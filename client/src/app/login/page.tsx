// app/login/page.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import AuthForm from '@/components/auth/AuthForm'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.replace('/chat')
    })
    return unsub
  }, [router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#111] p-4">
      <AuthForm variant="login" />
    </main>
  )
}

