import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiFilter,
  FiFileText,
  FiCalendar,
  FiMapPin,
  FiChevronRight,
  FiArrowLeft,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { experienceAPI, departmentAPI } from "../services/api";
import "./Experiences.css";

const Experiences = () => {
  const location = useLocation();
  const [experiences, setExperiences] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use API service for proper URL handling
      const expRes = await experienceAPI.getAll();
      const deptRes = await departmentAPI.getAll();

      // Handle both array and object with data property
      const expArray = Array.isArray(expRes.data)
        ? expRes.data
        : expRes.data?.data || [];
      const deptArray = Array.isArray(deptRes.data)
        ? deptRes.data
        : deptRes.data?.data || [];

      setExperiences(expArray);
      setDepartments(deptArray);

      if (expArray.length === 0) {
        setError("No experiences found in database");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setError(error.message);
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterFromDepartment = async (companyName, departmentId) => {
    try {
      setLoading(true);
      console.log("Filtering for company:", companyName, "in department:", departmentId);
      
      // Fetch departments for the filter dropdown
      const deptResponse = await departmentAPI.getAll();
      const deptArray = Array.isArray(deptResponse.data)
        ? deptResponse.data
        : deptResponse.data?.data || [];
      setDepartments(deptArray);
      
      // Get experiences by department first
      const response = await experienceAPI.getByDepartment(departmentId);
      console.log("Got experiences from department:", response.data);
      
      let filteredExps = response.data || [];
      
      // Then filter by company name (exact match after normalization)
      if (companyName) {
        // Normalize: lowercase, trim, and collapse multiple spaces
        const normalizeCompany = (name) => {
          return (name || '').toLowerCase().trim().replace(/\s+/g, ' ').replace(/[.,]/g, '');
        };
        
        const normalizedSearch = normalizeCompany(companyName);
        console.log("Filtering by normalized company name:", normalizedSearch);
        
        filteredExps = filteredExps.filter(exp => {
          const expCompany = normalizeCompany(exp.companyName);
          // Exact match only after normalization
          const matches = expCompany === normalizedSearch;
          console.log(`Comparing "${expCompany}" with "${normalizedSearch}": ${matches}`);
          return matches;
        });
      }
      
      console.log("Filtered results:", filteredExps);
      setExperiences(filteredExps);
    } catch (error) {
      console.error("Filter error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Single useEffect to handle all initial loading scenarios
  useEffect(() => {
    console.log("Location state:", location.state);
    
    // If coming from department page with company filter, handle that case
    if (location.state?.searchCompany && location.state?.departmentId) {
      setSearchTerm(location.state.searchCompany);
      setSelectedDepartment(location.state.departmentId);
      console.log("Calling handleFilterFromDepartment with:", location.state.searchCompany, location.state.departmentId);
      handleFilterFromDepartment(location.state.searchCompany, location.state.departmentId);
    } else {
      fetchData();
    }
  }, []);

  // Auto-filter when department or year selection changes
  useEffect(() => {
    if (!location.state?.searchCompany) {
      // Only auto-filter if we have data and user has interacted with filters
      if (experiences.length > 0 || selectedDepartment || selectedYear) {
        handleFilter();
      }
    }
  }, [selectedDepartment, selectedYear]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await experienceAPI.getAll();
      let filtered = response.data || [];
      
      // Normalize function for company names
      const normalizeCompany = (name) => {
        return (name || '').toLowerCase().trim().replace(/\s+/g, ' ').replace(/[.,]/g, '');
      };
      
      // Filter by search term (company name) - exact match after normalization
      if (searchTerm.trim()) {
        const normalizedSearch = normalizeCompany(searchTerm);
        filtered = filtered.filter(exp => {
          const expCompany = normalizeCompany(exp.companyName);
          // Exact match only
          return expCompany === normalizedSearch;
        });
      }
      
      // Filter by department if selected
      if (selectedDepartment) {
        filtered = filtered.filter(exp => exp.departmentId === selectedDepartment);
      }
      
      // Filter by year if selected
      if (selectedYear) {
        filtered = filtered.filter(exp => exp.yearOfPlacement === parseInt(selectedYear));
      }
      
      setExperiences(filtered);
    } catch (error) {
      console.error("Search error:", error);
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
        // Filter by department and year
        const allExp = await experienceAPI.getAll();
        response = {
          data: allExp.data.filter(
            (exp) =>
              exp.departmentId === selectedDepartment &&
              exp.yearOfPlacement === parseInt(selectedYear)
          ),
        };
      } else if (selectedDepartment) {
        response = await experienceAPI.getByDepartment(selectedDepartment);
      } else if (selectedYear) {
        // Filter by year
        const allExp = await experienceAPI.getAll();
        response = {
          data: allExp.data.filter(
            (exp) => exp.yearOfPlacement === parseInt(selectedYear)
          ),
        };
      } else {
        response = await experienceAPI.getAll();
      }

      setExperiences(response.data);
    } catch (error) {
      console.error("Filter error:", error);
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
    // Professional balanced gradient matching the app theme
    return "linear-gradient(135deg, #3b82f6, #1e40af)";
  };

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
            <FiFileText className="header-icon" />
            {location.state?.searchCompany 
              ? `${location.state.searchCompany} Experiences`
              : "Interview Experiences"}
          </h1>
          <p>
            {location.state?.departmentName 
              ? `Experiences from ${location.state.departmentName} department`
              : "Learn from real interview experiences shared by placed students"}
          </p>
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
          <div className="empty-icon">
            <FiFileText />
          </div>
          <h3>No experiences found</h3>
          <p>Try adjusting your search or filters</p>
          <button className="btn btn-secondary" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="experiences-grid">
          {experiences.map((exp) => (
            <Link
              to={`/experience/${exp.id}`}
              key={exp.id}
              className="experience-card"
            >
              <div
                className="card-header"
                style={{ background: getCompanyColor(exp.companyName) }}
              >
                <span className="company-name">{exp.companyName}</span>
                <span className="year-badge">
                  {exp.yearOfPlacement || new Date().getFullYear()}
                </span>
              </div>
              <div className="card-body">
                <h3 className="position">
                  {exp.position || "Interview Experience"}
                </h3>
                <p className="student-name">by {exp.studentName}</p>

                <div className="card-meta">
                  <span className="meta-item">
                    {exp.totalRounds || 0} Rounds
                  </span>
                </div>

                <p className="preview-text">
                  {exp.crackingStrategy?.substring(0, 100) ||
                    exp.inPersonInterviewTips?.substring(0, 100) ||
                    exp.preparationDetails?.substring(0, 100) ||
                    "Interview experience shared"}
                  ...
                </p>

                {exp.willingToMentor && (
                  <span className="mentor-badge">Willing to Mentor</span>
                )}
              </div>
              <div className="card-footer">
                <span>Read full experience</span>
                <FiChevronRight />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Experiences;
