import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSend, FiArrowRight, FiArrowLeft, FiCheck } from "react-icons/fi";
import { toast } from "react-toastify";
import { experienceAPI, departmentAPI } from "../services/api";
import "./AddExperience.css";

const AddExperience = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    studentName: "",
    companyName: "",
    position: "",
    yearOfPlacement: new Date().getFullYear(),
    departmentId: "",
    totalRounds: 1,

    // Step 2: Interview Details
    roundsDescription: "",
    questionsAsked: "",
    problemsSolved: "",
    inPersonInterviewTips: "",

    // Step 3: Preparation Strategy
    crackingStrategy: "",
    preparationDetails: "",
    resources: "",

    // Step 4: Mentorship & Contact
    willingToMentor: false,
    contactEmail: "",
    contactPhone: "",
    linkedinProfile: "",
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
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Validation for each step
  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.studentName.trim()) {
          toast.error("Please enter your name");
          return false;
        }
        if (!formData.companyName.trim()) {
          toast.error("Please enter the company name");
          return false;
        }
        if (!formData.position.trim()) {
          toast.error("Please enter the position");
          return false;
        }
        if (!formData.departmentId) {
          toast.error("Please select a department");
          return false;
        }
        if (formData.totalRounds < 1) {
          toast.error("Total rounds must be at least 1");
          return false;
        }
        return true;

      case 2:
        if (!formData.roundsDescription.trim()) {
          toast.error("Please describe each interview round");
          return false;
        }
        if (!formData.questionsAsked.trim()) {
          toast.error("Please list the questions asked");
          return false;
        }
        if (!formData.problemsSolved.trim()) {
          toast.error("Please describe the problems you solved");
          return false;
        }
        return true;

      case 3:
        if (!formData.crackingStrategy.trim()) {
          toast.error("Please share your cracking strategy");
          return false;
        }
        if (!formData.preparationDetails.trim()) {
          toast.error("Please provide preparation details");
          return false;
        }
        return true;

      case 4:
        // Optional fields, always valid
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate current step before submission
    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);
    try {
      const submissionData = {
        ...formData,
        departmentId: parseInt(formData.departmentId),
        yearOfPlacement: parseInt(formData.yearOfPlacement),
        totalRounds: parseInt(formData.totalRounds),
      };

      await experienceAPI.create(submissionData);
      toast.success("Experience shared successfully! 🎉");
      navigate("/experiences");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit experience"
      );
    } finally {
      setLoading(false);
    }
  };

  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - i + 1
  );

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div
          key={step}
          className={`step ${currentStep >= step ? "active" : ""} ${
            currentStep > step ? "completed" : ""
          }`}
        >
          <div className="step-number">
            {currentStep > step ? <FiCheck /> : step}
          </div>
          <div className="step-label">
            {step === 1 && "Basic Info"}
            {step === 2 && "Interview Details"}
            {step === 3 && "Preparation"}
            {step === 4 && "Mentorship"}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="add-experience-page">
      <div className="page-header">
        <h1>Share Your Experience</h1>
        <p>
          Help juniors by sharing your interview journey. Your insights can
          change someone's career.
        </p>
      </div>

      {renderStepIndicator()}

      <form onSubmit={handleSubmit} className="experience-form">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <section className="form-section active-section">
            <h2 className="section-title">Basic Information</h2>
            <p className="section-description">
              Tell us about yourself and the company you joined
            </p>
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
        )}

        {/* Step 2: Interview Details */}
        {currentStep === 2 && (
          <section className="form-section active-section">
            <h2 className="section-title">Interview Details</h2>
            <p className="section-description">
              Share details about the interview process and questions
            </p>
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
              <label>Questions Asked *</label>
              <textarea
                name="questionsAsked"
                value={formData.questionsAsked}
                onChange={handleChange}
                placeholder="List the technical and HR questions you were asked. E.g., Explain your projects, What is OOP, Tell me about yourself..."
                rows={4}
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
        )}

        {/* Step 3: Preparation Strategy */}
        {currentStep === 3 && (
          <section className="form-section active-section highlight">
            <h2 className="section-title">🎯 Preparation Strategy</h2>
            <p className="section-description">
              Share how you prepared and what worked for you
            </p>
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
          </section>
        )}

        {/* Step 4: Mentorship & Contact */}
        {currentStep === 4 && (
          <section className="form-section active-section">
            <h2 className="section-title">Mentorship & Contact</h2>
            <p className="section-description">
              Would you like to mentor and guide juniors?
            </p>
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
        )}

        {/* Navigation Buttons */}
        <div className="form-navigation">
          {currentStep > 1 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={handlePrevious}
            >
              <FiArrowLeft />
              Previous
            </button>
          )}
          <div className="flex-spacer"></div>
          {currentStep < totalSteps ? (
            <button type="button" className="btn-primary" onClick={handleNext}>
              Next
              <FiArrowRight />
            </button>
          ) : (
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
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
          )}
        </div>
      </form>
    </div>
  );
};

export default AddExperience;
