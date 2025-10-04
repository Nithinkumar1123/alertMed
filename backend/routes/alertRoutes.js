import express from "express";
import Alert from "../models/Alert.js";
import History from "../models/History.js";

const router = express.Router();

// Delete (resolve) an alert and move to history
router.delete("/alerts/:id", async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    // Move to history
    const history = new History({
      ...alert.toObject(),
      resolvedAt: new Date(),
    });
    await history.save();

    // Delete from active alerts
    await Alert.findByIdAndDelete(req.params.id);

    res.json({ message: "Alert moved to history", history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch history
router.get("/history", async (req, res) => {
  try {
    const history = await History.find().sort({ resolvedAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

export default router;
