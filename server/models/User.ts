import mongoose, { Document, Schema } from 'mongoose'

export interface UserType extends Document {
  uid: string
  email: string
  displayName?: string
  dms: string[]
}

const userSchema = new Schema<UserType>(
  {
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    displayName: { type: String },
    dms: [{ type: String }], // UIDs or emails
  },
  { timestamps: true }
)

export const User = mongoose.models.User as mongoose.Model<UserType> || mongoose.model<UserType>('User', userSchema)
