import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  licenseNo: { type: String, required: true },
  specialization: { type: String, required: true },
});

export default mongoose.model("Doctor", doctorSchema);
