import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { departmentAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

const Home = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Check if admin or regular user is logged in
  const isAdmin = localStorage.getItem("userRole") === "ADMIN";
  const isLoggedIn = isAuthenticated() || isAdmin;

  // Get the correct dashboard URL based on user role
  const getDashboardUrl = () => {
    // Check if admin from localStorage
    const userRole = localStorage.getItem("userRole");
    if (userRole === "ADMIN") return "/admin-dashboard";

    // Check user from context
    if (!user) return "/login";
    
    if (user.role === "ADMIN") return "/admin-dashboard";
    if (user.role === "STUDENT") return "/student-dashboard";
    if (user.role === "MENTOR") return "/mentor-dashboard";

    return "/login";
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data);
    } catch (err) {
      console.error("Error fetching departments:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="home-loading">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>GCT Placement</h1>
          <p>
            Explore interview experiences from your seniors and prepare for your
            dream company
          </p>
          <div className="hero-actions">
            {isLoggedIn ? (
              <Link to={getDashboardUrl()} className="hero-btn primary">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/login" className="hero-btn primary">
                Login to Add Experience
              </Link>
            )}
            <Link to="/mentors" className="hero-btn secondary">
              View Mentors
            </Link>
          </div>
        </div>
      </section>

      <section className="departments-section">
        <div className="section-header">
          <h2>Browse by Department</h2>
          <p>Select your department to view interview experiences</p>
        </div>
        <div className="departments-grid">
          {departments.map((dept) => (
            <Link
              to={"/department/" + dept.id}
              key={dept.id}
              className="department-card"
            >
              <div className="dept-code">{dept.departmentCode}</div>
              <p className="dept-name">{dept.departmentName}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="info-section">
        {!isAuthenticated() && (
          <div className="info-card">
            <div className="info-icon-box">01</div>
            <h3>Share Your Experience</h3>
            <p>Help juniors by sharing your interview experience</p>
            <Link to="/register" className="info-link">
              Register as Student →
            </Link>
          </div>
        )}
        <div className="info-card">
          <div className="info-icon-box">{isAuthenticated() ? "01" : "02"}</div>
          <h3>Connect with Mentors</h3>
          <p>Get guidance from placed students</p>
          <Link to="/mentors" className="info-link">
            View Mentors →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
