import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { placementAPI, departmentAPI, adminAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./DepartmentExperiences.css";

const DepartmentExperiences = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [department, setDepartment] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExp, setSelectedExp] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYears, setSelectedYears] = useState({}); // Store selected year for each company
  const [expandedCompanies, setExpandedCompanies] = useState({}); // Track which companies are expanded
  const [expandedExperiences, setExpandedExperiences] = useState({}); // Track which experiences are expanded
  const [activeTab, setActiveTab] = useState("experiences"); // experiences or mentors

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [deptRes, expRes, mentorsRes] = await Promise.all([
        departmentAPI.getById(id),
        placementAPI.getAll(),
        adminAPI.getMentorsByDepartment(id),
      ]);
      setDepartment(deptRes.data);
      const deptExperiences = expRes.data.filter(
        (exp) =>
          exp.department === deptRes.data.departmentCode ||
          exp.department === deptRes.data.departmentName
      );
      setExperiences(deptExperiences);
      setMentors(mentorsRes.data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Group experiences by company (case-insensitive)
  const groupedByCompany = experiences.reduce((acc, exp) => {
    const rawCompany = exp.companyName || "Other";
    // Normalize company name: capitalize first letter, lowercase the rest
    const company =
      rawCompany.charAt(0).toUpperCase() + rawCompany.slice(1).toLowerCase();
    if (!acc[company]) {
      acc[company] = [];
    }
    acc[company].push(exp);
    return acc;
  }, {});

  // Get unique companies from grouped data
  const companies = Object.keys(groupedByCompany).sort();

  const filteredCompanies = companies.filter((company) =>
    company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getYearsForCompany = (companyName) => {
    const companyExps = groupedByCompany[companyName] || [];
    const years = [
      ...new Set(
        companyExps.map(
          (exp) => exp.placementYear || new Date(exp.createdAt).getFullYear()
        )
      ),
    ].sort((a, b) => b - a);
    return years;
  };

  const handleYearSelect = (company, year) => {
    setSelectedYears((prev) => ({
      ...prev,
      [company]: year,
    }));
  };

  const toggleCompany = (companyName) => {
    setExpandedCompanies((prev) => ({
      ...prev,
      [companyName]: !prev[companyName],
    }));
  };

  const toggleExperience = (expId, e) => {
    e.stopPropagation();
    setExpandedExperiences((prev) => ({
      ...prev,
      [expId]: !prev[expId],
    }));
  };

  const getFilteredExperiencesForCompany = (companyName) => {
    const companyExps = groupedByCompany[companyName] || [];
    const selectedYear = selectedYears[companyName];
    const years = getYearsForCompany(companyName);

    if (!selectedYear && years.length > 0) {
      return companyExps.filter((exp) => {
        const expYear =
          exp.placementYear || new Date(exp.createdAt).getFullYear();
        return expYear.toString() === years[0].toString();
      });
    }

    return companyExps.filter((exp) => {
      const expYear =
        exp.placementYear || new Date(exp.createdAt).getFullYear();
      return expYear.toString() === selectedYear;
    });
  };

  const getCompanyInitial = (companyName) => {
    return companyName.charAt(0).toUpperCase();
  };

  const getCompanyColor = (companyName) => {
    const colors = [
      "#10b981",
      "#ec4899",
      "#f59e0b",
      "#8b5cf6",
      "#06b6d4",
      "#3b82f6",
      "#ef4444",
      "#14b8a6",
    ];
    const index = companyName.charCodeAt(0) % colors.length;
    return colors[index];
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
      <div className="page-header">
        <Link to="/" className="back-btn">
          ← Back to Home
        </Link>
        <h1>
          {department?.departmentCode} - {department?.departmentName}
        </h1>
        <p>{experiences.length} interview experiences shared</p>
        {department?.departmentCode === "IT" && (
          <div className="github-section">
            <a
              href="https://github.com/GCT-Open-Source-Community/Interview-Experience-2021.git"
              target="_blank"
              rel="noopener noreferrer"
              className="github-link"
            >
              📚 View Previous Year Experiences (2021) on GitHub
            </a>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "experiences" ? "active" : ""}`}
          onClick={() => setActiveTab("experiences")}
        >
          Experiences ({experiences.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "mentors" ? "active" : ""}`}
          onClick={() => setActiveTab("mentors")}
        >
          Mentors ({mentors.length})
        </button>
      </div>

      {/* Mentors Section */}
      {activeTab === "mentors" && (
        <div className="mentors-section">
          {mentors.length === 0 ? (
            <div className="no-data">
              <p>No mentors assigned to this department yet.</p>
            </div>
          ) : (
            <div className="mentors-grid">
              {mentors.map((mentor) => (
                <div key={mentor.id} className="mentor-card">
                  <div className="mentor-avatar">
                    {mentor.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="mentor-info">
                    <h3>{mentor.fullName}</h3>
                    <p className="mentor-company">{mentor.placedCompany}</p>
                    {mentor.placedPosition && (
                      <p className="mentor-position">{mentor.placedPosition}</p>
                    )}
                    {mentor.placementYear && (
                      <p className="mentor-year">
                        Batch of {mentor.placementYear}
                      </p>
                    )}
                    <div className="mentor-contact">
                      {mentor.email && (
                        <a
                          href={`mailto:${mentor.email}`}
                          className="contact-link"
                        >
                          📧 Email
                        </a>
                      )}
                      {mentor.linkedinProfile && (
                        <a
                          href={mentor.linkedinProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="contact-link"
                        >
                          💼 LinkedIn
                        </a>
                      )}
                    </div>
                    {mentor.departments && mentor.departments.length > 1 && (
                      <div className="mentor-depts">
                        <small>
                          Also mentoring:{" "}
                          {mentor.departments
                            .filter((d) => d.id !== parseInt(id))
                            .map((d) => d.departmentCode)
                            .join(", ")}
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Experiences Section */}
      {activeTab === "experiences" && (
        <>
          {experiences.length > 0 && (
            <div className="search-section">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search by company name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          )}

          {filteredCompanies.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-box">+</div>
              <h3>No experiences yet</h3>
              <p>Be the first to share your interview experience!</p>
              <Link to="/login" className="share-btn">
                Login to Share
              </Link>
            </div>
          ) : (
            <div className="companies-grid-dept">
              {filteredCompanies.map((companyName) => {
                const companyExps = groupedByCompany[companyName];
                const years = getYearsForCompany(companyName);
                const selectedYear =
                  selectedYears[companyName] || years[0]?.toString();
                const filteredExps =
                  getFilteredExperiencesForCompany(companyName);
                const isExpanded = expandedCompanies[companyName] === true;

                return (
                  <div key={companyName} className="company-card-dept">
                    <div
                      className="company-card-header"
                      onClick={() => toggleCompany(companyName)}
                      style={{ cursor: "pointer" }}
                    >
                      <div
                        className="company-avatar"
                        style={{ background: getCompanyColor(companyName) }}
                      >
                        {getCompanyInitial(companyName)}
                      </div>
                      <div className="company-info">
                        <h2>{companyName}</h2>
                        <p>
                          {companyExps.length} experience(s) across{" "}
                          {years.length} year(s)
                        </p>
                      </div>
                      <div className="arrow-icon">{isExpanded ? "▼" : "▶"}</div>
                    </div>

                    {isExpanded && (
                      <>
                        {/* Year Filter */}
                        <div className="year-filter">
                          {years.map((year) => (
                            <button
                              key={year}
                              className={`year-btn ${
                                selectedYear === year.toString() ? "active" : ""
                              }`}
                              onClick={() =>
                                handleYearSelect(companyName, year.toString())
                              }
                            >
                              {year}
                            </button>
                          ))}
                        </div>

                        {/* Experiences List */}
                        <div className="company-experiences-list">
                          {filteredExps.length === 0 ? (
                            <div className="no-exp">
                              No experiences for selected year
                            </div>
                          ) : (
                            filteredExps.map((exp) => {
                              const isExpanded =
                                expandedExperiences[exp.id] || false;
                              return (
                                <div key={exp.id} className="exp-item">
                                  <div
                                    className="exp-header"
                                    onClick={(e) => toggleExperience(exp.id, e)}
                                    style={{ cursor: "pointer" }}
                                  >
                                    <div className="exp-student">
                                      <h4>{exp.studentName}</h4>
                                      <span className="exp-roll">
                                        {exp.rollNumber}
                                      </span>
                                    </div>
                                    <span
                                      className={`result-badge ${exp.finalResult?.toLowerCase()}`}
                                    >
                                      {exp.finalResult}
                                    </span>
                                  </div>
                                  {isExpanded && (
                                    <div className="exp-details">
                                      <div className="exp-meta">
                                        {exp.salary && (
                                          <span className="meta-item">
                                            Salary: {exp.salary}
                                          </span>
                                        )}
                                        {exp.companyType && (
                                          <span className="meta-item">
                                            Type: {exp.companyType}
                                          </span>
                                        )}
                                        <span className="meta-item">
                                          Rounds: {exp.totalRounds}
                                        </span>
                                      </div>
                                      <button
                                        className="view-full-btn"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedExp(exp);
                                        }}
                                      >
                                        View Full Details →
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
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
