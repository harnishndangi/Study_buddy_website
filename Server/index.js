import express from "express";
import "dotenv/config";
import cors from "cors";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { connectDB } from "./library/db.js";
import authRoutes from "./routes/auth.js";
import noteRoutes from "./routes/notes.js";
import taskRoutes from "./routes/tasks.js";
import pomodoroRoutes from "./routes/pomodoros.js";
import calendarRoutes from "./routes/calendar.js";
import groupRoutes from "./routes/groups.js";
import { GroupMessage } from "./models/GroupMessage.js";
import protectedRoute from "./middleware/protectedRoute.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Increase limit for larger payloads

app.use("/api/auth", authRoutes);
app.use("/api/notes", protectedRoute, noteRoutes);
app.use("/api/tasks", protectedRoute, taskRoutes);
app.use("/api/pomodoros", protectedRoute, pomodoroRoutes);
app.use("/api/calendar", protectedRoute, calendarRoutes);
app.use("/api/groups", protectedRoute, groupRoutes);

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: "*" },
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

httpServer.listen(port, async () => {
  await connectDB();
  console.log(`Server is running on http://localhost:${port}`);
});
