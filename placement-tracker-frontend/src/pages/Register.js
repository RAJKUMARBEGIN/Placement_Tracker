import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { authAPI, departmentAPI } from "../services/api";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);

  // Step management: "role" -> "email" -> "otp" -> "form" (for students)
  // Step management: "role" -> "form" (for mentors)
  const [currentStep, setCurrentStep] = useState("role");
  const [selectedRole, setSelectedRole] = useState(null); // "STUDENT" or "MENTOR"

  // OTP verification states (only for students)
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otp, setOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    placedCompany: "",
    placedPosition: "",
    phoneNumber: "",
    linkedinProfile: "",
    departmentId: "",
    placementYear: new Date().getFullYear(),
    graduationYear: new Date().getFullYear() + 1,
    location: "",
    contactVisibility: "PUBLIC",
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await departmentAPI.getAll();
        setDepartments(response.data || []);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Check if email is GCT email (only required for students)
  const isGCTEmail = (email) => {
    return email && email.toLowerCase().endsWith("@gct.ac.in");
  };

  // Handle role selection
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role === "MENTOR") {
      // Mentors go directly to form - no OTP needed
      setCurrentStep("form");
      setEmailVerified(true); // Mentors don't need email verification
    } else {
      // Students need to verify GCT email
      setCurrentStep("email");
    }
  };

  // Send OTP to email (only for students)
  const handleSendOTP = async () => {
    if (!formData.email) {
      toast.error("Please enter your email");
      return;
    }

    if (!isGCTEmail(formData.email)) {
      toast.error(
        "Only GCT email addresses (@gct.ac.in) are allowed for students"
      );
      return;
    }

    setOtpSending(true);
    try {
      const response = await authAPI.sendOTP(formData.email);
      if (response.data.success) {
        toast.success("OTP sent to your email! Please check your inbox.", {
          autoClose: 8000,
        });
        setCurrentStep("otp");
        setCountdown(60);
      } else {
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpSending(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setOtpVerifying(true);
    try {
      const response = await authAPI.verifyOTP(formData.email, otp);
      if (response.data.success) {
        toast.success("Email verified successfully!");
        setEmailVerified(true);
        setCurrentStep("form");
      } else {
        toast.error(response.data.message || "Invalid OTP");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setOtpVerifying(false);
    }
  };

  // Resend OTP
  const handleResendOTP = () => {
    if (countdown === 0) {
      handleSendOTP();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Students need email verification, mentors don't
    if (selectedRole === "STUDENT" && !emailVerified) {
      toast.error("Please verify your email first");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
        role: selectedRole,
      };

      if (selectedRole === "STUDENT") {
        payload.departmentId = formData.departmentId;
        payload.graduationYear = parseInt(formData.graduationYear);
      }

      if (selectedRole === "MENTOR") {
        payload.placedCompany = formData.placedCompany;
        payload.placedPosition = formData.placedPosition;
        payload.phoneNumber = formData.phoneNumber;
        payload.linkedinProfile = formData.linkedinProfile;
        payload.departmentId = formData.departmentId;
        payload.placementYear = parseInt(formData.placementYear);
        payload.location = formData.location;
        payload.contactVisibility = formData.contactVisibility;
      }

      const response = await authAPI.register(payload);
      toast.success("Registration successful!");

      if (selectedRole === "MENTOR") {
        // Mentors need to wait for admin approval
        toast.info("Your registration request has been sent to the admin. You'll receive a verification code once approved.");
        navigate("/mentor-verify", { state: { email: formData.email } });
      } else {
        login(response.data.user);
        navigate("/student-dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Step 0: Role Selection (FIRST STEP)
  const renderRoleStep = () => (
    <div className="role-selection-step">
      <h2>Join GCT Placement Community</h2>
      <p>Choose how you want to register</p>

      <div className="role-selection-cards">
        <div className="role-card" onClick={() => handleRoleSelect("STUDENT")}>
          <div className="role-icon">S</div>
          <h3>Student</h3>
          <p>Current GCT student looking for placement guidance</p>
        </div>

        <div className="role-card" onClick={() => handleRoleSelect("MENTOR")}>
          <div className="role-icon">M</div>
          <h3>Mentor</h3>
          <p>Alumni who got placed and wants to guide juniors</p>
        </div>
      </div>

      <div className="admin-note">
        <p>
          Note: Students need GCT email verification. Mentors can register
          with any email.
        </p>
      </div>
    </div>
  );

  // Step 1: Email Entry (only for students)
  const renderEmailStep = () => (
    <div className="email-verification-step">
      <div className="step-indicator">
        <div className="step-dot completed"></div>
        <div className="step-dot active"></div>
        <div className="step-dot"></div>
        <div className="step-dot"></div>
      </div>

      <h2>Verify Your GCT Email</h2>
      <p>Only GCT students (@gct.ac.in) can register as students</p>

      <div className="email-input-group">
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="yourrollno@gct.ac.in"
          required
        />
        {formData.email && !isGCTEmail(formData.email) && (
          <span className="email-warning">
            ⚠️ Must be a GCT email (@gct.ac.in)
          </span>
        )}
      </div>

      <button
        type="button"
        className="auth-submit"
        onClick={handleSendOTP}
        disabled={otpSending || !isGCTEmail(formData.email)}
      >
        {otpSending ? "Sending OTP..." : "Send OTP"}
      </button>

      <button
        type="button"
        className="back-to-role-btn"
        onClick={() => {
          setCurrentStep("role");
          setSelectedRole(null);
        }}
      >
        ← Back to role selection
      </button>
    </div>
  );

  // Step 2: OTP Verification (only for students)
  const renderOTPStep = () => (
    <div className="otp-verification-step">
      <div className="step-indicator">
        <div className="step-dot completed"></div>
        <div className="step-dot completed"></div>
        <div className="step-dot active"></div>
        <div className="step-dot"></div>
      </div>

      <h2>Enter OTP</h2>
      <p>We've sent a 6-digit code to {formData.email}</p>

      <div className="form-group">
        <input
          type="text"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="Enter 6-digit OTP"
          maxLength={6}
          className="otp-input"
        />
      </div>
      <button
        type="button"
        className="auth-submit"
        onClick={handleVerifyOTP}
        disabled={otpVerifying || otp.length !== 6}
      >
        {otpVerifying ? "Verifying..." : "Verify OTP"}
      </button>
      <div className="otp-actions">
        <button
          type="button"
          className="resend-btn"
          onClick={handleResendOTP}
          disabled={countdown > 0}
        >
          {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
        </button>
        <button
          type="button"
          className="change-email-btn"
          onClick={() => {
            setCurrentStep("email");
            setOtp("");
          }}
        >
          Change Email
        </button>
      </div>
    </div>
  );

  // Step 3: Registration Form
  const renderFormStep = () => (
    <form className="auth-form" onSubmit={handleSubmit}>
      {selectedRole === "STUDENT" && (
        <div className="step-indicator">
          <div className="step-dot completed"></div>
          <div className="step-dot completed"></div>
          <div className="step-dot completed"></div>
          <div className="step-dot active"></div>
        </div>
      )}

      {selectedRole === "STUDENT" && (
        <div className="verified-email">
          <span className="verified-icon">✅</span>
          <span>{formData.email}</span>
          <span className="verified-badge">Verified</span>
        </div>
      )}

      <div className="role-badge-display">
        Registering as:{" "}
        <strong>
          {selectedRole === "STUDENT" ? "🎓 Student" : "💼 Mentor"}
        </strong>
      </div>

      <div className="form-group">
        <label>Full Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          required
        />
      </div>

      {/* Mentors enter email here since they skip OTP */}
      {selectedRole === "MENTOR" && (
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>
      )}

      <div className="form-group">
        <label>Password *</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a password (min 6 characters)"
          required
          minLength={6}
        />
      </div>

      {selectedRole === "STUDENT" && (
        <div className="student-fields">
          <div className="form-group">
            <label>Department *</label>
            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.departmentName} ({d.departmentCode})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Expected Graduation Year *</label>
            <input
              type="number"
              name="graduationYear"
              value={formData.graduationYear}
              onChange={handleChange}
              placeholder="e.g., 2025"
              min={new Date().getFullYear()}
              max={new Date().getFullYear() + 5}
              required
            />
          </div>
        </div>
      )}

      {selectedRole === "MENTOR" && (
        <div className="mentor-fields">
          <h4>📋 Mentor Details</h4>
          <div className="form-group">
            <label>Department *</label>
            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              required
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.departmentName} ({d.departmentCode})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Company Placed At *</label>
            <input
              type="text"
              name="placedCompany"
              value={formData.placedCompany}
              onChange={handleChange}
              placeholder="e.g., Google, Microsoft"
              required
            />
          </div>
          <div className="form-group">
            <label>Position *</label>
            <input
              type="text"
              name="placedPosition"
              value={formData.placedPosition}
              onChange={handleChange}
              placeholder="e.g., Software Engineer"
              required
            />
          </div>
          <div className="form-group">
            <label>Placement Year *</label>
            <input
              type="number"
              name="placementYear"
              value={formData.placementYear}
              onChange={handleChange}
              placeholder="e.g., 2024"
              min="2020"
              max={new Date().getFullYear() + 1}
              required
            />
          </div>
          <div className="form-group">
            <label>Location/Place *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Bangalore, Karnataka"
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Your contact number"
              required
            />
          </div>
          <div className="form-group">
            <label>LinkedIn Profile *</label>
            <input
              type="url"
              name="linkedinProfile"
              value={formData.linkedinProfile}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/yourprofile"
              required
            />
          </div>

          <div className="form-group privacy-section">
            <label>Contact Details Visibility *</label>
            <p className="privacy-description">
              Choose who can see your phone number and email
            </p>
            <div className="radio-options">
              <label className="radio-option">
                <input
                  type="radio"
                  name="contactVisibility"
                  value="PUBLIC"
                  checked={formData.contactVisibility === "PUBLIC"}
                  onChange={handleChange}
                />
                <span className="radio-label">
                  🌐 <strong>Public</strong> - All users can see my contact
                  details
                </span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="contactVisibility"
                  value="ADMIN_ONLY"
                  checked={formData.contactVisibility === "ADMIN_ONLY"}
                  onChange={handleChange}
                />
                <span className="radio-label">
                  🔒 <strong>Admin Only</strong> - Only admins can see my
                  contact details
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      <button type="submit" className="auth-submit" disabled={loading}>
        {loading ? "Creating Account..." : "Create Account"}
      </button>

      {selectedRole === "MENTOR" && (
        <button
          type="button"
          className="back-to-role-btn"
          onClick={() => {
            setCurrentStep("role");
            setSelectedRole(null);
            setEmailVerified(false);
          }}
        >
          ← Back to role selection
        </button>
      )}
    </form>
  );

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/" className="back-to-home">
          <FiArrowLeft /> Back to Home
        </Link>
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join GCT Placement Community</p>
        </div>

        {currentStep === "role" && renderRoleStep()}
        {currentStep === "email" && renderEmailStep()}
        {currentStep === "otp" && renderOTPStep()}
        {currentStep === "form" && renderFormStep()}

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
