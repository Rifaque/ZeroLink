import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 8080 })
console.log('✅ WebSocket server running on ws://localhost:8080')

wss.on('connection', (ws) => {
  console.log('🔌 Client connected')

  ws.on('message', (message) => {
    console.log('📩 Received:', message.toString())

    // Broadcast to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // 1 = WebSocket.OPEN
        client.send(message)
      }
    })
  })

  ws.on('close', () => {
    console.log('❌ Client disconnected')
  })
})
