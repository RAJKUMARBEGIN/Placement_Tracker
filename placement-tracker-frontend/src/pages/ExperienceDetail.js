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
  FiFileText,
  FiList,
  FiHelpCircle,
  FiLink,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { experienceAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import jsPDF from "jspdf";
import "./ExperienceDetail.css";

const ExperienceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if current user is the author of this experience
  const isAuthor = () => {
    if (!user || !experience) return false;
    // Match by email (contactEmail in experience vs user's email)
    return (
      user.email === experience.contactEmail ||
      user.collegeEmail === experience.contactEmail
    );
  };

  // Can edit/delete if user is author or admin
  const canModify = () => isAuthor() || isAdmin();

  useEffect(() => {
    fetchExperience();
  }, [id]);

  const fetchExperience = async () => {
    try {
      const response = await experienceAPI.getById(id);
      setExperience(response.data);
    } catch (error) {
      console.error("Fetch error:", error);
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

    // Parse rounds from JSON
    let pdfRounds = [];
    try {
      if (experience.roundsJson) {
        pdfRounds = JSON.parse(experience.roundsJson);
      }
    } catch (e) {
      console.error("Error parsing rounds for PDF:", e);
    }

    // Helper function to check page break
    const checkPageBreak = (neededHeight = 20) => {
      if (yPosition > pageHeight - margin - neededHeight) {
        pdf.addPage();
        yPosition = margin;
      }
    };

    // Helper function to add text with word wrap
    const addText = (
      text,
      fontSize = 12,
      isBold = false,
      color = [0, 0, 0]
    ) => {
      checkPageBreak();
      pdf.setFontSize(fontSize);
      pdf.setTextColor(color[0], color[1], color[2]);
      if (isBold) pdf.setFont(undefined, "bold");
      else pdf.setFont(undefined, "normal");

      const lines = pdf.splitTextToSize(String(text || "N/A"), maxWidth);
      lines.forEach((line) => {
        checkPageBreak();
        pdf.text(line, margin, yPosition);
        yPosition += fontSize * 0.5;
      });
      yPosition += 3;
    };

    // Helper function to add section header
    const addSectionHeader = (title) => {
      checkPageBreak(25);
      yPosition += 5;
      pdf.setFillColor(37, 99, 235);
      pdf.rect(margin, yPosition - 5, maxWidth, 10, "F");
      pdf.setFontSize(12);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont(undefined, "bold");
      pdf.text(title, margin + 5, yPosition + 2);
      yPosition += 15;
      pdf.setTextColor(0, 0, 0);
    };

    // Helper function to add label-value pair
    const addLabelValue = (label, value) => {
      checkPageBreak();
      pdf.setFontSize(10);
      pdf.setFont(undefined, "bold");
      pdf.setTextColor(100, 100, 100);
      pdf.text(label + ":", margin, yPosition);
      pdf.setFont(undefined, "normal");
      pdf.setTextColor(0, 0, 0);
      pdf.text(String(value || "N/A"), margin + 45, yPosition);
      yPosition += 7;
    };

    // ============ TITLE ============
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, 45, "F");
    pdf.setFontSize(22);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont(undefined, "bold");
    pdf.text(experience.companyName || "Company", margin, 25);
    pdf.setFontSize(12);
    pdf.setFont(undefined, "normal");
    pdf.text(
      `Placement Experience - ${
        experience.placementYear || new Date().getFullYear()
      }`,
      margin,
      38
    );
    yPosition = 60;

    // ============ STUDENT INFORMATION ============
    addSectionHeader("STUDENT INFORMATION");
    addLabelValue("Name", experience.studentName);
    addLabelValue("Roll Number", experience.rollNumber);
    addLabelValue("Department", experience.department);
    addLabelValue("Email", experience.contactEmail);
    addLabelValue("Contact", experience.contactPhone);
    addLabelValue("Placement Year", experience.placementYear);

    // ============ OFFER DETAILS ============
    addSectionHeader("OFFER DETAILS");
    addLabelValue("Company", experience.companyName);
    addLabelValue("Company Type", experience.companyType);
    addLabelValue("Salary/CTC", experience.salary);
    addLabelValue("Intern Offered", experience.internOffered ? "Yes" : "No");
    addLabelValue(
      "Bond",
      experience.hasBond ? experience.bondDetails || "Yes" : "No"
    );
    addLabelValue("Total Rounds", experience.totalRounds);
    addLabelValue("Final Result", experience.finalResult);

    // ============ INTERVIEW ROUNDS ============
    if (pdfRounds.length > 0) {
      addSectionHeader(`INTERVIEW ROUNDS (${pdfRounds.length})`);

      pdfRounds.forEach((round, idx) => {
        checkPageBreak(40);

        // Round header
        pdf.setFillColor(241, 245, 249);
        pdf.rect(margin, yPosition - 3, maxWidth, 8, "F");
        pdf.setFontSize(11);
        pdf.setFont(undefined, "bold");
        pdf.setTextColor(37, 99, 235);
        pdf.text(
          `Round ${idx + 1}: ${round.roundName || "Untitled"}`,
          margin + 3,
          yPosition + 2
        );
        yPosition += 12;

        pdf.setTextColor(0, 0, 0);
        addLabelValue("Platform", round.platform);
        addLabelValue("Duration", round.duration);
        addLabelValue("Cleared", round.cleared ? "Yes" : "No");

        if (round.roundDetails) {
          checkPageBreak(20);
          pdf.setFontSize(10);
          pdf.setFont(undefined, "bold");
          pdf.text("Round Details:", margin, yPosition);
          yPosition += 5;
          pdf.setFont(undefined, "normal");
          const detailLines = pdf.splitTextToSize(
            round.roundDetails,
            maxWidth - 5
          );
          detailLines.forEach((line) => {
            checkPageBreak();
            pdf.text(line, margin + 5, yPosition);
            yPosition += 5;
          });
          yPosition += 3;
        }

        if (round.topicsCovered) {
          checkPageBreak(20);
          pdf.setFontSize(10);
          pdf.setFont(undefined, "bold");
          pdf.text("Topics Covered:", margin, yPosition);
          yPosition += 5;
          pdf.setFont(undefined, "normal");
          const topicLines = pdf.splitTextToSize(
            round.topicsCovered,
            maxWidth - 5
          );
          topicLines.forEach((line) => {
            checkPageBreak();
            pdf.text(line, margin + 5, yPosition);
            yPosition += 5;
          });
          yPosition += 3;
        }

        if (round.comments) {
          checkPageBreak(20);
          pdf.setFontSize(10);
          pdf.setFont(undefined, "bold");
          pdf.text("Tips & Comments:", margin, yPosition);
          yPosition += 5;
          pdf.setFont(undefined, "normal");
          const commentLines = pdf.splitTextToSize(
            round.comments,
            maxWidth - 5
          );
          commentLines.forEach((line) => {
            checkPageBreak();
            pdf.text(line, margin + 5, yPosition);
            yPosition += 5;
          });
          yPosition += 3;
        }

        if (round.studyLinks) {
          checkPageBreak(20);
          pdf.setFontSize(10);
          pdf.setFont(undefined, "bold");
          pdf.text("Study Resources:", margin, yPosition);
          yPosition += 5;
          pdf.setFont(undefined, "normal");
          const links = round.studyLinks.split("\n").filter((l) => l.trim());
          links.forEach((link) => {
            checkPageBreak();
            pdf.setTextColor(37, 99, 235);
            pdf.text("• " + link.trim(), margin + 5, yPosition);
            yPosition += 5;
          });
          pdf.setTextColor(0, 0, 0);
          yPosition += 3;
        }

        // Questions if any
        if (
          round.questions &&
          round.questions.length > 0 &&
          round.questions.some((q) => q.question)
        ) {
          checkPageBreak(20);
          pdf.setFontSize(10);
          pdf.setFont(undefined, "bold");
          pdf.text("Questions Asked:", margin, yPosition);
          yPosition += 5;
          pdf.setFont(undefined, "normal");

          round.questions
            .filter((q) => q.question)
            .forEach((q, qIdx) => {
              checkPageBreak(15);
              if (q.domain) {
                pdf.setTextColor(124, 58, 237);
                pdf.text(`[${q.domain}]`, margin + 5, yPosition);
                yPosition += 5;
              }
              pdf.setTextColor(0, 0, 0);
              const qLines = pdf.splitTextToSize(
                `Q${qIdx + 1}: ${q.question}`,
                maxWidth - 10
              );
              qLines.forEach((line) => {
                checkPageBreak();
                pdf.text(line, margin + 5, yPosition);
                yPosition += 5;
              });
              if (q.approach) {
                pdf.setTextColor(100, 100, 100);
                const aLines = pdf.splitTextToSize(
                  `Approach: ${q.approach}`,
                  maxWidth - 10
                );
                aLines.forEach((line) => {
                  checkPageBreak();
                  pdf.text(line, margin + 10, yPosition);
                  yPosition += 5;
                });
              }
              pdf.setTextColor(0, 0, 0);
              yPosition += 3;
            });
        }

        yPosition += 5;
      });
    }

    // ============ OVERALL SUMMARY ============
    addSectionHeader("OVERALL SUMMARY & TIPS");

    if (experience.overallExperience) {
      checkPageBreak(20);
      pdf.setFontSize(10);
      pdf.setFont(undefined, "bold");
      pdf.text("Overall Experience:", margin, yPosition);
      yPosition += 5;
      pdf.setFont(undefined, "normal");
      const expLines = pdf.splitTextToSize(
        experience.overallExperience,
        maxWidth - 5
      );
      expLines.forEach((line) => {
        checkPageBreak();
        pdf.text(line, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 5;
    }

    if (experience.generalTips) {
      checkPageBreak(20);
      pdf.setFontSize(10);
      pdf.setFont(undefined, "bold");
      pdf.text("General Tips:", margin, yPosition);
      yPosition += 5;
      pdf.setFont(undefined, "normal");
      const tipLines = pdf.splitTextToSize(
        experience.generalTips,
        maxWidth - 5
      );
      tipLines.forEach((line) => {
        checkPageBreak();
        pdf.text(line, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 5;
    }

    if (experience.areasToPrepareFinal) {
      checkPageBreak(20);
      pdf.setFontSize(10);
      pdf.setFont(undefined, "bold");
      pdf.text("Areas to Prepare:", margin, yPosition);
      yPosition += 5;
      pdf.setFont(undefined, "normal");
      const areaLines = pdf.splitTextToSize(
        experience.areasToPrepareFinal,
        maxWidth - 5
      );
      areaLines.forEach((line) => {
        checkPageBreak();
        pdf.text(line, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 5;
    }

    if (experience.suggestedResources) {
      checkPageBreak(20);
      pdf.setFontSize(10);
      pdf.setFont(undefined, "bold");
      pdf.text("Suggested Resources:", margin, yPosition);
      yPosition += 5;
      pdf.setFont(undefined, "normal");
      const resLines = pdf.splitTextToSize(
        experience.suggestedResources,
        maxWidth - 5
      );
      resLines.forEach((line) => {
        checkPageBreak();
        pdf.text(line, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 5;
    }

    // ============ CONTACT INFORMATION ============
    if (experience.contactEmail || experience.contactPhone) {
      addSectionHeader("CONTACT INFORMATION");
      addLabelValue("Email", experience.contactEmail);
      addLabelValue("Phone", experience.contactPhone);
      if (experience.linkedinProfile) {
        addLabelValue("LinkedIn", experience.linkedinProfile);
      }
    }

    // ============ ATTACHED RESOURCES ============
    if (experience.attachmentFileName) {
      addSectionHeader("STUDY MATERIALS");
      addLabelValue("Attached File", experience.attachmentFileName);
      if (experience.attachmentSize) {
        const sizeInMB = (experience.attachmentSize / 1024 / 1024).toFixed(2);
        addLabelValue("File Size", `${sizeInMB} MB`);
      }
      if (experience.attachmentUrl) {
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text("(Download available in web version)", margin + 5, yPosition);
        yPosition += 5;
      }
      yPosition += 5;
    }

    // ============ FOOTER ============
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `Generated from PlaceTrack | Page ${i} of ${totalPages} | ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
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

  // Parse rounds from JSON
  let rounds = [];
  try {
    if (experience.roundsJson) {
      rounds = JSON.parse(experience.roundsJson);
    }
  } catch (e) {
    console.error("Error parsing rounds:", e);
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
      {/* Header Section with Back Button */}
      <div className="detail-header">
        <button
          className="back-link-hero"
          onClick={() => window.history.back()}
        >
          <FiArrowLeft /> Back
        </button>
        <div className="header-info">
          <div className="company-badge">{experience.companyName}</div>
          <h1>
            {experience.position || "Interview Experience"}
          </h1>
          <div className="header-meta">
            <span>
              <FiUser /> {experience.studentName}
            </span>
            <span>
              <FiCalendar />{" "}
              {experience.yearOfPlacement || new Date().getFullYear()}
            </span>
            <span>
              <FiLayers /> {experience.totalRounds || 0} Rounds
            </span>
          </div>
        </div>
        <div className="header-actions">
          <button className="action-btn download" onClick={handleDownloadPDF}>
            <FiDownload />
            Download PDF
          </button>
          {canModify() && (
            <button className="action-btn delete" onClick={handleDelete}>
              <FiTrash2 />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="detail-content">
        {/* Student Info Section */}
        <section className="content-section">
          <div className="section-header">
            <FiUser className="section-icon" />
            <h2>Interview Information</h2>
          </div>
          <div className="section-body info-grid">
            <div className="info-item">
              <strong>Student:</strong> {experience.studentName}
            </div>
            <div className="info-item">
              <strong>Company:</strong> {experience.companyName}
            </div>
            <div className="info-item">
              <strong>Position:</strong> {experience.position || "N/A"}
            </div>
            <div className="info-item">
              <strong>Year:</strong>{" "}
              {experience.yearOfPlacement || new Date().getFullYear()}
            </div>
          </div>
        </section>

        {/* Interview Process Overview */}
        <section className="content-section">
          <div className="section-header">
            <FiTarget className="section-icon" />
            <h2>Interview Process</h2>
          </div>
          <div className="section-body info-grid">
            <div className="info-item">
              <strong>Total Rounds:</strong> {experience.totalRounds || 0}
            </div>
            <div className="info-item">
              <strong>Willing to Mentor:</strong>{" "}
              {experience.willingToMentor ? "Yes" : "No"}
            </div>
          </div>
        </section>

        {/* Interview Rounds Section */}
        {experience.roundsDescription && (
          <section className="content-section rounds-section">
            <div className="section-header">
              <FiLayers className="section-icon" />
              <h2>Interview Rounds Description</h2>
            </div>
            <div className="section-body">
              <p className="interview-text">{experience.roundsDescription}</p>
            </div>
          </section>
        )}

        {/* Questions Asked */}
        {experience.questionsAsked && (
          <section className="content-section">
            <div className="section-header">
              <FiHelpCircle className="section-icon" />
              <h2>Questions Asked</h2>
            </div>
            <div className="section-body">
              <p className="interview-text">{experience.questionsAsked}</p>
            </div>
          </section>
        )}

        {/* Problems Solved */}
        {experience.problemsSolved && (
          <section className="content-section">
            <div className="section-header">
              <FiTarget className="section-icon" />
              <h2>Problems Solved</h2>
            </div>
            <div className="section-body">
              <p className="interview-text">{experience.problemsSolved}</p>
            </div>
          </section>
        )}

        {/* In-Person Interview Tips */}
        {experience.inPersonInterviewTips && (
          <section className="content-section">
            <div className="section-header">
              <FiMessageCircle className="section-icon" />
              <h2>In-Person Interview Tips</h2>
            </div>
            <div className="section-body">
              <p className="interview-text">{experience.inPersonInterviewTips}</p>
            </div>
          </section>
        )}

        {/* Cracking Strategy */}
        {experience.crackingStrategy && (
          <section className="content-section highlight">
            <div className="section-header">
              <FiBook className="section-icon" />
              <h2>Cracking Strategy</h2>
            </div>
            <div className="section-body">
              <p className="interview-text">{experience.crackingStrategy}</p>
            </div>
          </section>
        )}

        {/* Preparation Details */}
        {experience.preparationDetails && (
          <section className="content-section">
            <div className="section-header">
              <FiBook className="section-icon" />
              <h2>Preparation Details</h2>
            </div>
            <div className="section-body">
              <p className="interview-text">{experience.preparationDetails}</p>
            </div>
          </section>
        )}

        {/* Resources */}
        {experience.resources && (
          <section className="content-section">
            <div className="section-header">
              <FiBook className="section-icon" />
              <h2>Resources</h2>
            </div>
            <div className="section-body">
              <p className="interview-text">{experience.resources}</p>
            </div>
          </section>
        )}

        {/* Overall Experience - removed as it's not in InterviewExperience entity */}

        {/* General Tips - removed as it's not in InterviewExperience entity */}

        {/* Areas to Prepare - removed as it's not in InterviewExperience entity */}

        {/* Suggested Resources - removed as it's not in InterviewExperience entity */}

        {/* Attachments/Resources Download */}
        {experience.attachmentFileName && (
          <section className="content-section">
            <div className="section-header">
              <FiFileText className="section-icon" />
              <h2>Study Materials</h2>
            </div>
            <div className="section-body">
              <div className={`attachment-download-card ${!experience.attachmentUrl ? 'pending' : ''}`}>
                <div className="attachment-info">
                  <div className="attachment-icon">
                    <FiFileText size={32} />
                  </div>
                  <div className="attachment-details">
                    <h4>{experience.attachmentFileName}</h4>
                    <p className="attachment-size">
                      {experience.attachmentSize
                        ? `${(experience.attachmentSize / 1024 / 1024).toFixed(2)} MB`
                        : "Size unknown"}
                    </p>
                    <p className="attachment-description">
                      Study materials, resources, and preparation guides shared by{" "}
                      {experience.studentName}
                    </p>
                  </div>
                </div>
                {experience.attachmentUrl ? (
                  <a
                    href={`http://localhost:8080${experience.attachmentUrl}`}
                    download={experience.attachmentFileName}
                    className="btn-download-attachment"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(`http://localhost:8080${experience.attachmentUrl}`, "_blank");
                      toast.success("Downloading file...");
                    }}
                  >
                    <FiDownload size={20} />
                    Download ZIP
                  </a>
                ) : (
                  <button className="btn-download-attachment disabled">
                    <FiFileText size={20} />
                    No attachment available
                  </button>
                )}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Contact Card */}
      {(experience.contactEmail ||
        experience.contactPhone ||
        experience.linkedinProfile) && (
        <div className="mentor-card">
          <div className="mentor-header">
            <span className="mentor-badge">Connect with Them</span>
            <h3>{experience.studentName}</h3>
            <p>Get in touch for guidance and mentorship</p>
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
