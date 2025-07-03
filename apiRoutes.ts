import express from "express"
import { ConversationService } from "./conversationService.js"
import { 
  ConversationResponse, 
  ApiErrorResponse, 
  ConversationListResponse, 
  ConversationExistsResponse, 
  HealthResponse,
  SendMessageRequest 
} from "./types.js"

export function createApiRoutes(conversationService: ConversationService): express.Router {
  const router = express.Router()

  /**
   * POST /conversations
   * Body: { message: string, conversationId?: string }
   * 
   * - If conversationId is provided, continues that conversation
   * - If conversationId is null/undefined, creates a new conversation
   */
  router.post('/conversations', async (req, res) => {
    try {
      const { message, conversationId }: SendMessageRequest = req.body

      if (!message || typeof message !== 'string') {
        const errorResponse: ApiErrorResponse = { 
          error: 'Message is required and must be a string' 
        }
        return res.status(400).json(errorResponse)
      }

      const result = await conversationService.sendMessage(conversationId || null, message)
      
      const response: ConversationResponse = {
        conversationId: result.conversationId,
        title: result.title,
        message: result.response.output_text,
        responseId: result.response.id,
        isNewConversation: !conversationId,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      }
      
      res.json(response)

    } catch (error) {
      console.error('Error in /conversations:', error)
      const errorResponse: ApiErrorResponse = { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(errorResponse)
    }
  })

  /**
   * POST /conversations/:uuid/messages
   * Body: { message: string }
   * 
   * Send a message to a specific conversation
   */
  router.post('/conversations/:uuid/messages', async (req, res) => {
    try {
      const { uuid } = req.params
      const { message } = req.body

      if (!message || typeof message !== 'string') {
        const errorResponse: ApiErrorResponse = { 
          error: 'Message is required and must be a string' 
        }
        return res.status(400).json(errorResponse)
      }

      // Check if conversation exists
      if (!conversationService.conversationExists(uuid)) {
        const errorResponse: ApiErrorResponse = {
          error: 'Conversation not found',
          conversationId: uuid
        }
        return res.status(404).json(errorResponse)
      }

      const result = await conversationService.sendMessage(uuid, message)
      
      const response: ConversationResponse = {
        conversationId: result.conversationId,
        title: result.title,
        message: result.response.output_text,
        responseId: result.response.id,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      }
      
      res.json(response)

    } catch (error) {
      console.error(`Error in /conversations/${req.params.uuid}/messages:`, error)
      const errorResponse: ApiErrorResponse = { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(errorResponse)
    }
  })

  /**
   * GET /conversations
   * Get list of all conversations with their titles
   */
  router.get('/conversations', async (req, res) => {
    try {
      const conversations = await conversationService.getConversationInfos()
      const count = await conversationService.getConversationCount()
      const response: ConversationListResponse = {
        conversations,
        count
      }
      res.json(response)
    } catch (error) {
      console.error('Error in GET /conversations:', error)
      const errorResponse: ApiErrorResponse = { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(errorResponse)
    }
  })

  /**
   * GET /conversations/:uuid
   * Check if a specific conversation exists and get its title
   */
  router.get('/conversations/:uuid', async (req, res) => {
    try {
      const { uuid } = req.params
      const exists = await conversationService.conversationExists(uuid)
      
      if (!exists) {
        const errorResponse: ApiErrorResponse = {
          error: 'Conversation not found',
          conversationId: uuid
        }
        return res.status(404).json(errorResponse)
      }

      const title = await conversationService.getConversationTitle(uuid)
      const createdAt = await conversationService.getConversationCreatedAt(uuid)
      const updatedAt = await conversationService.getConversationUpdatedAt(uuid)
      const response: ConversationExistsResponse = {
        conversationId: uuid,
        title,
        exists: true,
        createdAt,
        updatedAt
      }
      res.json(response)
    } catch (error) {
      console.error(`Error in GET /conversations/${req.params.uuid}:`, error)
      const errorResponse: ApiErrorResponse = { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
      res.status(500).json(errorResponse)
    }
  })

  /**
   * GET /health
   * Health check endpoint
   */
  router.get('/health', async (req, res) => {
    const count = await conversationService.getConversationCount()
    const response: HealthResponse = { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      conversationCount: count
    }
    res.json(response)
  })

  return router
} 