import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  username: String,
  receivername: String,
  text: String,
  mediaUrl: String, 
  mediaType: String, // 'image' or 'video'
  timestamp: { type: Date, default: Date.now },
  delivered: { type: Boolean, default: false },
})

export default mongoose.model('Message', messageSchema)
