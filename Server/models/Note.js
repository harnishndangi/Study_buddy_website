import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
{
user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
title: { type: String, required: true },
content: { type: String }, // rich content (could be HTML, markdown, etc.)
highlights: [{ type: String }],
attachments: [
{
filename: String,
url: String,
mimetype: String,
  size: Number,
  },
],
  tags: [{ type: String }],
},
  { timestamps: true }
);
 
export const Note = mongoose.model("Note", NoteSchema);
