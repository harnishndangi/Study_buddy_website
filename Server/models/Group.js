import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    code: { type: String, unique: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Generate a simple invite code if not provided
GroupSchema.pre('save', function (next) {
  if (!this.code) {
    this.code = Math.random().toString(36).slice(2, 8).toUpperCase();
  }
  // ensure creator is in members
  if (this.createdBy && !this.members?.some((m) => m?.toString() === this.createdBy.toString())) {
    this.members.push(this.createdBy);
  }
  next();
});

export const Group = mongoose.model('Group', GroupSchema);
