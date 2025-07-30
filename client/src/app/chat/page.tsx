'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import ChatWindow from '@/components/ChatWindow'

export default function ChatPage() {
  const [currentRoomId, setCurrentRoomId] = useState<string>('global')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  // Prevent scroll when sidebar is open (mobile only)
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://localhost:5000/')
        .then((res) => {
          if (!res.ok) throw new Error()
        })
        .catch(() => {
          alert('🚨 ZeroLink server is unreachable.')
        })
    }, 10000) // every 10 seconds

    return () => clearInterval(interval)
  }, [])


  return (
    <main className="flex h-screen overflow-hidden relative">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-72 border-r bg-[#0d1117] border-[#1f2937]">
        <Sidebar onSelectRoom={setCurrentRoomId} activeRoom={currentRoomId} />
      </div>

      {/* Mobile Sidebar & Backdrop */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm md:hidden"
          />

          {/* Slide-in Sidebar */}
          <div className="fixed top-0 left-0 z-20 h-full w-64 bg-[#0d1117] border-r border-[#1f2937] transition-transform duration-300 ease-in-out transform md:hidden translate-x-0">
            <Sidebar
              onSelectRoom={(roomId) => {
                setCurrentRoomId(roomId)
                setSidebarOpen(false)
              }}
              activeRoom={currentRoomId}
            />
          </div>
        </>
      )}

      {/* Main Chat Section */}
      <div className="flex flex-col flex-1">
        {/* Mobile Topbar */}
        <div className="md:hidden flex justify-between items-center px-4 py-2 border-b border-gray-800 bg-[#161b22]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-[#3ABEFF] text-black px-3 py-1 rounded font-mono text-sm"
          >
            {sidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
          </button>
          <div className="text-white font-mono text-sm">{currentRoomId}</div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 overflow-hidden">
          <ChatWindow roomId={currentRoomId} />
        </div>
      </div>
    </main>
  )
}
