import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI, departmentAPI, authAPI } from "../services/api";
import { toast } from "react-toastify";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  console.log("AdminDashboard component rendering...");
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [pendingMentors, setPendingMentors] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false); // Changed to false so page shows immediately
  const [loadError, setLoadError] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(true); // Changed to true initially
  const [showMentorForm, setShowMentorForm] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [editingMentor, setEditingMentor] = useState(null);
  const [viewingMentor, setViewingMentor] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [activeTab, setActiveTab] = useState("mentors"); // 'mentors' or 'users'

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
    console.log("AdminDashboard mounted, checking authentication...");
    // Check if user is admin
    const userRole = localStorage.getItem("userRole");
    const adminUser = localStorage.getItem("adminUser");

    console.log("Auth status:", { userRole, hasAdminUser: !!adminUser });

    if (userRole !== "ADMIN" || !adminUser) {
      console.warn("Unauthorized access attempt, redirecting to login");
      toast.error("Please login as admin first");
      navigate("/login", { replace: true });
      return;
    }

    // User is authorized, fetch data
    console.log("User is authorized, fetching dashboard data...");
    setLoading(true);
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      console.log("Fetching admin dashboard data...");
      const [mentorsRes, deptsRes, pendingRes, usersRes] = await Promise.all([
        adminAPI.getAllMentors().catch((err) => {
          console.error("Error fetching mentors:", err);
          setLoadError("Failed to fetch mentors. Please check your backend/API.");
          return { data: [] };
        }),
        departmentAPI.getAll().catch((err) => {
          console.error("Error fetching departments:", err);
          setLoadError("Failed to fetch departments. Please check your backend/API.");
          return { data: [] };
        }),
        authAPI.getPendingMentors().catch((err) => {
          console.error("Error fetching pending mentors:", err);
          setLoadError("Failed to fetch pending mentors. Please check your backend/API.");
          return { data: [] };
        }),
        adminAPI.getAllUsers().catch((err) => {
          console.error("Error fetching users:", err);
          setLoadError("Failed to fetch users. Please check your backend/API.");
          return { data: [] };
        }),
      ]);

      console.log("Fetched data:", {
        mentors: mentorsRes.data.length,
        departments: deptsRes.data.length,
        pendingMentors: pendingRes.data.length,
        users: usersRes.data.length,
      });

      setMentors(mentorsRes.data || []);
      setDepartments(deptsRes.data || []);
      setPendingMentors(pendingRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoadError("Failed to load dashboard data. Check console for details.");
      toast.error("Failed to load dashboard data. Check console for details.");
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
      departmentIds: mentor.departments ? mentor.departments.map((d) => d.id) : [],
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

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await adminAPI.deleteUser(id);
        toast.success("User deleted successfully!");
        fetchData();
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
      }
    }
  };

  const handleToggleUserStatus = async (id) => {
    try {
      await adminAPI.toggleUserStatus(id);
      toast.success("User status updated!");
      fetchData();
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Failed to update user status");
    }
  };

  // Show error if loading fails
  if (loadError) {
    return (
      <div className="admin-dashboard">
        <div className="loading">
          <div className="loader"></div>
          <p style={{ color: 'red' }}>{loadError}</p>
        </div>
      </div>
    );
  }

  // Show loading spinner while loading data
  if (loading) {
    console.log("Rendering loading state");
    return (
      <div className="admin-dashboard">
        <div className="loading">
          <div className="loader"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  console.log("Rendering full dashboard with data:", {
    mentors: mentors.length,
    users: users.length,
    departments: departments.length,
    pendingMentors: pendingMentors.length
  });

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
          <h3>Total Users</h3>
          <p className="stat-value">{users.length}</p>
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
            <h2>Pending Mentor Approvals</h2>
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
                    {mentor.phoneNumber && (
                      <p className="mentor-phone">{mentor.phoneNumber}</p>
                    )}
                    <p className="mentor-company">
                      {mentor.placedCompany} -{" "}
                      {mentor.placedPosition || "Position not specified"}
                    </p>
                    {mentor.placementYear && (
                      <p className="mentor-year">
                        Placed in {mentor.placementYear}
                      </p>
                    )}
                    {mentor.graduationYear && (
                      <p className="mentor-grad">
                        Graduated in {mentor.graduationYear}
                      </p>
                    )}
                    {mentor.linkedinProfile && (
                      <p className="mentor-linkedin">
                        <a
                          href={mentor.linkedinProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          LinkedIn Profile
                        </a>
                      </p>
                    )}
                    <p className="mentor-dept">
                      {mentor.departmentName || "Department not specified"}
                    </p>
                  </div>
                </div>
                <div className="pending-actions">
                  <button
                    className="btn-view-details"
                    onClick={() => setViewingMentor(mentor)}
                  >
                    View Details
                  </button>
                  <button
                    className="btn-approve"
                    onClick={() => handleApproveMentor(mentor.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleRejectMentor(mentor.id)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === "mentors" ? "active" : ""}`}
          onClick={() => setActiveTab("mentors")}
        >
          👥 Manage Mentors
        </button>
        <button
          className={`tab-button ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👨‍🎓 Manage Users
        </button>
      </div>

      {/* Mentors Section */}
      {activeTab === "mentors" && (
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
                        {mentor.departments && mentor.departments.length > 0 ? (
                          mentor.departments.map((dept) => (
                            <span key={dept.id} className="dept-tag">
                              {dept.departmentCode}
                            </span>
                          ))
                        ) : (
                          <span className="dept-tag">No departments</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mentor-actions">
                    <button
                      onClick={() => setViewingMentor(mentor)}
                      className="btn-view"
                    >
                      View
                    </button>
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
      )}

      {/* Users Section */}
      {activeTab === "users" && (
        <div className="users-section">
          <div className="section-header">
            <h2>Manage All Users (Students)</h2>
          </div>

          <div className="mentors-grid">
            {users.length === 0 ? (
              <p className="no-data">No users found.</p>
            ) : (
              users.map((user) => (
                <div key={user.id} className="mentor-card">
                  <div className="mentor-info">
                    <h3>{user.fullName}</h3>
                    <p className="email">{user.email}</p>
                    {user.phoneNumber && (
                      <p className="phone">{user.phoneNumber}</p>
                    )}
                    <p className="role">
                      <strong>Role:</strong> {user.role}
                    </p>
                    {user.departmentName && (
                      <p className="department">
                        <strong>Department:</strong> {user.departmentName}
                      </p>
                    )}
                    <div className="user-status">
                      <span
                        className={
                          user.isActive ? "status-active" : "status-inactive"
                        }
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                      {" | "}
                      <span
                        className={
                          user.isApproved ? "status-approved" : "status-pending"
                        }
                      >
                        {user.isApproved ? "Approved" : "Pending"}
                      </span>
                    </div>
                  </div>
                  <div className="user-actions">
                    <button
                      onClick={() => setViewingUser(user)}
                      className="btn-view"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleToggleUserStatus(user.id)}
                      className={
                        user.isActive ? "btn-deactivate" : "btn-activate"
                      }
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
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
      )}

      {/* View Mentor Details Modal */}
      {viewingMentor && (
        <div className="mentor-form-overlay">
          <div className="mentor-detail-modal">
            <div className="modal-header">
              <h2>👤 Mentor Details</h2>
              <button
                className="btn-close-modal"
                onClick={() => setViewingMentor(null)}
              >
                ✕
              </button>
            </div>
            <div className="mentor-detail-content">
              <div className="detail-section">
                <h3>📋 Personal Information</h3>
                <div className="detail-item">
                  <strong>Full Name:</strong>
                  <span>{viewingMentor.fullName}</span>
                </div>
                <div className="detail-item">
                  <strong>Email:</strong>
                  <span>{viewingMentor.email}</span>
                </div>
                {viewingMentor.phoneNumber && (
                  <div className="detail-item">
                    <strong>Phone:</strong>
                    <span>{viewingMentor.phoneNumber}</span>
                  </div>
                )}
                {viewingMentor.linkedinProfile && (
                  <div className="detail-item">
                    <strong>LinkedIn:</strong>
                    <span>
                      <a
                        href={viewingMentor.linkedinProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {viewingMentor.linkedinProfile}
                      </a>
                    </span>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h3>Placement Information</h3>
                <div className="detail-item">
                  <strong>Company:</strong>
                  <span>{viewingMentor.placedCompany}</span>
                </div>
                {viewingMentor.placedPosition && (
                  <div className="detail-item">
                    <strong>Position:</strong>
                    <span>{viewingMentor.placedPosition}</span>
                  </div>
                )}
                {viewingMentor.placementYear && (
                  <div className="detail-item">
                    <strong>Placement Year:</strong>
                    <span>{viewingMentor.placementYear}</span>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h3>🎓 Academic Information</h3>
                {viewingMentor.graduationYear && (
                  <div className="detail-item">
                    <strong>Graduation Year:</strong>
                    <span>{viewingMentor.graduationYear}</span>
                  </div>
                )}
                {viewingMentor.departments &&
                viewingMentor.departments && viewingMentor.departments.length > 0 ? (
                  <div className="detail-item">
                    <strong>Departments:</strong>
                    <div className="departments-badges">
                      {viewingMentor.departments.map((dept) => (
                        <span key={dept.id} className="dept-badge">
                          {dept.departmentName} ({dept.departmentCode})
                        </span>
                      ))}
                    </div>
                  </div>
                ) : viewingMentor.departmentName ? (
                  <div className="detail-item">
                    <strong>Department:</strong>
                    <span>{viewingMentor.departmentName}</span>
                  </div>
                ) : null}
              </div>

              <div className="detail-section">
                <h3>⚙️ Account Status</h3>
                <div className="detail-item">
                  <strong>Status:</strong>
                  <span
                    className={
                      viewingMentor.isApproved
                        ? "status-approved"
                        : "status-pending"
                    }
                  >
                    {viewingMentor.isApproved ? "Approved" : "Pending"}
                  </span>
                </div>
                <div className="detail-item">
                  <strong>Active:</strong>
                  <span
                    className={
                      viewingMentor.isActive
                        ? "status-active"
                        : "status-inactive"
                    }
                  >
                    {viewingMentor.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                {viewingMentor.id && (
                  <div className="detail-item">
                    <strong>Mentor ID:</strong>
                    <span className="mentor-id">{viewingMentor.id}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions">
              {!viewingMentor.isApproved && (
                <>
                  <button
                    className="btn-approve"
                    onClick={() => {
                      handleApproveMentor(viewingMentor.id);
                      setViewingMentor(null);
                    }}
                  >
                    Approve Mentor
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => {
                      handleRejectMentor(viewingMentor.id);
                      setViewingMentor(null);
                    }}
                  >
                    Reject Mentor
                  </button>
                </>
              )}
              {viewingMentor.isApproved && (
                <>
                  <button
                    className="btn-edit"
                    onClick={() => {
                      handleEditMentor(viewingMentor);
                      setViewingMentor(null);
                    }}
                  >
                    Edit Mentor
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => {
                      handleDeleteMentor(viewingMentor.id);
                      setViewingMentor(null);
                    }}
                  >
                    Delete Mentor
                  </button>
                </>
              )}
              <button
                className="btn-cancel"
                onClick={() => setViewingMentor(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Details Modal */}
      {viewingUser && (
        <div className="mentor-form-overlay">
          <div className="mentor-detail-modal">
            <div className="modal-header">
              <h2>User Details</h2>
              <button
                className="btn-close-modal"
                onClick={() => setViewingUser(null)}
              >
                ✕
              </button>
            </div>
            <div className="mentor-detail-content">
              <div className="detail-section">
                <h3>📋 Personal Information</h3>
                <div className="detail-item">
                  <strong>Full Name:</strong>
                  <span>{viewingUser.fullName}</span>
                </div>
                <div className="detail-item">
                  <strong>Email:</strong>
                  <span>{viewingUser.email}</span>
                </div>
                {viewingUser.phoneNumber && (
                  <div className="detail-item">
                    <strong>Phone:</strong>
                    <span>{viewingUser.phoneNumber}</span>
                  </div>
                )}
                <div className="detail-item">
                  <strong>Role:</strong>
                  <span>{viewingUser.role}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>🎓 Academic Information</h3>
                {viewingUser.departmentName ? (
                  <div className="detail-item">
                    <strong>Department:</strong>
                    <span>{viewingUser.departmentName}</span>
                  </div>
                ) : (
                  <p>No department assigned</p>
                )}
              </div>

              <div className="detail-section">
                <h3>⚙️ Account Status</h3>
                <div className="detail-item">
                  <strong>Status:</strong>
                  <span
                    className={
                      viewingUser.isActive ? "status-active" : "status-inactive"
                    }
                  >
                    {viewingUser.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="detail-item">
                  <strong>Approved:</strong>
                  <span
                    className={
                      viewingUser.isApproved
                        ? "status-approved"
                        : "status-pending"
                    }
                  >
                    {viewingUser.isApproved ? "✅ Approved" : "⏳ Pending"}
                  </span>
                </div>
                {viewingUser.id && (
                  <div className="detail-item">
                    <strong>User ID:</strong>
                    <span className="mentor-id">{viewingUser.id}</span>
                  </div>
                )}
                {viewingUser.createdAt && (
                  <div className="detail-item">
                    <strong>Joined:</strong>
                    <span>
                      {new Date(viewingUser.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button
                className={
                  viewingUser.isActive ? "btn-deactivate" : "btn-activate"
                }
                onClick={() => {
                  handleToggleUserStatus(viewingUser.id);
                  setViewingUser(null);
                }}
              >
                {viewingUser.isActive ? "🚫 Deactivate" : "✅ Activate"}
              </button>
              <button
                className="btn-delete"
                onClick={() => {
                  handleDeleteUser(viewingUser.id);
                  setViewingUser(null);
                }}
              >
                🗑️ Delete User
              </button>
              <button
                className="btn-cancel"
                onClick={() => setViewingUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
