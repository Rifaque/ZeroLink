// client/src/app/chat/page.tsx

'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import ChatWindow from '@/components/ChatWindow'
import { createPortal } from 'react-dom'


export default function ChatPage() {
  const [currentRoomId, setCurrentRoomId] = useState<string>('global')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Prevent scroll when sidebar is open (mobile only)
  useEffect(() => {
    if (sidebarOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  return (
    <main className="flex h-screen overflow-hidden relative">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-72 border-r bg-[#0d1117] border-[#1f2937]">
        <Sidebar onSelectRoom={setCurrentRoomId} activeRoom={currentRoomId} />
      </div>

      {/* Mobile Sidebar & Backdrop */}
      {sidebarOpen && createPortal(
        <>
          {/* Backdrop */}
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm md:hidden"
          />

          {/* Sidebar */}
          <div className="fixed top-0 left-0 z-[9999] h-full w-64 bg-[#0d1117] border-r border-[#1f2937] transform transition-transform duration-300 ease-in-out md:hidden translate-x-0">
            <Sidebar
              onSelectRoom={(roomId) => {
                setCurrentRoomId(roomId)
                setSidebarOpen(false)
              }}
              activeRoom={currentRoomId}
            />
          </div>
        </>,
        document.body
      )}


      {/* Main Chat Section */}
      <div className="flex flex-col flex-1">
        {/* Chat Window */}
        <ChatWindow
          roomId={currentRoomId}
          onToggleSidebar={() => setSidebarOpen(open => !open)}
        />
      </div>
    </main>
  )
}