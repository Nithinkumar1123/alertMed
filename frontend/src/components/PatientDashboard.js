// src/components/PatientDashboard.js
import React, { useEffect, useState, useRef } from "react";
import API from "../api";
import { socket } from "../socket";
import { Container, Card, Button } from "react-bootstrap";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ToastContainer, toast } from "react-toastify";

const PatientDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [sending, setSending] = useState(false);
  const userId = localStorage.getItem("userId");

  // ref for "doctor coming" audio to control play/pause
  const comingAudioRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get(`/profile/${userId}`);
        setProfile(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    if (userId) fetchProfile();
  }, [userId]);

  useEffect(() => {
    if (!profile) return;

    if (!socket.connected) socket.connect();

    // join patient's room
    socket.emit("join", { role: "patient", patientId: profile.patientId, userId });

    // doctor clicks "Coming"
    const onDoctorComing = (alert) => {
      if (alert && alert.patientId === profile.patientId) {
        toast.info(`Doctor ${alert.respondedBy} is coming!`);

        // play looping coming sound
        if (!comingAudioRef.current) {
          comingAudioRef.current = new Audio("/coming.mp3");
          comingAudioRef.current.loop = true;
          comingAudioRef.current.play().catch(() => {});
        }
      }
    };

    // doctor clicks "Done" or alert resolved
    const onAlertResolved = ({ alertId }) => {
      if (comingAudioRef.current) {
        comingAudioRef.current.pause();
        comingAudioRef.current.currentTime = 0;
        comingAudioRef.current = null;
      }
      toast.success("✅ Emergency resolved. Doctor has arrived.");
    };

    socket.on("doctorComing", onDoctorComing);
    socket.on("alertResolved", onAlertResolved);

    return () => {
      socket.off("doctorComing", onDoctorComing);
      socket.off("alertResolved", onAlertResolved);

      // cleanup audio on unmount
      if (comingAudioRef.current) {
        comingAudioRef.current.pause();
        comingAudioRef.current.currentTime = 0;
        comingAudioRef.current = null;
      }
    };
  }, [profile, userId]);

  const handleEmergency = async () => {
    if (!profile) return;
    setSending(true);
    try {
      const payload = {
        patientId: profile.patientId,
        name: profile.name,
        bedNumber: profile.bedNumber,
        roomNumber: profile.roomNumber,
        message: `Emergency: patient ${profile.patientId} needs help!`,
      };
      await API.post("/alert", payload); // server saves + broadcasts to doctors

      toast.success("Emergency alert sent to doctors");

      // play one-time alert sent sound
      const confirmSound = new Audio("/alert_sent.mp3");
      confirmSound.play().catch(() => {});
    } catch (err) {
      console.error(err);
      toast.error("Failed to send alert");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" />
      <Container className="py-4">
        <Card className="p-4">
          <h4>Patient Dashboard</h4>
          {profile ? (
            <>
              <p><strong>Patient ID:</strong> {profile.patientId}</p>
              <p><strong>Name:</strong> {profile.name}</p>
              <p><strong>Bed:</strong> {profile.bedNumber}</p>
              <p><strong>Room:</strong> {profile.roomNumber}</p>
              <div className="d-grid">
                <Button
                  variant="danger"
                  size="lg"
                  onClick={handleEmergency}
                  disabled={sending}
                >
                  {sending ? "Sending..." : "🚨 Emergency — Send Alert"}
                </Button>
              </div>
            </>
          ) : (
            <p>Loading profile...</p>
          )}
        </Card>
      </Container>
      <Footer />
    </>
  );
};

export default PatientDashboard;
