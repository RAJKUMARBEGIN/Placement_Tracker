import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiArrowLeft, FiMail, FiLock, FiKey } from "react-icons/fi";
import { forgotPassword, resetPassword } from "../services/api";
import { toast } from "react-toastify";
import "./Auth.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & Password
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Check password strength on newPassword change
    if (name === "newPassword") {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    if (password.length < 6) {
      setPasswordStrength("Too short (min 6 characters)");
    } else {
      const hasLower = /[a-z]/.test(password);
      const hasUpper = /[A-Z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSpecial = /[@$!%*?&]/.test(password);

      const strength = [hasLower, hasUpper, hasNumber, hasSpecial].filter(
        Boolean
      ).length;

      if (strength === 4) {
        setPasswordStrength("Strong");
      } else if (strength >= 2) {
        setPasswordStrength("Medium");
      } else {
        setPasswordStrength("Weak");
      }
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!formData.email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword({ email: formData.email });
      toast.success(response.data || "OTP sent to your email successfully");
      setStep(2);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to send OTP. Please check your email."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validate OTP
    if (!formData.otp || formData.otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    // Validate password
    if (!formData.newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Validate password strength
    const hasLower = /[a-z]/.test(formData.newPassword);
    const hasUpper = /[A-Z]/.test(formData.newPassword);
    const hasNumber = /\d/.test(formData.newPassword);
    const hasSpecial = /[@$!%*?&]/.test(formData.newPassword);

    if (
      !hasLower ||
      !hasUpper ||
      !hasNumber ||
      !hasSpecial ||
      formData.newPassword.length < 6
    ) {
      toast.error(
        "Password must contain at least one lowercase, uppercase, number, special character (@$!%*?&) and be at least 6 characters long"
      );
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });
      toast.success(response.data || "Password reset successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to reset password. Please check your OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/login" className="back-to-home">
          <FiArrowLeft /> Back to Login
        </Link>
        {/* Hero Header */}
        <div className="auth-hero">
          <div className="hero-content">
            <div className="auth-icon">
              <FiKey />
            </div>
            <h1>Reset Password</h1>
            <p>We'll help you get back into your account</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="auth-card">
          {step === 1 ? (
            <form onSubmit={handleSendOTP}>
              <div className="form-group">
                <label>
                  <FiMail className="input-icon" /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your registered email"
                  required
                />
              </div>

              <button
                type="submit"
                className="submit-btn primary"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>

              <p className="auth-link">
                Remember your password? <Link to="/login">Login</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>
                  <FiMail className="input-icon" /> Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="disabled-input"
                />
              </div>

              <div className="form-group">
                <label>
                  <FiKey className="input-icon" /> OTP (6-digit code)
                </label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  required
                />
                <small className="form-hint">
                  Check your email for the OTP
                </small>
              </div>

              <div className="form-group">
                <label>
                  <FiLock className="input-icon" /> New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  required
                />
                {formData.newPassword && (
                  <small
                    className={`password-strength ${
                      passwordStrength.includes("Strong") ? "strong" : ""
                    }`}
                  >
                    Strength: {passwordStrength}
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>
                  <FiLock className="input-icon" /> Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <div className="password-requirements">
                <p>Password must contain:</p>
                <ul>
                  <li
                    className={
                      /[a-z]/.test(formData.newPassword) ? "valid" : ""
                    }
                  >
                    At least one lowercase letter
                  </li>
                  <li
                    className={
                      /[A-Z]/.test(formData.newPassword) ? "valid" : ""
                    }
                  >
                    At least one uppercase letter
                  </li>
                  <li
                    className={/\d/.test(formData.newPassword) ? "valid" : ""}
                  >
                    At least one number
                  </li>
                  <li
                    className={
                      /[@$!%*?&]/.test(formData.newPassword) ? "valid" : ""
                    }
                  >
                    At least one special character (@$!%*?&)
                  </li>
                  <li
                    className={formData.newPassword.length >= 6 ? "valid" : ""}
                  >
                    Minimum 6 characters
                  </li>
                </ul>
              </div>

              <button
                type="submit"
                className="submit-btn primary"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <button
                type="button"
                className="submit-btn secondary"
                onClick={() => setStep(1)}
              >
                <FiArrowLeft /> Back to Email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
