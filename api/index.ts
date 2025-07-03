import express from "express";
import { ConversationService } from "./conversationService.js";
import { createApiRoutes } from "./apiRoutes.js";

const app = express();
const conversationService = new ConversationService();

// Middleware
app.use(express.json());

// Use API routes
app.use(createApiRoutes(conversationService));

// Export the Express app as a Vercel serverless function
export default app; 