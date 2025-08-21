import mongoose from "mongoose";
 
const TaskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  deadline: { type: Date },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  subject: { type: String },
  reminder: { type: Date },
  attachments: [{
    filename: String,
    url: String,
    mimetype: String,
    size: Number
  }]
}, { timestamps: true });
 
export const Task = mongoose.model('Task', TaskSchema);
