import { useState, useEffect, useRef, useCallback } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import axios from '@/lib/axios'

type ChatMessage = {
  _id: string
  senderId: string
  roomId: string
  username: string
  text: string
  timestamp: string
  delivered: boolean
}

/**
 * Custom hook to manage WebSocket connection and message state for a chat room.
 * @param roomId - The ID of the chat room to connect to.
 * @returns [messages, sendMessage, connectSocket]
 */
export function useMessages(roomId: string): [ChatMessage[], (text: string) => void, () => void] {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const socketRef = useRef<WebSocket | null>(null)
  const userRef = useRef<User | null>(null)

  // Subscribe to auth changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      userRef.current = u
    })
    return unsub
  }, [])

  // Establish WebSocket connection
  const connectSocket = useCallback(() => {
    if (!roomId) return

    const setup = async () => {
      const user = userRef.current
      if (!user) return
      
      try {
        const token = await user.getIdToken(true)
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://${window.location.hostname}:5000`
        const ws = new WebSocket(`${wsUrl}?token=${token}&roomId=${roomId}`)
        socketRef.current = ws

        ws.onopen = () => {
          console.log('WebSocket connected to room', roomId)
        }

        ws.onmessage = async (event) => {
          const raw = typeof event.data === 'string' ? event.data : await event.data.text()
          const payload = JSON.parse(raw)

          switch (payload.type) {
            case 'history':
              setMessages(payload.messages)
              break
            case 'message':
              if (payload.message.roomId === roomId) {
                setMessages((prev) => [...prev, payload.message])
              }
              break
            default:
              break
          }
        }

        ws.onerror = (err) => console.error('WebSocket error', err)
        ws.onclose = () => console.log('WebSocket disconnected from room', roomId)
      } catch (err) {
        console.error('Failed to connect WebSocket', err)
      }
    }

    setup()
  }, [roomId])

  // Send a new message
  const sendMessage = useCallback((text: string) => {
    const socket = socketRef.current
    const user = userRef.current
    if (!socket || socket.readyState !== WebSocket.OPEN || !user) return

    const payload = {
      type: 'message',
      text,
      username: user.displayName || user.email,
      roomId,
      senderId: user.uid,
      timestamp: new Date().toISOString(),
    }
    socket.send(JSON.stringify(payload))
  }, [roomId])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      socketRef.current?.close()
    }
  }, [])

  return [messages, sendMessage, connectSocket]
}
