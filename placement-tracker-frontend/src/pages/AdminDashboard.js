import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI, departmentAPI, authAPI } from "../services/api";
import { toast } from "react-toastify";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [pendingMentors, setPendingMentors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMentorForm, setShowMentorForm] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [editingMentor, setEditingMentor] = useState(null);

  const [mentorFormData, setMentorFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    linkedinProfile: "",
    placedCompany: "",
    placedPosition: "",
    placementYear: "",
    graduationYear: "",
    departmentIds: [],
  });

  const [adminFormData, setAdminFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
  });

  useEffect(() => {
    // Check if user is admin
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "ADMIN") {
      toast.error("Unauthorized access");
      navigate("/admin-login");
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [mentorsRes, deptsRes, pendingRes] = await Promise.all([
        adminAPI.getAllMentors(),
        departmentAPI.getAll(),
        authAPI.getPendingMentors(),
      ]);
      setMentors(mentorsRes.data);
      setDepartments(deptsRes.data);
      setPendingMentors(pendingRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveMentor = async (mentorId) => {
    try {
      await authAPI.approveMentor(mentorId);
      toast.success("Mentor approved successfully!");
      fetchData();
    } catch (error) {
      console.error("Error approving mentor:", error);
      toast.error("Failed to approve mentor");
    }
  };

  const handleRejectMentor = async (mentorId) => {
    if (
      window.confirm(
        "Are you sure you want to reject this mentor? Their account will be deleted."
      )
    ) {
      try {
        await authAPI.rejectMentor(mentorId);
        toast.success("Mentor rejected and removed");
        fetchData();
      } catch (error) {
        console.error("Error rejecting mentor:", error);
        toast.error("Failed to reject mentor");
      }
    }
  };

  const handleMentorFormChange = (e) => {
    const { name, value, type, checked, options } = e.target;

    if (type === "select-multiple") {
      const selectedIds = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => parseInt(option.value));
      setMentorFormData({ ...mentorFormData, departmentIds: selectedIds });
    } else {
      setMentorFormData({ ...mentorFormData, [name]: value });
    }
  };

  const handleAdminFormChange = (e) => {
    setAdminFormData({
      ...adminFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateMentor = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...mentorFormData,
        placementYear: mentorFormData.placementYear
          ? parseInt(mentorFormData.placementYear)
          : null,
        graduationYear: mentorFormData.graduationYear
          ? parseInt(mentorFormData.graduationYear)
          : null,
      };

      await adminAPI.createMentor(dataToSend);
      toast.success("Mentor created successfully!");
      setShowMentorForm(false);
      resetMentorForm();
      fetchData();
    } catch (error) {
      console.error("Error creating mentor:", error);
      toast.error(error.response?.data?.message || "Failed to create mentor");
    }
  };

  const handleUpdateMentor = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...mentorFormData,
        placementYear: mentorFormData.placementYear
          ? parseInt(mentorFormData.placementYear)
          : null,
        graduationYear: mentorFormData.graduationYear
          ? parseInt(mentorFormData.graduationYear)
          : null,
      };

      await adminAPI.updateMentor(editingMentor.id, dataToSend);
      toast.success("Mentor updated successfully!");
      setEditingMentor(null);
      setShowMentorForm(false);
      resetMentorForm();
      fetchData();
    } catch (error) {
      console.error("Error updating mentor:", error);
      toast.error(error.response?.data?.message || "Failed to update mentor");
    }
  };

  const handleDeleteMentor = async (id) => {
    if (window.confirm("Are you sure you want to delete this mentor?")) {
      try {
        await adminAPI.deleteMentor(id);
        toast.success("Mentor deleted successfully!");
        fetchData();
      } catch (error) {
        console.error("Error deleting mentor:", error);
        toast.error("Failed to delete mentor");
      }
    }
  };

  const handleEditMentor = (mentor) => {
    setEditingMentor(mentor);
    setMentorFormData({
      fullName: mentor.fullName,
      email: mentor.email,
      phoneNumber: mentor.phoneNumber || "",
      linkedinProfile: mentor.linkedinProfile || "",
      placedCompany: mentor.placedCompany,
      placedPosition: mentor.placedPosition || "",
      placementYear: mentor.placementYear || "",
      graduationYear: mentor.graduationYear || "",
      departmentIds: mentor.departments.map((d) => d.id),
    });
    setShowMentorForm(true);
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createAdmin(adminFormData);
      toast.success("Admin created successfully!");
      setShowAdminForm(false);
      setAdminFormData({ username: "", password: "", fullName: "", email: "" });
    } catch (error) {
      console.error("Error creating admin:", error);
      toast.error(error.response?.data?.message || "Failed to create admin");
    }
  };

  const resetMentorForm = () => {
    setMentorFormData({
      fullName: "",
      email: "",
      phoneNumber: "",
      linkedinProfile: "",
      placedCompany: "",
      placedPosition: "",
      placementYear: "",
      graduationYear: "",
      departmentIds: [],
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    localStorage.removeItem("userRole");
    toast.success("Logged out successfully");
    navigate("/admin-login");
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-actions">
          <button
            onClick={() => setShowAdminForm(true)}
            className="btn-create-admin"
          >
            Create New Admin
          </button>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Mentors</h3>
          <p className="stat-value">{mentors.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Departments</h3>
          <p className="stat-value">{departments.length}</p>
        </div>
        <div className="stat-card pending-stat">
          <h3>Pending Approvals</h3>
          <p className="stat-value">{pendingMentors.length}</p>
        </div>
      </div>

      {/* Pending Mentor Approvals Section */}
      {pendingMentors.length > 0 && (
        <div className="pending-mentors-section">
          <div className="section-header">
            <h2>⏳ Pending Mentor Approvals</h2>
            <span className="pending-count">
              {pendingMentors.length} awaiting approval
            </span>
          </div>
          <div className="pending-mentors-grid">
            {pendingMentors.map((mentor) => (
              <div key={mentor.id} className="pending-mentor-card">
                <div className="pending-mentor-info">
                  <div className="mentor-avatar">
                    {mentor.fullName?.charAt(0).toUpperCase() || "M"}
                  </div>
                  <div className="mentor-details">
                    <h4>{mentor.fullName}</h4>
                    <p className="mentor-email">{mentor.email}</p>
                    <p className="mentor-company">
                      {mentor.placedCompany} - {mentor.placedPosition}
                    </p>
                    <p className="mentor-dept">
                      {mentor.departmentName || "Department not specified"}
                    </p>
                  </div>
                </div>
                <div className="pending-actions">
                  <button
                    className="btn-approve"
                    onClick={() => handleApproveMentor(mentor.id)}
                  >
                    ✓ Approve
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleRejectMentor(mentor.id)}
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mentors-section">
        <div className="section-header">
          <h2>Manage Mentors</h2>
          <button
            onClick={() => {
              setEditingMentor(null);
              resetMentorForm();
              setShowMentorForm(true);
            }}
            className="btn-add-mentor"
          >
            + Add Mentor
          </button>
        </div>

        {showMentorForm && (
          <div className="mentor-form-overlay">
            <div className="mentor-form-container">
              <h3>{editingMentor ? "Edit Mentor" : "Add New Mentor"}</h3>
              <form
                onSubmit={
                  editingMentor ? handleUpdateMentor : handleCreateMentor
                }
              >
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={mentorFormData.fullName}
                      onChange={handleMentorFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={mentorFormData.email}
                      onChange={handleMentorFormChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={mentorFormData.phoneNumber}
                      onChange={handleMentorFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>LinkedIn Profile</label>
                    <input
                      type="url"
                      name="linkedinProfile"
                      value={mentorFormData.linkedinProfile}
                      onChange={handleMentorFormChange}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Placed Company *</label>
                    <input
                      type="text"
                      name="placedCompany"
                      value={mentorFormData.placedCompany}
                      onChange={handleMentorFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Position</label>
                    <input
                      type="text"
                      name="placedPosition"
                      value={mentorFormData.placedPosition}
                      onChange={handleMentorFormChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Placement Year</label>
                    <input
                      type="number"
                      name="placementYear"
                      value={mentorFormData.placementYear}
                      onChange={handleMentorFormChange}
                      min="2000"
                      max="2030"
                    />
                  </div>
                  <div className="form-group">
                    <label>Graduation Year</label>
                    <input
                      type="number"
                      name="graduationYear"
                      value={mentorFormData.graduationYear}
                      onChange={handleMentorFormChange}
                      min="2000"
                      max="2030"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Assign Departments * (Hold Ctrl to select multiple)
                  </label>
                  <select
                    name="departmentIds"
                    multiple
                    value={mentorFormData.departmentIds}
                    onChange={handleMentorFormChange}
                    required
                    size="5"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.departmentName} ({dept.departmentCode})
                      </option>
                    ))}
                  </select>
                  <small>
                    Selected: {mentorFormData.departmentIds.length}{" "}
                    department(s)
                  </small>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-submit">
                    {editingMentor ? "Update Mentor" : "Create Mentor"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMentorForm(false);
                      setEditingMentor(null);
                      resetMentorForm();
                    }}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAdminForm && (
          <div className="mentor-form-overlay">
            <div className="mentor-form-container">
              <h3>Create New Admin</h3>
              <form onSubmit={handleCreateAdmin}>
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={adminFormData.username}
                    onChange={handleAdminFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={adminFormData.password}
                    onChange={handleAdminFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={adminFormData.fullName}
                    onChange={handleAdminFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={adminFormData.email}
                    onChange={handleAdminFormChange}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-submit">
                    Create Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminForm(false);
                      setAdminFormData({
                        username: "",
                        password: "",
                        fullName: "",
                        email: "",
                      });
                    }}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="mentors-grid">
          {mentors.length === 0 ? (
            <p className="no-data">
              No mentors added yet. Click "Add Mentor" to create one.
            </p>
          ) : (
            mentors.map((mentor) => (
              <div key={mentor.id} className="mentor-card">
                <div className="mentor-info">
                  <h3>{mentor.fullName}</h3>
                  <p className="company">{mentor.placedCompany}</p>
                  {mentor.placedPosition && (
                    <p className="position">{mentor.placedPosition}</p>
                  )}
                  <p className="email">{mentor.email}</p>
                  {mentor.phoneNumber && (
                    <p className="phone">{mentor.phoneNumber}</p>
                  )}
                  {mentor.placementYear && (
                    <p className="year">
                      Placement Year: {mentor.placementYear}
                    </p>
                  )}
                  <div className="departments-list">
                    <strong>Departments:</strong>
                    <div className="department-tags">
                      {mentor.departments.map((dept) => (
                        <span key={dept.id} className="dept-tag">
                          {dept.departmentCode}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mentor-actions">
                  <button
                    onClick={() => handleEditMentor(mentor)}
                    className="btn-edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteMentor(mentor.id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
