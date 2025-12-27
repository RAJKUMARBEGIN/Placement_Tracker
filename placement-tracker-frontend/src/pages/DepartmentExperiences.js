import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { placementAPI, departmentAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./DepartmentExperiences.css";

const DepartmentExperiences = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [department, setDepartment] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExp, setSelectedExp] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [deptRes, expRes] = await Promise.all([
        departmentAPI.getById(id),
        placementAPI.getAll(),
      ]);
      setDepartment(deptRes.data);
      const deptExperiences = expRes.data.filter(
        (exp) =>
          exp.department === deptRes.data.departmentCode ||
          exp.department === deptRes.data.departmentName
      );
      setExperiences(deptExperiences);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique companies and years for filter
  const companies = [
    ...new Set(experiences.map((e) => e.companyName).filter(Boolean)),
  ].sort();
  const years = [
    ...new Set(
      experiences
        .map((e) => e.placementYear || new Date(e.createdAt).getFullYear())
        .filter(Boolean)
    ),
  ].sort((a, b) => b - a);

  const filteredExperiences = experiences.filter((exp) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      exp.companyName?.toLowerCase().includes(search) ||
      exp.studentName?.toLowerCase().includes(search);
    const matchesCompany =
      !selectedCompany || exp.companyName === selectedCompany;
    const expYear = exp.placementYear || new Date(exp.createdAt).getFullYear();
    const matchesYear = !selectedYear || expYear?.toString() === selectedYear;
    return matchesSearch && matchesCompany && matchesYear;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCompany("");
    setSelectedYear("");
  };

  if (loading) {
    return (
      <div className="dept-loading">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dept-page">
      <div className="dept-header">
        <Link to="/" className="back-btn">
          ← Back to Home
        </Link>
        <h1>
          {department?.departmentCode} - {department?.departmentName}
        </h1>
        <p>{experiences.length} interview experiences shared</p>
      </div>

      {experiences.length > 0 && (
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by company or student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-controls">
            <select
              className="company-filter"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              <option value="">All Companies</option>
              {companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
            <select
              className="year-filter"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {(searchTerm || selectedCompany || selectedYear) && (
              <button className="clear-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {filteredExperiences.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-box">+</div>
          <h3>No experiences yet</h3>
          <p>Be the first to share your interview experience!</p>
          <Link to="/login" className="share-btn">
            Login to Share
          </Link>
        </div>
      ) : (
        <div className="experiences-grid">
          {filteredExperiences.map((exp) => (
            <div
              key={exp.id}
              className="exp-card"
              onClick={() => setSelectedExp(exp)}
            >
              <div className="exp-header">
                <h3>{exp.companyName}</h3>
                <span
                  className={`result ${exp.finalResult
                    ?.toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {exp.finalResult}
                </span>
              </div>
              <p className="student-name">By {exp.studentName}</p>
              <div className="exp-meta">
                <span>Type: {exp.companyType || "Company"}</span>
                <span>Salary: {exp.salary || "Not disclosed"}</span>
              </div>
              <p className="exp-preview">
                {exp.overallExperience?.substring(0, 100)}...
              </p>
              <button className="view-btn">View Details</button>
            </div>
          ))}
        </div>
      )}

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
                <div className="company-logo-large">
                  {selectedExp.companyName?.charAt(0) || "C"}
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
                  <strong>Roll Number:</strong>{" "}
                  {selectedExp.rollNumber || "N/A"}
                </p>
                <p>
                  <strong>Department:</strong> {selectedExp.department}
                </p>
                <p>
                  <strong>Email:</strong> {selectedExp.personalEmail || "N/A"}
                </p>
              </div>
            </div>

            {/* Contact Details - to connect with the student */}
            <div className="detail-section contact-section">
              <h4>
                📞 Connect with{" "}
                {selectedExp.studentName?.split(" ")[0] || "Student"}
              </h4>
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
                {selectedExp.linkedinProfile && (
                  <a
                    href={
                      selectedExp.linkedinProfile.startsWith("http")
                        ? selectedExp.linkedinProfile
                        : `https://${selectedExp.linkedinProfile}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-btn-modal linkedin"
                  >
                    💼 LinkedIn
                  </a>
                )}
                {!selectedExp.personalEmail &&
                  !selectedExp.phoneNumber &&
                  !selectedExp.linkedinProfile && (
                    <p className="no-contact">Contact details not provided</p>
                  )}
              </div>
            </div>

            {/* Company & Package Details */}
            <div className="detail-section">
              <h4>💼 Company & Package</h4>
              <div className="detail-grid">
                <p>
                  <strong>Company Type:</strong>{" "}
                  {selectedExp.companyType || "N/A"}
                </p>
                <p>
                  <strong>Salary/CTC:</strong>{" "}
                  {selectedExp.salary || "Not disclosed"}
                </p>
                <p>
                  <strong>Intern Offered:</strong>{" "}
                  {selectedExp.internOffered ? "✅ Yes" : "❌ No"}
                </p>
                <p>
                  <strong>Bond:</strong>{" "}
                  {selectedExp.hasBond
                    ? `Yes - ${selectedExp.bondDetails}`
                    : "No"}
                </p>
              </div>
            </div>

            {/* Interview Rounds */}
            <div className="detail-section rounds-section">
              <h4>
                🎯 Interview Rounds ({selectedExp.totalRounds || "N/A"} Rounds)
              </h4>
              {(() => {
                let rounds = [];
                try {
                  rounds = selectedExp.roundsJson
                    ? JSON.parse(selectedExp.roundsJson)
                    : [];
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
                          <span className="round-number">
                            Round {round.roundNumber || idx + 1}
                          </span>
                          <span className="round-name">
                            {round.roundName || "Interview Round"}
                          </span>
                          <span
                            className={`round-status ${
                              round.cleared ? "cleared" : "not-cleared"
                            }`}
                          >
                            {round.cleared ? "✅ Cleared" : "❌ Not Cleared"}
                          </span>
                        </div>
                        <div className="round-body">
                          <p>
                            <strong>Platform:</strong> {round.platform || "N/A"}
                          </p>
                          <p>
                            <strong>Duration:</strong> {round.duration || "N/A"}
                          </p>
                          {round.roundDetails && (
                            <div className="round-details">
                              <strong>Details:</strong>
                              <p>{round.roundDetails}</p>
                            </div>
                          )}
                          {round.topicsCovered && (
                            <div className="round-topics">
                              <strong>Topics Covered:</strong>
                              <p>{round.topicsCovered}</p>
                            </div>
                          )}
                          {round.comments && (
                            <div className="round-comments">
                              <strong>Tips/Comments:</strong>
                              <p>{round.comments}</p>
                            </div>
                          )}
                          {round.studyLinks && (
                            <div className="round-links">
                              <strong>Study Links:</strong>
                              <pre>{round.studyLinks}</pre>
                            </div>
                          )}

                          {/* Questions in this round */}
                          {round.questions && round.questions.length > 0 && (
                            <div className="round-questions">
                              <strong>Questions Asked:</strong>
                              {round.questions.map((q, qIdx) => (
                                <div key={qIdx} className="question-item">
                                  <span className="q-domain">
                                    {q.domain || "General"}
                                  </span>
                                  <p className="q-text">{q.question}</p>
                                  {q.approach && (
                                    <div className="q-approach">
                                      <em>Approach:</em> {q.approach}
                                    </div>
                                  )}
                                  {q.references && (
                                    <div className="q-refs">
                                      <em>References:</em>{" "}
                                      <pre>{q.references}</pre>
                                    </div>
                                  )}
                                </div>
                              ))}
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

            {/* Tips & Resources */}
            {selectedExp.generalTips && (
              <div className="detail-section">
                <h4>💡 General Tips</h4>
                <p className="detail-text">{selectedExp.generalTips}</p>
              </div>
            )}

            {selectedExp.areasToPrepareFinal && (
              <div className="detail-section">
                <h4>📚 Areas to Prepare</h4>
                <p className="detail-text">{selectedExp.areasToPrepareFinal}</p>
              </div>
            )}

            {selectedExp.suggestedResources && (
              <div className="detail-section">
                <h4>🔗 Suggested Resources</h4>
                <pre className="resources-text">
                  {selectedExp.suggestedResources}
                </pre>
              </div>
            )}

            {/* Only show edit button if the logged-in user is the owner */}
            {isAuthenticated() && user?.email === selectedExp.personalEmail && (
              <div className="modal-actions owner-actions">
                <p className="owner-note">
                  ✏️ This is your experience. You can edit it from your
                  dashboard.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentExperiences;
