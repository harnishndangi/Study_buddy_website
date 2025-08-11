import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Layout/Sidebar";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    deadline: "",
    priority: "medium",
    subject: "",
    reminder: "",
    files: [],
  });

  // API base URL - adjust according to your backend
  const API_URL = "http://localhost:3000/api/tasks";

  // All your existing functions remain the same...
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      alert("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    let progressInterval;
    try {
      setSubmitting(true);
      setProgress(0);

      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 90) {
            return prev + Math.random() * 15;
          }
          return prev;
        });
      }, 300);

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("deadline", formData.deadline);
      formDataToSend.append("priority", formData.priority);
      formDataToSend.append("subject", formData.subject);
      formDataToSend.append("reminder", formData.reminder);

      Array.from(formData.files).forEach((file) => {
        formDataToSend.append("files", file);
      });

      await axios.post(API_URL, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(progressInterval);
      setProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setShowCreateForm(false);
      resetForm();
      fetchTasks();
      alert("Task created successfully!");
    } catch (error) {
      if (progressInterval) clearInterval(progressInterval);
      console.error("Error creating task:", error);
      alert("Failed to create task");
    } finally {
      setSubmitting(false);
      setProgress(0);
    }
  };

  const updateTask = async (e) => {
    e.preventDefault();
    let progressInterval;
    try {
      setSubmitting(true);
      setProgress(0);

      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 90) {
            return prev + Math.random() * 15;
          }
          return prev;
        });
      }, 300);

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("deadline", formData.deadline);
      formDataToSend.append("priority", formData.priority);
      formDataToSend.append("subject", formData.subject);
      formDataToSend.append("reminder", formData.reminder);

      Array.from(formData.files).forEach((file) => {
        formDataToSend.append("files", file);
      });

      await axios.put(`${API_URL}/${editingTask._id}`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(progressInterval);
      setProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setEditingTask(null);
      resetForm();
      fetchTasks();
      alert("Task updated successfully!");
    } catch (error) {
      if (progressInterval) clearInterval(progressInterval);
      console.error("Error updating task:", error);
      alert("Failed to update task");
    } finally {
      setSubmitting(false);
      setProgress(0);
    }
  };

  const deleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axios.delete(`${API_URL}/${taskId}`);
        fetchTasks();
        alert("Task deleted successfully!");
      } catch (error) {
        console.error("Error deleting task:", error);
        alert("Failed to delete task");
      }
    }
  };

  const completeTask = async (taskId) => {
    try {
      await axios.post(`${API_URL}/${taskId}/complete`);
      fetchTasks();
    } catch (error) {
      console.error("Error completing task:", error);
      alert("Failed to complete task");
    }
  };

  const updatePriority = async (taskId, priority) => {
    try {
      await axios.post(`${API_URL}/${taskId}/priority`, { priority });
      fetchTasks();
    } catch (error) {
      console.error("Error updating priority:", error);
      alert("Failed to update priority");
    }
  };

  const updateDeadline = async (taskId, deadline) => {
    try {
      await axios.post(`${API_URL}/${taskId}/deadline`, { deadline });
      fetchTasks();
    } catch (error) {
      console.error("Error updating deadline:", error);
      alert("Failed to update deadline");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      deadline: "",
      priority: "medium",
      subject: "",
      reminder: "",
      files: [],
    });
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files : value,
    }));
  };

  const startEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      deadline: task.deadline
        ? new Date(task.deadline).toISOString().slice(0, 16)
        : "",
      priority: task.priority,
      subject: task.subject || "",
      reminder: task.reminder
        ? new Date(task.reminder).toISOString().slice(0, 16)
        : "",
      files: [],
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatDate = (dateString) => {
    return dateString
      ? new Date(dateString).toLocaleDateString()
      : "No date set";
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <div className={`${(showCreateForm || editingTask) ? 'hidden md:block' : ''}`}>
          <Sidebar />
        </div>
        <main className={`flex-1 ${(showCreateForm || editingTask) ? 'ml-0 md:ml-40' : 'ml-20 md:ml-40'} p-3 sm:p-6 lg:p-8 bg-gray-50 overflow-y-auto relative z-10`}>
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    <span className="text-blue-600">Tasks</span>{" "}
                    <span className="text-gray-700 hidden sm:inline">
                      Management
                    </span>
                  </h1>
                  <div className="sm:hidden flex items-center text-xs text-gray-500 mt-1">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      {tasks.length} Tasks
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                <div className="hidden sm:flex items-center text-sm text-gray-500">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                    {tasks.length} Tasks
                  </span>
                </div>

                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm font-medium w-full sm:w-auto justify-center"
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Create Task
                </button>
              </div>
            </div>

            {/* Create/Edit Task Form Modal - FIXED MODAL */}
            {(showCreateForm || editingTask) && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] px-4 py-6 sm:px-0 sm:py-0"
                style={{
                  paddingTop: "env(safe-area-inset-top)",
                  paddingBottom: "env(safe-area-inset-bottom)",
                }}
              >
                <div className="bg-white w-full max-w-lg mx-auto max-h-[calc(100vh-3rem)] overflow-y-auto rounded-lg shadow-lg">
                  {/* Modal Header */}
                  <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        {editingTask ? "Edit Task" : "Create New Task"}
                      </h2>
                      <button
                        onClick={() => {
                          setShowCreateForm(false);
                          setEditingTask(null);
                          resetForm();
                        }}
                        className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
                        disabled={submitting}
                      >
                        <svg
                          className="w-5 h-5"
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

                  {/* Modal Body */}
                  <div className="p-4 sm:p-6">
                    <form
                      onSubmit={editingTask ? updateTask : createTask}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Title *
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter task title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Subject
                        </label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter subject"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Priority
                        </label>
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          className="w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">
                            Deadline
                          </label>
                          <input
                            type="datetime-local"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleInputChange}
                            className="w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">
                            Reminder
                          </label>
                          <input
                            type="datetime-local"
                            name="reminder"
                            value={formData.reminder}
                            onChange={handleInputChange}
                            className="w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Attachments (Max 5 files)
                        </label>
                        <input
                          type="file"
                          name="files"
                          multiple
                          onChange={handleInputChange}
                          className="w-full p-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>

                      {/* Progress Bar */}
                      {submitting && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium text-blue-800">
                              {editingTask
                                ? "Updating task..."
                                : "Creating task..."}
                            </span>
                            <span className="text-sm text-blue-600 font-semibold">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out shadow-sm"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Form Actions */}
                      <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg"
                        >
                          {submitting && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          )}
                          {editingTask ? "Update Task" : "Create Task"}
                        </button>
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => {
                            setShowCreateForm(false);
                            setEditingTask(null);
                            resetForm();
                          }}
                          className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Tasks List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 text-sm sm:text-base">
                  Loading tasks...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="text-gray-400 mb-6">
                      <svg
                        className="w-16 h-16 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <h3 className="text-gray-900 text-lg font-semibold mb-2">
                      No tasks found
                    </h3>
                    <p className="text-gray-500 text-sm mb-6">
                      Create your first task to get started with task
                      management!
                    </p>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Create Your First Task
                    </button>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task._id}
                      className={`bg-white p-4 sm:p-6 rounded-lg shadow-sm border-l-4 ${
                        task.completed
                          ? "border-green-500 opacity-75 bg-gray-50"
                          : "border-blue-500"
                      } hover:shadow-md transition-all duration-200`}
                    >
                      {/* Task Header */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`text-base sm:text-lg font-semibold break-words ${
                              task.completed
                                ? "line-through text-gray-500"
                                : "text-gray-900"
                            }`}
                          >
                            {task.title}
                          </h3>
                          {task.subject && (
                            <p className="text-sm text-gray-600 mt-2 break-words">
                              <span className="font-medium text-gray-700">
                                Subject:
                              </span>{" "}
                              {task.subject}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority.toUpperCase()}
                          </span>
                          {task.completed && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 whitespace-nowrap">
                              ✓ COMPLETED
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Task Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-gray-400 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="font-medium">Deadline:</span>
                          <span className="break-words">
                            {formatDate(task.deadline)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-gray-400 flex-shrink-0"
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
                          <span className="font-medium">Reminder:</span>
                          <span className="break-words">
                            {formatDate(task.reminder)}
                          </span>
                        </div>
                      </div>

                      {/* Attachments */}
                      {task.attachments && task.attachments.length > 0 && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                              />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">
                              Attachments ({task.attachments.length}):
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {task.attachments.map((attachment, index) => (
                              <a
                                key={index}
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm bg-white px-3 py-1 rounded-full border border-blue-200 hover:border-blue-300 transition-colors"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                {attachment.filename}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Task Actions */}
                      <div className="space-y-4 pt-4 border-t border-gray-200">
                        {/* Primary Actions */}
                        <div className="flex flex-wrap gap-2">
                          {!task.completed && (
                            <button
                              onClick={() => completeTask(task._id)}
                              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
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
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Complete
                            </button>
                          )}

                          <button
                            onClick={() => startEdit(task)}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </button>

                          <button
                            onClick={() => deleteTask(task._id)}
                            className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
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
                            Delete
                          </button>
                        </div>

                        {/* Quick Edit Controls */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2">
                              Update Priority:
                            </label>
                            <select
                              value={task.priority}
                              onChange={(e) =>
                                updatePriority(task._id, e.target.value)
                              }
                              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                              <option value="low">Low Priority</option>
                              <option value="medium">Medium Priority</option>
                              <option value="high">High Priority</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2">
                              Update Deadline:
                            </label>
                            <input
                              type="datetime-local"
                              defaultValue={
                                task.deadline
                                  ? new Date(task.deadline)
                                      .toISOString()
                                      .slice(0, 16)
                                  : ""
                              }
                              onBlur={(e) => {
                                if (e.target.value) {
                                  updateDeadline(task._id, e.target.value);
                                }
                              }}
                              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

export default Tasks;
