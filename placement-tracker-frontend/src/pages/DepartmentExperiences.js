import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft, FiUsers, FiFileText } from "react-icons/fi";
import { experienceAPI, departmentAPI, adminAPI } from "../services/api";
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
        experienceAPI.getByDepartment(id),
        adminAPI.getMentorsByDepartment(id),
      ]);
      setDepartment(deptRes.data);
      setExperiences(expRes.data);
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
          (exp) => exp.yearOfPlacement || new Date(exp.submittedAt).getFullYear()
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
          exp.yearOfPlacement || new Date(exp.submittedAt).getFullYear();
        return expYear.toString() === years[0].toString();
      });
    }

    return companyExps.filter((exp) => {
      const expYear =
        exp.yearOfPlacement || new Date(exp.submittedAt).getFullYear();
      return expYear.toString() === selectedYear;
    });
  };

  const getCompanyInitials = (companyName) => {
    // Split by spaces and take first letter of each word (max 2)
    const words = companyName.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    // For single word, take first 2 letters
    return companyName.substring(0, 2).toUpperCase();
  };

  const getCompanyColor = (companyName) => {
    const lowerName = companyName.toLowerCase();

    // Specific colors for known companies
    const companyColors = {
      google: "linear-gradient(135deg, #4285f4, #34a853)",
      microsoft: "linear-gradient(135deg, #00a4ef, #f65314)",
      amazon: "linear-gradient(135deg, #ff9900, #232f3e)",
      meta: "linear-gradient(135deg, #0668e1, #1877f2)",
      facebook: "linear-gradient(135deg, #0668e1, #1877f2)",
      apple: "linear-gradient(135deg, #000000, #555555)",
      netflix: "linear-gradient(135deg, #e50914, #b20710)",
      adobe: "linear-gradient(135deg, #ff0000, #cc0000)",
      tesla: "linear-gradient(135deg, #cc0000, #8b0000)",
      spotify: "linear-gradient(135deg, #1db954, #1ed760)",
      uber: "linear-gradient(135deg, #000000, #1a1a1a)",
      tcs: "linear-gradient(135deg, #0066b2, #004080)",
      infosys: "linear-gradient(135deg, #007cc3, #0059a0)",
      wipro: "linear-gradient(135deg, #a01772, #7d1258)",
      zoho: "linear-gradient(135deg, #e42527, #c41e1e)",
      flipkart: "linear-gradient(135deg, #2874f0, #1e5bc6)",
      mobicip: "linear-gradient(135deg, #667eea, #764ba2)",
    };

    // Check if company name contains any of the keywords
    for (const [key, color] of Object.entries(companyColors)) {
      if (lowerName.includes(key)) {
        return color;
      }
    }

    // Default gradient colors based on first letter
    const colors = [
      "linear-gradient(135deg, #667eea, #764ba2)",
      "linear-gradient(135deg, #f093fb, #f5576c)",
      "linear-gradient(135deg, #4facfe, #00f2fe)",
      "linear-gradient(135deg, #43e97b, #38f9d7)",
      "linear-gradient(135deg, #fa709a, #fee140)",
      "linear-gradient(135deg, #30cfd0, #330867)",
      "linear-gradient(135deg, #a8edea, #fed6e3)",
      "linear-gradient(135deg, #ff9a9e, #fecfef)",
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
      {/* Hero Header with Back Link */}
      <div className="page-hero">
        <button
          className="back-link-hero"
          onClick={() => window.history.back()}
        >
          <FiArrowLeft /> Back
        </button>
        <div className="hero-content">
          <h1>{department?.departmentName}</h1>
          <p>{experiences.length} interview experiences shared</p>
          {department?.departmentCode === "IT" && (
            <a
              href="https://github.com/GCT-Open-Source-Community/Interview-Experience-2021.git"
              target="_blank"
              rel="noopener noreferrer"
              className="github-link"
            >
              View Previous Year Experiences (2021) on GitHub
            </a>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "experiences" ? "active" : ""}`}
          onClick={() => setActiveTab("experiences")}
        >
          <FiFileText /> Experiences ({experiences.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "mentors" ? "active" : ""}`}
          onClick={() => setActiveTab("mentors")}
        >
          <FiUsers /> Mentors ({mentors.length})
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
                          Email
                        </a>
                      )}
                      {mentor.linkedinProfile && (
                        <a
                          href={mentor.linkedinProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="contact-link"
                        >
                          LinkedIn
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
                const totalExperiences = companyExps.length;

                return (
                  <Link
                    key={companyName}
                    to="/experiences"
                    state={{ searchCompany: companyName, departmentId: id, departmentName: department?.departmentName }}
                    className="company-card-dept"
                  >
                    <div className="company-content">
                      <h2 className="company-name">{companyName}</h2>
                      <p className="company-stats">
                        {totalExperiences} experience
                        {totalExperiences !== 1 ? "s" : ""} • {years.length}{" "}
                        year{years.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DepartmentExperiences;
