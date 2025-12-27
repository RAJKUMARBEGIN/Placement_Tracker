import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./MentorDashboard.css";

function MentorDashboard() {
  const { user } = useAuth();

  return (
    <div className="mentor-dashboard">
      <div className="mentor-header">
        <div className="mentor-header-content">
          <h1>Welcome, {user?.name || "Mentor"}!</h1>
          <p>Thank you for being a mentor and guiding students</p>
        </div>
      </div>

      <div className="mentor-content">
        <div className="dashboard-cards">
          <div className="dashboard-card profile-card">
            <div className="card-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h3>Your Profile</h3>
            <div className="profile-info">
              <p>
                <strong>Name:</strong> <span>{user?.name}</span>
              </p>
              <p>
                <strong>Email:</strong> <span>{user?.email}</span>
              </p>
              <p>
                <strong>Company:</strong>{" "}
                <span>{user?.placedCompany || "Not specified"}</span>
              </p>
              <p>
                <strong>Position:</strong>{" "}
                <span>{user?.placedPosition || "Not specified"}</span>
              </p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <h3>Browse Experiences</h3>
            <p>
              View placement experiences shared by students across departments
            </p>
            <Link to="/" className="card-link">
              Go to Home →
            </Link>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>Mentors List</h3>
            <p>
              Your profile is visible on the mentors page for students to
              connect
            </p>
            <Link to="/mentors" className="card-link">
              View Mentors →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MentorDashboard;
