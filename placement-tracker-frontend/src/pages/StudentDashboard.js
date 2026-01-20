import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { experienceAPI, departmentAPI, authAPI, uploadFile } from "../services/api";
import "./Dashboard.css";

function StudentDashboard() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [experiences, setExperiences] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editing, setEditing] = useState(null);
  const [resourceFile, setResourceFile] = useState(null);

  const createEmptyRound = (roundNumber) => ({
    roundNumber,
    roundName: "",
    duration: "",
    roundDetails: "",
    howSolved: "",
  });

  const [formData, setFormData] = useState({
    studentName: "",
    rollNumber: "",
    department: "",
    personalEmail: "",
    contactNumber: "",
    companyName: "",
    position: "",
    salary: "",
    internOffered: false,
    hasBond: false,
    bondDetails: "",
    totalRounds: 1,
    rounds: [createEmptyRound(1)],
    overallExperience: "",
    areasToPrepareFinal: "",
    suggestedResources: "",
    finalResult: "SELECTED",
  });

  const fetchData = useCallback(async () => {
    try {
      const [expRes, deptRes] = await Promise.all([
        experienceAPI.getAll(),
        departmentAPI.getAll(),
      ]);
      const myExperiences = (expRes.data || []).filter(
        (exp) =>
          exp.contactEmail === user?.email || 
          exp.studentEmail === user?.email ||
          (exp.studentName && user?.fullName && exp.studentName.toLowerCase() === user.fullName.toLowerCase()) ||
          (exp.studentName && user?.name && exp.studentName.toLowerCase() === user.name.toLowerCase())
      );
      setExperiences(myExperiences);
      setDepartments(deptRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.email, user?.fullName, user?.name]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleRoundChange = (roundIndex, field, value) => {
    setFormData((prev) => {
      const newRounds = [...prev.rounds];
      newRounds[roundIndex] = { ...newRounds[roundIndex], [field]: value };
      return { ...prev, rounds: newRounds };
    });
  };

  const handleQuestionChange = (roundIndex, qIndex, field, value) => {
    setFormData((prev) => {
      const newRounds = [...prev.rounds];
      const newQuestions = [...newRounds[roundIndex].questions];
      newQuestions[qIndex] = { ...newQuestions[qIndex], [field]: value };
      newRounds[roundIndex].questions = newQuestions;
      return { ...prev, rounds: newRounds };
    });
  };

  const addQuestion = (roundIndex) => {
    setFormData((prev) => {
      const newRounds = [...prev.rounds];
      newRounds[roundIndex].questions.push({
        domain: "",
        question: "",
        approach: "",
        references: "",
      });
      return { ...prev, rounds: newRounds };
    });
  };

  const removeQuestion = (roundIndex, qIndex) => {
    setFormData((prev) => {
      const newRounds = [...prev.rounds];
      if (newRounds[roundIndex].questions.length > 1) {
        newRounds[roundIndex].questions.splice(qIndex, 1);
      }
      return { ...prev, rounds: newRounds };
    });
  };

  const handleTotalRoundsChange = (value) => {
    const numRounds = parseInt(value) || 1;
    setFormData((prev) => {
      let newRounds = [...prev.rounds];
      if (numRounds > newRounds.length) {
        for (let i = newRounds.length + 1; i <= numRounds; i++) {
          newRounds.push(createEmptyRound(i));
        }
      } else {
        newRounds = newRounds.slice(0, numRounds);
      }
      return { ...prev, totalRounds: numRounds, rounds: newRounds };
    });
  };

  const addNewRound = () => {
    setFormData((prev) => {
      const newRoundNumber = prev.rounds.length + 1;
      return {
        ...prev,
        totalRounds: newRoundNumber,
        rounds: [...prev.rounds, createEmptyRound(newRoundNumber)],
      };
    });
  };

  const removeRound = (roundIndex) => {
    if (formData.rounds.length <= 1) {
      toast.warning("At least one round is required");
      return;
    }
    setFormData((prev) => {
      const newRounds = prev.rounds
        .filter((_, idx) => idx !== roundIndex)
        .map((round, idx) => ({ ...round, roundNumber: idx + 1 }));
      return {
        ...prev,
        totalRounds: newRounds.length,
        rounds: newRounds,
      };
    });
  };

  const openAddModal = () => {
    setEditing(null);
    setCurrentStep(1);
    // Find department code from user's departmentId
    const userDept = departments.find((d) => d.id === user?.departmentId);
    setFormData({
      studentName: user?.fullName || user?.name || "",
      rollNumber: "",
      department: userDept?.departmentCode || user?.department || "",
      personalEmail: user?.email || "",
      contactNumber: "",
      companyName: "",
      position: "",
      salary: "",
      internOffered: false,
      hasBond: false,
      bondDetails: "",
      totalRounds: 1,
      rounds: [createEmptyRound(1)],
      overallExperience: "",
      areasToPrepareFinal: "",
      suggestedResources: "",
      finalResult: "SELECTED",
    });
    setShowModal(true);
  };

  const openEditModal = (exp) => {
    // Set editing state first
    setEditing(exp);
    setCurrentStep(1);

    // Parse rounds from JSON if available, otherwise create default round
    let rounds = [];
    if (exp.roundsJson) {
      try {
        rounds = JSON.parse(exp.roundsJson);
        // Ensure rounds have the correct structure
        rounds = rounds.map((r, idx) => ({
          roundNumber: idx + 1,
          roundName: r.roundName || "",
          duration: r.duration || "",
          roundDetails: r.roundDetails || "",
          howSolved: r.howSolved || "",
        }));
      } catch (error) {
        console.error("Error parsing roundsJson:", error);
        // Fallback to creating a default round
        rounds = [{
          roundNumber: 1,
          roundName: "Interview Round",
          duration: "",
          roundDetails: exp.roundsDescription || "",
          howSolved: exp.problemsSolved || "",
        }];
      }
    } else {
      // Create a simple round from the experience data
      rounds = [{
        roundNumber: 1,
        roundName: "Interview Round",
        duration: "",
        roundDetails: exp.roundsDescription || "",
        howSolved: exp.problemsSolved || "",
      }];
    }

    // Find department code from departmentId
    const dept = departments.find(d => d.id === exp.departmentId);

    // Set form data with experience values - populate ALL fields from exp
    setFormData({
      studentName: exp.studentName || "",
      rollNumber: exp.rollNumber || "",
      department: dept?.departmentCode || exp.department || "",
      personalEmail: exp.personalEmail || exp.contactEmail || "",
      contactNumber: exp.contactNumber || exp.contactPhone || "",
      companyName: exp.companyName || "",
      position: exp.position || "",
      salary: exp.salary || "",
      internOffered: exp.internOffered || false,
      hasBond: exp.hasBond || false,
      bondDetails: exp.bondDetails || "",
      totalRounds: rounds.length,
      rounds: rounds,
      overallExperience: exp.overallExperience || exp.crackingStrategy || "",
      areasToPrepareFinal: exp.areasToPrepareFinal || exp.preparationDetails || "",
      suggestedResources: exp.suggestedResources || exp.resources || "",
      finalResult: exp.finalResult || (exp.willingToMentor ? "SELECTED" : "PENDING"),
    });
    
    // Show modal last
    setShowModal(true);
  };

  // Validate compulsory fields before submission
  const validateForm = () => {
    const requiredFields = [
      { field: "studentName", label: "Student Name" },
      { field: "rollNumber", label: "Roll Number" },
      { field: "department", label: "Department" },
      { field: "personalEmail", label: "Personal Email" },
      { field: "contactNumber", label: "Contact Number" },
      { field: "companyName", label: "Company Name" },
      { field: "position", label: "Position/Role" },
      { field: "finalResult", label: "Result Status" },
      { field: "overallExperience", label: "Overall Experience" },
      { field: "areasToPrepareFinal", label: "Areas to Prepare" },
    ];

    for (const { field, label } of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        toast.error(`${label} is required`);
        return false;
      }
    }

    // Validate each round has required fields
    for (let i = 0; i < formData.rounds.length; i++) {
      const round = formData.rounds[i];
      if (!round.roundName || round.roundName.trim() === "") {
        toast.error(`Round ${i + 1} name is required`);
        return false;
      }
      if (!round.roundDetails || round.roundDetails.trim() === "") {
        toast.error(`Round ${i + 1} details are required`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Find department ID from department code
      const dept = departments.find(d => d.departmentCode === formData.department);
      
      // Map form fields to both InterviewExperience AND PlacementExperience API fields
      const payload = {
        // Basic info
        studentName: formData.studentName,
        rollNumber: formData.rollNumber,
        department: formData.department,
        personalEmail: formData.personalEmail,
        contactNumber: formData.contactNumber,
        
        // Company info
        companyName: formData.companyName,
        position: formData.position,
        salary: formData.salary,
        internOffered: formData.internOffered,
        hasBond: formData.hasBond,
        bondDetails: formData.bondDetails,
        
        // For InterviewExperience model compatibility
        yearOfPlacement: new Date().getFullYear(),
        departmentId: dept?.id || user?.departmentId,
        departmentName: dept?.departmentName || "",
        contactEmail: formData.personalEmail,
        contactPhone: formData.contactNumber,
        
        // Interview rounds
        totalRounds: formData.rounds.length,
        roundsJson: JSON.stringify(formData.rounds), // Store rounds as JSON
        roundsDescription: formData.rounds.map((round, idx) => 
          `Round ${idx + 1}: ${round.roundName} - ${round.roundDetails}`
        ).join('\n'),
        problemsSolved: formData.rounds.map((round) => round.howSolved).filter(Boolean).join('\n') || "N/A",
        
        // Summary & preparation
        overallExperience: formData.overallExperience,
        areasToPrepareFinal: formData.areasToPrepareFinal,
        suggestedResources: formData.suggestedResources,
        finalResult: formData.finalResult,
        
        // Legacy compatibility
        crackingStrategy: formData.overallExperience,
        preparationDetails: formData.areasToPrepareFinal,
        resources: formData.suggestedResources,
        willingToMentor: formData.finalResult === "SELECTED",
      };

      // Upload file if present
      if (resourceFile) {
        try {
          const uploadData = await uploadFile(resourceFile);
          payload.attachmentFileName = uploadData.fileName;
          payload.attachmentSize = uploadData.fileSize;
          payload.attachmentUrl = uploadData.fileUrl;
        } catch (uploadError) {
          console.error("File upload error:", uploadError);
        }
      }

      if (editing) {
        await experienceAPI.update(editing.id, payload);
        toast.success("Experience updated successfully!");
      } else {
        await experienceAPI.create(payload);
        toast.success("Experience added successfully!");
      }
      setShowModal(false);
      setResourceFile(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save experience");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this experience?")) {
      try {
        await experienceAPI.delete(id);
        toast.success("Experience deleted!");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      // Validate Step 1: Basic Info
      const requiredFields = [
        { field: "studentName", label: "Student Name" },
        { field: "rollNumber", label: "Roll Number" },
        { field: "department", label: "Department" },
        { field: "personalEmail", label: "Personal Email" },
        { field: "contactNumber", label: "Contact Number" },
        { field: "companyName", label: "Company Name" },
        { field: "position", label: "Position/Role" },
        { field: "finalResult", label: "Result Status" },
      ];

      for (const { field, label } of requiredFields) {
        if (!formData[field] || formData[field].toString().trim() === "") {
          toast.error(`${label} is required to proceed`);
          return false;
        }
      }
      return true;
    } else if (currentStep === 2) {
      // Validate Step 2: Interview Rounds
      for (let i = 0; i < formData.rounds.length; i++) {
        const round = formData.rounds[i];
        if (!round.roundName || round.roundName.trim() === "") {
          toast.error(`Round ${i + 1} name is required`);
          return false;
        }
        if (!round.roundDetails || round.roundDetails.trim() === "") {
          toast.error(`Round ${i + 1} details are required`);
          return false;
        }
      }
      return true;
    }
    return true;
  };

  const nextStep = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };
  
  const prevStep = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div>
            <h1>Welcome, {user?.fullName || user?.name || "Student"}!</h1>
            <p>Share your placement experiences to help juniors</p>
          </div>
          <div className="header-actions">
            <button className="add-btn" onClick={openAddModal}>
              + Add Experience
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {experiences.length > 0 ? (
          <div className="experiences-grid">
            {experiences.map((exp) => (
              <div key={exp.id} className="experience-card">
                <div className="exp-header">
                  <div className="exp-company">
                    <div className="company-logo">
                      {exp.companyName?.charAt(0).toUpperCase() || "C"}
                    </div>
                    <div className="company-info">
                      <h3>{exp.companyName}</h3>
                      <p className="company-type">{exp.position || "Interview Experience"}</p>
                    </div>
                  </div>
                  <span className="year-badge">
                    {exp.yearOfPlacement || new Date().getFullYear()}
                  </span>
                </div>

                <div className="exp-details">
                  <div className="detail-item">
                    <span className="detail-label">Rounds:</span>
                    <span className="detail-value">{exp.totalRounds || 1}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Department:</span>
                    <span className="detail-value">{exp.departmentName || "N/A"}</span>
                  </div>
                </div>

                {exp.crackingStrategy && (
                  <p className="exp-description">
                    {exp.crackingStrategy.length > 100
                      ? exp.crackingStrategy.substring(0, 100) + "..."
                      : exp.crackingStrategy}
                  </p>
                )}

                {exp.willingToMentor && (
                  <div className="intern-badge">
                    <span>✓</span> Willing to Mentor
                  </div>
                )}

                <div className="exp-actions">
                  <button
                    className="view-btn"
                    onClick={(e) => { e.stopPropagation(); navigate(`/experience/${exp.id}`); }}
                  >
                    <span>👁</span> View
                  </button>
                  <button
                    className="edit-btn"
                    onClick={(e) => { e.stopPropagation(); openEditModal(exp); }}
                  >
                    <span>✎</span> Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={(e) => { e.stopPropagation(); handleDelete(exp.id); }}
                  >
                    <span>✕</span> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty">
            <div className="empty-icon-box">+</div>
            <h3>No Experiences Yet</h3>
            <p>Share your placement journey to help other students!</p>
            <button className="empty-btn" onClick={openAddModal}>
              Add Your First Experience
            </button>
          </div>
        )}
      </div>

      {/* Multi-Step Modal Form */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Experience' : 'Add Interview Experience'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            {/* Step Progress - 3 Steps */}
            <div className="step-progress">
              <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                <span className="step-number">1</span>
                <span className="step-label">Basic Info</span>
              </div>
              <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                <span className="step-number">2</span>
                <span className="step-label">Interview Rounds</span>
              </div>
              <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                <span className="step-number">3</span>
                <span className="step-label">Preparation</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="form-step">
                  <h3>Basic Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Student Name *</label>
                      <input type="text" name="studentName" value={formData.studentName} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>Roll Number *</label>
                      <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Department *</label>
                      <select name="department" value={formData.department} onChange={handleChange} required>
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.departmentCode}>{dept.departmentName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Personal Email *</label>
                      <input type="email" name="personalEmail" value={formData.personalEmail} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="e.g., 9876543210" required />
                    </div>
                    <div className="form-group">
                      <label>Company Name *</label>
                      <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Position/Role *</label>
                      <input type="text" name="position" value={formData.position} onChange={handleChange} placeholder="e.g., Software Engineer" required />
                    </div>
                    <div className="form-group">
                      <label>Salary/CTC</label>
                      <input type="text" name="salary" value={formData.salary} onChange={handleChange} placeholder="e.g., 12 LPA" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Result Status *</label>
                      <select name="finalResult" value={formData.finalResult} onChange={handleChange} required>
                        <option value="SELECTED">Selected ✓</option>
                        <option value="REJECTED">Rejected ✗</option>
                        <option value="PENDING">Pending ⏳</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row checkbox-row">
                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <input type="checkbox" name="internOffered" checked={formData.internOffered} onChange={handleChange} />
                        <span className="checkbox-text">Intern Offered</span>
                      </label>
                    </div>
                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <input type="checkbox" name="hasBond" checked={formData.hasBond} onChange={handleChange} />
                        <span className="checkbox-text">Has Bond</span>
                      </label>
                    </div>
                  </div>
                  {formData.hasBond && (
                    <div className="form-group">
                      <label>Bond Details</label>
                      <input type="text" name="bondDetails" value={formData.bondDetails} onChange={handleChange} placeholder="e.g., 2 years bond, 1.5 LPA penalty" />
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Interview Rounds */}
              {currentStep === 2 && (
                <div className="form-step">
                  <h3>Interview Rounds</h3>
                  <p className="step-hint">Add details for each interview round you attended</p>
                  
                  {formData.rounds.map((round, roundIndex) => (
                    <div key={roundIndex} className="round-section">
                      <div className="round-header">
                        <h4>Round {roundIndex + 1}</h4>
                        {formData.rounds.length > 1 && (
                          <button type="button" className="remove-round-btn" onClick={() => removeRound(roundIndex)}>✕ Remove</button>
                        )}
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Round Name *</label>
                          <input type="text" value={round.roundName} onChange={(e) => handleRoundChange(roundIndex, 'roundName', e.target.value)} placeholder="e.g., Online Test, Technical, HR" required />
                        </div>
                        <div className="form-group">
                          <label>Time Taken</label>
                          <input type="text" value={round.duration} onChange={(e) => handleRoundChange(roundIndex, 'duration', e.target.value)} placeholder="e.g., 45 mins, 1 hour" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Round Details *</label>
                        <textarea value={round.roundDetails} onChange={(e) => handleRoundChange(roundIndex, 'roundDetails', e.target.value)} placeholder="Describe what happened in this round - topics covered, difficulty level, etc." rows={3} required />
                      </div>
                      <div className="form-group">
                        <label>How I Solved It / My Approach</label>
                        <textarea value={round.howSolved} onChange={(e) => handleRoundChange(roundIndex, 'howSolved', e.target.value)} placeholder="Explain your approach, what worked, what didn't..." rows={3} />
                      </div>
                    </div>
                  ))}
                  
                  <button type="button" className="add-round-btn" onClick={addNewRound}>
                    + Add Another Round
                  </button>
                </div>
              )}

              {/* Step 3: Preparation Strategy */}
              {currentStep === 3 && (
                <div className="form-step">
                  <h3>Preparation Strategy & Tips</h3>
                  <div className="form-group">
                    <label>Overall Experience *</label>
                    <textarea name="overallExperience" value={formData.overallExperience} onChange={handleChange} placeholder="Share your overall experience with this company's recruitment process - what went well, what was challenging, key takeaways..." rows={4} required />
                  </div>
                  <div className="form-group">
                    <label>Areas to Prepare *</label>
                    <textarea name="areasToPrepareFinal" value={formData.areasToPrepareFinal} onChange={handleChange} placeholder="Key areas to focus on for this company - DSA topics, CS fundamentals, specific technologies..." rows={3} required />
                  </div>
                  <div className="form-group">
                    <label>Suggested Resources</label>
                    <textarea name="suggestedResources" value={formData.suggestedResources} onChange={handleChange} placeholder="Books, websites, YouTube channels, courses that helped you prepare..." rows={3} />
                  </div>
                  <div className="form-group file-upload-group">
                    <label>Upload Resources (Optional)</label>
                    <p className="field-hint">Upload study materials, notes, or code as a ZIP file (max 10MB)</p>
                    <input type="file" accept=".zip,.pdf,.doc,.docx" onChange={(e) => setResourceFile(e.target.files[0])} />
                    {resourceFile && <p className="file-selected-text">📎 Selected: {resourceFile.name}</p>}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="modal-footer">
                {currentStep > 1 && (
                  <button type="button" className="prev-btn" onClick={prevStep}>← Previous</button>
                )}
                {currentStep < 3 ? (
                  <button type="button" className="next-btn" onClick={nextStep}>Next →</button>
                ) : (
                  <button type="submit" className="submit-btn">{editing ? 'Update Experience' : 'Submit Experience'}</button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
