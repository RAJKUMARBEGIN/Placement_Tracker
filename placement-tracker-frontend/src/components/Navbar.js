import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-text">PlaceTrack</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/mentors" className="nav-link">Mentors</Link>
          
          {isAuthenticated ? (
            <>
              {user?.role === 'STUDENT' && (
                <Link to="/student-dashboard" className="nav-link">Dashboard</Link>
              )}
              {user?.role === 'MENTOR' && (
                <Link to="/mentor-dashboard" className="nav-link">Dashboard</Link>
              )}
              <button className="nav-btn logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-btn login">Login</Link>
              <Link to="/register" className="nav-btn register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
