import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiLinkedin,
  FiMapPin,
  FiBriefcase,
  FiCalendar,
  FiSave,
  FiEdit2,
} from "react-icons/fi";
import { authAPI, departmentAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    linkedinProfile: "",
    departmentId: "",
    rollNumber: "",
    yearOfStudy: "",
    graduationYear: "",
    placedCompany: "",
    placedPosition: "",
    placementYear: "",
    location: "",
    contactVisibility: "PUBLIC",
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [deptRes] = await Promise.all([departmentAPI.getAll()]);
      setDepartments(deptRes.data || []);

      if (user) {
        // Get fresh user data from API
        const userRes = await authAPI.getUserById(user.id);
        const userData = userRes.data;

        setFormData({
          fullName: userData.fullName || "",
          email: userData.email || "",
          phoneNumber: userData.phoneNumber || "",
          linkedinProfile: userData.linkedinProfile || "",
          departmentId: userData.departmentId || "",
          rollNumber: userData.rollNumber || "",
          yearOfStudy: userData.yearOfStudy || "",
          graduationYear: userData.graduationYear || "",
          placedCompany: userData.placedCompany || "",
          placedPosition: userData.placedPosition || "",
          placementYear: userData.placementYear || "",
          location: userData.location || "",
          contactVisibility: userData.contactVisibility || "PUBLIC",
        });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const updateData = {
        ...formData,
        yearOfStudy: formData.yearOfStudy
          ? parseInt(formData.yearOfStudy)
          : null,
        graduationYear: formData.graduationYear
          ? parseInt(formData.graduationYear)
          : null,
        placementYear: formData.placementYear
          ? parseInt(formData.placementYear)
          : null,
      };

      const response = await authAPI.updateProfile(user.id, updateData);

      // Update local auth context with new data
      const updatedUser = {
        ...user,
        name: response.data.fullName,
        fullName: response.data.fullName,
        phoneNumber: response.data.phoneNumber,
        linkedinProfile: response.data.linkedinProfile,
        departmentId: response.data.departmentId,
        placedCompany: response.data.placedCompany,
        placedPosition: response.data.placedPosition,
      };

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setSuccess("Profile updated successfully!");
      setIsEditing(false);

      // Refresh user data
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const getDepartmentName = (deptId) => {
    const dept = departments.find((d) => d.id === deptId);
    return dept ? dept.departmentName : "Not specified";
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loader"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="back-link-hero" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>
        <div className="hero-content">
          <h1>My Profile</h1>
          <p>Manage your personal information</p>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            {formData.fullName?.charAt(0).toUpperCase() || "U"}
          </div>
          <h2>{formData.fullName || "User"}</h2>
          <p className="profile-role">{user?.role || "Student"}</p>
          {user?.role === "MENTOR" && user?.isApproved && (
            <span className="approved-badge">Approved Mentor</span>
          )}
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="profile-form-container">
          <div className="form-header">
            <h3>Personal Information</h3>
            {!isEditing ? (
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                <FiEdit2 /> Edit Profile
              </button>
            ) : (
              <button
                className="cancel-btn"
                onClick={() => {
                  setIsEditing(false);
                  fetchData();
                }}
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Basic Info */}
              <div className="form-group">
                <label>
                  <FiUser /> Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label>
                  <FiMail /> Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="disabled-input"
                  placeholder="Email cannot be changed"
                />
              </div>

              <div className="form-group">
                <label>
                  <FiPhone /> Phone Number
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="+91-9876543210"
                />
              </div>

              <div className="form-group">
                <label>
                  <FiLinkedin /> LinkedIn Profile
                </label>
                <input
                  type="url"
                  name="linkedinProfile"
                  value={formData.linkedinProfile}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div className="form-group">
                <label>Department</label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  disabled={!isEditing}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.departmentName} ({dept.departmentCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Student specific fields */}
              {user?.role === "STUDENT" && (
                <>
                  <div className="form-group">
                    <label>Roll Number</label>
                    <input
                      type="text"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="20IT001"
                    />
                  </div>

                  <div className="form-group">
                    <label>Year of Study</label>
                    <select
                      name="yearOfStudy"
                      value={formData.yearOfStudy}
                      onChange={handleChange}
                      disabled={!isEditing}
                    >
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </>
              )}

              <div className="form-group">
                <label>
                  <FiCalendar /> Graduation Year
                </label>
                <select
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  disabled={!isEditing}
                >
                  <option value="">Select Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mentor specific fields */}
              {user?.role === "MENTOR" && (
                <>
                  <div className="form-group">
                    <label>
                      <FiBriefcase /> Company
                    </label>
                    <input
                      type="text"
                      name="placedCompany"
                      value={formData.placedCompany}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Company name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Position</label>
                    <input
                      type="text"
                      name="placedPosition"
                      value={formData.placedPosition}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Software Engineer"
                    />
                  </div>

                  <div className="form-group">
                    <label>Placement Year</label>
                    <select
                      name="placementYear"
                      value={formData.placementYear}
                      onChange={handleChange}
                      disabled={!isEditing}
                    >
                      <option value="">Select Year</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      <FiMapPin /> Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Bangalore, Karnataka"
                    />
                  </div>

                  <div className="form-group">
                    <label>Contact Visibility</label>
                    <select
                      name="contactVisibility"
                      value={formData.contactVisibility}
                      onChange={handleChange}
                      disabled={!isEditing}
                    >
                      <option value="PUBLIC">
                        Public - Visible to everyone
                      </option>
                      <option value="ADMIN_ONLY">
                        Admin Only - Only admins can see
                      </option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {isEditing && (
              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={saving}>
                  <FiSave /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
