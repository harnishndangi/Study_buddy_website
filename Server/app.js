import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import noteRoutes from "./routes/notes.js";
import taskRoutes from "./routes/tasks.js";
import pomodoroRoutes from "./routes/pomodoros.js";
import calendarRoutes from "./routes/calendar.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/pomodoros", pomodoroRoutes);
app.use("/api/calendar", calendarRoutes);

export { app };
