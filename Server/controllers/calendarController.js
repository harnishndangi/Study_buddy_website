// Calendar Controller: Handles calendar event CRUD and optional Google sync

import { CalendarEvent } from "../models/CalendarEvent.js";
import mongoose from "mongoose";

/**
 * Add a new calendar event
 */
export const createEvent = async (req, res) => {
  try {
    const { title, description, start, end, eventType, notifications, color } =
      req.body;

    // Validate required fields
    if (!title || !start || !end) {
      return res.status(400).json({
        success: false,
        message: "Title, start date, and end date are required",
      });
    }

    // Validate date logic
    if (new Date(start) >= new Date(end)) {
      return res.status(400).json({
        success: false,
        message: "Start date must be before end date",
      });
    }

    const newEvent = new CalendarEvent({
      user: req.user.id,
      title,
      description,
      start: new Date(start),
      end: new Date(end),
      eventType,
      notifications: notifications || [],
      color: color || "#3498db",
    });

    const savedEvent = await newEvent.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: savedEvent,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create event",
      error: error.message,
    });
  }
};

/**
 * Get all calendar events with optional filtering
 */
export const getEvents = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      eventType,
      page = 1,
      limit = 50,
      sortBy = "start",
      sortOrder = "asc",
    } = req.query;

    // Build filter object (scope to current user)
    const filter = { user: req.user.id };

    // Date range filtering
    if (startDate || endDate) {
      filter.start = {};
      if (startDate) filter.start.$gte = new Date(startDate);
      if (endDate) filter.start.$lte = new Date(endDate);
    }

    // Event type filtering
    if (eventType) {
      filter.eventType = eventType;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const events = await CalendarEvent.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const totalEvents = await CalendarEvent.countDocuments(filter);
    const totalPages = Math.ceil(totalEvents / parseInt(limit));

    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalEvents,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error.message,
    });
  }
};

/**
 * Get a single event by ID
 */
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    const event = await CalendarEvent.findOne({ _id: id, user: req.user.id });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event",
      error: error.message,
    });
  }
};

/**
 * Update a calendar event by ID
 */
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    // Validate date logic if dates are being updated
    if (updateData.start && updateData.end) {
      if (new Date(updateData.start) >= new Date(updateData.end)) {
        return res.status(400).json({
          success: false,
          message: "Start date must be before end date",
        });
      }
    }

    // Convert date strings to Date objects if present
    if (updateData.start) updateData.start = new Date(updateData.start);
    if (updateData.end) updateData.end = new Date(updateData.end);

    const updatedEvent = await CalendarEvent.findOneAndUpdate({ _id: id, user: req.user.id }, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update event",
      error: error.message,
    });
  }
};

/**
 * Delete a calendar event by ID
 */
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    const deletedEvent = await CalendarEvent.findOneAndDelete({ _id: id, user: req.user.id });

    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
      data: deletedEvent,
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete event",
      error: error.message,
    });
  }
};

/**
 * Sync events with Google Calendar (placeholder implementation)
 */
// export const syncWithGoogle = async (req, res) => {
//   try {
//     // This is a placeholder implementation for Google Calendar sync
//     // In a real implementation, you would:
//     // 1. Authenticate with Google Calendar API
//     // 2. Fetch events from Google Calendar
//     // 3. Compare with local events
//     // 4. Sync differences (create, update, delete)

//     const { googleAccessToken } = req.body;

//     if (!googleAccessToken) {
//       return res.status(400).json({
//         success: false,
//         message: "Google access token is required for synchronization",
//       });
//     }

//     // Placeholder response
//     res.status(200).json({
//       success: true,
//       message: "Google Calendar sync initiated (placeholder implementation)",
//       data: {
//         syncStatus: "pending",
//         message: "This feature requires Google Calendar API integration",
//       },
//     });
//   } catch (error) {
//     console.error("Error syncing with Google Calendar:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to sync with Google Calendar",
//       error: error.message,
//     });
//   }
// };

/**
 * Get events for a specific date range (useful for calendar views)
 */
export const getEventsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const events = await CalendarEvent.find({
      $or: [
        {
          start: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
        {
          end: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
        {
          start: { $lte: new Date(startDate) },
          end: { $gte: new Date(endDate) },
        },
      ],
    }).sort({ start: 1 });

    res.status(200).json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error) {
    console.error("Error fetching events by date range:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events for date range",
      error: error.message,
    });
  }
};
