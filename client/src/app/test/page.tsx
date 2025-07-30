'use client'

import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { useEffect } from 'react'

export default function Test() {
  useEffect(() => {
    const load = async () => {
      const snapshot = await getDocs(collection(db, 'test'))
      console.log('Fetched docs:', snapshot.docs.map(doc => doc.data()))
    }
    load()
  }, [])

  return <div>Check console for Firestore test data</div>
}
