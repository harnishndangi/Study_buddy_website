import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Layout/Sidebar";

function Pomodoro() {
  // Timer States
  const [time, setTime] = useState(25 * 60); // Default 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhase, setCurrentPhase] = useState("focus"); // 'focus', 'shortBreak', 'longBreak'
  const [completedRounds, setCompletedRounds] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [_currentSessionId, setCurrentSessionId] = useState(null);

  // Session Configuration
  const [studyPeriod, setStudyPeriod] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(15);
  const [purpose, setPurpose] = useState("");
  const [tag, setTag] = useState("");

  // UI States
  const [showSettings, setShowSettings] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalStudyMinutes: 0,
    totalCompletedRounds: 0,
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("timer"); // 'timer', 'sessions', 'stats'

  // Helper function to decode JWT and extract user ID
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

  // API Configuration
  const API_URL = "http://localhost:3000/api/pomodoros";
  const userId = getUserIdFromToken(); // Replace with actual user ID from auth context

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (isActive && !isPaused && time > 0) {
      interval = setInterval(() => {
        setTime((time) => time - 1);
      }, 1000);
    } else if (time === 0) {
      handlePhaseComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused, time]);

  // Handle phase completion
  const handlePhaseComplete = async () => {
    // Play notification sound
    try {
      const audio = new Audio("/notification-sound.mp3");
      audio.play().catch(() => console.log("Audio play failed"));
    } catch {
      console.log("Audio not available");
    }

    if (currentPhase === "focus") {
      const newRounds = completedRounds + 1;
      setCompletedRounds(newRounds);

      // Log completed focus session
      await logCompletedSession(newRounds);

      // Determine next break type
      const nextPhase = newRounds % 4 === 0 ? "longBreak" : "shortBreak";
      setCurrentPhase(nextPhase);
      setTime(nextPhase === "longBreak" ? longBreak * 60 : shortBreak * 60);
    } else {
      // Break completed, start new focus session
      setCurrentPhase("focus");
      setTime(studyPeriod * 60);
    }

    setIsActive(false);
    setIsPaused(false);
  };

  // Start timer
  const startTimer = async () => {
    if (!sessionStartTime) {
      setSessionStartTime(new Date());
      await startSession();
    }
    setIsActive(true);
    setIsPaused(false);
  };

  // Pause timer
  const pauseTimer = () => {
    setIsPaused(true);
  };

  // Reset timer
  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setTime(studyPeriod * 60);
    setCurrentPhase("focus");
    setCompletedRounds(0);
    setSessionStartTime(null);
    setCurrentSessionId(null);
  };

  // API Functions
  const startSession = async () => {
    try {
      const response = await axios.post(`${API_URL}/start/${userId}`, {
        studyPeriod,
        shortBreak,
        longBreak,
        completedRounds: 0,
        startTime: new Date(),
        purpose,
        tag,
      });
      setCurrentSessionId(response.data._id);
      console.log("Session started:", response.data);
    } catch (error) {
      console.error("Error starting session:", error);
    }
  };

  const logCompletedSession = async (rounds) => {
    try {
      await axios.post(`${API_URL}/log/${userId}`, {
        studyPeriod,
        shortBreak,
        longBreak,
        completedRounds: rounds,
        startTime: sessionStartTime,
        endTime: new Date(),
        purpose,
        tag,
      });
      await fetchStats();
      await fetchSessions();
    } catch (error) {
      console.error("Error logging session:", error);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}?userId=${userId}`);
      setSessions(response.data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats/${userId}`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats({
        totalSessions: 0,
        totalStudyMinutes: 0,
        totalCompletedRounds: 0,
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchSessions();
    fetchStats();
  }, []);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Get phase display info
  const getPhaseInfo = () => {
    switch (currentPhase) {
      case "focus":
        return {
          title: "Focus Time",
          color: "text-red-500",
          bgColor: "bg-red-50",
          progressColor: "stroke-red-500",
        };
      case "shortBreak":
        return {
          title: "Short Break",
          color: "text-green-500",
          bgColor: "bg-green-50",
          progressColor: "stroke-green-500",
        };
      case "longBreak":
        return {
          title: "Long Break",
          color: "text-blue-500",
          bgColor: "bg-blue-50",
          progressColor: "stroke-blue-500",
        };
      default:
        return {
          title: "Focus Time",
          color: "text-red-500",
          bgColor: "bg-red-50",
          progressColor: "stroke-red-500",
        };
    }
  };

  const phaseInfo = getPhaseInfo();

  return (
    <>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 ml-20 md:ml-40 p-3 sm:p-6 lg:p-8 bg-gray-50 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-0">
                <div className="bg-red-100 p-1.5 sm:p-2 rounded-lg">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    <span className="text-red-600">Pomodoro</span>{" "}
                    <span className="text-gray-700 hidden sm:inline">
                      Timer
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Stay focused and productive
                  </p>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex bg-white rounded-lg p-1 shadow-sm border w-full sm:w-auto">
                {[
                  { id: "timer", label: "Timer", icon: "⏰" },
                  { id: "sessions", label: "Sessions", icon: "📝" },
                  { id: "stats", label: "Stats", icon: "📊" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-none ${
                      activeTab === tab.id
                        ? "bg-red-600 text-white"
                        : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                    }`}
                  >
                    <span className="text-sm sm:text-base">{tab.icon}</span>
                    <span className="hidden xs:inline sm:inline">
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Timer Tab */}
            {activeTab === "timer" && (
              <div className="space-y-6 sm:space-y-8">
                {/* Main Timer Display */}
                <div
                  className={`${phaseInfo.bgColor} rounded-xl sm:rounded-2xl p-4 sm:p-8 text-center shadow-lg`}
                >
                  <div className="mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
                      {phaseInfo.title}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">
                      {currentPhase === "focus"
                        ? `Round ${completedRounds + 1}`
                        : "Take a break"}
                    </p>
                  </div>

                  {/* Circular Progress - Responsive */}
                  <div
                    className="relative mx-auto mb-6 sm:mb-8"
                    style={{ width: "200px", height: "200px" }}
                  >
                    <svg
                      className="transform -rotate-90 w-full h-full"
                      viewBox="0 0 200 200"
                    >
                      <circle
                        cx="100"
                        cy="100"
                        r="85"
                        stroke="rgba(0,0,0,0.1)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="85"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        className={phaseInfo.progressColor}
                        strokeDasharray={`${2 * Math.PI * 85}`}
                        strokeDashoffset={`${
                          2 *
                          Math.PI *
                          85 *
                          (time /
                            (currentPhase === "focus"
                              ? studyPeriod * 60
                              : currentPhase === "shortBreak"
                              ? shortBreak * 60
                              : longBreak * 60))
                        }`}
                        style={{ transition: "stroke-dashoffset 1s linear" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl sm:text-5xl font-bold text-gray-800 mb-1 sm:mb-2">
                          {formatTime(time)}
                        </div>
                        <div className="text-sm sm:text-lg text-gray-600">
                          {isActive
                            ? isPaused
                              ? "Paused"
                              : "Running"
                            : "Ready"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timer Controls - Mobile Optimized */}
                  <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                    {!isActive || isPaused ? (
                      <button
                        onClick={startTimer}
                        className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md text-sm sm:text-base"
                      >
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2-10v.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        {!sessionStartTime ? "Start" : "Resume"}
                      </button>
                    ) : (
                      <button
                        onClick={pauseTimer}
                        className="flex items-center justify-center gap-2 bg-yellow-600 text-white px-4 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-yellow-700 transition-colors font-semibold shadow-md text-sm sm:text-base"
                      >
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 9v6m4-6v6"
                          />
                        </svg>
                        Pause
                      </button>
                    )}

                    <button
                      onClick={resetTimer}
                      className="flex items-center justify-center gap-2 bg-gray-600 text-white px-4 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold shadow-md text-sm sm:text-base"
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Reset
                    </button>

                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md text-sm sm:text-base"
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="hidden sm:inline">Settings</span>
                    </button>
                  </div>

                  {/* Rounds Counter */}
                  <div className="flex justify-center items-center gap-2 text-gray-600 text-sm sm:text-base">
                    <span>Completed Rounds:</span>
                    <span className="font-bold text-lg sm:text-xl">
                      {completedRounds}
                    </span>
                    <div className="flex gap-1 ml-2">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                            i < completedRounds % 4
                              ? "bg-red-500"
                              : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Settings Panel - Mobile Optimized */}
                {showSettings && (
                  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border">
                    <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                        />
                      </svg>
                      Timer Settings
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Focus Duration (minutes)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={studyPeriod}
                          onChange={(e) =>
                            setStudyPeriod(parseInt(e.target.value) || 1)
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-base"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Short Break (minutes)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={shortBreak}
                          onChange={(e) =>
                            setShortBreak(parseInt(e.target.value) || 1)
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-base"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Long Break (minutes)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={longBreak}
                          onChange={(e) =>
                            setLongBreak(parseInt(e.target.value) || 1)
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-base"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Purpose/Goal
                        </label>
                        <input
                          type="text"
                          value={purpose}
                          onChange={(e) => setPurpose(e.target.value)}
                          placeholder="What are you working on?"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-base"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-2">
                          Tag/Category
                        </label>
                        <input
                          type="text"
                          value={tag}
                          onChange={(e) => setTag(e.target.value)}
                          placeholder="e.g., Study, Work, Project"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-base"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                      <button
                        onClick={() => setShowSettings(false)}
                        className="w-full sm:w-auto px-6 py-3 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setTime(studyPeriod * 60);
                          setShowSettings(false);
                        }}
                        className="w-full sm:w-auto px-6 py-3 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Apply Settings
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sessions Tab */}
            {activeTab === "sessions" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Recent Sessions
                  </h2>
                  <button
                    onClick={fetchSessions}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Refresh
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-red-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 text-sm sm:text-base">
                      Loading sessions...
                    </p>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <div className="text-gray-400 mb-4">
                      <svg
                        className="w-12 h-12 sm:w-16 sm:h-16 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-gray-900 text-lg font-semibold mb-2">
                      No sessions recorded yet
                    </h3>
                    <p className="text-gray-500 text-sm mb-6">
                      Start your first Pomodoro session to see your progress
                      here
                    </p>
                    <button
                      onClick={() => setActiveTab("timer")}
                      className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Start Your First Session
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {sessions.map((session) => (
                      <div
                        key={session._id}
                        className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base break-words flex-1">
                              {session.purpose || "Pomodoro Session"}
                            </h3>
                            {session.tag && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full whitespace-nowrap">
                                {session.tag}
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                            <div className="break-words">
                              <span className="font-medium">Study:</span>{" "}
                              {session.studyPeriod}m
                            </div>
                            <div className="break-words">
                              <span className="font-medium">Rounds:</span>{" "}
                              {session.completedRounds}
                            </div>
                            <div className="break-words">
                              <span className="font-medium">Short:</span>{" "}
                              {session.shortBreak}m
                            </div>
                            <div className="break-words">
                              <span className="font-medium">Long:</span>{" "}
                              {session.longBreak}m
                            </div>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 border-t pt-2">
                            {new Date(session.createdAt).toLocaleDateString()}{" "}
                            at{" "}
                            {new Date(session.createdAt).toLocaleTimeString(
                              undefined,
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Stats Tab - Fixed and Mobile Optimized */}
            {activeTab === "stats" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Your Statistics
                  </h2>
                  <button
                    onClick={fetchStats}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Refresh Stats
                  </button>
                </div>

                {/* Main Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sm:p-6 rounded-xl shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 sm:p-3 rounded-lg">
                        <svg
                          className="w-6 h-6 sm:w-8 sm:h-8"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-blue-100 text-xs sm:text-sm">
                          Total Sessions
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold">
                          {stats.totalSessions || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 sm:p-6 rounded-xl shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 sm:p-3 rounded-lg">
                        <svg
                          className="w-6 h-6 sm:w-8 sm:h-8"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-green-100 text-xs sm:text-sm">
                          Study Minutes
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold">
                          {stats.totalStudyMinutes || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 sm:p-6 rounded-xl shadow-lg sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 sm:p-3 rounded-lg">
                        <svg
                          className="w-6 h-6 sm:w-8 sm:h-8"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-purple-100 text-xs sm:text-sm">
                          Completed Rounds
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold">
                          {stats.totalCompletedRounds || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Stats - Mobile Optimized */}
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">
                    Productivity Insights
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">
                        {stats.totalStudyMinutes > 0
                          ? Math.round((stats.totalStudyMinutes / 60) * 10) / 10
                          : 0}
                        h
                      </div>
                      <p className="text-gray-600 text-sm sm:text-base">
                        Total Study Hours
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                        {stats.totalSessions > 0
                          ? Math.round(
                              stats.totalStudyMinutes / stats.totalSessions
                            )
                          : 0}
                        min
                      </div>
                      <p className="text-gray-600 text-sm sm:text-base">
                        Avg Session Length
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
                        {stats.totalSessions > 0
                          ? Math.round(
                              (stats.totalCompletedRounds /
                                stats.totalSessions) *
                                10
                            ) / 10
                          : 0}
                      </div>
                      <p className="text-gray-600 text-sm sm:text-base">
                        Avg Rounds/Session
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">
                        {stats.totalCompletedRounds > 0
                          ? Math.round((stats.totalCompletedRounds / 4) * 10) /
                            10
                          : 0}
                      </div>
                      <p className="text-gray-600 text-sm sm:text-base">
                        Complete Cycles
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Chart Placeholder */}
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">
                    Recent Activity
                  </h3>
                  <div className="text-center py-8 text-gray-500">
                    <svg
                      className="w-12 h-12 mx-auto mb-3 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <p className="text-sm">Activity chart coming soon...</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Complete more sessions to see your progress visualization
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export default Pomodoro;
