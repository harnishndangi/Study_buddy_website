// Note Controller: Handles CRUD and utility logic for notes
// Includes: create, read, update, delete, search, highlight, file attach

import { Note } from "../models/Note.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

/**
 * Create a new note
 */
export const createNote = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const note = new Note({ user: req.user.id, title, content, tags });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: "Failed to create note" });
  }
};

/**
 * Get all notes or search notes by title/content/tags
 * Query params: ?search=term
 */
export const getNotes = async (req, res) => {
  try {
    const { search } = req.query;
    const base = { user: req.user.id };
    let query = base;
    if (search) {
      query = {
        ...base,
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { tags: { $regex: search, $options: 'i' } },
        ],
      };
    }
    const notes = await Note.find(query).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};

/**
 * Get a single note by ID
 * Route param: /:id
 */
export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch note" });
  }
};

/**
 * Update a note by ID
 * Route param: /:id
 * Body: { title, content, tags }
 */
export const updateNote = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title, content, tags },
      { new: true }
    );
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json({ message: "Note updated successfully", note });
  } catch (err) {
    res.status(500).json({ error: "Failed to update note" });
  }
};

/**
 * Delete a note by ID
 * Route param: /:id
 */
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete note" });
  }
};

/**
 * Highlight text in a note
 * Body: { highlight } (string to highlight)
 */
export const highlightNote = async (req, res) => {
  try {
    const { highlight } = req.body;
    if (!highlight) return res.status(400).json({ error: "Highlight text required" });
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $addToSet: { highlights: highlight } },
      { new: true }
    );
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: "Failed to highlight note" });
  }
};

// Attach a file to a note: receives file from Multer, uploads to Cloudinary, and saves the file info to the note
export const attachFile = async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) return res.status(400).json({ error: "No file uploaded. Please select a file to attach." });
    const { buffer, originalname, mimetype, size } = req.file;

    // Upload the file buffer to Cloudinary
    try {
      const result = await uploadToCloudinary(buffer, `notes_attachments/${originalname}`, mimetype);
      if (!result || !result.secure_url) {
        return res.status(500).json({ error: `Failed to upload file: ${originalname}. Please try again.` });
      }

      // Prepare file data to store in the note
      const fileData = {
        filename: originalname,
        url: result.secure_url,
        mimetype,
        size,
      };

      // Add the file data to the note's attachments array
      const note = await Note.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        { $push: { attachments: fileData } },
        { new: true }
      );
      if (!note) return res.status(404).json({ error: "Note not found" });
      res.json(note);
    } catch (uploadErr) {
      return res.status(500).json({ error: `Failed to upload file: ${originalname}. ${uploadErr.message}` });
    }
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to attach file. Please try again." });
  }
};
