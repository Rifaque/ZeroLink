import { Request, Response } from 'express'
import { adminAuth } from '../lib/firebase-admin'

// This just verifies the Firebase ID token from the client
export const verifyUser = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split('Bearer ')[1]

  if (!token) return res.status(401).json({ message: 'No token provided' })

  try {
    const decodedToken = await adminAuth.verifyIdToken(token)
    return res.status(200).json({ uid: decodedToken.uid, email: decodedToken.email })
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}
