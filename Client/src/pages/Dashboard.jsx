import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Layout/Sidebar";
import { Book, Calendar, CheckSquare, Clock, PlusCircle } from "lucide-react";

// --- Reusable Child Components for the Dashboard ---

// A card for displaying key statistics
const StatCard = ({ title, value, icon, color, linkTo }) => (
  <Link to={linkTo} className="block">
    <div
      className={`p-3 sm:p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4 border-l-4 ${color} min-h-[100px] sm:min-h-[80px]`}
    >
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div className="text-center sm:text-left">
        <p className="text-xs sm:text-sm text-gray-500">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  </Link>
);

// A generic card component for dashboard widgets
const DashboardCard = ({ title, icon, linkTo, children }) => (
  <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 flex flex-col h-full">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 sm:gap-0">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-base sm:text-lg font-bold text-gray-700">{title}</h3>
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 self-start sm:self-auto"
        >
          View all
        </Link>
      )}
    </div>
    <div className="flex-grow overflow-y-auto">{children}</div>
  </div>
);
 
function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [notes, setRecentNotes] = useState([]);
  const [pomodoroStats, setPomodoroStats] = useState({
    sessionsToday: 0,
    focusMinutes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

   const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId || payload.id || payload.sub;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // --- Data Fetching with Axios ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");
      try {
        const today = new Date().toISOString().split("T")[0];

        // Upcoming window for events: now -> +30 days
        const startFromNow = new Date().toISOString();
        const endIn30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        
        // Note: Using a dummy userId for pomodoro stats. In a real app, get this from auth context
        const userId = getUserIdFromToken();

        const [tasksResponse, eventsResponse, notesResponse, pomoResponse] =
        await Promise.all([
        // Get all tasks since backend doesn't support filtering by deadline/status yet
        axios.get("http://localhost:3000/api/tasks"),
        // Fetch upcoming events from calendar (sorted ascending)
        axios.get(`http://localhost:3000/api/calendar?startDate=${encodeURIComponent(startFromNow)}&endDate=${encodeURIComponent(endIn30Days)}&sortBy=start&sortOrder=asc`),
          // Get recent notes - backend supports search but not limit/sortBy params
            axios.get("http://localhost:3000/api/notes"),
            // Get pomodoro stats with userId param
            axios.get(`http://localhost:3000/api/pomodoros/stats/${userId}`),
          ]);

        // Filter tasks for today's deadline and pending status on frontend
        const todayTasks = tasksResponse.data.filter(task => {
          if (!task.deadline) return false;
          const taskDate = new Date(task.deadline).toISOString().split("T")[0];
          return taskDate === today && !task.completed;
        });

        // Handle calendar response structure
        const calendarData = eventsResponse.data?.success 
          ? eventsResponse.data.data 
          : eventsResponse.data || [];

        setTasks(todayTasks.slice(0, 5)); // Show max 5 tasks
        setEvents(calendarData.slice(0, 5) || []); // Show max 5 events
        setRecentNotes(notesResponse.data?.slice(0, 4) || []); // Show max 4 notes
        
        // Handle pomodoro stats - transform to match UI expectations
        const pomodoroData = pomoResponse.data || {};
        setPomodoroStats({
          sessionsToday: pomodoroData.totalSessions || 0,
          focusMinutes: pomodoroData.totalStudyMinutes || 0
        });
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Could not load dashboard data. Using sample data.");
        // Set some sample data on error to showcase the UI
        setTasks([
          { _id: "1", title: "Review project proposal", priority: "high" },
        ]);
        setEvents([{ _id: "1", title: "Team Standup", start: new Date() }]);
        setRecentNotes([{ _id: "1", title: "Meeting Notes - Q3 Planning" }]);
        setPomodoroStats({ sessionsToday: 0, focusMinutes: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="ml-0 md:ml-40 p-3 sm:p-4 lg:p-6 xl:p-8 pt-14 md:pt-0">
        <div className="max-w-7xl mx-auto">
          {/* --- Header --- */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Here's a snapshot of your day.</p>
            {error && (
              <div className="mt-2 p-2 sm:p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded text-sm">
                {error}
              </div>
            )}
          </div>

          {/* --- Quick Stats --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <StatCard
              title="Tasks Due Today"
              value={loading ? "..." : tasks.length}
              icon={<CheckSquare className="text-orange-500" size={32} />}
              color="border-orange-500"
              linkTo="/tasks"
            />
            <StatCard
              title="Upcoming Events"
              value={loading ? "..." : events.length}
              icon={<Calendar className="text-indigo-500" size={32} />}
              color="border-indigo-500"
              linkTo="/calendar"
              />
            <StatCard
              title="Pomodoros Today"
              value={loading ? "..." : pomodoroStats.sessionsToday}
              icon={<Clock className="text-green-500" size={32} />}
              color="border-green-500"
              linkTo="/pomodoro"
            />
            <StatCard
              title="Recent Notes"
              value={loading ? "..." : notes.length}
              icon={<Book className="text-blue-500" size={32} />}
              color="border-blue-500"
              linkTo="/notes"
            />
          </div>

          {/* --- Main Content Grid --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* --- Tasks and Events (Main Column) --- */}
            <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
              <DashboardCard
                title="Today's Tasks"
                icon={<CheckSquare size={20} className="text-orange-500" />}
                linkTo="/tasks"
              >
                {loading ? (
                  <p>Loading tasks...</p>
                ) : tasks.length > 0 ? (
                <ul className="space-y-2 sm:space-y-3">
                {tasks.map((task) => (
                <li
                key={task._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 rounded-md hover:bg-gray-50 gap-2 sm:gap-0"
                >
                <span className="font-medium text-gray-700 text-sm sm:text-base">
                {task.title}
                </span>
                <span
                className={`px-2 py-1 text-xs font-semibold rounded-full self-start sm:self-auto ${
                task.priority === "high"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
                }`}
                >
                {task.priority}
                </span>
                </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No tasks due today. Great job!
                  </p>
                )}
              </DashboardCard>

              <DashboardCard
                title="Upcoming Events"
                icon={<Calendar size={20} className="text-indigo-500" />}
                linkTo="/calendar"
              >
                {loading ? (
                  <p>Loading events...</p>
                ) : events.length > 0 ? (
                <ul className="space-y-2 sm:space-y-3">
                {events.map((event) => (
                <li
                key={event._id}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-md hover:bg-gray-50"
                >
                <span className="font-bold text-indigo-600 text-sm">
                {formatDate(event.start)}
                </span>
                <span className="font-medium text-gray-700 text-sm sm:text-base">
                {event.title}
                </span>
                </li>
                    ))}
                  </ul>
                ) : (
                <p className="text-gray-500 text-center py-4">
                No upcoming events.
                </p>
                )}
              </DashboardCard>
            </div>

            {/* --- Notes and Quick Actions (Side Column) --- */}
            <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6">
              <DashboardCard
                title="Recent Notes"
                icon={<Book size={20} className="text-blue-500" />}
                linkTo="/notes"
              >
                {loading ? (
                  <p>Loading notes...</p>
                ) : notes.length > 0 ? (
                <ul className="space-y-2">
                {notes.map((note) => (
                <li
                key={note._id}
                className="truncate p-2 sm:p-3 rounded-md hover:bg-gray-50 font-medium text-gray-600 cursor-pointer"
                >
                <Link to={`/notes/${note._id}`} className="text-sm sm:text-base">{note.title}</Link>
                </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No recent notes found.
                  </p>
                )}
              </DashboardCard>

              <DashboardCard
                title="Quick Actions"
                icon={<PlusCircle size={20} className="text-gray-500" />}
              >
                <div className="flex flex-col space-y-3">
                  <Link
                    to="/tasks"
                    className="w-full text-center bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold shadow hover:bg-indigo-700 transition text-sm sm:text-base min-h-[44px] flex items-center justify-center"
                  >
                    Add New Task
                  </Link>
                  <Link
                    to="/calendar"
                    className="w-full text-center bg-white text-indigo-600 border border-indigo-200 py-3 px-4 rounded-lg font-semibold shadow hover:bg-indigo-50 transition text-sm sm:text-base min-h-[44px] flex items-center justify-center"
                  >
                    Schedule Event
                  </Link>
                </div>
              </DashboardCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
