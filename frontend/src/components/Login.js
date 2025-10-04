import React, { useState } from "react";
import { Form, Button, Container, Row, Col, Card, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import API from "../api";
import Footer from "./Footer";
import Navbar from "./Navbar";
import "./Login.css"; // we'll add custom styles

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userId", res.data.user._id);

      if (res.data.role === "patient") navigate("/patient");
      else navigate("/doctor");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="login-page">
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
          <Row className="justify-content-center w-100">
            <Col xs={12} sm={10} md={8} lg={6}>
              <Card className="p-4 shadow-lg login-card">
                <h2 className="text-center mb-4 login-title">Welcome Back!</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="input-field"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="input-field"
                    />
                  </Form.Group>
                  <Button
                    type="submit"
                    className="w-100 login-btn"
                    disabled={loading}
                  >
                    {loading ? <Spinner animation="border" size="sm" /> : "Login"}
                  </Button>
                </Form>
                <p className="mt-3 text-center">
                  Don't have an account? <a href="/signup" className="signup-link">Sign Up</a>
                </p>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default Login;
