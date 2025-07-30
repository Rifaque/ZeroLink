'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/icons/Logo'

export default function LandingContent() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user)
      setChecking(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!checking && isLoggedIn && window.location.pathname === '/') {
      router.replace('/chat')
    }
  }, [checking, isLoggedIn, router])

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0d1117] text-white">
        <div className="animate-pulse flex items-center gap-3">
          <Logo className="h-10 w-10 text-[#3ABEFF]" />
          <span className="text-xl font-bold">ZeroLink</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white overflow-x-hidden">
      {/* Navbar */}
      <header className="w-full px-4 sm:px-6 py-4 flex items-center justify-between border-b border-gray-800 bg-[#161b22]">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-[#3ABEFF]" />
          <h1 className="text-lg sm:text-xl font-semibold text-white">ZeroLink</h1>
        </div>
        <div className="flex gap-2 sm:gap-3">
          {isLoggedIn ? (
            <Button size="sm" onClick={() => router.push('/chat')}>Go to Chat</Button>
          ) : (
            <>
              <Link href="/login"><Button size="sm" variant="ghost">Sign In</Button></Link>
              <Link href="/signup"><Button size="sm" className="bg-[#3ABEFF] text-black hover:brightness-110">Get Started</Button></Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">A new way to connect.</h2>
        <p className="max-w-md sm:max-w-xl mx-auto text-gray-400 mb-6 text-sm sm:text-base">
          ZeroLink is a real-time chat app built for simplicity, speed, and privacy — powered by Firebase Auth and WebSockets.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          {!isLoggedIn && (
            <>
              <Link href="/signup"><Button className="w-full sm:w-auto bg-[#3ABEFF] text-black hover:brightness-110">Try ZeroLink</Button></Link>
              <Link href="/login"><Button  className="w-full sm:w-auto border-gray-600 text-white hover:bg-gray-800">Sign In</Button></Link>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#161b22]">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-semibold text-center mb-10 sm:mb-12 text-white">Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Feature title="Realtime Chat" desc="Built with WebSocket magic — no refresh needed." />
            <Feature title="Firebase Auth" desc="Secure email/password login with session persistence." />
            <Feature title="Clean UI" desc="Simple, modern, distraction-free interface." />
            <Feature title="Fast Backend" desc="Optimized Node.js server with MongoDB." />
            <Feature title="Mobile Ready" desc="Responsive UI works great on phones too." />
            <Feature title="Open Source" desc="Built by Rifaque. Fork it, remix it, use it!" />
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white">Tech Stack</h2>
        <p className="text-gray-400 mb-4 text-sm sm:text-base">Built using modern and production-ready technologies</p>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-sm">
          {[
            'Next.js',
            'TypeScript',
            'Firebase',
            'Socket.io',
            'MongoDB',
            'Express.js',
            'TailwindCSS',
            'shadcn/ui',
            'Zod',
          ].map((tech) => (
            <span
              key={tech}
              className="rounded-lg bg-[#1f2937] px-4 py-2 text-white border border-gray-700 text-xs sm:text-sm"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-gray-500 text-xs sm:text-sm bg-[#161b22] border-t border-gray-800">
        &copy; {new Date().getFullYear()} ZeroLink — Developed by Rifaque, hosted via{' '}
        <a
          href="https://hubzero.in"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-[#3ABEFF]"
        >
          hubzero.in
        </a>
      </footer>
    </div>
  )
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-5 sm:p-6 border border-gray-800 rounded-2xl hover:shadow-md transition bg-[#0d1117]">
      <h4 className="text-base sm:text-lg font-semibold text-[#3ABEFF] mb-1">{title}</h4>
      <p className="text-xs sm:text-sm text-gray-400">{desc}</p>
    </div>
  )
}
