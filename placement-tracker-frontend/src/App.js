import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Experiences from "./pages/Experiences";
import DepartmentExperiences from "./pages/DepartmentExperiences";
import CompanyExperiences from "./pages/CompanyExperiences";
import Mentors from "./pages/Mentors";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MentorRegister from "./pages/MentorRegister";
import MentorVerificationCode from "./pages/MentorVerificationCode";
import ForgotPassword from "./pages/ForgotPassword";
import StudentDashboard from "./pages/StudentDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ExperienceDetail from "./pages/ExperienceDetail";
import TestAPI from "./pages/TestAPI";
import Profile from "./pages/Profile";
import AddExperience from "./pages/AddExperience";
import EditExperience from "./pages/EditExperience";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/experiences" element={<Experiences />} />
            <Route path="/department/:id" element={<DepartmentExperiences />} />
            <Route
              path="/company-experiences"
              element={<CompanyExperiences />}
            />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/mentor-register" element={<MentorRegister />} />
            <Route path="/mentor-verify" element={<MentorVerificationCode />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/add-experience" element={<AddExperience />} />
            <Route path="/edit-experience/:id" element={<EditExperience />} />
            <Route path="/mentor-dashboard" element={<MentorDashboard />} />
            <Route path="/experience/:id" element={<ExperienceDetail />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/test-api" element={<TestAPI />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
          <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
