import express from "express"
import { ConversationService } from "./conversationService.js"
import { createApiRoutes } from "./apiRoutes.js"

const app = express()
const PORT = process.env.PORT || 3000

// Initialize conversation service
const conversationService = new ConversationService()

// Middleware
app.use(express.json())

// Use API routes
app.use(createApiRoutes(conversationService))

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Conversation API server running on port ${PORT}`)
//   console.log(`📁 Conversations stored in: ${conversationService.getDbPath()}`)
//   console.log(`📊 Active conversations: ${conversationService.getConversationCount()}`)
//   console.log(`\nEndpoints:`)
//   console.log(`  POST /conversations - Create new conversation or continue existing`)
//   console.log(`  POST /conversations/:uuid/messages - Send message to specific conversation`)
//   console.log(`  GET /conversations - List all conversation UUIDs`)
//   console.log(`  GET /conversations/:uuid - Check if conversation exists`)
//   console.log(`  GET /health - Health check`)
})
