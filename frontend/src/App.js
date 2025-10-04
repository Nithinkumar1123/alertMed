// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Signup from "./components/Signup";
import Login from "./components/Login";
import PatientDashboard from "./components/PatientDashboard";
import DoctorDashboard from "./components/DoctorDashboard";
import History from "./components/History";
import PrivateRoute from "./components/PrivateRoute";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/patient" element={<PrivateRoute role="patient"><PatientDashboard /></PrivateRoute>} />
        <Route path="/doctor" element={<PrivateRoute role="doctor"><DoctorDashboard /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute role="doctor"><History /></PrivateRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
