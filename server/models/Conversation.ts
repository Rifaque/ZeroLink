import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema({
  participants: {
    type: [String], // store user uids
    required: true,
    validate: (arr: string[]) => arr.length === 2,
  },
}, { timestamps: true })

export default mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema)
