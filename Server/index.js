import express from "express";
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
const allowedOrigins = [
  "https://study-buddy-website-ennx.onrender.com",
  process.env.CORS_ORIGIN,
].filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Increase limit for larger payloads

// Basic auth rate limiting
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api/auth", authLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/notes", protectedRoute, noteRoutes);
app.use("/api/tasks", protectedRoute, taskRoutes);
app.use("/api/pomodoros", protectedRoute, pomodoroRoutes);
app.use("/api/calendar", protectedRoute, calendarRoutes);
app.use("/api/groups", protectedRoute, groupRoutes);

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: allowedOrigins, credentials: true },
});

io.on("connection", (socket) => {
  // client should emit: join_group { groupId }
  socket.on("join_group", ({ groupId }) => {
    if (groupId) socket.join(`group:${groupId}`);
  });

  // client emits: group_message { groupId, userId, content }
  socket.on("group_message", async ({ groupId, userId, content }) => {
    if (!groupId || !userId || !content) return;
    try {
      // ensure sender is a member of the group
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

  socket.on("disconnect", () => {});
});

app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running" });
});

httpServer.listen(port, async () => {
  await connectDB();
  console.log(`Server is running on http://localhost:${port}`);
});
