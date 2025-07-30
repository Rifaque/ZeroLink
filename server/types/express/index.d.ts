// zerolink/server/types/express/index.d.ts
import { DecodedIdToken } from 'firebase-admin/auth';
import { UserType } from '../../types/User'

declare module 'express-serve-static-core' {
  interface Request {
    user: DecodedIdToken; // <- remove "?" to make it required
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: UserType
    }
  }
}