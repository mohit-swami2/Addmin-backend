import mongoose from 'mongoose';

const errorLogSchema = new mongoose.Schema(
  {
    fingerprint: { type: String, required: true, index: true },
    message: { type: String, required: true },
    stack: { type: String },
    path: { type: String },
    method: { type: String },
    statusCode: { type: Number },
    occurrenceCount: { type: Number, default: 1 },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ErrorLog = mongoose.model('ErrorLog', errorLogSchema);
export default ErrorLog;
