import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { placementAPI } from "../services/api";
import { toast } from "react-toastify";
import { FiChevronDown, FiChevronRight, FiSearch } from "react-icons/fi";
import "./CompanyExperiences.css";

const CompanyExperiences = () => {
  const navigate = useNavigate();
  const [groupedExperiences, setGroupedExperiences] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedCompanies, setExpandedCompanies] = useState({});
  const [expandedYears, setExpandedYears] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchGroupedExperiences();
  }, []);

  const fetchGroupedExperiences = async () => {
    try {
      setLoading(true);
      const response = await placementAPI.getGroupedByCompany();
      setGroupedExperiences(response.data);
    } catch (error) {
      console.error("Error fetching experiences:", error);
      toast.error("Failed to load experiences");
    } finally {
      setLoading(false);
    }
  };

  const toggleCompany = (companyName) => {
    setExpandedCompanies(prev => ({
      ...prev,
      [companyName]: !prev[companyName]
    }));
  };

  const toggleYear = (companyName, year) => {
    const key = `${companyName}-${year}`;
    setExpandedYears(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredCompanies = Object.keys(groupedExperiences).filter(company =>
    company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCompanyInitial = (companyName) => {
    return companyName.charAt(0).toUpperCase();
  };

  const getCompanyColor = (companyName) => {
    const colors = [
      '#667eea', '#764ba2', '#f093fb', '#4facfe',
      '#43e97b', '#fa709a', '#fee140', '#30cfd0'
    ];
    const index = companyName.charCodeAt(0) % colors.length;
    return colors[index];
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
      <div className="page-header">
        <h1>Placement Experiences by Company</h1>
        <p>Browse previous year experiences organized by company</p>
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

      <div className="companies-container">
        {filteredCompanies.length === 0 ? (
          <div className="no-data">
            <p>No experiences found</p>
          </div>
        ) : (
          filteredCompanies.map(companyName => {
            const yearData = groupedExperiences[companyName];
            const years = Object.keys(yearData).sort((a, b) => b - a);
            const totalExperiences = years.reduce((sum, year) => sum + yearData[year].length, 0);
            const isCompanyExpanded = expandedCompanies[companyName];

            return (
              <div key={companyName} className="company-section">
                <div 
                  className="company-header" 
                  onClick={() => toggleCompany(companyName)}
                >
                  <div className="company-info">
                    <div 
                      className="company-avatar"
                      style={{ background: getCompanyColor(companyName) }}
                    >
                      {getCompanyInitial(companyName)}
                    </div>
                    <div className="company-details">
                      <h2>{companyName}</h2>
                      <p>{totalExperiences} experience(s) across {years.length} year(s)</p>
                    </div>
                  </div>
                  <div className="expand-icon">
                    {isCompanyExpanded ? <FiChevronDown /> : <FiChevronRight />}
                  </div>
                </div>

                {isCompanyExpanded && (
                  <div className="years-container">
                    {years.map(year => {
                      const experiences = yearData[year];
                      const yearKey = `${companyName}-${year}`;
                      const isYearExpanded = expandedYears[yearKey];

                      return (
                        <div key={year} className="year-section">
                          <div 
                            className="year-header"
                            onClick={() => toggleYear(companyName, year)}
                          >
                            <div className="year-info">
                              <h3>Year {year}</h3>
                              <span className="experience-count">{experiences.length} student(s)</span>
                            </div>
                            <div className="expand-icon-small">
                              {isYearExpanded ? <FiChevronDown /> : <FiChevronRight />}
                            </div>
                          </div>

                          {isYearExpanded && (
                            <div className="experiences-list">
                              {experiences.map(exp => (
                                <div 
                                  key={exp.id} 
                                  className="experience-card"
                                  onClick={() => navigate(`/experience/${exp.id}`)}
                                >
                                  <div className="exp-header">
                                    <h4>{exp.studentName}</h4>
                                    <span className={`result-badge ${exp.finalResult.toLowerCase()}`}>
                                      {exp.finalResult}
                                    </span>
                                  </div>
                                  <div className="exp-details">
                                    <p><strong>Department:</strong> {exp.department}</p>
                                    <p><strong>Roll No:</strong> {exp.rollNumber}</p>
                                    {exp.salary && <p><strong>Package:</strong> {exp.salary}</p>}
                                    {exp.companyType && <p><strong>Type:</strong> {exp.companyType}</p>}
                                    <p><strong>Rounds:</strong> {exp.totalRounds}</p>
                                  </div>
                                  <div className="exp-footer">
                                    <span>Click to view full experience</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CompanyExperiences;
