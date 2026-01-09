import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { placementAPI } from "../services/api";
import { toast } from "react-toastify";
import { FiSearch, FiArrowLeft, FiBriefcase } from "react-icons/fi";
import "./CompanyExperiences.css";

const CompanyExperiences = () => {
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYears, setSelectedYears] = useState({}); // Store selected year for each company
  const [expandedCompanies, setExpandedCompanies] = useState({}); // Track which companies are expanded
  const [expandedExperiences, setExpandedExperiences] = useState({}); // Track which experiences are expanded

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const response = await placementAPI.getAll();
      setExperiences(response.data);
    } catch (error) {
      console.error("Error fetching experiences:", error);
      toast.error("Failed to load experiences");
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

  const companies = Object.keys(groupedByCompany)
    .filter((company) =>
      company.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort();

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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading experiences...</p>
      </div>
    );
  }

  return (
    <div className="company-experiences-page">
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
            <FiBriefcase className="header-icon" /> Experiences by Company
          </h1>
          <p>Browse interview experiences organized by company</p>
        </div>
      </div>

      <div className="search-section">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search for a company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="companies-grid">
        {companies.length === 0 ? (
          <div className="no-data">
            <p>No experiences found</p>
          </div>
        ) : (
          companies.map((companyName) => {
            const companyExps = groupedByCompany[companyName];
            const years = getYearsForCompany(companyName);
            const selectedYear =
              selectedYears[companyName] || years[0]?.toString();
            const filteredExps = getFilteredExperiencesForCompany(companyName);
            const isExpanded = expandedCompanies[companyName] === true;

            return (
              <div key={companyName} className="company-card">
                <div
                  className="company-card-header"
                  onClick={() => toggleCompany(companyName)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="company-info">
                    <h2>{companyName}</h2>
                    <p>
                      {companyExps.length} experience(s) across {years.length}{" "}
                      year(s)
                    </p>
                  </div>
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
                                  <span className="exp-dept">
                                    {exp.department}
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
                                      navigate(`/experience/${exp.id}`);
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
                    </div>{" "}
                  </>
                )}{" "}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CompanyExperiences;
