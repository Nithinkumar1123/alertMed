// backend/models/History.js
import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  patientId: String,
  name: String,
  bedNumber: String,
  roomNumber: String,
  message: String,
  respondedBy: String,
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date, default: Date.now },
});

export default mongoose.model("History", historySchema);
