import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["patient", "doctor"], required: true },
  profileCompleted: { type: Boolean, default: false }
});

export default mongoose.model("User", userSchema);
