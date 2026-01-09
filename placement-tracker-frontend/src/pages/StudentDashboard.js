import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { placementAPI, departmentAPI, authAPI } from "../services/api";
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
    platform: "Online Test",
    duration: "",
    roundDetails: "",
    topicsCovered: "",
    comments: "",
    studyLinks: "",
    cleared: true,
    questions: [{ domain: "", question: "", approach: "", references: "" }],
  });

  const [formData, setFormData] = useState({
    studentName: "",
    rollNumber: "",
    department: "",
    personalEmail: "",
    contactNumber: "",
    companyName: "",
    companyType: "IT",
    salary: "",
    internOffered: false,
    hasBond: false,
    bondDetails: "",
    totalRounds: 1,
    rounds: [createEmptyRound(1)],
    overallExperience: "",
    generalTips: "",
    areasToPrepareFinal: "",
    suggestedResources: "",
    finalResult: "SELECTED",
  });

  const fetchData = useCallback(async () => {
    try {
      const [expRes, deptRes] = await Promise.all([
        placementAPI.getAll(),
        departmentAPI.getAll(),
      ]);
      const myExperiences = (expRes.data || []).filter(
        (exp) =>
          exp.personalEmail === user?.email || exp.studentEmail === user?.email
      );
      setExperiences(myExperiences);
      setDepartments(deptRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (user) {
      // Find department code from user's departmentId
      const userDept = departments.find((d) => d.id === user.departmentId);
      setFormData((prev) => ({
        ...prev,
        studentName: user.fullName || user.name || "",
        personalEmail: user.email || "",
        department: userDept?.departmentCode || user.department || "",
      }));
    }
  }, [user, departments]);

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
      companyType: "IT",
      salary: "",
      internOffered: false,
      hasBond: false,
      bondDetails: "",
      totalRounds: 1,
      rounds: [createEmptyRound(1)],
      overallExperience: "",
      generalTips: "",
      areasToPrepareFinal: "",
      suggestedResources: "",
      finalResult: "SELECTED",
    });
    setShowModal(true);
  };

  const openEditModal = (exp) => {
    setEditing(exp);
    setCurrentStep(1);

    // Parse rounds from JSON
    let rounds = [createEmptyRound(1)];
    try {
      if (exp.roundsJson) {
        rounds = JSON.parse(exp.roundsJson);
      }
    } catch (e) {
      console.error("Error parsing rounds:", e);
    }

    setFormData({
      studentName: exp.studentName || "",
      rollNumber: exp.rollNumber || "",
      department: exp.department || "",
      personalEmail: exp.personalEmail || "",
      contactNumber: exp.contactNumber || "",
      companyName: exp.companyName || "",
      companyType: exp.companyType || "IT",
      salary: exp.salary || "",
      internOffered: exp.internOffered || false,
      hasBond: exp.hasBond || false,
      bondDetails: exp.bondDetails || "",
      totalRounds: exp.totalRounds || rounds.length,
      rounds: rounds,
      overallExperience: exp.overallExperience || "",
      generalTips: exp.generalTips || "",
      areasToPrepareFinal: exp.areasToPrepareFinal || "",
      suggestedResources: exp.suggestedResources || "",
      finalResult: exp.finalResult || "SELECTED",
    });
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
      { field: "companyType", label: "Company Type" },
      { field: "salary", label: "Salary" },
      { field: "finalResult", label: "Final Result" },
      { field: "overallExperience", label: "Overall Experience" },
      { field: "generalTips", label: "General Tips" },
      { field: "areasToPrepareFinal", label: "Areas to Prepare" },
      { field: "suggestedResources", label: "Suggested Resources" },
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
      if (!round.topicsCovered || round.topicsCovered.trim() === "") {
        toast.error(`Round ${i + 1} topics covered is required`);
        return false;
      }
      if (!round.duration || round.duration.trim() === "") {
        toast.error(`Round ${i + 1} duration is required`);
        return false;
      }
      if (!round.comments || round.comments.trim() === "") {
        toast.error(`Round ${i + 1} comments/tips are required`);
        return false;
      }
      if (!round.studyLinks || round.studyLinks.trim() === "") {
        toast.error(`Round ${i + 1} study links are required`);
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
      const payload = {
        ...formData,
        placementYear: user?.graduationYear || new Date().getFullYear(),
        roundsJson: JSON.stringify(formData.rounds),
      };
      delete payload.rounds;

      if (editing) {
        await placementAPI.update(editing.id, payload);
        toast.success("Experience updated successfully!");
      } else {
        await placementAPI.create(payload);
        toast.success("Experience added successfully!");
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save experience");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this experience?")) {
      try {
        await placementAPI.delete(id);
        toast.success("Experience deleted!");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

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
                      <p className="company-type">{exp.companyType || "IT"}</p>
                    </div>
                  </div>
                  <span
                    className={`result-badge ${exp.finalResult?.toLowerCase()}`}
                  >
                    {exp.finalResult}
                  </span>
                </div>

                <div className="exp-details">
                  {exp.salary && (
                    <div className="detail-item">
                      <span className="detail-label">Salary:</span>
                      <span className="detail-value">{exp.salary}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="detail-label">Rounds:</span>
                    <span className="detail-value">{exp.totalRounds}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Department:</span>
                    <span className="detail-value">{exp.department}</span>
                  </div>
                </div>

                {exp.internOffered && (
                  <div className="intern-badge">
                    <span>✓</span> Intern Offered
                  </div>
                )}

                {exp.overallExperience && (
                  <p className="exp-description">
                    {exp.overallExperience.length > 150
                      ? exp.overallExperience.substring(0, 150) + "..."
                      : exp.overallExperience}
                  </p>
                )}

                <div className="exp-actions">
                  <button
                    className="edit-btn"
                    onClick={() => openEditModal(exp)}
                  >
                    <span>✎</span> Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(exp.id)}
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Student Feedback Form</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                x
              </button>
            </div>

            <div className="form-steps">
              <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
                1. Student Info
              </div>
              <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
                2. Rounds Setup
              </div>
              <div className={`step ${currentStep >= 3 ? "active" : ""}`}>
                3. Round Details
              </div>
              <div className={`step ${currentStep >= 4 ? "active" : ""}`}>
                4. Summary
              </div>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              {currentStep === 1 && (
                <div className="form-step-content">
                  <h3>Student Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Student Name *</label>
                      <input
                        name="studentName"
                        value={formData.studentName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Roll Number *</label>
                      <input
                        name="rollNumber"
                        value={formData.rollNumber}
                        onChange={handleChange}
                        placeholder="e.g., 71762207030"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Department *</label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.departmentCode}>
                            {d.departmentName} ({d.departmentCode})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Personal Email *</label>
                      <input
                        type="email"
                        name="personalEmail"
                        value={formData.personalEmail}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Contact Number *</label>
                    <input
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="e.g., 9876543210"
                      required
                    />
                  </div>

                  <h3>Company Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Company Name *</label>
                      <input
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="e.g., Mobicip, TCS"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Company Type *</label>
                      <select
                        name="companyType"
                        value={formData.companyType}
                        onChange={handleChange}
                        required
                      >
                        <option value="IT">IT</option>
                        <option value="Core">Core</option>
                        <option value="Product">Product Based</option>
                        <option value="Service">Service Based</option>
                        <option value="Startup">Startup</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Salary (CTC) *</label>
                      <input
                        name="salary"
                        value={formData.salary}
                        onChange={handleChange}
                        placeholder="e.g., 15000(Intern) + 8 LPA(FTE)"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Final Result *</label>
                      <select
                        name="finalResult"
                        value={formData.finalResult}
                        onChange={handleChange}
                        required
                      >
                        <option value="SELECTED">Selected</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="PENDING">Pending</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row checkbox-row">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="internOffered"
                        checked={formData.internOffered}
                        onChange={handleChange}
                      />
                      <span>Intern Offered</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="hasBond"
                        checked={formData.hasBond}
                        onChange={handleChange}
                      />
                      <span>Has Bond</span>
                    </label>
                  </div>
                  {formData.hasBond && (
                    <div className="form-group">
                      <label>Bond Details</label>
                      <input
                        name="bondDetails"
                        value={formData.bondDetails}
                        onChange={handleChange}
                        placeholder="e.g., 2 years"
                      />
                    </div>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div className="form-step-content">
                  <h3>Selection Process Overview</h3>
                  <p className="form-hint">
                    Add all rounds of your selection process. You can add more
                    rounds using the button below.
                  </p>

                  <div className="rounds-overview">
                    {formData.rounds.map((round, idx) => (
                      <div key={idx} className="round-config-card">
                        <div className="round-config-header">
                          <span className="round-number-badge">
                            Round {idx + 1}
                          </span>
                          {formData.rounds.length > 1 && (
                            <button
                              type="button"
                              className="remove-round-btn"
                              onClick={() => removeRound(idx)}
                            >
                              ✕ Remove
                            </button>
                          )}
                        </div>
                        <div className="round-config-fields">
                          <div className="form-group">
                            <label>Round Name *</label>
                            <input
                              placeholder="e.g., Written Test, Technical Interview, HR Round"
                              value={round.roundName}
                              onChange={(e) =>
                                handleRoundChange(
                                  idx,
                                  "roundName",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>
                          <div className="form-row">
                            <div className="form-group">
                              <label>Platform/Mode</label>
                              <select
                                value={round.platform}
                                onChange={(e) =>
                                  handleRoundChange(
                                    idx,
                                    "platform",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="Online Test">Online Test</option>
                                <option value="Written Test">
                                  Written Test (Offline)
                                </option>
                                <option value="Technical Interview">
                                  Technical Interview
                                </option>
                                <option value="HR Interview">
                                  HR Interview
                                </option>
                                <option value="Group Discussion">
                                  Group Discussion
                                </option>
                                <option value="Coding Round">
                                  Coding Round
                                </option>
                                <option value="Video Call">Video Call</option>
                                <option value="In-Person">In-Person</option>
                                <option value="Hybrid">Hybrid</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label>Duration *</label>
                              <input
                                placeholder="e.g., 1 hour, 30 mins"
                                value={round.duration}
                                onChange={(e) =>
                                  handleRoundChange(
                                    idx,
                                    "duration",
                                    e.target.value
                                  )
                                }
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="add-round-btn"
                      onClick={addNewRound}
                    >
                      + Add Another Round
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="form-step-content scrollable">
                  <h3>Round Details</h3>
                  <p className="form-hint">
                    Provide detailed information for each round to help students
                    prepare better.
                  </p>

                  <div className="rounds-detail-container">
                    {formData.rounds.map((round, roundIdx) => (
                      <div key={roundIdx} className="round-detail-card">
                        <div className="round-detail-header">
                          <h4>
                            Round {roundIdx + 1}:{" "}
                            {round.roundName || "Untitled"}
                          </h4>
                          <div className="round-badges">
                            <span className="platform-badge">
                              {round.platform}
                            </span>
                            {round.duration && (
                              <span className="duration-badge">
                                {round.duration}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="round-info-section">
                          <div className="info-label">Platform Used:</div>
                          <div className="info-value">{round.platform}</div>
                        </div>

                        <div className="form-group">
                          <label>Round Details *</label>
                          <textarea
                            value={round.roundDetails}
                            onChange={(e) =>
                              handleRoundChange(
                                roundIdx,
                                "roundDetails",
                                e.target.value
                              )
                            }
                            placeholder="Describe the round process, format, number of questions, cutoff marks, time given, difficulty level..."
                            rows={4}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Topics/Areas Covered *</label>
                          <textarea
                            value={round.topicsCovered}
                            onChange={(e) =>
                              handleRoundChange(
                                roundIdx,
                                "topicsCovered",
                                e.target.value
                              )
                            }
                            placeholder="e.g., Aptitude, Logical Reasoning, DSA, OOP, DBMS, OS, CN, Verbal, Coding..."
                            rows={2}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Your Comments About This Round *</label>
                          <textarea
                            value={round.comments}
                            onChange={(e) =>
                              handleRoundChange(
                                roundIdx,
                                "comments",
                                e.target.value
                              )
                            }
                            placeholder="Your experience, tips for this round, time management advice, what worked, what didn't..."
                            rows={3}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>
                            Links to Refer for Study (for this round) *
                          </label>
                          <textarea
                            value={round.studyLinks}
                            onChange={(e) =>
                              handleRoundChange(
                                roundIdx,
                                "studyLinks",
                                e.target.value
                              )
                            }
                            placeholder="Add helpful links separated by new lines:\nhttps://leetcode.com/problems/...\nhttps://geeksforgeeks.org/...\nhttps://youtube.com/watch?v=..."
                            rows={3}
                            required
                          />
                        </div>

                        <label className="checkbox-label inline cleared-checkbox">
                          <input
                            type="checkbox"
                            checked={round.cleared}
                            onChange={(e) =>
                              handleRoundChange(
                                roundIdx,
                                "cleared",
                                e.target.checked
                              )
                            }
                          />
                          <span>I cleared this round</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="form-step-content">
                  <h3>Overall Summary and Tips</h3>

                  <div className="form-group">
                    <label>Overall Experience *</label>
                    <textarea
                      name="overallExperience"
                      value={formData.overallExperience}
                      onChange={handleChange}
                      placeholder="Describe your overall experience..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>General Tips for Students *</label>
                    <textarea
                      name="generalTips"
                      value={formData.generalTips}
                      onChange={handleChange}
                      placeholder="Share tips that helped you..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Areas to Prepare *</label>
                    <textarea
                      name="areasToPrepareFinal"
                      value={formData.areasToPrepareFinal}
                      onChange={handleChange}
                      placeholder="1. C Programming 2. DSA 3. Aptitude..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Sites/Books Suggested *</label>
                    <textarea
                      name="suggestedResources"
                      value={formData.suggestedResources}
                      onChange={handleChange}
                      placeholder="LeetCode, GeeksforGeeks, Striver..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Upload Resources (ZIP file)</label>
                    <p className="field-hint">
                      Upload study materials, notes, or code as a ZIP file (max
                      10MB)
                    </p>
                    {!resourceFile ? (
                      <div className="file-upload-area">
                        <input
                          type="file"
                          id="resourceFile"
                          accept=".zip"
                          onChange={(e) => {
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
                              toast.success(`File "${file.name}" selected`);
                            }
                          }}
                          style={{ display: "none" }}
                        />
                        <label
                          htmlFor="resourceFile"
                          className="file-upload-btn"
                        >
                          📁 Choose ZIP File
                        </label>
                      </div>
                    ) : (
                      <div className="file-selected">
                        <div className="file-info">
                          <span className="file-icon">📄</span>
                          <span className="file-name">{resourceFile.name}</span>
                          <span className="file-size">
                            ({(resourceFile.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          className="remove-file-btn"
                          onClick={() => {
                            setResourceFile(null);
                            toast.info("File removed");
                          }}
                        >
                          × Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="modal-actions">
                {currentStep > 1 && (
                  <button type="button" className="prev-btn" onClick={prevStep}>
                    Previous
                  </button>
                )}
                {currentStep < 4 ? (
                  <button type="button" className="next-btn" onClick={nextStep}>
                    Next
                  </button>
                ) : (
                  <button type="submit" className="submit-btn">
                    Submit Experience
                  </button>
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
