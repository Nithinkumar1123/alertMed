import React, { useEffect, useState } from "react";
import API from "../api";
import { Container, Card, ListGroup } from "react-bootstrap";
import Navbar from "./Navbar";
import Footer from "./Footer";

const History = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get("/api/history");
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to load history", err);
      }
    };
    fetchHistory();
  }, []);

  return (
    <>
      <Navbar />
      <Container className="py-4">
        <h3>Resolved Alerts (History)</h3>
        {history.length === 0 ? (
          <p>No resolved alerts yet.</p>
        ) : (
          history.map((h) => (
            <Card className="mb-3" key={h._id}>
              <Card.Body>
                <h5>{h.name} — Bed {h.bedNumber}, Room {h.roomNumber}</h5>
                <ListGroup>
                  <ListGroup.Item><strong>Patient ID:</strong> {h.patientId}</ListGroup.Item>
                  <ListGroup.Item><strong>Message:</strong> {h.message}</ListGroup.Item>
                  <ListGroup.Item><strong>Responded By:</strong> {h.respondedBy}</ListGroup.Item>
                  <ListGroup.Item>
                    <small className="text-muted">Resolved at {new Date(h.resolvedAt).toLocaleString()}</small>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          ))
        )}
      </Container>
      <Footer />
    </>
  );
};

export default History;
