import app from "./api/index.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Conversation API server running on port ${PORT}`);
  console.log(`\nEndpoints:`);
  console.log(`  POST /conversations - Create new conversation or continue existing`);
  console.log(`  POST /conversations/:uuid/messages - Send message to specific conversation`);
  console.log(`  GET /conversations - List all conversation UUIDs`);
  console.log(`  GET /conversations/:uuid - Check if conversation exists`);
  console.log(`  GET /health - Health check`);
}); 