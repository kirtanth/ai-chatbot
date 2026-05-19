import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

app.post("/chat", async (req, res) => {
  const { messages } = req.body;

  // Set headers for streaming
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: `You are a helpful assistant who is an expert 
    in JavaScript and web development. Be concise and 
    always include code examples when relevant.`,
    messages: messages, // 👈 full history from frontend
  });

  // Send each chunk to frontend as it arrives
  for await (const chunk of stream) {
    if (chunk.delta?.text) {
      res.write(chunk.delta.text);
    }
  }

  res.end();
});

app.listen(3001, () => {
  console.log("Server running on port 3001 ✅");
});