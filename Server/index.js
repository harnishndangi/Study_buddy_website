import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { connectDB } from "./library/db.js";
import authRoutes from "./routes/auth.js";
import noteRoutes from "./routes/notes.js";
import taskRoutes from "./routes/tasks.js";
import pomodoroRoutes from "./routes/pomodoros.js";
import calendarRoutes from "./routes/calendar.js";
import groupRoutes from "./routes/groups.js";
import { Group } from "./models/Group.js";
import { GroupMessage } from "./models/GroupMessage.js";
import protectedRoute from "./middleware/protectedRoute.js";

const app = express();
const port = process.env.PORT || 3000;

// Configure allowed origins for CORS
const allowedOrigins = [
  "https://study-buddy-x4l2.onrender.com",
  "https://study-buddy-lilac-omega.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CORS_ORIGIN,
].filter(Boolean);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS blocked origin: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    exposedHeaders: ["Set-Cookie"],
    maxAge: 86400,
  })
);

// Handle preflight requests explicitly
app.options(
  /(.*)/,
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Basic auth rate limiting
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api/auth", authLimiter);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - Origin: ${req.get("origin") || "none"}`);
  next();
});

// Health check route (before other routes)
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", protectedRoute, noteRoutes);
app.use("/api/tasks", protectedRoute, taskRoutes);
app.use("/api/pomodoros", protectedRoute, pomodoroRoutes);
app.use("/api/calendar", protectedRoute, calendarRoutes);
app.use("/api/groups", protectedRoute, groupRoutes);

// 404 handler - MUST use named wildcard for Express v5+
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Create HTTP server
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: allowedOrigins, credentials: true },
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("👤 User connected:", socket.id);

  socket.on("join_group", ({ groupId }) => {
    if (groupId) {
      socket.join(`group:${groupId}`);
      console.log(`User ${socket.id} joined group ${groupId}`);
    }
  });

  socket.on("group_message", async ({ groupId, userId, content }) => {
    if (!groupId || !userId || !content) return;
    try {
      const isMember = await Group.exists({ _id: groupId, members: userId });
      if (!isMember) return;

      const msg = await GroupMessage.create({
        group: groupId,
        sender: userId,
        content,
      });

      io.to(`group:${groupId}`).emit("group_message", {
        _id: msg._id,
        group: groupId,
        sender: userId,
        content,
        createdAt: msg.createdAt,
      });
    } catch (e) {
      console.error("Error saving group message:", e);
    }
  });

  socket.on("disconnect", () => {
    console.log("👋 User disconnected:", socket.id);
  });
});

// Start server
httpServer.listen(port, async () => {
  try {
    await connectDB();
    console.log(`✅ Server is running on port ${port}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🔗 CORS Origins: ${allowedOrigins.join(", ")}`);
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
});
