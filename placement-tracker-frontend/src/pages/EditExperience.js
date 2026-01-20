import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiSave,
  FiUpload,
  FiFile,
  FiX,
  FiArrowLeft,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { experienceAPI, departmentAPI, uploadFile } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./AddExperience.css";

const EditExperience = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [resourceFile, setResourceFile] = useState(null);
  const [existingFile, setExistingFile] = useState(null);
  const [formData, setFormData] = useState({
    studentName: "",
    companyName: "",
    position: "",
    yearOfPlacement: new Date().getFullYear(),
    departmentId: "",
    totalRounds: 1,
    roundsDescription: "",
    problemsSolved: "",
    inPersonInterviewTips: "",
    crackingStrategy: "",
    preparationDetails: "",
    resources: "",
    willingToMentor: false,
    contactEmail: "",
    contactPhone: "",
    linkedinProfile: "",
  });

  useEffect(() => {
    fetchDepartments();
    fetchExperience();
  }, [id]);

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data);
    } catch (error) {
      toast.error("Failed to fetch departments");
    }
  };

  const fetchExperience = async () => {
    try {
      setFetching(true);
      const response = await experienceAPI.getById(id);
      const exp = response.data;
      
      setFormData({
        studentName: exp.studentName || "",
        companyName: exp.companyName || "",
        position: exp.position || "",
        yearOfPlacement: exp.yearOfPlacement || new Date().getFullYear(),
        departmentId: exp.departmentId || "",
        totalRounds: exp.totalRounds || 1,
        roundsDescription: exp.roundsDescription || "",
        problemsSolved: exp.problemsSolved || "",
        inPersonInterviewTips: exp.inPersonInterviewTips || "",
        crackingStrategy: exp.crackingStrategy || "",
        preparationDetails: exp.preparationDetails || "",
        resources: exp.resources || "",
        willingToMentor: exp.willingToMentor || false,
        contactEmail: exp.contactEmail || "",
        contactPhone: exp.contactPhone || "",
        linkedinProfile: exp.linkedinProfile || "",
      });

      if (exp.attachmentFileName) {
        setExistingFile({
          name: exp.attachmentFileName,
          url: exp.attachmentUrl,
        });
      }
    } catch (error) {
      console.error("Error fetching experience:", error);
      toast.error("Failed to load experience");
      navigate("/student-dashboard");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      if (!file.name.endsWith(".zip")) {
        toast.error("Only ZIP files are allowed");
        return;
      }
      setResourceFile(file);
      setExistingFile(null);
      toast.success(`File "${file.name}" selected`);
    }
  };

  const handleRemoveFile = () => {
    setResourceFile(null);
    setExistingFile(null);
    toast.info("File removed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.departmentId) {
      toast.error("Please select a department");
      return;
    }

    setLoading(true);
    try {
      let fileInfo = {};

      // Upload new file if present
      if (resourceFile) {
        try {
          const uploadData = await uploadFile(resourceFile);
          fileInfo = {
            attachmentFileName: uploadData.fileName,
            attachmentSize: uploadData.fileSize,
            attachmentUrl: uploadData.fileUrl,
          };
          toast.success(`File "${resourceFile.name}" uploaded successfully!`);
        } catch (uploadError) {
          console.error("File upload error:", uploadError);
          toast.error("Failed to upload file.");
        }
      }

      const submissionData = {
        ...formData,
        yearOfPlacement: parseInt(formData.yearOfPlacement),
        totalRounds: parseInt(formData.totalRounds),
        ...fileInfo,
      };

      await experienceAPI.update(id, submissionData);
      toast.success("Experience updated successfully!");
      navigate("/student-dashboard");
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update experience");
    } finally {
      setLoading(false);
    }
  };

  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - i + 1
  );

  if (fetching) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading experience...</p>
      </div>
    );
  }

  return (
    <div className="add-experience-page">
      <div className="page-hero">
        <button
          className="back-link-hero"
          onClick={() => navigate("/student-dashboard")}
        >
          <FiArrowLeft /> Back to Dashboard
        </button>
        <div className="hero-content">
          <h1>
            <FiSave className="header-icon" />
            Edit Experience
          </h1>
          <p>Update your interview experience details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="experience-form">
        <section className="form-section">
          <h2 className="section-title">Basic Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Your Name *</label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Position *</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Year of Placement *</label>
              <select
                name="yearOfPlacement"
                value={formData.yearOfPlacement}
                onChange={handleChange}
                required
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
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
              <label>Total Interview Rounds *</label>
              <input
                type="number"
                name="totalRounds"
                value={formData.totalRounds}
                onChange={handleChange}
                min="1"
                max="20"
                required
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2 className="section-title">Interview Details</h2>
          <div className="form-group">
            <label>Describe Each Round *</label>
            <textarea
              name="roundsDescription"
              value={formData.roundsDescription}
              onChange={handleChange}
              rows={5}
              required
            />
          </div>
          <div className="form-group">
            <label>Problems Solved *</label>
            <textarea
              name="problemsSolved"
              value={formData.problemsSolved}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>
          <div className="form-group">
            <label>In-Person Interview Tips</label>
            <textarea
              name="inPersonInterviewTips"
              value={formData.inPersonInterviewTips}
              onChange={handleChange}
              rows={3}
            />
          </div>
        </section>

        <section className="form-section highlight">
          <h2 className="section-title">Preparation Strategy</h2>
          <div className="form-group">
            <label>How Did You Crack It? *</label>
            <textarea
              name="crackingStrategy"
              value={formData.crackingStrategy}
              onChange={handleChange}
              rows={5}
              required
            />
          </div>
          <div className="form-group">
            <label>Preparation Details *</label>
            <textarea
              name="preparationDetails"
              value={formData.preparationDetails}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>
          <div className="form-group">
            <label>Resources Used</label>
            <textarea
              name="resources"
              value={formData.resources}
              onChange={handleChange}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Upload Resources (ZIP file)</label>
            <p className="field-hint">
              Upload study materials, notes, or code as a ZIP file (max 10MB)
            </p>
            {existingFile ? (
              <div className="file-selected">
                <div className="file-info">
                  <FiFile />
                  <span className="file-name">{existingFile.name}</span>
                  <span className="file-size">(existing file)</span>
                </div>
                <button
                  type="button"
                  className="remove-file-btn"
                  onClick={handleRemoveFile}
                >
                  <FiX /> Remove
                </button>
              </div>
            ) : resourceFile ? (
              <div className="file-selected">
                <div className="file-info">
                  <FiFile />
                  <span className="file-name">{resourceFile.name}</span>
                  <span className="file-size">
                    ({(resourceFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  className="remove-file-btn"
                  onClick={handleRemoveFile}
                >
                  <FiX /> Remove
                </button>
              </div>
            ) : (
              <div className="file-upload-area">
                <input
                  type="file"
                  id="resourceFile"
                  accept=".zip"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <label htmlFor="resourceFile" className="file-upload-btn">
                  <FiUpload />
                  Choose ZIP File
                </label>
              </div>
            )}
          </div>
        </section>

        <section className="form-section">
          <h2 className="section-title">Mentorship & Contact</h2>
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="willingToMentor"
              name="willingToMentor"
              checked={formData.willingToMentor}
              onChange={handleChange}
            />
            <label htmlFor="willingToMentor">
              I'm willing to mentor juniors
            </label>
          </div>

          {formData.willingToMentor && (
            <div className="form-grid contact-fields">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group full-width">
                <label>LinkedIn Profile</label>
                <input
                  type="url"
                  name="linkedinProfile"
                  value={formData.linkedinProfile}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}
        </section>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Updating...
              </>
            ) : (
              <>
                <FiSave />
                Update Experience
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditExperience;
