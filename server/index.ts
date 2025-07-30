import express from 'express'
import http from 'http'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import path from 'path'
import { WebSocketServer } from 'ws'
import Conversation from './models/Conversation'
import multer from 'multer'


import authRoutes from './routes/auth'
import Message from './models/Message'
import { User, UserType } from './models/User'
import { firebaseAuthMiddleware } from './middleware/firebaseAuthMiddleware'
import { adminAuth } from './lib/firebase-admin'

// Load environment variables
dotenv.config()

const app = express()
const allowedOrigins = [
  'http://localhost:5000',
  'http://localhost:3500',
  'http://192.168.1.6:5000',
  'http://192.168.1.6:3500',
  'http://rs-x1:5000',
  'http://rs-x1:3500',
  'https://zerolink.hubzero.in',
  'https://chat.hubzero.in',
  'https://api.zerolink.hubzero.in',
]
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.hubzero.in')) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)
app.use(express.json())

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads')) // Saves in /uploads
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext)
    cb(null, `${name}-${Date.now()}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm']
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Only image and video files are allowed!'))
  }
})

// Create HTTP server
const server = http.createServer(app)

// Create WebSocket server
const wss = new WebSocketServer({ server })

interface ConversationType {
  participants: string[];
}

async function ensureUserExists(decoded: any) {
  const uid = decoded.uid;
  const email = decoded.email;
  const name = decoded.name || email;

  const existing = await User.findOne({ uid });
  if (!existing) {
    await User.create({
      uid,
      email,
      displayName: name,
      dms: [],
    });
    console.log(`🆕 New user created: ${email}`);
  }
}

wss.on('connection', async (ws, req) => {
  console.log('🔌 WebSocket client connected');

  const url = new URL(req.url ?? '', `http://${req.headers.host}`);
  const token = url.searchParams.get('token');
  const userId = url.searchParams.get('userId') || '';
  const roomId = url.searchParams.get('roomId') || 'global';

  if (!token || !userId) {
    console.error('❌ Missing token or userId');
    ws.close(4001, 'Missing credentials');
    return;
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);


    await ensureUserExists(decoded);
    console.log(`✅ Authenticated: ${decoded.email} as ${userId} joined room: ${roomId}`);

    (ws as any).userId = userId;
    (ws as any).roomId = roomId;

    // --- 1) SEND ROOM LIST ---
    const buildRooms = async () => {
      const conversations = await Conversation.find({ participants: userId });

      const rooms = [];
      
      // Global Chat
      const lastGlobal = await Message.findOne({ receivername: 'global' })
        .sort({ timestamp: -1 });
      const unreadGlobal = await Message.countDocuments({ receivername: 'global', delivered: false });
      rooms.push({ roomId: 'global', name: 'Global Chat', lastMessage: lastGlobal?.text || '', unreadCount: unreadGlobal });

      for (const convo of conversations) {
        // find the other participant string
        const other = convo.participants.find((p: string) => p !== userId);
        if (!other) continue;

        // Use other as display name
        const displayName = other;

        // Determine identifier for messages: compare email or displayName usage
        // For simplicity assume messages stored with usernames equal to displayName or email

        const lastMsg = await Message.findOne({
          $or: [
            { username: userId, receivername: other },
            { username: other, receivername: userId }
          ]
        }).sort({ timestamp: -1 });

        const unread = await Message.countDocuments({ username: other, receivername: userId, delivered: false });

        rooms.push({ roomId: other, name: displayName, lastMessage: lastMsg?.text || '', unreadCount: unread });
      }
      ws.send(JSON.stringify({ type: 'rooms', rooms }));
    };

    await buildRooms();

    // --- 2) SEND HISTORY FOR THIS ROOM ---
    let history;
    if (roomId === 'global') {
      history = await Message.find({ receivername: 'global' }).sort({ timestamp: 1 })
    } else {
      history = await Message.find({
        $or: [
          { username: userId, receivername: roomId },
          { username: roomId, receivername: userId }
        ]
      }).sort({ timestamp: 1 });
    }
    ws.send(JSON.stringify({ type: 'history', messages: history }));

    // --- 3) MESSAGE HANDLER ---
    ws.on('message', async (raw) => {
      const d = JSON.parse(raw.toString());

      if (d.type === 'getRooms') {
        await buildRooms();
        return;
      }

      if (d.type === 'typing') {
        const payload = JSON.stringify({ type: 'typing', username: d.username });
        wss.clients.forEach((client) => {
          const c = client as any;
          const sameChat =
            (c.userId === userId && c.roomId === roomId) ||
            (c.userId === roomId && c.roomId === userId);
          if (client !== ws && client.readyState === ws.OPEN && sameChat) {
            client.send(payload);
          }
        });
        return;
      }

      if (d.type === 'sendMessage') {
        const { roomId: rid, text, receivername = 'global' } = d;
        const newMsg = new Message({ username: userId, receivername, text, delivered: true });
        await newMsg.save();
        console.log('Saved message:', newMsg);


        if (receivername !== 'global') {
          const existing = await Conversation.findOne({ participants: { $all: [userId, receivername] } });
          if (!existing) {
            await Conversation.create({ participants: [userId, receivername] });
            console.log(`🆕 New DM conversation created between ${userId} and ${receivername}`);
          }
        }

        const out = JSON.stringify({ type: 'message', message: { _id: newMsg._id, username: newMsg.username, receivername: newMsg.receivername, text: newMsg.text, timestamp: newMsg.timestamp, delivered: newMsg.delivered } });
        wss.clients.forEach((client) => {
          const c = client as any;
          const sameChat =
            (c.userId === userId && c.roomId === rid) ||
            (c.userId === rid && c.roomId === userId) ||
            (rid === 'global' && c.roomId === 'global');
          if (client.readyState === ws.OPEN && sameChat) client.send(out);
        });
        return;
      }

      if (d.type === 'sendMedia') {
        const { roomId: rid, receivername = 'global', mediaUrl, mediaType, text } = d;
        const newMsg = new Message({ username: userId, receivername, mediaUrl, mediaType, text, delivered: true });
        await newMsg.save();
        console.log('Saved message:', newMsg);

        const out = JSON.stringify({
          type: 'message',
          message: {
            _id: newMsg._id,
            username: newMsg.username,
            receivername: newMsg.receivername,
            text: newMsg.text,
            mediaUrl: newMsg.mediaUrl,       // ✅ add this
            mediaType: newMsg.mediaType,     // ✅ add this
            timestamp: newMsg.timestamp,
            delivered: newMsg.delivered
          }
        });

        wss.clients.forEach((client) => {
          const c = client as any;
          const sameChat =
            (c.userId === userId && c.roomId === rid) ||
            (c.userId === rid && c.roomId === userId) ||
            (rid === 'global' && c.roomId === 'global');
          if (client.readyState === ws.OPEN && sameChat) client.send(out);
        });
        return;
      }

    });

    ws.on('close', () => console.log(`❌ ${userId} disconnected from room: ${roomId}`));
  } catch (err) {
    console.error('❌ Firebase token verification failed:', err);
    ws.close(4001, 'Invalid Firebase token');
  }
});

// REST routes
app.get('/api/protected', firebaseAuthMiddleware, (req, res) => {
  res.json({ message: `Hello, ${req.user?.email}` })  // ✅ Template literal fixed here
})

// Upload route
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
  res.json({ fileUrl })
})

app.get('/api/messages', firebaseAuthMiddleware, async (req, res) => {
  try {
    const messages = await Message.find()
    res.json(messages)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

app.use('/api/auth', authRoutes)
app.get('/', (_, res) => res.send('ZeroLink Server Running 🚀'))
app.get('/api/health', (_, res) => res.json({ status: 'ok' }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// GET /api/users — returns all users (id=email, name=displayName||email)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    // Map to only id+name
    const payload = users.map(u => ({
      id: u.displayName || u.email,
      name: u.displayName || u.email,
    }))
    res.json(payload)
  } catch (err) {
    console.error('❌ Failed to fetch users:', err)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err))

// Start server
const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
