import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSend,
  FiPlus,
  FiUpload,
  FiFile,
  FiX,
  FiArrowLeft,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { experienceAPI, departmentAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./AddExperience.css";

const AddExperience = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resourceFile, setResourceFile] = useState(null);
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
  }, []);

  // Auto-fill user data when component loads
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        studentName: user.fullName || user.name || prev.studentName,
        contactEmail: user.email || prev.contactEmail,
        departmentId: user.departmentId || prev.departmentId,
      }));
    }
  }, [user]);

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data);
    } catch (error) {
      toast.error("Failed to fetch departments");
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
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      // Check file type (only zip files)
      if (!file.name.endsWith(".zip")) {
        toast.error("Only ZIP files are allowed");
        return;
      }
      setResourceFile(file);
      toast.success(`File "${file.name}" selected`);
    }
  };

  const handleRemoveFile = () => {
    setResourceFile(null);
    toast.info("File removed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.departmentId) {
      toast.error("Please select a department");
      return;
    }

    console.log("Submitting experience data:", formData);
    setLoading(true);
    try {
      let fileInfo = {
        attachmentFileName: null,
        attachmentSize: null,
        attachmentUrl: null,
      };

      // Upload file first if present
      if (resourceFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', resourceFile);

        try {
          const uploadResponse = await fetch('http://localhost:8080/api/files/upload', {
            method: 'POST',
            body: uploadFormData,
          });

          if (!uploadResponse.ok) {
            throw new Error('File upload failed');
          }

          const uploadData = await uploadResponse.json();
          fileInfo = {
            attachmentFileName: uploadData.fileName,
            attachmentSize: uploadData.fileSize,
            attachmentUrl: uploadData.fileUrl,
          };
          toast.success(`File "${resourceFile.name}" uploaded successfully!`);
        } catch (uploadError) {
          console.error("File upload error:", uploadError);
          toast.error("Failed to upload file. Continuing without attachment.");
        }
      }

      // Prepare submission data with file metadata
      const submissionData = {
        ...formData,
        departmentId: formData.departmentId,
        yearOfPlacement: parseInt(formData.yearOfPlacement),
        totalRounds: parseInt(formData.totalRounds),
        ...fileInfo,
      };

      console.log("Sending to backend:", submissionData);
      const response = await experienceAPI.create(submissionData);
      console.log("Backend response:", response);
      toast.success("Experience shared successfully!");
      navigate("/experiences");
    } catch (error) {
      console.error("Submission error:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.join(", ") ||
                          "Failed to submit experience. Please check all required fields.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - i + 1
  );

  return (
    <div className="add-experience-page">
      {/* Hero Header with Back Link */}
      <div className="page-hero">
        <button
          className="back-link-hero"
          onClick={() => window.history.back()}
        >
          <FiArrowLeft /> Back
        </button>
        <div className="hero-content">
          <h1>
            <FiPlus className="header-icon" />
            Share Your Experience
          </h1>
          <p>
            Help juniors by sharing your interview journey. Your insights can
            change someone's career.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="experience-form">
        {/* Basic Info Section */}
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
                placeholder="e.g., John Doe"
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
                placeholder="e.g., Google, Microsoft"
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
                placeholder="e.g., Software Engineer"
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
                  <option key={year} value={year}>
                    {year}
                  </option>
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

        {/* Interview Details Section */}
        <section className="form-section">
          <h2 className="section-title">Interview Details</h2>
          <div className="form-group">
            <label>Describe Each Round *</label>
            <textarea
              name="roundsDescription"
              value={formData.roundsDescription}
              onChange={handleChange}
              placeholder="Describe each round in detail. E.g., Round 1: Online coding test with 3 DSA problems (Medium-Hard). Round 2: Technical interview focusing on System Design..."
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
              placeholder="Describe the coding problems you solved. E.g., Two Sum, Binary Tree traversal, LRU Cache implementation..."
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
              placeholder="Tips for in-person interviews. E.g., Dress formally, arrive 15 mins early, maintain eye contact..."
              rows={3}
            />
          </div>
        </section>

        {/* Preparation Section */}
        <section className="form-section highlight">
          <h2 className="section-title">Preparation Strategy</h2>
          <div className="form-group">
            <label>How Did You Crack It? *</label>
            <textarea
              name="crackingStrategy"
              value={formData.crackingStrategy}
              onChange={handleChange}
              placeholder="Share your winning strategy. E.g., Solved 300+ LeetCode problems focusing on arrays, strings, and trees. Practiced system design for 2 months..."
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
              placeholder="How long did you prepare? What was your daily routine? E.g., Started 6 months before, 4 hours daily coding, weekends for mock interviews..."
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
              placeholder="Share helpful resources. E.g., LeetCode, GeeksforGeeks, Striver's SDE Sheet, YouTube channels like Take U Forward..."
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Upload Resources (ZIP file)</label>
            <p className="field-hint">
              Upload study materials, notes, or code as a ZIP file (max 10MB)
            </p>
            {!resourceFile ? (
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
            ) : (
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
            )}
          </div>
        </section>

        {/* Contact Section */}
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
              I'm willing to mentor juniors and help them prepare
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
                  placeholder="your.email@example.com"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="+91-9876543210"
                />
              </div>
              <div className="form-group full-width">
                <label>LinkedIn Profile</label>
                <input
                  type="url"
                  name="linkedinProfile"
                  value={formData.linkedinProfile}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </div>
          )}
        </section>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Submitting...
              </>
            ) : (
              <>
                <FiSend />
                Share Experience
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExperience;
