import express from "express";
import { ConversationService } from "./conversationService.js";
import { createApiRoutes } from "./apiRoutes.js";

const app = express();
const conversationService = new ConversationService();

// Middleware
app.use(express.json());

// Use API routes
app.use(createApiRoutes(conversationService));

// Export for local server
export default app;

// Export for Vercel
export const config = {
  api: {
    bodyParser: false, // Disable the built-in body parser as we're using express.json()
  },
};

// Handle Vercel serverless function format
module.exports = app; 