import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/axiosConfig";
import Sidebar from "../components/Layout/Sidebar";
import {
  BarChart3,
  Calendar,
  CheckSquare,
  Clock,
  Book,
  TrendingUp,
  Target,
  Activity,
} from "lucide-react";

// Utility function to get user ID from token
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

// Reusable components
const StatCard = ({
  title,
  value,
  // eslint-disable-next-line no-unused-vars
  icon: Icon,
  description,
  color = "bg-indigo-600",
}) => (
  <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 border-indigo-500 hover:shadow-lg transition-shadow duration-300">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
        {description && (
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace("bg-", "text-")}`} />
      </div>
    </div>
  </div>
);

const ChartCard = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-md p-4 sm:p-6 ${className}`}>
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    <div className="h-64">{children}</div>
  </div>
);

// Simple Bar Chart Component
const SimpleBarChart = ({ data, dataKey, labelKey, color = "#4F46E5" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map((item) => item[dataKey] || 0));

  return (
    <div className="flex justify-around items-end h-full gap-2 px-4">
      {data.map((item, index) => (
        <div
          key={index}
          className="flex-1 flex flex-col items-center group max-w-16"
        >
          <div className="relative flex-1 flex items-end w-full">
            <div
              className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80"
              style={{
                backgroundColor: color,
                height: `${
                  maxValue > 0 ? (item[dataKey] / maxValue) * 100 : 0
                }%`,
                minHeight: item[dataKey] > 0 ? "8px" : "2px",
              }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {item[dataKey]}
              </div>
            </div>
          </div>
          <span className="text-xs text-gray-500 mt-2 text-center truncate w-full">
            {item[labelKey]}
          </span>
        </div>
      ))}
    </div>
  );
};

// Simple Pie Chart Component
const SimplePieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No data available
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = [
    "#4F46E5",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
  ];

  let cumulative = 0;
  const segments = data.map((item, index) => {
    const start = cumulative;
    cumulative += (item.value / total) * 100;
    const end = cumulative;
    return {
      ...item,
      start,
      end,
      color: colors[index % colors.length],
    };
  });

  const gradientStops = segments
    .map((s) => `${s.color} ${s.start}% ${s.end}%`)
    .join(", ");

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 h-full">
      <div
        className="w-32 h-32 sm:w-40 sm:h-40 rounded-full"
        style={{ background: `conic-gradient(${gradientStops})` }}
      />
      <div className="space-y-2">
        {segments.map((item, index) => (
          <div key={index} className="flex items-center text-sm">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-600">{item.label}:</span>
            <span className="font-semibold text-gray-900 ml-2">
              {((item.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analyticsData, setAnalyticsData] = useState({
    tasks: [],
    notes: [],
    pomodoros: [],
    events: [],
  });
  const [dateRange, setDateRange] = useState("week");

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const userId = getUserIdFromToken();
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Calculate date range
      const today = new Date();
      let startDate = new Date();

      switch (dateRange) {
        case "day":
          startDate.setDate(today.getDate() - 1);
          break;
        case "week":
          startDate.setDate(today.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(today.getMonth() - 1);
          break;
        default:
          startDate.setDate(today.getDate() - 7);
      }

      const startDateStr = startDate.toISOString();
      const endDateStr = today.toISOString();

      // Fetch data from all endpoints
      const [tasksResponse, notesResponse, pomodorosResponse, eventsResponse] =
        await Promise.all([
          axiosInstance
            .get("/tasks")
            .catch(() => ({ data: [] })),
          axiosInstance
            .get("/notes")
            .catch(() => ({ data: [] })),
          axiosInstance
            .get(`/pomodoros/stats/${userId}`)
            .catch(() => ({ data: {} })),
          axiosInstance
            .get(
              `/calendar?startDate=${startDateStr}&endDate=${endDateStr}`
            )
            .catch(() => ({ data: [] })),
        ]);

      // Process and filter data based on date range
      const filteredTasks = tasksResponse.data.filter((task) => {
        const taskDate = new Date(task.createdAt || task.deadline);
        return taskDate >= startDate && taskDate <= today;
      });

      const filteredNotes = notesResponse.data.filter((note) => {
        const noteDate = new Date(note.createdAt || note.updatedAt);
        return noteDate >= startDate && noteDate <= today;
      });

      const calendarData = eventsResponse.data?.success
        ? eventsResponse.data.data
        : eventsResponse.data || [];
      const filteredEvents = calendarData.filter((event) => {
        const eventDate = new Date(event.start || event.createdAt);
        return eventDate >= startDate && eventDate <= today;
      });

      setAnalyticsData({
        tasks: filteredTasks,
        notes: filteredNotes,
        pomodoros: pomodorosResponse.data,
        events: filteredEvents,
      });
    } catch (err) {
      console.error("Failed to fetch analytics data:", err);
      setError("Failed to fetch analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Data processing functions
  const getTaskStats = () => {
    const completed = analyticsData.tasks.filter(
      (task) => task.completed
    ).length;
    const total = analyticsData.tasks.length;
    const completionRate =
      total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

    const priorityData = analyticsData.tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.entries(priorityData).map(([priority, count]) => ({
      label: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: count,
    }));

    return { completed, total, completionRate, chartData };
  };

  const getPomodoroStats = () => {
    const sessions = analyticsData.pomodoros.totalSessions || 0;
    const studyMinutes = analyticsData.pomodoros.totalStudyMinutes || 0;
    const studyHours = (studyMinutes / 60).toFixed(1);

    return { sessions, studyMinutes, studyHours };
  };

  const getProductivityTrend = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const tasksByDay = analyticsData.tasks.reduce((acc, task) => {
      const day = new Date(task.createdAt || task.deadline).getDay();
      const dayName = days[day];
      acc[dayName] = (acc[dayName] || 0) + 1;
      return acc;
    }, {});

    return days.map((day) => ({
      day,
      tasks: tasksByDay[day] || 0,
    }));
  };

  const getSubjectDistribution = () => {
    const subjects = analyticsData.tasks.reduce((acc, task) => {
      if (task.subject) {
        acc[task.subject] = (acc[task.subject] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(subjects).map(([subject, count]) => ({
      label: subject,
      value: count,
    }));
  };

  const taskStats = getTaskStats();
  const pomodoroStats = getPomodoroStats();
  const trendData = getProductivityTrend();
  const subjectData = getSubjectDistribution();

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Sidebar />
        <main className="ml-0 md:ml-40 p-4 sm:p-6 lg:p-8 pt-14 md:pt-0">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <span className="ml-4 text-gray-600">Loading analytics...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="ml-0 md:ml-40 p-4 sm:p-6 lg:p-8 pt-14 md:pt-0">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Analytics Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Track your productivity and study patterns
                </p>
              </div>

              {/* Date Range Filter */}
              <div className="flex flex-wrap items-center gap-2 bg-white rounded-lg p-1 shadow-sm border">
                {["day", "week", "month"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${
                      dateRange === range
                        ? "bg-indigo-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <StatCard
              title="Total Tasks"
              value={taskStats.total}
              icon={CheckSquare}
              description={`${taskStats.completed} completed`}
              color="bg-blue-600"
            />
            <StatCard
              title="Study Sessions"
              value={pomodoroStats.sessions}
              icon={Clock}
              description={`${pomodoroStats.studyHours}h total`}
              color="bg-green-600"
            />
            <StatCard
              title="Notes Created"
              value={analyticsData.notes.length}
              icon={Book}
              description="This period"
              color="bg-purple-600"
            />
            <StatCard
              title="Completion Rate"
              value={`${taskStats.completionRate}%`}
              icon={Target}
              description="Task completion"
              color="bg-orange-600"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
            <ChartCard title="Task Priority Distribution">
              <SimplePieChart data={taskStats.chartData} />
            </ChartCard>

            <ChartCard title="Weekly Productivity Trend">
              <SimpleBarChart
                data={trendData}
                dataKey="tasks"
                labelKey="day"
                color="#4F46E5"
              />
            </ChartCard>

            {subjectData.length > 0 && (
              <ChartCard title="Subject Distribution" className="lg:col-span-2">
                <SimplePieChart data={subjectData} />
              </ChartCard>
            )}
          </div>

          {/* Additional Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {taskStats.completed} tasks completed
                    </p>
                    <p className="text-xs text-gray-500">This {dateRange}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {pomodoroStats.studyHours} hours studied
                    </p>
                    <p className="text-xs text-gray-500">Focus time</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Book className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {analyticsData.notes.length} notes created
                    </p>
                    <p className="text-xs text-gray-500">Knowledge captured</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Task Completion</span>
                    <span className="font-medium">
                      {taskStats.completionRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${taskStats.completionRate}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Study Goal</span>
                    <span className="font-medium">
                      {Math.min(
                        100,
                        (pomodoroStats.sessions / 5) * 100
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (pomodoroStats.sessions / 5) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Target: 5 sessions
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recommendations
              </h3>
              <div className="space-y-3">
                {taskStats.completionRate < 50 && (
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-900">
                        Improve Task Completion
                      </p>
                      <p className="text-xs text-orange-700">
                        Focus on completing smaller tasks first
                      </p>
                    </div>
                  </div>
                )}
                {pomodoroStats.sessions < 3 && (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Increase Study Time
                      </p>
                      <p className="text-xs text-blue-700">
                        Try to add more Pomodoro sessions
                      </p>
                    </div>
                  </div>
                )}
                {taskStats.completionRate >= 80 &&
                  pomodoroStats.sessions >= 3 && (
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-900">
                          Great Progress!
                        </p>
                        <p className="text-xs text-green-700">
                          Keep up the excellent work
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Analytics;
