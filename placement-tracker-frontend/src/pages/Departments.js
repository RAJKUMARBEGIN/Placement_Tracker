import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiGrid } from "react-icons/fi";
import { toast } from "react-toastify";
import { departmentAPI } from "../services/api";
import "./Departments.css";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    departmentName: "",
    description: "",
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data);
    } catch (error) {
      toast.error("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDepartment) {
        await departmentAPI.update(editingDepartment.id, formData);
        toast.success("Department updated successfully!");
      } else {
        await departmentAPI.create(formData);
        toast.success("Department created successfully!");
      }
      fetchDepartments();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        await departmentAPI.delete(id);
        toast.success("Department deleted successfully!");
        fetchDepartments();
      } catch (error) {
        toast.error("Failed to delete department");
      }
    }
  };

  const openModal = (department = null) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        departmentName: department.departmentName,
        description: department.description || "",
      });
    } else {
      setEditingDepartment(null);
      setFormData({ departmentName: "", description: "" });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDepartment(null);
    setFormData({ departmentName: "", description: "" });
  };

  const departmentColors = [
    "linear-gradient(135deg, #10b981, #34d399)",
    "linear-gradient(135deg, #f59e0b, #fbbf24)",
    "linear-gradient(135deg, #ef4444, #f87171)",
    "linear-gradient(135deg, #3b82f6, #60a5fa)",
    "linear-gradient(135deg, #ec4899, #f472b6)",
    "linear-gradient(135deg, #14b8a6, #2dd4bf)",
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading departments...</p>
      </div>
    );
  }

  return (
    <div className="departments-page">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <FiGrid className="header-icon" />
            Departments
          </h1>
          <p>
            Manage college departments and view associated interview experiences
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <FiPlus />
          Add Department
        </button>
      </div>

      {departments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">!</div>
          <h3>No departments yet</h3>
          <p>Get started by adding your first department</p>
          <button className="btn btn-primary" onClick={() => openModal()}>
            <FiPlus />
            Add Department
          </button>
        </div>
      ) : (
        <div className="departments-grid">
          {departments.map((department, index) => (
            <div key={department.id} className="department-card">
              <div
                className="card-accent"
                style={{
                  background: departmentColors[index % departmentColors.length],
                }}
              />
              <div className="card-content">
                <h3>{department.departmentName}</h3>
                <p>{department.description || "No description available"}</p>
              </div>
              <div className="card-actions">
                <button
                  className="action-btn edit"
                  onClick={() => openModal(department)}
                  title="Edit"
                >
                  <FiEdit2 />
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => handleDelete(department.id)}
                  title="Delete"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingDepartment ? "Edit Department" : "Add Department"}
              </h2>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Department Name *</label>
                <input
                  type="text"
                  value={formData.departmentName}
                  onChange={(e) =>
                    setFormData({ ...formData, departmentName: e.target.value })
                  }
                  placeholder="e.g., Computer Science Engineering"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of the department"
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDepartment ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
