import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jti: { type: String, required: true, unique: true, index: true },
    userAgent: { type: String },
    ip: { type: String },
    valid: { type: Boolean, default: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Session = mongoose.model('Session', SessionSchema);
