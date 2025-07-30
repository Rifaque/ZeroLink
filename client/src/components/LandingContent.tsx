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
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse flex items-center gap-3">
          <Logo className="h-10 w-10 text-primary" />
          <span className="text-xl font-bold text-foreground">ZeroLink</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navbar */}
      <header className="w-full px-4 sm:px-6 py-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-lg sm:text-xl font-semibold">ZeroLink</h1>
        </div>
        <div className="flex gap-2 sm:gap-3">
          {isLoggedIn ? (
            <Button size="sm" onClick={() => router.push('/chat')}>Go to Chat</Button>
          ) : (
            <>
              <Link href="/login"><Button size="sm" variant="ghost">Sign In</Button></Link>
              <Link href="/signup"><Button size="sm">Get Started</Button></Link>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">A new way to connect.</h2>
        <p className="max-w-md sm:max-w-xl mx-auto text-muted-foreground mb-6 text-sm sm:text-base">
          ZeroLink is a real-time chat app built for simplicity, speed, and privacy — powered by Firebase Auth and WebSockets.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          {!isLoggedIn && (
            <>
              <Link href="/signup"><Button className="w-full sm:w-auto">Try ZeroLink</Button></Link>
              <Link href="/login"><Button variant="outline" className="w-full sm:w-auto">Sign In</Button></Link>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-muted/10">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-semibold text-center mb-10 sm:mb-12">Features</h3>
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
        <h2 className="text-2xl sm:text-3xl font-bold mb-6">Tech Stack</h2>
        <p className="text-muted-foreground mb-4 text-sm sm:text-base">Built using modern and production-ready technologies</p>
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
            'React Hook Form',
          ].map((tech) => (
            <span
              key={tech}
              className="rounded-lg bg-muted px-4 py-2 text-foreground border text-xs sm:text-sm"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-muted-foreground text-xs sm:text-sm">
        &copy; {new Date().getFullYear()} ZeroLink — Developed by Rifaque, hosted via{' '}
        <a
          href="https://hubzero.in"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-primary"
        >
          hubzero.in
        </a>
      </footer>
    </div>
  )
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-5 sm:p-6 border border-border rounded-2xl hover:shadow-md transition bg-background">
      <h4 className="text-base sm:text-lg font-semibold text-primary mb-1">{title}</h4>
      <p className="text-xs sm:text-sm text-muted-foreground">{desc}</p>
    </div>
  )
}
