import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOtp from "./pages/VerifyOtp";
import AdminDashboard from "./pages/AdminDashboard";
import VoterDashboard from "./pages/VoterDashboard";

const App = () => {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto mt-4 px-4">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/voter" element={<VoterDashboard />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
