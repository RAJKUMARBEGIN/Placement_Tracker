import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isLoggedIn = isAuthenticated();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <img src="/logo.jpeg" alt="GCT Logo" className="logo-img" />
          <span className="logo-text">PlaceTrack</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/mentors" className="nav-link">
            Mentors
          </Link>

          {isLoggedIn ? (
            <>
              {user?.role === "STUDENT" && (
                <Link to="/student-dashboard" className="nav-link">
                  Dashboard
                </Link>
              )}
              {user?.role === "MENTOR" && (
                <Link to="/mentor-dashboard" className="nav-link">
                  Dashboard
                </Link>
              )}
              <div className="user-menu">
                <div className="user-info">
                  <div className="user-avatar">
                    {user?.fullName?.charAt(0) || user?.name?.charAt(0) || "U"}
                  </div>
                  <div className="user-details">
                    <span className="user-name">
                      {user?.fullName || user?.name}
                    </span>
                    <span className="user-role">
                      {user?.role?.toLowerCase()}
                    </span>
                  </div>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="nav-btn login">
                Sign In
              </Link>
              <Link to="/register" className="nav-btn register">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
