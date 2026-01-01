import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiMapPin,
  FiUser,
  FiMail,
  FiPhone,
  FiLinkedin,
  FiBook,
  FiTarget,
  FiLayers,
  FiMessageCircle,
  FiEdit2,
  FiTrash2,
  FiDownload,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { experienceAPI } from "../services/api";
import jsPDF from "jspdf";
import "./ExperienceDetail.css";

const ExperienceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperience();
  }, [id]);

  const fetchExperience = async () => {
    try {
      const response = await experienceAPI.getById(id);
      setExperience(response.data);
    } catch (error) {
      toast.error("Failed to fetch experience");
      navigate("/experiences");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this experience?")) {
      try {
        await experienceAPI.delete(id);
        toast.success("Experience deleted successfully!");
        navigate("/experiences");
      } catch (error) {
        toast.error("Failed to delete experience");
      }
    }
  };

  const handleDownloadPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper function to add text with word wrap
    const addText = (text, fontSize = 12, isBold = false) => {
      pdf.setFontSize(fontSize);
      if (isBold) pdf.setFont(undefined, "bold");
      else pdf.setFont(undefined, "normal");

      const lines = pdf.splitTextToSize(text, maxWidth);
      lines.forEach((line) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += fontSize * 0.5;
      });
      yPosition += 5;
    };

    // Title
    addText(`${experience.companyName} - ${experience.position}`, 18, true);
    yPosition += 5;

    // Basic Info
    addText(`Student: ${experience.studentName}`, 12);
    addText(`Department: ${experience.departmentName}`, 12);
    addText(`Year: ${experience.yearOfPlacement}`, 12);
    addText(`Total Rounds: ${experience.totalRounds}`, 12);
    yPosition += 5;

    // Interview Details
    addText("Interview Rounds:", 14, true);
    addText(experience.roundsDescription || "N/A", 11);
    yPosition += 5;

    addText("Questions Asked:", 14, true);
    addText(experience.questionsAsked || "N/A", 11);
    yPosition += 5;

    addText("Problems Solved:", 14, true);
    addText(experience.problemsSolved || "N/A", 11);
    yPosition += 5;

    addText("Cracking Strategy:", 14, true);
    addText(experience.crackingStrategy || "N/A", 11);
    yPosition += 5;

    addText("Preparation Details:", 14, true);
    addText(experience.preparationDetails || "N/A", 11);
    yPosition += 5;

    if (experience.inPersonInterviewTips) {
      addText("In-Person Interview Tips:", 14, true);
      addText(experience.inPersonInterviewTips, 11);
      yPosition += 5;
    }

    if (experience.resources) {
      addText("Resources Used:", 14, true);
      addText(experience.resources, 11);
    }

    // Save PDF
    const fileName = `${experience.companyName.replace(
      /[^a-z0-9]/gi,
      "_"
    )}_${experience.studentName.replace(/[^a-z0-9]/gi, "_")}_Experience.pdf`;
    pdf.save(fileName);
    toast.success("PDF downloaded successfully!");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading experience...</p>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="error-container">
        <h2>Experience not found</h2>
        <Link to="/experiences" className="btn btn-primary">
          Back to Experiences
        </Link>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="experience-detail">
      {/* Back Button */}
      <Link to="/experiences" className="back-link">
        <FiArrowLeft />
        Back to Experiences
      </Link>

      {/* Header Section */}
      <div className="detail-header">
        <div className="header-info">
          <div className="company-badge">{experience.companyName}</div>
          <h1>{experience.position}</h1>
          <div className="header-meta">
            <span>
              <FiUser /> {experience.studentName}
            </span>
            <span>
              <FiMapPin /> {experience.departmentName}
            </span>
            <span>
              <FiCalendar /> {experience.yearOfPlacement}
            </span>
            <span>
              <FiLayers /> {experience.totalRounds} Rounds
            </span>
          </div>
        </div>
        <div className="header-actions">
          <button className="action-btn download" onClick={handleDownloadPDF}>
            <FiDownload />
            Download PDF
          </button>
          <button className="action-btn delete" onClick={handleDelete}>
            <FiTrash2 />
            Delete
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="detail-content">
        {/* Rounds Description */}
        <section className="content-section">
          <div className="section-header">
            <FiLayers className="section-icon" />
            <h2>Interview Rounds</h2>
          </div>
          <div className="section-body">
            <p>{experience.roundsDescription}</p>
          </div>
        </section>

        {/* Questions Asked */}
        <section className="content-section">
          <div className="section-header">
            <FiMessageCircle className="section-icon" />
            <h2>Questions Asked</h2>
          </div>
          <div className="section-body">
            <p>{experience.questionsAsked}</p>
          </div>
        </section>

        {/* Problems Solved */}
        <section className="content-section">
          <div className="section-header">
            <FiTarget className="section-icon" />
            <h2>Problems Solved</h2>
          </div>
          <div className="section-body">
            <p>{experience.problemsSolved}</p>
          </div>
        </section>

        {/* Cracking Strategy */}
        <section className="content-section highlight">
          <div className="section-header">
            <FiTarget className="section-icon" />
            <h2>Cracking Strategy</h2>
          </div>
          <div className="section-body">
            <p>{experience.crackingStrategy}</p>
          </div>
        </section>

        {/* Preparation Details */}
        <section className="content-section">
          <div className="section-header">
            <FiBook className="section-icon" />
            <h2>Preparation Details</h2>
          </div>
          <div className="section-body">
            <p>{experience.preparationDetails}</p>
          </div>
        </section>

        {/* In-Person Interview Tips */}
        {experience.inPersonInterviewTips && (
          <section className="content-section">
            <div className="section-header">
              <FiUser className="section-icon" />
              <h2>In-Person Interview Tips</h2>
            </div>
            <div className="section-body">
              <p>{experience.inPersonInterviewTips}</p>
            </div>
          </section>
        )}

        {/* Resources */}
        {experience.resources && (
          <section className="content-section">
            <div className="section-header">
              <FiBook className="section-icon" />
              <h2>Resources Used</h2>
            </div>
            <div className="section-body">
              <p>{experience.resources}</p>
            </div>
          </section>
        )}
      </div>

      {/* Contact Card */}
      {experience.willingToMentor && (
        <div className="mentor-card">
          <div className="mentor-header">
            <span className="mentor-badge">✨ Available to Mentor</span>
            <h3>{experience.studentName} is willing to help!</h3>
            <p>Connect with them for guidance and mentorship</p>
          </div>
          <div className="contact-info">
            {experience.contactEmail && (
              <a
                href={`mailto:${experience.contactEmail}`}
                className="contact-item"
              >
                <FiMail />
                {experience.contactEmail}
              </a>
            )}
            {experience.contactPhone && (
              <a
                href={`tel:${experience.contactPhone}`}
                className="contact-item"
              >
                <FiPhone />
                {experience.contactPhone}
              </a>
            )}
            {experience.linkedinProfile && (
              <a
                href={experience.linkedinProfile}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-item"
              >
                <FiLinkedin />
                LinkedIn Profile
              </a>
            )}
          </div>
        </div>
      )}

      {/* Submitted Date */}
      <div className="submitted-info">
        Shared on {formatDate(experience.submittedAt)}
      </div>
    </div>
  );
};

export default ExperienceDetail;
