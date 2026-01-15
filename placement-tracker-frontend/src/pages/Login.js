import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Check for hardcoded admin credentials
      if (formData.email === "harshavardhinin6@gmail.com" && formData.password === "admin123") {
        // Admin login with hardcoded credentials
        const adminUser = {
          email: "harshavardhinin6@gmail.com",
          fullName: "Admin",
          role: "ADMIN"
        };
        localStorage.setItem("adminUser", JSON.stringify(adminUser));
        localStorage.setItem("userRole", "ADMIN");
        toast.success("Admin login successful!");
        navigate("/admin-dashboard");
        setLoading(false);
        return;
      }

      // Regular login flow
      const response = await authAPI.login(formData);

      // Check user role and navigate accordingly
      if (response.data.user.role === "ADMIN") {
        // Admin login
        localStorage.setItem("adminUser", JSON.stringify(response.data.user));
        localStorage.setItem("userRole", "ADMIN");
        login(response.data.user);
        toast.success("Admin login successful!");
        navigate("/admin-dashboard");
      } else if (response.data.user.role === "MENTOR") {
        // Mentor login successful (already approved)
        login(response.data.user);
        toast.success("Mentor login successful!");
        navigate("/mentor-dashboard");
      } else {
        // Student login
        login(response.data.user);
        toast.success("Login successful!");
        navigate("/student-dashboard");
      }
    } catch (error) {
      // Check if it's a mentor not approved error
      if (error.response?.data?.message === "MENTOR_NOT_APPROVED" || 
          error.response?.data?.message === "MENTOR_NOT_VERIFIED") {
        toast.warning(
          "Your mentor account is pending admin approval. You will receive an email with login credentials once approved."
        );
      } else {
        toast.error(error.response?.data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/" className="back-to-home">
          <FiArrowLeft /> Back to Home
        </Link>
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to access your dashboard</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <p
            className="auth-link"
            style={{
              textAlign: "right",
              marginTop: "-8px",
              marginBottom: "12px",
            }}
          >
            <Link to="/forgot-password">Forgot Password?</Link>
          </p>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
