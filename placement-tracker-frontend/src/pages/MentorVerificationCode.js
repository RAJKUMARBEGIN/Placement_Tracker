import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./VerificationCode.css";

function MentorVerificationCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mentorEmail, setMentorEmail] = useState("");

  useEffect(() => {
    // Get email from navigation state
    if (location.state?.email) {
      setMentorEmail(location.state.email);
    } else {
      navigate("/login");
    }
  }, [location.state, navigate]);

  return (
    <div className="verification-page">
      <div className="verification-container">
        <div className="verification-header">
          <div className="verification-icon">✅</div>
          <h1>Registration Submitted Successfully!</h1>
          <p>Your mentor details have been sent to the admin for review</p>
        </div>

        <div className="verification-email" style={{
          background: '#dbeafe',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <p style={{ margin: 0, color: '#1e40af', fontWeight: '600' }}>
            Registered Email: <strong>{mentorEmail}</strong>
          </p>
        </div>

        <div className="verification-info" style={{
          background: '#f9fafb',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ marginTop: 0, color: '#111827', marginBottom: '16px' }}>What Happens Next?</h3>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            <li style={{ marginBottom: '12px', color: '#4b5563' }}>
              ✉️ <strong>Admin reviews your details</strong> - Your profile including LinkedIn will be verified
            </li>
            <li style={{ marginBottom: '12px', color: '#4b5563' }}>
              📧 <strong>Email notification</strong> - You will receive an email once admin approves your registration
            </li>
            <li style={{ marginBottom: '12px', color: '#4b5563' }}>
              🔑 <strong>Login credentials</strong> - The approval email will contain your login instructions
            </li>
            <li style={{ marginBottom: '0', color: '#4b5563' }}>
              🚀 <strong>Sign in</strong> - Use your email and password to access the mentor dashboard
            </li>
          </ul>
        </div>

        <div className="important-note" style={{
          background: '#fef3c7',
          border: '2px solid #fbbf24',
          borderRadius: '8px',
          padding: '16px',
          marginTop: '24px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#92400e', fontWeight: '600' }}>
            ⏱️ Please wait for admin approval. Check your email regularly!
          </p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link 
            to="/" 
            className="verify-btn"
            style={{
              display: 'inline-block',
              textDecoration: 'none',
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            🏠 Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MentorVerificationCode;
