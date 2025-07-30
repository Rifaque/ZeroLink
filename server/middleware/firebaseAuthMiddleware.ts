// middleware/firebaseAuthMiddleware.ts
import { Request, Response, NextFunction } from 'express'
import { adminAuth } from '../lib/firebase-admin'

export const firebaseAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const idToken = authHeader.split('Bearer ')[1]

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    req.user = decodedToken
    next()
  } catch (error) {
    console.error('Firebase Auth Error:', error)
    res.status(401).json({ error: 'Unauthorized' })
  }
}
