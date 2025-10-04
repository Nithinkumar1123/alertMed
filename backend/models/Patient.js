import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  patientId: { type: String, required: true },
  name: { type: String, required: true },
  bedNumber: { type: String, required: true },
  roomNumber: { type: String, required: true },
  ward: { type: String, required: true },
});

export default mongoose.model("Patient", patientSchema);
