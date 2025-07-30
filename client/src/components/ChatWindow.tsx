// client/src/components/ChatWindow.tsx

'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { FiPaperclip, FiMenu, FiChevronDown } from 'react-icons/fi'
import Image from 'next/image'


export type ChatMessage = {
  _id?: string
  username: string
  receivername?: string
  text: string
  timestamp?: string
  delivered?: boolean
  mediaUrl?: string       // ✅ URL to image or video
  mediaType?: 'image' | 'video' // ✅ optional enum
}


type ChatWindowProps = {
  roomId: string
  onToggleSidebar: () => void
}

export default function ChatWindow({ roomId, onToggleSidebar }: ChatWindowProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<NodeJS.Timeout | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [user, setUser] = useState<User | null>(null)
  const connectionIdRef = useRef(0)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  const typingUserRef = useRef(typingUser)


  useEffect(() => { textareaRef.current?.focus() }, [roomId])
  useEffect(() => onAuthStateChanged(auth, setUser), [])


  useEffect(() => {
  if (!user) return
  connectionIdRef.current += 1
  const thisId = connectionIdRef.current

  socketRef.current?.close()
  if (reconnectRef.current) clearTimeout(reconnectRef.current)

  setMessages([])
    setLoading(true) // ✅ Show loading when room/user changes

    const connect = async () => {
      try {
        const token = await user.getIdToken(true)
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://${window.location.hostname}:5000`
        const ws = new WebSocket(
          `${wsUrl}?token=${encodeURIComponent(token)}&userId=${encodeURIComponent(
            user.displayName || user.email || ''
          )}&roomId=${encodeURIComponent(roomId)}`
        )
        socketRef.current = ws

        ws.onmessage = async (e) => {
          const raw = typeof e.data === 'string' ? e.data : await e.data.text()
          const d = JSON.parse(raw)

          if (d.type === 'history') {
            console.log('📜 Chat history loaded:', d.messages)
            setMessages(d.messages)
            setLoading(false) // ✅ Hide loading once messages come in
          }

          if (d.type === 'message') {
            setMessages((m) => [...m, d.message])
            if (d.message.username === typingUserRef.current) setTypingUser(null)
          }

          if (d.type === 'typing' && d.username !== (user.displayName || user.email)) {
            setTypingUser(d.username)
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
            typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000)
          }
        }

        ws.onclose = (e) => {
          if (connectionIdRef.current === thisId) {
            if (e.code === 4001) {
              signOut(auth).then(() => router.push('/login'))
            } else {
              reconnectRef.current = setTimeout(connect, 3000)
            }
          }
        }

      } catch {
        if (connectionIdRef.current === thisId) reconnectRef.current = setTimeout(connect, 3000)
      }
    }

    connect()
    return () => {
      socketRef.current?.close()
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
    }
  }, [roomId, user, router])

  useEffect(() => {
    typingUserRef.current = typingUser
  }, [typingUser])


  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages])

  useEffect(() => {
    const el = containerRef.current
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'auto' })
    }
  }, [messages, loading])


  const scrollToBottom = () => {
    const el = containerRef.current
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
      setShowScrollBtn(false)
    }
  }

  const sendMessage = () => {
    const ws = socketRef.current
    const ta = textareaRef.current
    if (!ws || !ta || !user) return
    const text = ta.value.trim()
    if (!text) return
    ws.send(JSON.stringify({
      type: 'sendMessage',
      roomId,
      text,
      receivername: roomId !== 'global' ? roomId : undefined,
      username: user.displayName || user.email
    }))
    ta.value = ''
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: 'POST',
        body: formData
      })
      const { fileUrl } = await res.json()
      const mediaType = file.type.startsWith('video') ? 'video' : 'image'

      socketRef.current?.send(JSON.stringify({
        type: 'sendMedia',
        roomId,
        text: '', // Optional caption
        receivername: roomId !== 'global' ? roomId : undefined,
        mediaUrl: fileUrl,
        mediaType,
        username: user.displayName || user.email
      }))
    } catch (err) {
      console.error('❌ Upload failed:', err)
    }
  }


  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleTyping = () => {
    const ws = socketRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN || !user) return
    ws.send(JSON.stringify({ type: 'typing', username: user.displayName || user.email }))
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d1117] text-white border border-[#1f2937] shadow-inner overflow-hidden">
      {/* Top bar */}
      <div className="fixed inset-x-0 top-0 z-20 h-14 flex items-center px-4 border-b border-gray-800 bg-[#161b22] md:relative">
        {/* Hamburger (mobile only) */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-blue-400 hover:text-blue-300 mr-3"
        >
          <FiMenu size={24} />
        </button>
        <div className="text-lg font-mono text-[#3ABEFF] tracking-wide">
          {roomId === 'global' ? 'Global Chat' : roomId}
        </div>
      </div>

      {/* Typing Indicator */}
      {typingUser && (
        <div className="text-sm italic text-blue-400 px-4 py-1 animate-pulse font-mono">
          {typingUser} is typing...
        </div>
      )}

      {/* Chat messages */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-blue-400">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto px-2 md:px-4 py-3 space-y-4 custom-scrollbar pt-16 pb-12 md:pt-0 md:pb-0"
        >
          {messages.map((msg, idx) => {
            const isMe = msg.username === (user?.displayName || user?.email)
            return (
              <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-2 py-2 rounded-2xl font-mono text-sm break-words whitespace-pre-wrap transition ${
                    isMe
                      ? 'bg-[#2F80ED] text-white rounded-br-none'
                      : 'bg-[#1c1f24] text-gray-100 border border-gray-700 rounded-bl-none'
                  }`}
                >
                  {!isMe && <div className="font-semibold text-[#3ABEFF] mb-1">{msg.username}</div>}

                  {msg.mediaType === 'image' && (
                    <div className="mb-2 w-full overflow-hidden rounded-lg">
                      {msg.mediaUrl && (
                        <Image
                          src={msg.mediaUrl}
                          alt="Uploaded media"
                          width={500}
                          height={500}
                          className="w-auto max-w-full max-h-80 object-contain rounded-lg"
                          priority={false}
                          placeholder="empty" 
                        />
                      )}
                    </div>
                  )}

                  {msg.mediaType === 'video' && (
                    <div className="mb-2 w-full overflow-hidden rounded-lg">
                      <video
                        preload="none"
                        controls
                        src={msg.mediaUrl}
                        className="w-full max-h-80 object-contain"
                      />
                    </div>
                  )}
                  {msg.text && <div>{msg.text}</div>}

                  <div
                    className={`text-[10px] text-right mt-1 ${
                      isMe ? 'text-white/70' : 'text-gray-400'
                    }`}
                  >
                    {msg.timestamp &&
                      new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                  </div>

                </div>
              </div>
            )
          })}
          <div ref={endRef} />
        </div>
      )}

      {/* Scroll to bottom button */}
      {showScrollBtn && !loading && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-4 z-10 bg-[#3ABEFF] text-black p-2 rounded-full shadow-lg hover:brightness-110 transition"
        >
          <FiChevronDown size={20} />
        </button>
      )}

      {/* Input bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-800 bg-[#161b22] px-4 py-2 flex items-center gap-3 md:relative">
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileUpload}
          className="hidden"
          id="mediaUpload"
        />
        <label
          htmlFor="mediaUpload"
          className="cursor-pointer text-blue-400 hover:text-blue-300 text-xl"
        >
            <FiPaperclip className="text-gray-400 hover:text-white w-5 h-5" />
        </label>

        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Type your message..."
          className="flex-1 resize-none bg-[#0d1117] text-white border border-gray-700 rounded-full px-4 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#3ABEFF] placeholder:text-gray-500"
          onKeyDown={handleKeyDown}
          onChange={() => {
            handleTyping()
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
            typingTimeoutRef.current = setTimeout(() => {
              typingTimeoutRef.current = null
            }, 2000)
          }}
        />
        <button
          onClick={sendMessage}
          className="bg-[#3ABEFF] text-black px-4 py-2 rounded-full text-sm font-bold font-mono shadow hover:brightness-110 transition"
        >
          Send
        </button>
      </div>
    </div>
  )
}