// src/components/DoctorDashboard.js
import React, { useEffect, useState } from "react";
import API from "../api";
import { socket } from "../socket";
import { Container, Card, ListGroup, Button, Row, Col } from "react-bootstrap";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const DoctorDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const doctorName =
    localStorage.getItem("doctorName") ||
    localStorage.getItem("name") ||
    "Doctor";
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  // keep audio refs so we can stop them later
  let alertAudio = null;

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await API.get("/alerts");
        setAlerts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();

    if (!socket.connected) socket.connect();
    socket.emit("join", { role: "doctor", userId });

    // doctor receives patientAlert
    const onPatientAlert = (alert) => {
      setAlerts((prev) => [alert, ...prev]);
      toast.warn(
        `🚨 ${alert.name} — Bed ${alert.bedNumber}, Room ${alert.roomNumber}`
      );
      alertAudio = new Audio("/alert.mp3"); // only doctors hear this
      alertAudio.loop = true;
      alertAudio.play().catch(() => {});
    };

    const onAlertResolved = ({ alertId }) => {
      // remove resolved alert from active list
      setAlerts((prev) => prev.filter((a) => a._id !== alertId));
      // toast.info("✅ Alert resolved and moved to history");
      // stop any alert sound
      if (alertAudio) {
        alertAudio.pause();
        alertAudio.currentTime = 0;
      }
    };

    const onAlertUpdated = (alert) => {
      setAlerts((prev) =>
        prev.map((a) => (a._id === alert._id ? alert : a))
      );
    };

    socket.on("patientAlert", onPatientAlert);
    socket.on("alertResolved", onAlertResolved);
    socket.on("alertUpdated", onAlertUpdated);

    return () => {
      socket.off("patientAlert", onPatientAlert);
      socket.off("alertResolved", onAlertResolved);
      socket.off("alertUpdated", onAlertUpdated);
    };
  }, [userId]);

  const handleComing = async (alertId) => {
    try {
      await API.post("/respond", { alertId, doctorName });
      toast.success("You clicked Coming — patient will be notified");
      const confirmSound = new Audio("/coming_confirm.mp3");
      confirmSound.play().catch(() => {});
      // locally update respondedBy
      setAlerts((prev) =>
        prev.map((a) =>
          a._id === alertId ? { ...a, respondedBy: doctorName } : a
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to notify patient");
    }
  };

 const handleDone = async (alertId) => {
  try {
    await API.delete(`/alerts/${alertId}`);
    toast.success("Resolved ");
    // navigate("/history"); // optional: go to history page
  } catch (err) {
    console.error(err);
    toast.error("Delete failed");
  }
};


  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" />
      <Container className="py-4">
        <h3>Doctor Dashboard</h3>
        {loading ? (
          <p>Loading...</p>
        ) : alerts.length === 0 ? (
          <p>No active alerts</p>
        ) : (
          alerts.map((alert) => (
            <Card className="mb-3" key={alert._id}>
              <Card.Body>
                <Row>
                  <Col md={8}>
                    <h5 className="text-danger">
                      {alert.name}{" "}
                      {alert.respondedBy && (
                        <small className="text-success">
                          — {alert.respondedBy} coming
                        </small>
                      )}
                    </h5>
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <strong>Patient ID:</strong> {alert.patientId}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Bed:</strong> {alert.bedNumber}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Room:</strong> {alert.roomNumber}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Message:</strong> {alert.message}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <small className="text-muted">
                          {new Date(alert.createdAt).toLocaleString()}
                        </small>
                      </ListGroup.Item>
                    </ListGroup>
                  </Col>
                  <Col md={4} className="text-end">
                    <div className="d-grid">
                      <Button
                        variant="warning"
                        className="mb-2"
                        onClick={() => handleComing(alert._id)}
                      >
                        🚶‍♂️ Coming
                      </Button>
                      <Button
                        variant="success"
                        onClick={() => handleDone(alert._id)}
                      >
                        ✅ Done
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))
        )}
      </Container>
      <Footer />
    </>
  );
};

export default DoctorDashboard;
