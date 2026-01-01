import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiSearch,
  FiFilter,
  FiFileText,
  FiCalendar,
  FiMapPin,
  FiChevronRight,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { experienceAPI, departmentAPI } from "../services/api";
import "./Experiences.css";

const Experiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expResponse, deptResponse] = await Promise.all([
        experienceAPI.getAll(),
        departmentAPI.getAll(),
      ]);
      setExperiences(expResponse.data);
      setDepartments(deptResponse.data);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchData();
      return;
    }
    try {
      setLoading(true);
      const response = await experienceAPI.searchByCompany(searchTerm);
      setExperiences(response.data);
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    try {
      setLoading(true);
      let response;

      if (selectedDepartment && selectedYear) {
        response = await experienceAPI.getByDepartmentAndYear(
          selectedDepartment,
          selectedYear
        );
      } else if (selectedDepartment) {
        response = await experienceAPI.getByDepartment(selectedDepartment);
      } else if (selectedYear) {
        response = await experienceAPI.getByYear(selectedYear);
      } else {
        response = await experienceAPI.getAll();
      }

      setExperiences(response.data);
    } catch (error) {
      toast.error("Filter failed");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDepartment("");
    setSelectedYear("");
    fetchData();
  };

  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - i
  );

  const getCompanyColor = (company) => {
    const colors = {
      google: "linear-gradient(135deg, #4285f4, #34a853)",
      microsoft: "linear-gradient(135deg, #00a4ef, #7fba00)",
      amazon: "linear-gradient(135deg, #ff9900, #146eb4)",
      meta: "linear-gradient(135deg, #1877f2, #42b72a)",
      apple: "linear-gradient(135deg, #555555, #000000)",
      netflix: "linear-gradient(135deg, #e50914, #b81d24)",
    };
    const lowerCompany = company.toLowerCase();
    for (const [key, value] of Object.entries(colors)) {
      if (lowerCompany.includes(key)) return value;
    }
    return "linear-gradient(135deg, var(--primary), var(--primary-dark))";
  };

  // Group experiences by company
  const groupedExperiences = experiences.reduce((acc, exp) => {
    const companyName = exp.companyName;
    if (!acc[companyName]) {
      acc[companyName] = [];
    }
    acc[companyName].push(exp);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading experiences...</p>
      </div>
    );
  }

  return (
    <div className="experiences-page">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <FiFileText className="header-icon" />
            Interview Experiences
          </h1>
          <p>Learn from real interview experiences shared by placed students</p>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="search-filter-section">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by company name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="search-btn" onClick={handleSearch}>
            Search
          </button>
        </div>

        <div className="filters">
          <div className="filter-group">
            <FiFilter className="filter-icon" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.departmentName}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <FiCalendar className="filter-icon" />
            <select
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
          </div>

          <button className="filter-btn" onClick={handleFilter}>
            Apply
          </button>
          <button className="clear-btn" onClick={clearFilters}>
            Clear
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-info">
        <span>
          {experiences.length} experience{experiences.length !== 1 ? "s" : ""}{" "}
          found
        </span>
      </div>

      {/* Experiences Grid */}
      {experiences.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No experiences found</h3>
          <p>Try adjusting your search or filters</p>
          <button className="btn btn-secondary" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="company-groups-container">
          {Object.entries(groupedExperiences).map(([companyName, companyExperiences]) => (
            <div key={companyName} className="company-group">
              <div 
                className="company-group-header"
                style={{ background: getCompanyColor(companyName) }}
              >
                <h2 className="company-group-title">{companyName}</h2>
                <span className="company-count">{companyExperiences.length} experience{companyExperiences.length > 1 ? 's' : ''}</span>
              </div>
              <div className="company-experiences-grid">
                {companyExperiences.map((exp) => (
                  <Link
                    to={`/experiences/${exp.id}`}
                    key={exp.id}
                    className="experience-card-compact"
                  >
                    <div className="card-year-badge">{exp.yearOfPlacement}</div>
                    <div className="card-body-compact">
                      <h3 className="position-title">{exp.position}</h3>
                      <p className="student-name-compact">by {exp.studentName}</p>

                      <div className="card-meta-compact">
                        <span className="meta-item">
                          <FiMapPin />
                          {exp.departmentName}
                        </span>
                        <span className="meta-item">
                          <FiCalendar />
                          {exp.totalRounds} Rounds
                        </span>
                      </div>

                      <p className="preview-text-compact">
                        {exp.crackingStrategy?.substring(0, 80)}...
                      </p>

                      {exp.willingToMentor && (
                        <span className="mentor-badge-compact">✨ Mentor Available</span>
                      )}
                    </div>
                    <div className="card-footer-compact">
                      <span>Read full experience</span>
                      <FiChevronRight />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Experiences;
