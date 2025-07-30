// client/src/components/Sidebar.tsx

'use client'

import { useEffect, useRef, useState } from 'react'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { FiSettings } from 'react-icons/fi'
import { FiUserPlus, FiSearch, FiX } from 'react-icons/fi'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'


export type ChatRoom = {
  roomId: string
  name: string
  lastMessage: string
  unreadCount: number
}

type SidebarProps = {
  activeRoom: string
  onSelectRoom: (roomId: string) => void
}

// Fetch users from backend API
async function fetchAllUsers(): Promise<Array<{ id: string; name: string }>> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`)
  if (!res.ok) throw new Error('Failed to fetch users')
  return res.json()
}

export default function Sidebar({ activeRoom, onSelectRoom }: SidebarProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [filter, setFilter] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [showNewChat, setShowNewChat] = useState(false)
  const [friends, setFriends] = useState<Array<{ id: string; name: string }>>([])
  const [friendFilter, setFriendFilter] = useState<string>('')
  const [showSettings, setShowSettings] = useState(false)
  const [loading, setLoading] = useState<boolean>(true)
  const socketRef = useRef<WebSocket | null>(null)
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u))
    return unsubscribe
  }, [])

  // WebSocket for rooms
  useEffect(() => {
    if (!user) return
    const setupSocket = async () => {
      const token = await user.getIdToken(true)
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://${window.location.hostname}:5000`
      const userId = user.displayName || user.email || ''
      const socket = new WebSocket(
        `${wsUrl}?token=${encodeURIComponent(token)}&userId=${encodeURIComponent(userId)}`
      )
      socketRef.current = socket

      setLoading(true) // ✅ Start loading

      socket.onopen = () => {
        socket.send(JSON.stringify({ type: 'getRooms' }))
      }

      socket.onmessage = (e) => {
        const data = JSON.parse(e.data)
        if (data.type === 'rooms') {
          setRooms(data.rooms)
          setLoading(false) // ✅ Done loading
        }
        if (data.type === 'message') {
          socket.send(JSON.stringify({ type: 'getRooms' }))
        }
      }
      socket.onerror = () => {
        setError('Failed to load chats')
        setLoading(false) // ✅ Stop loading on error
      }
    }
    setupSocket()
    return () => socketRef.current?.close()
  }, [user])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640) // Tailwind's `sm` breakpoint
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])


  // Open New Chat Modal
  const handleOpenNewChat = async () => {
    if (!showNewChat && user) {
      const list = await fetchAllUsers()
      const myId = user.displayName || user.email || ''
      setFriends(
        list
          .filter(f => f.id !== myId) // ✅ Exclude yourself
          .filter(f => !rooms.find(r => r.roomId === f.id)) // ✅ Exclude existing rooms
      )
    }
    setShowNewChat(!showNewChat)
  }


  const handleLogout = async () => {
    await signOut(auth)
    router.push('/') // or '/login', depending on your routing
  }

  // Select friend
  const handleSelectFriend = (friendId: string, friendName: string) => {
    if (!rooms.some(r => r.roomId === friendId)) {
      setRooms(prev => [{ roomId: friendId, name: friendName, lastMessage: '', unreadCount: 0 }, ...prev])
    }
    onSelectRoom(friendId)
    setShowNewChat(false)
    setFriendFilter('')
  }

  const filteredRooms = rooms.filter(r =>
    r.name.toLowerCase().includes(filter.toLowerCase()) ||
    r.lastMessage.toLowerCase().includes(filter.toLowerCase())
  )
  const filteredFriends = friends.filter(f =>
    f.name.toLowerCase().includes(friendFilter.toLowerCase())
  )

  if (error) {
    return <aside className="w-72 p-4 text-red-500">Error loading chats: {error}</aside>
  }

  return (
    <AnimatePresence>
      {!(isMobile && (showNewChat || showSettings)) && (
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="fixed w-72 z-[30] bg-[#0d1117] border-r border-[#1f2937] h-screen flex flex-col text-white font-mono"
      >
        {/* User Header */}
        <div className="flex items-center gap-3 p-4 border-b border-[#1f2937] bg-[#161b22]">
          <div className="w-10 h-10 rounded-full bg-[#3ABEFF1A] text-[#3ABEFF] font-bold flex items-center justify-center">
            {user?.displayName?.[0] || user?.email?.[0]}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">{user?.displayName || user?.email}</div>
            <div className="text-xs text-green-500">Online</div>
          </div>
          <button onClick={() => setShowSettings(true)} className="text-gray-400 hover:text-white">
            <FiSettings size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-4 pb-2 flex items-center gap-2 relative">
          <FiSearch className="text-gray-500" />
          <input
            type="text"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search Chats"
            className="w-full px-3 py-2 rounded-lg bg-[#161b22] text-white text-sm border border-[#2c313a] focus:outline-none focus:ring-2 focus:ring-[#3ABEFF] placeholder:text-gray-400"
          />
          {filter && (
            <button
              onClick={() => setFilter('')}
              className="absolute right-5 top-9/16 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <FiX size={16} />
            </button>
          )}
        </div>

        {/* New Chat Button */}
        <div className="px-4">
          <button
            onClick={handleOpenNewChat}
            className="w-full mb-3 py-2 text-sm bg-[#3ABEFF] text-black font-semibold rounded-lg hover:brightness-110 transition flex items-center justify-center gap-2"
          >
            <FiUserPlus /> New Chat
          </button>
        </div>

        {/* Chat List */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-[#3ABEFF]">
            <div className="animate-spin h-6 w-6 border-2 border-[#3ABEFF] border-t-transparent rounded-full" />
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto px-2 py-2 space-y-1 custom-scrollbar">
            {filteredRooms.map(room => (
              <li
                key={room.roomId}
                onClick={() => onSelectRoom(room.roomId)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition ${
                  activeRoom === room.roomId
                    ? 'bg-[#3ABEFF33]'
                    : 'hover:bg-[#1c2128]'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#2c313a] text-gray-300 font-semibold flex items-center justify-center">
                  {room.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{room.name}</div>
                  <div className="text-xs text-gray-400 truncate">{room.lastMessage}</div>
                </div>
                {room.unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {room.unreadCount}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </motion.aside>
      )}

      {/* NEW CHAT MODAL (now outside the sidebar) */}
      {showNewChat && (
        <div className="fixed inset-0 z-[100]  bg-opacity-40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-sm bg-[#161b22] text-white rounded-lg shadow-lg p-4 border border-[#2c313a]">
            <h3 className="text-base font-semibold mb-3">Start New Chat</h3>
            <input
              type="text"
              value={friendFilter}
              onChange={e => setFriendFilter(e.target.value)}
              placeholder="Search Friends"
              className="w-full px-3 py-2 mb-3 rounded-lg bg-[#0d1117] border border-[#2c313a] text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3ABEFF]"
            />
            <ul className="max-h-40 overflow-y-auto space-y-1">
              {filteredFriends.map(fr => (
                <li
                  key={fr.id}
                  className="px-2 py-1 rounded hover:bg-[#1c2128] cursor-pointer"
                  onClick={() => handleSelectFriend(fr.id, fr.name)}
                >
                  {fr.name}
                </li>
              ))}
              {filteredFriends.length === 0 && (
                <li className="text-center text-gray-500">No friends found</li>
              )}
            </ul>
            <button
              onClick={() => setShowNewChat(false)}
              className="mt-4 w-full py-2 bg-[#2c313a] text-gray-300 rounded hover:bg-[#3a404b] transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL (now outside too) */}
      {showSettings && user && (
        <div className="fixed inset-0 z-[100]  bg-opacity-40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-sm bg-[#161b22] text-white rounded-lg shadow-lg p-4 border border-[#2c313a] relative">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
            >
              <FiX size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#3ABEFF1A] text-[#3ABEFF] font-bold text-xl flex items-center justify-center mb-2">
                {user.displayName?.[0] || user.email?.[0]}
              </div>
              <div className="font-medium text-sm">{user.displayName || user.email}</div>
              <div className="text-xs text-green-400 mt-1">Online</div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleLogout}
                className="w-full py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition mb-2"
              >
                Logout
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-2 bg-[#2c313a] text-gray-300 text-sm rounded-lg hover:bg-[#3a404b] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )} 
    </AnimatePresence>
  )
};