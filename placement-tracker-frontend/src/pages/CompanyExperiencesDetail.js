import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { placementAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./CompanyExperiencesDetail.css";

const CompanyExperiencesDetail = () => {
  const { departmentId, companyName } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExp, setSelectedExp] = useState(null);

  useEffect(() => {
    fetchExperiences();
  }, [companyName]);

  const fetchExperiences = async () => {
    try {
      const response = await placementAPI.getAll();
      const companyExps = response.data.filter(
        (exp) =>
          exp.companyName?.toLowerCase() === decodeURIComponent(companyName).toLowerCase()
      );
      setExperiences(companyExps);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCompanyLogo = (companyName) => {
    const name = companyName?.toLowerCase() || "";
    // Return company logo URL or fallback to initials
    const logos = {
      google: "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
      microsoft: "https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b",
      amazon: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
      meta: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
      facebook: "https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png",
    };
    
    for (const [key, url] of Object.entries(logos)) {
      if (name.includes(key)) return url;
    }
    return null;
  };

  const getCompanyInitial = (companyName) => {
    return companyName?.charAt(0).toUpperCase() || "C";
  };

  const getCompanyColor = (companyName) => {
    const colors = [
      "#667eea", "#f56565", "#48bb78", "#ed8936", 
      "#9f7aea", "#38b2ac", "#4299e1", "#ec4899"
    ];
    const index = (companyName?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="company-detail-loading">
        <div className="loader"></div>
        <p>Loading experiences...</p>
      </div>
    );
  }

  return (
    <div className="company-detail-page">
      {/* Header */}
      <div className="company-detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="company-header-content">
          {getCompanyLogo(decodeURIComponent(companyName)) ? (
            <img
              src={getCompanyLogo(decodeURIComponent(companyName))}
              alt={decodeURIComponent(companyName)}
              className="company-logo-large"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="company-logo-fallback"
            style={{
              background: getCompanyColor(decodeURIComponent(companyName)),
              display: getCompanyLogo(decodeURIComponent(companyName)) ? "none" : "flex",
            }}
          >
            {getCompanyInitial(decodeURIComponent(companyName))}
          </div>
          <div className="company-title-section">
            <h1>{decodeURIComponent(companyName)}</h1>
            <p>{experiences.length} interview experiences shared</p>
          </div>
        </div>
      </div>

      {/* Experiences Grid */}
      {experiences.length === 0 ? (
        <div className="no-experiences">
          <p>No experiences found for the selected year.</p>
        </div>
      ) : (
        <div className="experiences-grid-detail">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="experience-card-detail"
              onClick={() => setSelectedExp(exp)}
            >
              <div className="card-header-detail">
                <h3>{exp.studentName}</h3>
                <span className={`result-badge ${exp.finalResult?.toLowerCase()}`}>
                  {exp.finalResult}
                </span>
              </div>
              <div className="card-body-detail">
                <div className="card-meta-detail">
                  <span className="meta-item-detail">
                    📅 {exp.placementYear || new Date(exp.createdAt).getFullYear()}
                  </span>
                  <span className="meta-item-detail">
                    🎯 {exp.totalRounds} Rounds
                  </span>
                  {exp.salary && (
                    <span className="meta-item-detail">💰 {exp.salary}</span>
                  )}
                </div>
                <div className="card-info-detail">
                  <p><strong>Roll:</strong> {exp.rollNumber}</p>
                  <p><strong>Department:</strong> {exp.department}</p>
                  {exp.companyType && (
                    <p><strong>Type:</strong> {exp.companyType}</p>
                  )}
                </div>
              </div>
              <button className="view-details-btn">
                View Full Experience →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Full Experience Details */}
      {selectedExp && (
        <div className="modal-overlay" onClick={() => setSelectedExp(null)}>
          <div
            className="modal-content experience-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-btn" onClick={() => setSelectedExp(null)}>
              ×
            </button>

            {/* Header */}
            <div className="exp-detail-header">
              <div className="company-info">
                <div className="company-logo-modal">
                  {getCompanyInitial(selectedExp.companyName)}
                </div>
                <div>
                  <h2>{selectedExp.companyName}</h2>
                  <span className="company-type-badge">
                    {selectedExp.companyType || "Company"}
                  </span>
                </div>
              </div>
              <span
                className={`result-badge-large ${selectedExp.finalResult
                  ?.toLowerCase()
                  .replace(" ", "-")}`}
              >
                {selectedExp.finalResult}
              </span>
            </div>

            {/* Student Details */}
            <div className="detail-section">
              <h4>👤 Student Details</h4>
              <div className="detail-grid">
                <p>
                  <strong>Name:</strong> {selectedExp.studentName}
                </p>
                <p>
                  <strong>Roll Number:</strong> {selectedExp.rollNumber || "N/A"}
                </p>
                <p>
                  <strong>Department:</strong> {selectedExp.department}
                </p>
                <p>
                  <strong>Email:</strong> {selectedExp.personalEmail || "N/A"}
                </p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="detail-section contact-section">
              <h4>📞 Connect with {selectedExp.studentName?.split(" ")[0] || "Student"}</h4>
              <div className="contact-buttons-modal">
                {selectedExp.personalEmail && (
                  <a
                    href={`mailto:${selectedExp.personalEmail}`}
                    className="contact-btn-modal email"
                  >
                    📧 Email
                  </a>
                )}
                {selectedExp.phoneNumber && (
                  <a
                    href={`tel:${selectedExp.phoneNumber}`}
                    className="contact-btn-modal phone"
                  >
                    📱 Call
                  </a>
                )}
              </div>
            </div>

            {/* Company & Package Details */}
            <div className="detail-section">
              <h4>💼 Company & Package</h4>
              <div className="detail-grid">
                <p>
                  <strong>Salary/CTC:</strong> {selectedExp.salary || "Not disclosed"}
                </p>
                <p>
                  <strong>Intern Offered:</strong> {selectedExp.internOffered ? "✅ Yes" : "❌ No"}
                </p>
                <p>
                  <strong>Bond:</strong> {selectedExp.hasBond ? `Yes - ${selectedExp.bondDetails}` : "No"}
                </p>
              </div>
            </div>

            {/* Interview Rounds */}
            <div className="detail-section rounds-section">
              <h4>🎯 Interview Rounds ({selectedExp.totalRounds || "N/A"} Rounds)</h4>
              {(() => {
                let rounds = [];
                try {
                  rounds = selectedExp.roundsJson ? JSON.parse(selectedExp.roundsJson) : [];
                } catch (e) {
                  rounds = [];
                }

                if (rounds.length === 0) {
                  return <p className="no-data">No round details available</p>;
                }

                return (
                  <div className="rounds-container">
                    {rounds.map((round, idx) => (
                      <div key={idx} className="round-card">
                        <div className="round-header">
                          <span className="round-number">Round {round.roundNumber || idx + 1}</span>
                          <span className="round-name">{round.roundName || "Interview Round"}</span>
                          <span className={`round-status ${round.cleared ? "cleared" : "not-cleared"}`}>
                            {round.cleared ? "✅ Cleared" : "❌ Not Cleared"}
                          </span>
                        </div>
                        <div className="round-body">
                          <p><strong>Platform:</strong> {round.platform || "N/A"}</p>
                          <p><strong>Duration:</strong> {round.duration || "N/A"}</p>
                          {round.roundDetails && (
                            <div className="round-details">
                              <strong>Details:</strong>
                              <p>{round.roundDetails}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Overall Experience */}
            {selectedExp.overallExperience && (
              <div className="detail-section">
                <h4>📝 Overall Experience</h4>
                <p className="detail-text">{selectedExp.overallExperience}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyExperiencesDetail;
