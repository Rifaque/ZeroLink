// lib/firebase-admin.ts
import admin from 'firebase-admin';
import serviceAccount from '../firebaseServiceAccount.json';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export const adminAuth = admin.auth();
