import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import "./VerificationCode.css";

function MentorVerificationCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [mentorEmail, setMentorEmail] = useState("");
  const [codeReceived, setCodeReceived] = useState(false);

  useEffect(() => {
    // Get email from navigation state
    if (location.state?.email) {
      setMentorEmail(location.state.email);
    } else {
      navigate("/login");
    }
  }, [location.state, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (verificationCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.verifyMentorCode(
        mentorEmail,
        verificationCode
      );

      if (response.data.success) {
        login(response.data.user);
        toast.success("Email verified successfully!");
        navigate("/mentor-dashboard");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    try {
      const response = await authAPI.sendMentorVerificationCode(mentorEmail);
      if (response.data.success) {
        toast.success("Verification code sent to your email!");
        setVerificationCode("");
        setCodeReceived(true);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to request code"
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="verification-page">
      <div className="verification-container">
        <div className="verification-header">
          <div className="verification-icon">🔐</div>
          <h1>Verify Your Account</h1>
          <p>Your admin has approved your registration. Enter the verification code you received.</p>
        </div>

        <div className="verification-email">
          <p>Email: <strong>{mentorEmail}</strong></p>
        </div>

        {!codeReceived && (
          <div className="waiting-for-code-message">
            <p>⏳ Waiting for admin to send your verification code...</p>
            <p className="sub-text">Once the admin sends the code, you can enter it below. The code does not expire.</p>
          </div>
        )}

        <form className="verification-form" onSubmit={handleVerify}>
          <div className="code-input-group">
            <label>Verification Code</label>
            <input
              type="text"
              maxLength="6"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                setVerificationCode(value);
              }}
              className="code-input"
              required
            />
            <p className="code-helper">Enter the 6-digit code sent to your email</p>
          </div>

          <button
            type="submit"
            className="verify-btn"
            disabled={loading || verificationCode.length !== 6}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        <div className="resend-section">
          <p>Didn't receive the code yet?</p>
          <button
            className="resend-btn"
            onClick={handleResendCode}
            disabled={resending}
          >
            {resending ? "Requesting..." : "Request Code"}
          </button>
          <p className="resend-info">Ask your admin to send the verification code if you haven't received it yet.</p>
        </div>

        <div className="verification-info">
          <h3>How It Works</h3>
          <ul>
            <li>✓ Wait for your admin to send you the verification code</li>
            <li>✓ Check your email (including spam folder) for the code</li>
            <li>✓ The code does NOT expire - you can use it anytime</li>
            <li>✓ Enter the 6-digit code in the field above</li>
            <li>✓ After verification, you can access your mentor dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default MentorVerificationCode;
