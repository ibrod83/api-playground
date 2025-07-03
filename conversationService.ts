import dotenv from "dotenv"
import OpenAI from "openai"
import { v4 as uuidv4 } from "uuid"
import fs from "fs/promises"
import path from "path"
import { SendMessageResult, ConversationData, ConversationInfo } from "./types.js"

dotenv.config()

export class ConversationService {
  private openai: OpenAI
  private dbPath: string
  private convMap: Record<string, ConversationData> = {}

  constructor() {
    this.openai = new OpenAI()
    this.dbPath = path.resolve("./conversations.json")
  }

  /**
   * Load (or initialize) the conversation map from disk
   */
  private async loadConvMap(): Promise<void> {
    try {
      const data = await fs.readFile(this.dbPath, "utf8")
      this.convMap = JSON.parse(data)
    } catch (err) {
      // If file doesn't exist or parse fails, start with empty map
      this.convMap = {}
    }
  }

  /**
   * Persist the conversation map back to disk
   */
  private async saveConvMap(): Promise<void> {
    await fs.writeFile(this.dbPath, JSON.stringify(this.convMap, null, 2), "utf8")
  }

  /**
   * Generate a title for a conversation based on the first message
   */
  private async generateTitle(userMessage: string): Promise<string> {
    try {
      const response = await this.openai.responses.create({
        model: "gpt-4o-mini",
        input: `Generate a short, descriptive title (3-6 words) for a conversation that starts with this message: "${userMessage}". Only return the title, nothing else.`,
        store: false
      })
      
      const title = response.output_text.trim()
      // Clean up the title - remove quotes and limit length
      return title.replace(/^["']|["']$/g, '').substring(0, 50)
    } catch (error) {
      console.error('Error generating title:', error)
      // Fallback: create a title from the first few words of the message
      const words = userMessage.split(' ').slice(0, 4).join(' ')
      return words.length > 20 ? words.substring(0, 20) + '...' : words
    }
  }

  /**
   * Send a message in a (possibly-new) stateful chain.
   * Persists the updated convMap after each call.
   *
   * @param conversationId - Pass `null` to start a **new** conversation, otherwise pass the UUID
   * @param userMessage - The user's prompt for this turn
   * @returns Promise with conversationId and response
   */
  async sendMessage(conversationId: string | null, userMessage: string): Promise<SendMessageResult> {
    await this.loadConvMap()
    let uuid = conversationId || uuidv4()
    const isNewConversation = !conversationId
    const conversationData = this.convMap[uuid]
    const prevId = conversationData?.lastResponseId
    const now = new Date().toISOString()
    const payload = {
      model: "gpt-4o-mini",
      input: userMessage,
      store: true,
      metadata: { conversation_id: uuid },
      ...(prevId ? { previous_response_id: prevId } : {}),
    }
    const resp = await this.openai.responses.create(payload)
    let title = conversationData?.title
    let createdAt = conversationData?.createdAt
    if (isNewConversation) {
      title = await this.generateTitle(userMessage)
      createdAt = now
    }
    this.convMap[uuid] = {
      lastResponseId: resp.id,
      title: title || "Untitled Conversation",
      createdAt: createdAt || now,
      updatedAt: now
    }
    await this.saveConvMap()
    return { 
      conversationId: uuid, 
      title: this.convMap[uuid].title,
      response: resp,
      createdAt: this.convMap[uuid].createdAt,
      updatedAt: this.convMap[uuid].updatedAt
    }
  }

  /**
   * Get all conversation info (ID, title, lastResponseId, createdAt, updatedAt)
   */
  async getConversationInfos(): Promise<ConversationInfo[]> {
    await this.loadConvMap()
    return Object.entries(this.convMap).map(([id, data]) => ({
      conversationId: id,
      title: data.title,
      lastResponseId: data.lastResponseId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    }))
  }

  /**
   * Get all conversation IDs (for backward compatibility)
   */
  async getConversationIds(): Promise<string[]> {
    await this.loadConvMap()
    return Object.keys(this.convMap)
  }

  /**
   * Check if a conversation exists
   */
  async conversationExists(uuid: string): Promise<boolean> {
    await this.loadConvMap()
    return uuid in this.convMap
  }

  /**
   * Get conversation title
   */
  async getConversationTitle(uuid: string): Promise<string | undefined> {
    await this.loadConvMap()
    return this.convMap[uuid]?.title
  }

  async getConversationCreatedAt(uuid: string): Promise<string | undefined> {
    await this.loadConvMap()
    return this.convMap[uuid]?.createdAt
  }

  async getConversationUpdatedAt(uuid: string): Promise<string | undefined> {
    await this.loadConvMap()
    return this.convMap[uuid]?.updatedAt
  }

  /**
   * Get the database path for debugging/logging
   */
  getDbPath(): string {
    return this.dbPath
  }

  /**
   * Get conversation count
   */
  async getConversationCount(): Promise<number> {
    await this.loadConvMap()
    return Object.keys(this.convMap).length
  }
} 