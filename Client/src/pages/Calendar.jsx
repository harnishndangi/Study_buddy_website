import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axiosConfig";
import Sidebar from "../components/Layout/Sidebar";

// Calendar Component with optimized screen fit and scrolling
function Calendar() {
  // State management
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState("month");
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filters, setFilters] = useState({
    eventType: "",
    searchTerm: "",
  });

  // Form state for creating/editing events
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    eventType: "",
    color: "#3498db",
    notifications: [],
  });
 
  const [editMode, setEditMode] = useState(false);
  const modalRef = useRef(null);

  // Predefined event types and colors
  const eventTypes = [
    { value: "exam", label: "Exam", color: "#e74c3c" },
    { value: "session", label: "Session", color: "#2ecc71" },
    { value: "meeting", label: "Meeting", color: "#3498db" },
    { value: "workshop", label: "Workshop", color: "#9b59b6" },
    { value: "assignment", label: "Assignment", color: "#f39c12" },
    { value: "birthday", label: "Birthday", color: "#FDE29B" },
    { value: "other", label: "Other", color: "#95a5a6" },
  ];

  // Fetch events on component mount and when filters change
  useEffect(() => {
    fetchEvents();
  }, [currentDate, filters, viewMode]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    if (showEventModal || showEventDetails) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEventModal, showEventDetails]);

  // Fetch events from backend
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const startDate = getViewStartDate();
      const endDate = getViewEndDate();

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ...(filters.eventType && { eventType: filters.eventType }),
        sortBy: "start",
        sortOrder: "asc",
      });

      const response = await axiosInstance.get(`/calendar?${params}`);
      if (response.data.success) {
        setEvents(response.data.data);
      } else {
        setError("Failed to fetch events");
      }
    } catch (err) {
      setError(
        "Error fetching events: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Get start date for current view
  const getViewStartDate = () => {
    const date = new Date(currentDate);
    switch (viewMode) {
      case "month":
        date.setDate(1);
        date.setDate(date.getDate() - date.getDay());
        break;
      case "week":
        date.setDate(date.getDate() - date.getDay());
        break;
      case "day":
        break;
      default:
        break;
    }
    return date;
  };

  // Get end date for current view
  const getViewEndDate = () => {
    const date = new Date(currentDate);
    switch (viewMode) {
      case "month":
        date.setMonth(date.getMonth() + 1, 0);
        date.setDate(date.getDate() + (6 - date.getDay()));
        break;
      case "week":
        date.setDate(date.getDate() - date.getDay() + 6);
        break;
      case "day":
        break;
      default:
        break;
    }
    return date;
  };

  // Create new event
  const createEvent = async (eventData) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(`/calendar`, eventData);
      if (response.data.success) {
        setSuccess("Event created successfully!");
        fetchEvents();
        closeModal();
      } else {
        setError("Failed to create event");
      }
    } catch (err) {
      setError(
        "Error creating event: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Update existing event
  const updateEvent = async (eventId, eventData) => {
    try {
      setLoading(true);
      const response = await axiosInstance.put(`/calendar/${eventId}`, eventData);
      if (response.data.success) {
        setSuccess("Event updated successfully!");
        fetchEvents();
        closeModal();
      } else {
        setError("Failed to update event");
      }
    } catch (err) {
      setError(
        "Error updating event: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete event
  const deleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      setLoading(true);
      const response = await axiosInstance.delete(`/calendar/${eventId}`);
      if (response.data.success) {
        setSuccess("Event deleted successfully!");
        fetchEvents();
        closeModal();
      } else {
        setError("Failed to delete event");
      }
    } catch (err) {
      setError(
        "Error deleting event: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!eventForm.title || !eventForm.start || !eventForm.end) {
      setError("Title, start date, and end date are required");
      return;
    }

    if (new Date(eventForm.start) >= new Date(eventForm.end)) {
      setError("Start date must be before end date");
      return;
    }

    const eventData = {
      ...eventForm,
      notifications: eventForm.notifications.filter((n) => n.time && n.method),
    };

    if (editMode && selectedEvent) {
      updateEvent(selectedEvent._id, eventData);
    } else {
      createEvent(eventData);
    }
  };

  // Open event modal for creating/editing
  const openEventModal = (event = null, date = null) => {
    if (event) {
      setEditMode(true);
      setSelectedEvent(event);
      setEventForm({
        title: event.title,
        description: event.description || "",
        start: new Date(event.start).toISOString().slice(0, 16),
        end: new Date(event.end).toISOString().slice(0, 16),
        eventType: event.eventType || "",
        color: event.color || "#3498db",
        notifications: event.notifications || [],
      });
    } else {
      setEditMode(false);
      setSelectedEvent(null);
      const startDate = date || selectedDate || new Date();
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 1);

      setEventForm({
        title: "",
        description: "",
        start: startDate.toISOString().slice(0, 16),
        end: endDate.toISOString().slice(0, 16),
        eventType: "",
        color: "#3498db",
        notifications: [],
      });
    }
    setShowEventModal(true);
  };

  // Open event details modal
  const openEventDetails = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  // Close all modals
  const closeModal = () => {
    setShowEventModal(false);
    setShowEventDetails(false);
    setSelectedEvent(null);
    setEditMode(false);
    setEventForm({
      title: "",
      description: "",
      start: "",
      end: "",
      eventType: "",
      color: "#3498db",
      notifications: [],
    });
    setError("");
  };

  // Navigation functions
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case "month":
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case "week":
        newDate.setDate(newDate.getDate() - 7);
        break;
      case "day":
        newDate.setDate(newDate.getDate() - 1);
        break;
      default:
        break;
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case "month":
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case "week":
        newDate.setDate(newDate.getDate() + 7);
        break;
      case "day":
        newDate.setDate(newDate.getDate() + 1);
        break;
      default:
        break;
    }
    setCurrentDate(newDate);
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const checkDate = new Date(date);

      return (
        checkDate >= eventStart.setHours(0, 0, 0, 0) &&
        checkDate <= eventEnd.setHours(23, 59, 59, 999)
      );
    });
  };

  // Generate calendar grid for month view
  const generateCalendarGrid = () => {
    const startDate = getViewStartDate();
    const days = [];

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }

    return days;
  };

  // Format date for display
  const formatDate = (date, format = "full") => {
    const options = {
      full: { weekday: "long", year: "numeric", month: "long", day: "numeric" },
      short: { month: "short", day: "numeric" },
      time: { hour: "2-digit", minute: "2-digit" },
    };
    return new Intl.DateTimeFormat("en-US", options[format]).format(
      new Date(date)
    );
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Add notification to form
  const addNotification = () => {
    setEventForm((prev) => ({
      ...prev,
      notifications: [...prev.notifications, { time: "", method: "popup" }],
    }));
  };

  // Remove notification from form
  const removeNotification = (index) => {
    setEventForm((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((_, i) => i !== index),
    }));
  };

  // Update notification in form
  const updateNotification = (index, field, value) => {
    setEventForm((prev) => ({
      ...prev,
      notifications: prev.notifications.map((notification, i) =>
        i === index ? { ...notification, [field]: value } : notification
      ),
    }));
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      {/* Main Content - Fixed height with internal scrolling */}
      <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-40 pt-14 md:pt-0">
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200 p-3 lg:p-4">
          {/* Title Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
            <div className="mb-3 lg:mb-0">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                Calendar
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Manage your events and schedule
              </p>
            </div>

            <button
              onClick={() => openEventModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm lg:text-base"
            >
              <svg
                className="w-4 h-4 lg:w-5 lg:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Add Event</span>
            </button>
          </div>

          {/* Navigation and Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
            {/* Date Navigation */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="flex items-center space-x-1">
                <button
                  onClick={navigatePrevious}
                  className="p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4 lg:w-5 lg:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <button
                  onClick={navigateToday}
                  className="px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  Today
                </button>

                <button
                  onClick={navigateNext}
                  className="p-1.5 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4 lg:w-5 lg:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                  ...(viewMode === "day" && { day: "numeric" }),
                })}
              </h2>
            </div>

            {/* View Controls */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-3">
              {/* View Mode Selector */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {["month", "week", "day"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-2 py-1 lg:px-3 lg:py-1.5 text-xs lg:text-sm font-medium rounded-md transition-colors duration-200 ${
                      viewMode === mode
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>

              {/* Event Type Filter */}
              <select
                value={filters.eventType}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, eventType: e.target.value }))
                }
                className="border border-gray-300 rounded-lg px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Events</option>
                {eventTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Alerts - Fixed position */}
        <div className="flex-shrink-0 px-3 lg:px-4">
          {error && (
            <div className="mt-3 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg text-sm">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="break-words">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mt-3 bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded-lg text-sm">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="break-words">{success}</span>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Calendar Content */}
        <div className="flex-1 overflow-hidden p-3 lg:p-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col relative">
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Calendar Views */}
            {viewMode === "month" && (
              <div className="flex flex-col h-full">
                {/* Week Headers */}
                <div className="flex-shrink-0 grid grid-cols-7 border-b border-gray-200">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="p-2 lg:p-3 text-center text-xs lg:text-sm font-medium text-gray-700 bg-gray-50"
                      >
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden">{day.charAt(0)}</span>
                      </div>
                    )
                  )}
                </div>

                {/* Calendar Grid - Scrollable */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                  <div
                    className="grid grid-cols-7"
                    style={{ minHeight: "600px" }}
                  >
                    {generateCalendarGrid().map((date, index) => {
                      const dayEvents = getEventsForDate(date);
                      const isCurrentMonth =
                        date.getMonth() === currentDate.getMonth();
                      const isToday =
                        date.toDateString() === new Date().toDateString();
                      const isSelected =
                        selectedDate &&
                        date.toDateString() === selectedDate.toDateString();

                      return (
                        <div
                          key={index}
                          onClick={() => setSelectedDate(date)}
                          onDoubleClick={() => openEventModal(null, date)}
                          className={`min-h-[80px] lg:min-h-[100px] p-1 lg:p-2 border-b border-r border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                            !isCurrentMonth ? "bg-gray-50 text-gray-400" : ""
                          } ${
                            isSelected ? "bg-blue-50 ring-2 ring-blue-500" : ""
                          }`}
                        >
                          <div
                            className={`text-xs lg:text-sm font-medium mb-1 ${
                              isToday
                                ? "bg-blue-600 text-white w-5 h-5 lg:w-7 lg:h-7 rounded-full flex items-center justify-center text-xs"
                                : ""
                            }`}
                          >
                            {date.getDate()}
                          </div>

                          <div className="space-y-1">
                            {dayEvents
                              .slice(0, window.innerWidth < 768 ? 2 : 3)
                              .map((event) => {
                                const eventType = eventTypes.find(
                                  (type) => type.value === event.eventType
                                );
                                return (
                                  <div
                                    key={event._id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEventDetails(event);
                                    }}
                                    className="text-xs p-1 rounded truncate cursor-pointer hover:shadow-sm transition-shadow duration-200"
                                    style={{
                                      backgroundColor:
                                        event.color || eventType?.color + "20",
                                      color: event.color || eventType?.color,
                                      fontSize:
                                        window.innerWidth < 768
                                          ? "10px"
                                          : "12px",
                                    }}
                                    title={event.title}
                                  >
                                    {event.title}
                                  </div>
                                );
                              })}
                            {dayEvents.length >
                              (window.innerWidth < 768 ? 2 : 3) && (
                              <div className="text-xs text-gray-500">
                                +
                                {dayEvents.length -
                                  (window.innerWidth < 768 ? 2 : 3)}{" "}
                                more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {viewMode === "week" && (
              <div className="flex flex-col h-full">
                {/* Week Header */}
                <div className="flex-shrink-0 grid grid-cols-8 border-b border-gray-200">
                  <div className="p-2 lg:p-3"></div>
                  {Array.from({ length: 7 }, (_, i) => {
                    const date = new Date(getViewStartDate());
                    date.setDate(date.getDate() + i);
                    const isToday =
                      date.toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={i}
                        className="p-2 lg:p-3 text-center border-r border-gray-200 bg-gray-50"
                      >
                        <div
                          className={`text-xs lg:text-sm font-medium ${
                            isToday ? "text-blue-600" : "text-gray-700"
                          }`}
                        >
                          <span className="hidden sm:inline">
                            {date.toLocaleDateString("en-US", {
                              weekday: "short",
                            })}
                          </span>
                          <span className="sm:hidden">
                            {date.toLocaleDateString("en-US", {
                              weekday: "narrow",
                            })}
                          </span>
                        </div>
                        <div
                          className={`text-sm lg:text-lg font-semibold ${
                            isToday
                              ? "bg-blue-600 text-white w-6 h-6 lg:w-8 lg:h-8 rounded-full mx-auto flex items-center justify-center"
                              : "text-gray-900"
                          }`}
                        >
                          {date.getDate()}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Time Slots - Scrollable */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                  {Array.from({ length: 24 }, (_, hour) => (
                    <div
                      key={hour}
                      className="grid grid-cols-8 border-b border-gray-100"
                    >
                      <div className="p-2 lg:p-3 text-xs text-gray-500 border-r border-gray-200 bg-gray-50">
                        <div className="sticky top-0">
                          {hour === 0
                            ? "12 AM"
                            : hour < 12
                            ? `${hour} AM`
                            : hour === 12
                            ? "12 PM"
                            : `${hour - 12} PM`}
                        </div>
                      </div>
                      {Array.from({ length: 7 }, (_, dayIndex) => {
                        const date = new Date(getViewStartDate());
                        date.setDate(date.getDate() + dayIndex);
                        date.setHours(hour, 0, 0, 0);

                        const hourEvents = events.filter((event) => {
                          const eventStart = new Date(event.start);
                          return (
                            eventStart.toDateString() === date.toDateString() &&
                            eventStart.getHours() === hour
                          );
                        });

                        return (
                          <div
                            key={dayIndex}
                            onClick={() => openEventModal(null, date)}
                            className="min-h-[50px] lg:min-h-[60px] p-1 border-r border-gray-200 hover:bg-gray-50 cursor-pointer"
                          >
                            {hourEvents.map((event) => {
                              const eventType = eventTypes.find(
                                (type) => type.value === event.eventType
                              );
                              return (
                                <div
                                  key={event._id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEventDetails(event);
                                  }}
                                  className="text-xs p-1 mb-1 rounded truncate cursor-pointer hover:shadow-sm transition-shadow duration-200"
                                  style={{
                                    backgroundColor:
                                      event.color || eventType?.color + "20",
                                    color: event.color || eventType?.color,
                                  }}
                                  title={event.title}
                                >
                                  {event.title}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === "day" && (
              <div className="flex flex-col h-full">
                {/* Day Header */}
                <div className="flex-shrink-0 p-3 lg:p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900">
                    {formatDate(currentDate, "full")}
                  </h3>
                </div>

                {/* Day Schedule - Scrollable */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const hourEvents = events.filter((event) => {
                      const eventStart = new Date(event.start);
                      return (
                        eventStart.toDateString() ===
                          currentDate.toDateString() &&
                        eventStart.getHours() === hour
                      );
                    });

                    return (
                      <div key={hour} className="flex border-b border-gray-100">
                        <div className="w-16 lg:w-20 p-2 lg:p-3 text-xs text-gray-500 border-r border-gray-200 bg-gray-50 sticky left-0">
                          {hour === 0
                            ? "12 AM"
                            : hour < 12
                            ? `${hour} AM`
                            : hour === 12
                            ? "12 PM"
                            : `${hour - 12} PM`}
                        </div>
                        <div
                          onClick={() => {
                            const date = new Date(currentDate);
                            date.setHours(hour, 0, 0, 0);
                            openEventModal(null, date);
                          }}
                          className="flex-1 min-h-[60px] lg:min-h-[80px] p-2 lg:p-3 hover:bg-gray-50 cursor-pointer"
                        >
                          {hourEvents.map((event) => {
                            const eventType = eventTypes.find(
                              (type) => type.value === event.eventType
                            );
                            return (
                              <div
                                key={event._id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEventDetails(event);
                                }}
                                className="p-2 mb-2 rounded-lg cursor-pointer hover:shadow-sm transition-shadow duration-200"
                                style={{
                                  backgroundColor:
                                    event.color || eventType?.color + "20",
                                  color: event.color || eventType?.color,
                                }}
                              >
                                <div className="font-medium text-sm lg:text-base">
                                  {event.title}
                                </div>
                                <div className="text-xs opacity-75">
                                  {formatDate(event.start, "time")} -{" "}
                                  {formatDate(event.end, "time")}
                                </div>
                                {event.description && (
                                  <div className="text-xs mt-1 opacity-75 truncate">
                                    {event.description}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 lg:p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Modal Header - Fixed */}
            <div className="flex-shrink-0 p-4 lg:p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editMode ? "Edit Event" : "Create New Event"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-auto custom-scrollbar p-4 lg:p-6">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) =>
                      setEventForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Event title"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) =>
                      setEventForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Event description"
                    rows="3"
                  />
                </div>

                {/* Start and End Date/Time */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={eventForm.start}
                      onChange={(e) =>
                        setEventForm((prev) => ({
                          ...prev,
                          start: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={eventForm.end}
                      onChange={(e) =>
                        setEventForm((prev) => ({
                          ...prev,
                          end: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Event Type and Color */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Type
                    </label>
                    <select
                      value={eventForm.eventType}
                      onChange={(e) => {
                        const selectedType = eventTypes.find(
                          (type) => type.value === e.target.value
                        );
                        setEventForm((prev) => ({
                          ...prev,
                          eventType: e.target.value,
                          color: selectedType?.color || prev.color,
                        }));
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select type</option>
                      {eventTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={eventForm.color}
                        onChange={(e) =>
                          setEventForm((prev) => ({
                            ...prev,
                            color: e.target.value,
                          }))
                        }
                        className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={eventForm.color}
                        onChange={(e) =>
                          setEventForm((prev) => ({
                            ...prev,
                            color: e.target.value,
                          }))
                        }
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="#3498db"
                      />
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Notifications
                    </label>
                    <button
                      type="button"
                      onClick={addNotification}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Add
                    </button>
                  </div>

                  <div className="space-y-2 max-h-32 overflow-auto custom-scrollbar">
                    {eventForm.notifications.map((notification, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-2 bg-gray-50 rounded"
                      >
                        <input
                          type="datetime-local"
                          value={notification.time}
                          onChange={(e) =>
                            updateNotification(index, "time", e.target.value)
                          }
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                        <select
                          value={notification.method}
                          onChange={(e) =>
                            updateNotification(index, "method", e.target.value)
                          }
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value="popup">Popup</option>
                          <option value="email">Email</option>
                          <option value="sms">SMS</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeNotification(index)}
                          className="text-red-600 hover:text-red-700 p-1"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer - Fixed */}
            <div className="flex-shrink-0 p-4 lg:p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleFormSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2 text-sm"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editMode ? "Update Event" : "Create Event"}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 lg:p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Modal Header - Fixed */}
            <div className="flex-shrink-0 p-4 lg:p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div
                    className="w-4 h-4 rounded flex-shrink-0"
                    style={{
                      backgroundColor: selectedEvent.color || "#3498db",
                    }}
                  ></div>
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {selectedEvent.title}
                  </h3>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 ml-2 flex-shrink-0"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-auto custom-scrollbar p-4 lg:p-6">
              <div className="space-y-4">
                {selectedEvent.description && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Description:
                    </span>
                    <p className="text-gray-900 mt-1 break-words">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Start:
                  </span>
                  <p className="text-gray-900 mt-1 text-sm">
                    {formatDate(selectedEvent.start, "full")} at{" "}
                    {formatDate(selectedEvent.start, "time")}
                  </p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">
                    End:
                  </span>
                  <p className="text-gray-900 mt-1 text-sm">
                    {formatDate(selectedEvent.end, "full")} at{" "}
                    {formatDate(selectedEvent.end, "time")}
                  </p>
                </div>

                {selectedEvent.eventType && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Type:
                    </span>
                    <p className="text-gray-900 mt-1 capitalize">
                      {selectedEvent.eventType}
                    </p>
                  </div>
                )}

                {selectedEvent.notifications &&
                  selectedEvent.notifications.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Notifications:
                      </span>
                      <div className="mt-1 space-y-1 max-h-32 overflow-auto custom-scrollbar">
                        {selectedEvent.notifications.map(
                          (notification, index) => (
                            <div
                              key={index}
                              className="text-sm text-gray-900 p-2 bg-gray-50 rounded"
                            >
                              <div>
                                {formatDate(notification.time, "full")} at{" "}
                                {formatDate(notification.time, "time")}
                              </div>
                              <span className="text-gray-500 text-xs">
                                via {notification.method}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Modal Footer - Fixed */}
            <div className="flex-shrink-0 p-4 lg:p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    closeModal();
                    openEventModal(selectedEvent);
                  }}
                  className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteEvent(selectedEvent._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
