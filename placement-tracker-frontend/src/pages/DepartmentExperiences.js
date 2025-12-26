import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { placementAPI, departmentAPI } from '../services/api';
import './DepartmentExperiences.css';

const DepartmentExperiences = () => {
  const { id } = useParams();
  const [department, setDepartment] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExp, setSelectedExp] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [deptRes, expRes] = await Promise.all([
        departmentAPI.getById(id),
        placementAPI.getAll()
      ]);
      setDepartment(deptRes.data);
      const deptExperiences = expRes.data.filter(
        exp => exp.department === deptRes.data.departmentCode || 
               exp.department === deptRes.data.departmentName
      );
      setExperiences(deptExperiences);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredExperiences = experiences.filter(exp => {
    const search = searchTerm.toLowerCase();
    return exp.companyName?.toLowerCase().includes(search) ||
           exp.studentName?.toLowerCase().includes(search);
  });

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
        <Link to="/" className="back-btn">← Back to Home</Link>
        <h1>{department?.departmentCode} - {department?.departmentName}</h1>
        <p>{experiences.length} interview experiences shared</p>
      </div>

      {experiences.length > 0 && (
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by company or student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {filteredExperiences.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-box">+</div>
          <h3>No experiences yet</h3>
          <p>Be the first to share your interview experience!</p>
          <Link to="/login" className="share-btn">Login to Share</Link>
        </div>
      ) : (
        <div className="experiences-grid">
          {filteredExperiences.map((exp) => (
            <div key={exp.id} className="exp-card" onClick={() => setSelectedExp(exp)}>
              <div className="exp-header">
                <h3>{exp.companyName}</h3>
                <span className={`result ${exp.finalResult?.toLowerCase().replace(' ', '-')}`}>
                  {exp.finalResult}
                </span>
              </div>
              <p className="student-name">By {exp.studentName}</p>
              <div className="exp-meta">
                <span>Type: {exp.companyType || 'Company'}</span>
                <span>Salary: {exp.salary || 'Not disclosed'}</span>
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedExp(null)}>×</button>
            <h2>{selectedExp.companyName}</h2>
            <span className={`result ${selectedExp.finalResult?.toLowerCase().replace(' ', '-')}`}>
              {selectedExp.finalResult}
            </span>
            
            <div className="detail-section">
              <h4>Student Details</h4>
              <p><strong>Name:</strong> {selectedExp.studentName}</p>
              <p><strong>Roll:</strong> {selectedExp.rollNumber}</p>
              <p><strong>Year:</strong> {selectedExp.academicYear}</p>
            </div>

            <div className="detail-section">
              <h4>Company Details</h4>
              <p><strong>Type:</strong> {selectedExp.companyType}</p>
              <p><strong>Salary:</strong> {selectedExp.salary}</p>
              <p><strong>Intern Offered:</strong> {selectedExp.internOffered ? 'Yes' : 'No'}</p>
            </div>

            <div className="detail-section">
              <h4>Overall Experience</h4>
              <p>{selectedExp.overallExperience}</p>
            </div>

            <div className="detail-section">
              <h4>General Tips</h4>
              <p>{selectedExp.generalTips}</p>
            </div>

            <div className="detail-section">
              <h4>Resources</h4>
              <p>{selectedExp.suggestedResources}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentExperiences;
