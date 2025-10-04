import React, { useState } from "react";
import { Form, Button, Container, Row, Col, Card, Alert, Collapse } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import API from "../api";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { FaUserInjured, FaUserMd } from "react-icons/fa";
import "./Signup.css"; // We'll add CSS for animations

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [name, setName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [bedNumber, setBedNumber] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        email,
        password,
        role,
        name,
        patientId: role === "patient" ? patientId : undefined,
        bedNumber: role === "patient" ? bedNumber : undefined,
        roomNumber: role === "patient" ? roomNumber : undefined,
        licenseNumber: role === "doctor" ? licenseNumber : undefined,
        department: role === "doctor" ? department : undefined,
      };
      await API.post("/signup", payload);
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Container className="my-5">
        <Row className="justify-content-center">
          <Col lg={6}>
            {/* Animated Role Preview Card */}
            <Card
              className={`text-center mb-4 shadow-sm p-3 border-0 role-card ${
                role === "patient" ? "patient-bg" : "doctor-bg"
              }`}
            >
              <div className="d-flex justify-content-center align-items-center flex-column role-content">
                {role === "patient" ? (
                  <>
                    <FaUserInjured size={50} className="role-icon" />
                    <h4 className="mb-0">Patient Signup</h4>
                    <small className="text-light">Create your patient account to send alerts.</small>
                  </>
                ) : (
                  <>
                    <FaUserMd size={50} className="role-icon" />
                    <h4 className="mb-0">Doctor Signup</h4>
                    <small className="text-light">Create your doctor account to respond to alerts.</small>
                  </>
                )}
              </div>
            </Card>

            <Card className="shadow-sm p-4 border-0">
              <h2 className="text-center mb-3">Create Your Account</h2>
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Form.Group>

                {/* Patient Fields */}
                <Collapse in={role === "patient"}>
                  <div>
                    <Form.Group className="mb-3">
                      <Form.Label>Patient ID</Form.Label>
                      <Form.Control
                        placeholder="Enter your patient ID"
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        required={role === "patient"}
                      />
                    </Form.Group>

                    <Row>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>Bed Number</Form.Label>
                          <Form.Control
                            placeholder="e.g., B12"
                            value={bedNumber}
                            onChange={(e) => setBedNumber(e.target.value)}
                            required={role === "patient"}
                          />
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-3">
                          <Form.Label>Room Number</Form.Label>
                          <Form.Control
                            placeholder="e.g., 101"
                            value={roomNumber}
                            onChange={(e) => setRoomNumber(e.target.value)}
                            required={role === "patient"}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                </Collapse>

                {/* Doctor Fields */}
                <Collapse in={role === "doctor"}>
                  <div>
                    <Form.Group className="mb-3">
                      <Form.Label>License Number</Form.Label>
                      <Form.Control
                        placeholder="Enter your license number"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        required={role === "doctor"}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Department</Form.Label>
                      <Form.Control
                        placeholder="e.g., Cardiology"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        required={role === "doctor"}
                      />
                    </Form.Group>
                  </div>
                </Collapse>

               <div className="d-flex justify-content-between align-items-center flex-wrap mt-3">
  <Button
    type="submit"
    className="flex-grow-1 mb-2 mb-sm-0 signup-btn"
    disabled={loading}
  >
    {loading ? "Creating Account..." : "Signup"}
  </Button>

  <span
    className={`role-badge ms-2 ${
      role === "patient" ? "patient-badge" : "doctor-badge"
    }`}
  >
    {role === "patient" ? "Patient" : "Doctor"}
  </span>
</div>


              </Form>

              <p className="text-center text-muted mt-3">
                Already have an account? <a href="/login">Login here</a>
              </p>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
};

export default Signup;
