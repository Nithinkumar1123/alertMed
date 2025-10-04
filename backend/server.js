import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// === App Setup ===
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

// === MongoDB Connection ===
mongoose.connect("mongodb+srv://alertMed:Qrl1pxascXCxa5CK@cluster0.ed2am5j.mongodb.net/alertMed", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// === JWT Secret ===
const JWT_SECRET = "alertMed";

// === Schemas ===
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true }, // doctor / patient
  name: String,
  patientId: String,
  bedNumber: String,
  roomNumber: String,
  licenseNumber: String,
  department: String,
});

const alertSchema = new mongoose.Schema({
  patientId: String,
  name: String,
  bedNumber: String,
  roomNumber: String,
  message: String,
  respondedBy: String,
  createdAt: { type: Date, default: Date.now },
});

const historySchema = new mongoose.Schema({
  patientId: String,
  name: String,
  bedNumber: String,
  roomNumber: String,
  message: String,
  respondedBy: String,
  createdAt: Date,
  resolvedAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Alert = mongoose.model("Alert", alertSchema);
const History = mongoose.model("History", historySchema);

// === Routes ===

// Signup
app.post("/api/signup", async (req, res) => {
  const { email, password, role, name, patientId, bedNumber, roomNumber, licenseNumber, department } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, role, name, patientId, bedNumber, roomNumber, licenseNumber, department });
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Error creating user", error: err.message });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, role: user.role, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get profile
app.get("/api/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get history
app.get("/api/history", async (req, res) => {
  try {
    const history = await History.find().sort({ resolvedAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

// Create alert (patient)
app.post("/api/alert", async (req, res) => {
  const { patientId, name, bedNumber, roomNumber, message } = req.body;
  try {
    const alert = new Alert({ patientId, name, bedNumber, roomNumber, message });
    await alert.save();

    // Emit alert to doctors
    io.to("doctors").emit("patientAlert", alert);

    res.status(201).json({ message: "Alert sent", alert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send alert" });
  }
});

// Doctor responds (Coming)
app.post("/api/respond", async (req, res) => {
  const { alertId, doctorName } = req.body;
  try {
    const alert = await Alert.findByIdAndUpdate(alertId, { respondedBy: doctorName }, { new: true });
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    // Notify patient only
    io.to(`patient-${alert.patientId}`).emit("doctorComing", alert);

    // Notify all doctors to update dashboard
    io.to("doctors").emit("alertUpdated", alert);

    res.json({ message: "Doctor is coming", alert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to respond" });
  }
});

// Doctor resolves alert (Done)
app.delete("/api/alerts/:id", async (req, res) => {
  try {
    const alertId = req.params.id;
    const alert = await Alert.findById(alertId);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    // Save to history
    await History.create({
      patientId: alert.patientId,
      name: alert.name,
      bedNumber: alert.bedNumber,
      roomNumber: alert.roomNumber,
      message: alert.message,
      respondedBy: alert.respondedBy || "Unknown",
      createdAt: alert.createdAt,
      resolvedAt: new Date(),
    });

    // Delete active alert
    await Alert.findByIdAndDelete(alertId);

    // Notify doctors and patient
    io.to("doctors").emit("alertResolved", { alertId });
    io.to(`patient-${alert.patientId}`).emit("alertResolved", { alertId });

    res.json({ message: "Alert resolved and moved to history" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to resolve alert" });
  }
});

// === Socket.io ===
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join", ({ role, patientId }) => {
    if (role === "doctor") socket.join("doctors");
    if (role === "patient" && patientId) socket.join(`patient-${patientId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// === Start server ===
const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get("/", (req, res) => res.send("🚀 Backend ready for AlertMed"));
