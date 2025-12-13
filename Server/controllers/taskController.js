// Task Controller: Handles CRUD and utility logic for tasks/to-dos
// Includes: add, check (complete), update priority, update deadline, etc.

import { Task } from "../models/Task.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
 
/**
 * Create a new task
 */
export const createTask = async (req, res) => {
  try {
    const { title, deadline, priority, subject, reminder } = req.body;
    const attachments = [];

    // Handle file uploads if present (req.files = multer's array of files)
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          // Upload each file to Cloudinary
          const uploadRes = await uploadToCloudinary(
            file.buffer,
            file.originalname,
            file.mimetype
          );
          
          if (!uploadRes || !uploadRes.secure_url) {
            return res.status(500).json({ 
              error: `Failed to upload file: ${file.originalname}. Please try again.` 
            });
          }
          
          attachments.push({
            filename: file.originalname,
            url: uploadRes.secure_url,
            mimetype: file.mimetype,
            size: file.size,
          });
        } catch (uploadErr) {
          return res.status(500).json({ 
            error: `Failed to upload file: ${file.originalname}. ${uploadErr.message}` 
          });
        }
      }
    }

    const task = await Task.create({
      user: req.user.id,
      title,
      deadline,
      priority,
      subject,
      reminder,
      attachments,
    });

    res.status(201).json(task);
  } catch (err) {
    res
      .status(500)
      .json({ error: err.message || "Failed to create task. Please try again." });
  }
};

/**
 * Get all tasks
 */
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: err.message });
  }
};

/**
 * Get a single task by ID
 */
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch task', error: err.message });
  }
};
/**
 * Update a task by ID
 */
export const updateTask = async (req, res) => {
  try {
    const { title, deadline, priority, subject, reminder, completed } = req.body;
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (deadline !== undefined) updateFields.deadline = deadline;
    if (priority !== undefined) updateFields.priority = priority;
    if (subject !== undefined) updateFields.subject = subject;
    if (reminder !== undefined) updateFields.reminder = reminder;
    if (completed !== undefined) updateFields.completed = completed;

    // Handle file uploads if present (req.files = multer's array of files)
    if (req.files && req.files.length > 0) {
      // Find the existing task to get current attachments
      const existingTask = await Task.findOne({ _id: req.params.id, user: req.user.id });
      if (!existingTask) return res.status(404).json({ error: 'Task not found' });
      const attachments = existingTask.attachments ? [...existingTask.attachments] : [];
      
      for (const file of req.files) {
        try {
          const uploadRes = await uploadToCloudinary(
            file.buffer,
            file.originalname,
            file.mimetype
          );
          
          if (!uploadRes || !uploadRes.secure_url) {
            return res.status(500).json({ 
              error: `Failed to upload file: ${file.originalname}. Please try again.` 
            });
          }
          
          attachments.push({
            filename: file.originalname,
            url: uploadRes.secure_url,
            mimetype: file.mimetype,
            size: file.size,
          });
        } catch (uploadErr) {
          return res.status(500).json({ 
            error: `Failed to upload file: ${file.originalname}. ${uploadErr.message}` 
          });
        }
      }
      updateFields.attachments = attachments;
    }

    const task = await Task.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, updateFields, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update task. Please try again.' });
  }
};

/**
 * Delete a task by ID
 */
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task', error: err.message });
  }
};

/**
 * Mark a task as completed
 */
export const completeTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { completed: true },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to complete task', error: err.message });
  }
};

/**
 * Update task priority
 */
export const updatePriority = async (req, res) => {
  try {
    const { priority } = req.body;
    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority value. Must be low, medium, or high.' });
    }
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { priority },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update priority. Please try again.' });
  }
};

/**
 * Update task deadline
 */
export const updateDeadline = async (req, res) => {
  try {
    const { deadline } = req.body;
    if (!deadline) {
      return res.status(400).json({ message: 'Deadline is required' });
    }
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { deadline },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update deadline', error: err.message });
  }
};
