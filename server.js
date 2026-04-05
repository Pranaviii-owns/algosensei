// server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import problemsRouter from "./problems.js";

const app = express();
app.use(cors());
app.use(express.json());
console.log("Server middleware configured");

// Connect to MongoDB
const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
console.log("MongoDB connected successfully.");

// Pass MongoDB client to the router
app.use("/api/problems", problemsRouter(client));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "AlgoSensi API Running 🚀", timestamp: new Date() });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log("=================================");
  console.log(`🚀 SERVER RUNNING ON PORT ${PORT}`);
  console.log("Frontend: http://localhost:3000");
  console.log("API Docs: POST /api/problems, GET /api/problems, POST /api/problems/:id/generate");
  console.log("=================================");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  await client.close();
  process.exit(0);
});