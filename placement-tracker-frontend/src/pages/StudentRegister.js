import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI, departmentAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Register.css";

const StudentRegister = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    departmentId: "",
    rollNumber: "",
    yearOfStudy: "",
    phoneNumber: "",
  });

  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data);
    } catch (err) {
      console.error("Error fetching departments:", err);
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

    setLoading(true);

    try {
      const registerData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: "STUDENT",
        departmentId: parseInt(formData.departmentId),
        rollNumber: formData.rollNumber,
        yearOfStudy: formData.yearOfStudy
          ? parseInt(formData.yearOfStudy)
          : null,
        phoneNumber: formData.phoneNumber,
      };

      const response = await authAPI.register(registerData);
      login(response.data);
      navigate("/student/dashboard");
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

  return (
    <div className="register-container student-bg">
      <div className="register-card">
        <div className="register-header">
          <div className="role-badge student-badge">
            <span className="badge-icon">🎓</span>
            Student Registration
          </div>
          <h1>Join Placement Tracker</h1>
          <p>Create your student account to explore placement opportunities</p>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
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
              <label>Roll Number</label>
              <input
                type="text"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                placeholder="e.g., 20IT001"
              />
            </div>
          </div>

          <div className="form-row two-col">
            <div className="form-group">
              <label>Year of Study</label>
              <select
                name="yearOfStudy"
                value={formData.yearOfStudy}
                onChange={handleChange}
              >
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
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
          </div>

          <button
            type="submit"
            className="register-btn student-btn"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Student Account"}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
          <p>
            Are you a mentor?{" "}
            <Link to="/register/mentor">Register as Mentor</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;
