import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI, departmentAPI, companyAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Register.css";

const MentorRegister = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    departmentId: "",
    graduationYear: "",
    phoneNumber: "",
    linkedinProfile: "",
    placedCompany: "",
    placedPosition: "",
    placementYear: "",
    contactVisibility: "PUBLIC",
  });

  const [departments, setDepartments] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  useEffect(() => {
    fetchDepartments();
    fetchCompanies();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await companyAPI.getAll();
      setCompanies(response.data);
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password") {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    setPasswordStrength(strength);
  };

  const validateEmail = (email) => {
    return email.endsWith("@gct.ac.in");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validations
    if (!validateEmail(formData.email)) {
      setError("Only @gct.ac.in email addresses are allowed");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!formData.departmentId) {
      setError("Please select your department");
      return;
    }

    if (!formData.placedCompany) {
      setError("Please enter the company where you were placed");
      return;
    }

    // MANDATORY LinkedIn validation for mentors
    if (!formData.linkedinProfile || formData.linkedinProfile.trim() === "") {
      setError("LinkedIn profile is mandatory for mentor registration");
      return;
    }

    setLoading(true);

    try {
      const registerData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: "MENTOR",
        departmentId: formData.departmentId,
        graduationYear: formData.graduationYear
          ? parseInt(formData.graduationYear)
          : null,
        phoneNumber: formData.phoneNumber,
        linkedinProfile: formData.linkedinProfile,
        placedCompany: formData.placedCompany,
        placedPosition: formData.placedPosition,
        placementYear: formData.placementYear
          ? parseInt(formData.placementYear)
          : null,
        contactVisibility: formData.contactVisibility,
      };

      const response = await authAPI.register(registerData);
      // Show success card instead of navigating
      setRegisteredEmail(formData.email);
      setRegistrationSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return "#e74c3c";
    if (passwordStrength <= 3) return "#f39c12";
    return "#27ae60";
  };

  const getStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Medium";
    return "Strong";
  };

  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from(
    { length: currentYear - 2000 + 1 },
    (_, i) => currentYear - i
  );

  // Show success card after registration
  if (registrationSuccess) {
    return (
      <div className="register-container mentor-bg">
        <div className="register-card mentor-card success-card">
          <div className="success-icon-container">
            <div className="success-icon-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"></path>
              </svg>
            </div>
          </div>
          
          <h1 style={{ color: '#22c55e', marginBottom: '16px' }}>Registration Submitted Successfully!</h1>
          
          <div className="success-message-box">
            <div className="success-detail">
              <span className="success-emoji">✉️</span>
              <div>
                <strong>Your mentor details have been sent to the admin</strong>
                <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
                  Registered Email: <strong style={{ color: '#3b82f6' }}>{registeredEmail}</strong>
                </p>
              </div>
            </div>
            
            <div className="success-detail">
              <span className="success-emoji">✓</span>
              <div>
                <strong>Admin is reviewing your application</strong>
                <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
                  Your profile details including LinkedIn will be verified
                </p>
              </div>
            </div>
            
            <div className="success-detail">
              <span className="success-emoji">✓</span>
              <div>
                <strong>You will receive an email notification</strong>
                <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
                  Once admin approves, you'll get login credentials via email
                </p>
              </div>
            </div>
            
            <div className="success-detail">
              <span className="success-emoji">✓</span>
              <div>
                <strong>Then you can sign in</strong>
                <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
                  Use your email and password to access the mentor dashboard
                </p>
              </div>
            </div>
          </div>
          
          <div className="important-note" style={{
            background: '#fef3c7',
            border: '2px solid #fbbf24',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '24px',
            marginBottom: '24px'
          }}>
            <p style={{ margin: 0, color: '#92400e', fontWeight: '600' }}>
              Please wait for admin approval. Check your email regularly!
            </p>
          </div>
          
          <div className="success-actions">
            <Link to="/" className="btn-home">
              Go to Home
            </Link>
            <Link to="/login" className="btn-login">
              Check Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container mentor-bg">
      <div className="register-card mentor-card">
        <div className="register-header">
          <div className="role-badge mentor-badge">
            <span className="badge-icon">M</span>
            Mentor Registration
          </div>
          <h1>Become a Mentor</h1>
          <p>Share your placement experience and guide juniors</p>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">!</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-section">
            <h3 className="section-title">Personal Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>GCT Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="yourname@gct.ac.in"
                  required
                />
                <small className="email-hint">
                  Only @gct.ac.in emails are accepted
                </small>
              </div>
            </div>

            <div className="form-row two-col">
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 8 characters"
                  required
                />
                {formData.password && (
                  <div className="password-strength">
                    <div
                      className="strength-bar"
                      style={{
                        width: `${(passwordStrength / 5) * 100}%`,
                        backgroundColor: getStrengthColor(),
                      }}
                    />
                    <span style={{ color: getStrengthColor() }}>
                      {getStrengthText()}
                    </span>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>

            <div className="form-row two-col">
              <div className="form-group">
                <label>Department *</label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.departmentName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Graduation Year</label>
                <select
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                >
                  <option value="">Select Year</option>
                  {graduationYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row two-col">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="form-group">
                <label>LinkedIn Profile * (MANDATORY)</label>
                <input
                  type="url"
                  name="linkedinProfile"
                  value={formData.linkedinProfile}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                  required
                />
                <small
                  className="linkedin-hint"
                  style={{ color: "#0066cc", fontSize: "12px" }}
                >
                  LinkedIn profile is mandatory for mentor approval
                </small>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Placement Information</h3>

            <div className="form-row two-col">
              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  name="placedCompany"
                  value={formData.placedCompany}
                  onChange={handleChange}
                  placeholder="e.g., Google, Microsoft"
                  list="companies-list"
                  required
                />
                <datalist id="companies-list">
                  {companies.map((company) => (
                    <option key={company.id} value={company.companyName} />
                  ))}
                </datalist>
              </div>
              <div className="form-group">
                <label>Position/Role</label>
                <input
                  type="text"
                  name="placedPosition"
                  value={formData.placedPosition}
                  onChange={handleChange}
                  placeholder="e.g., Software Engineer"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half-width">
                <label>Placement Year</label>
                <select
                  name="placementYear"
                  value={formData.placementYear}
                  onChange={handleChange}
                >
                  <option value="">Select Year</option>
                  {graduationYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Privacy Settings</h3>
            <div className="form-group">
              <label>Contact Visibility</label>
              <select
                name="contactVisibility"
                value={formData.contactVisibility}
                onChange={handleChange}
              >
                <option value="PUBLIC">
                  Public - Everyone can see my contact info
                </option>
                <option value="ADMIN_ONLY">
                  Admin Only - Only administrators can see my contact info
                </option>
              </select>
              <p className="form-hint">
                Choose who can view your email, phone number, and LinkedIn
                profile
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="register-btn mentor-btn"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Mentor Account"}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
          <p>
            Are you a student?{" "}
            <Link to="/register/student">Register as Student</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MentorRegister;
