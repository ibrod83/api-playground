/**
 * Shared TypeScript types and interfaces for the Conversation API
 */

export interface ConversationResponse {
  conversationId: string
  title?: string
  message: string
  responseId: string
  isNewConversation?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ApiErrorResponse {
  error: string
  details?: string
  conversationId?: string
}

export interface ConversationInfo {
  conversationId: string
  title: string
  lastResponseId: string
  createdAt: string
  updatedAt: string
}

export interface ConversationListResponse {
  conversations: ConversationInfo[]
  count: number
}

export interface ConversationExistsResponse {
  conversationId: string
  title?: string
  exists: boolean
  createdAt?: string
  updatedAt?: string
}

export interface HealthResponse {
  status: string
  timestamp: string
  conversationCount: number
}

export interface SendMessageRequest {
  message: string
  conversationId?: string
}

export interface SendMessageResult {
  conversationId: string
  title?: string
  response: {
    id: string
    output_text: string
    [key: string]: any
  }
  createdAt?: string
  updatedAt?: string
}

export interface ConversationData {
  lastResponseId: string
  title: string
  createdAt: string
  updatedAt: string
} 