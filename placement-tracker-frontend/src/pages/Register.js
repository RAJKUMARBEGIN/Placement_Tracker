import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { authAPI, departmentAPI } from '../services/api';
import './Auth.css';

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('STUDENT');
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    placedCompany: '',
    placedPosition: '',
    phoneNumber: '',
    linkedinProfile: '',
    departmentId: '',
    placementYear: new Date().getFullYear()
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await departmentAPI.getAll();
        setDepartments(response.data || []);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
        role: role
      };
      if (role === 'MENTOR') {
        payload.placedCompany = formData.placedCompany;
        payload.placedPosition = formData.placedPosition;
        payload.phoneNumber = formData.phoneNumber;
        payload.linkedinProfile = formData.linkedinProfile;
        payload.departmentId = parseInt(formData.departmentId);
        payload.placementYear = parseInt(formData.placementYear);
      }
      const response = await authAPI.register(payload);
      login(response.data.user);
      toast.success('Registration successful!');
      if (role === 'MENTOR') {
        navigate('/mentor-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join our placement community</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="role-selector">
            <label>I am a:</label>
            <div className="role-buttons">
              <button
                type="button"
                className={`role-btn ${role === 'STUDENT' ? 'active' : ''}`}
                onClick={() => setRole('STUDENT')}
              >
                <span>Student</span>
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'MENTOR' ? 'active' : ''}`}
                onClick={() => setRole('MENTOR')}
              >
                <span>Mentor</span>
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>
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
              placeholder="Create a password"
              required
              minLength={6}
            />
          </div>
          {role === 'MENTOR' && (
            <div className="mentor-fields">
              <h4>Mentor Details (for mentors list)</h4>
              <div className="form-group">
                <label>Department *</label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.departmentName} ({d.departmentCode})</option>
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
                <label>Phone Number (optional)</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Your contact number"
                />
              </div>
              <div className="form-group">
                <label>LinkedIn Profile (optional)</label>
                <input
                  type="text"
                  name="linkedinProfile"
                  value={formData.linkedinProfile}
                  onChange={handleChange}
                  placeholder="linkedin.com/in/yourprofile"
                />
              </div>
            </div>
          )}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
