import express from "express";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";

const router = express.Router();

// Patient Profile
router.post("/patient", async (req, res) => {
  try {
    const { userId, patientId, name, bedNumber, roomNumber, ward } = req.body;

    await Patient.create({ userId, patientId, name, bedNumber, roomNumber, ward });
    await User.findByIdAndUpdate(userId, { profileCompleted: true });

    res.json({ success: true, message: "Patient profile completed" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving patient profile", error: error.message });
  }
});

// Doctor Profile
router.post("/doctor", async (req, res) => {
  try {
    const { userId, name, licenseNo, specialization } = req.body;

    await Doctor.create({ userId, name, licenseNo, specialization });
    await User.findByIdAndUpdate(userId, { profileCompleted: true });

    res.json({ success: true, message: "Doctor profile completed" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving doctor profile", error: error.message });
  }
});

export default router;
