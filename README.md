# 🔗 ZeroLink

**ZeroLink** is a modern full-stack chat application built with the MERN stack and Firebase, designed for real-time, secure, and seamless communication. It features JWT authentication, WebSocket-based messaging, Firebase integration, and a sleek Next.js frontend.

![ZeroLink Banner](./client/public/banner.png) <!-- Replace with actual banner path if any -->

## 🚀 Features

- 🔐 JWT-based Authentication (Login / Signup)
- 🧠 Firebase integration for auth & message storage
- 📡 Real-time messaging via WebSocket (WS)
- 💬 Typing indicator & chat animations (Framer Motion)
- 🌐 Fully responsive, built with Tailwind CSS & Next.js 14 App Router
- 🧪 Route protection & middleware-based auth handling
- 🧱 Scalable monorepo structure (`client`, `server`, `shared`)
- 🧰 Tech stack: Zod, React Hook Form, Sonner, Axios

## 🧠 Tech Stack

| Category       | Tech                                     |
|----------------|------------------------------------------|
| Frontend       | Next.js 14 (App Router), Tailwind CSS    |
| Backend        | Express.js, TypeScript, WebSocket (ws)   |
| Auth & Storage | Firebase Auth, Firebase Realtime DB      |
| State & Forms  | React Hook Form, Zod, Context API        |
| Animations     | Framer Motion                            |
| Hosting        | NGINX + Cloudflare Tunnel (self-hosted)  |
| Dev Tools      | ESLint, Prettier, GitHub Actions (soon)  |

## 📁 Project Structure

```bash
zerolink/
├── client/          # Next.js frontend
├── server/          # Express backend
├── shared/          # Shared types/modules (optional)
└── README.md
```

---

## 🛠 Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/Rifaque/ZeroLink.git
cd ZeroLink
```

### 2. Install dependencies

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install

```

### 3. Run the app locally

```bash
# Backend (port 5000)
npm run dev

# Frontend (port 3000)
cd ../client
npm run dev


```
Make sure MongoDB and Firebase are set up and connected properly in your .env files.
---

## 🔐 Environment Variables

Create `.env` files in both the `client/` and `server/` directories.

### `client/.env.local`

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
```

### `server/.env`

```env
PORT=5000

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_admin_sdk_client_email
FIREBASE_PRIVATE_KEY="your_firebase_private_key"  # Wrap in quotes and preserve \n

# JWT Secret
JWT_SECRET=your_jwt_secret

# MongoDB
MONGO_URI=mongodb://localhost:27017/zerolink

```

---
<!-- ## 📸 Previews -->



## ✨ Upcoming Features

- ✅ Admin panel
- ✅ Group chats & threads
- ⏳ File uploads
- ⏳ Message read receipts
- ⏳ Firebase Cloud Messaging (push)

## 🧑‍💻 Author

**Rifaque Ahmed**  
👨‍💻 [GitHub](https://github.com/Rifaque) • [LinkedIn](https://linkedin.com/in/rifaque-akrami)

## 📝 License

This project is licensed under the MIT License.  
Feel free to use, fork, and improve!

---