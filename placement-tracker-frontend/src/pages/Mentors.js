import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import './Mentors.css';

function Mentors() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const response = await authAPI.getAllMentors();
      setMentors(response.data || []);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      setMentors([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMentors = mentors.filter(mentor => 
    mentor.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.placedCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.placedPosition?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="mentors-loading">
        <div className="loader"></div>
        <p>Loading mentors...</p>
      </div>
    );
  }

  return (
    <div className="mentors-page">
      <div className="mentors-header">
        <h1>Our Mentors</h1>
        <p>Connect with placed students who can guide your placement journey</p>
      </div>

      <div className="mentors-content">
        <div className="search-section">
          <input
            type="text"
            className="search-input"
            placeholder="Search mentors by name, company, or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredMentors.length > 0 ? (
          <>
            <p className="mentors-count">{filteredMentors.length} mentor(s) available</p>
            <div className="mentors-grid">
              {filteredMentors.map((mentor) => (
                <div key={mentor.id} className="mentor-card">
                  <div className="mentor-avatar">
                    {mentor.fullName?.charAt(0).toUpperCase() || 'M'}
                  </div>
                  <h3>{mentor.fullName}</h3>
                  <p className="mentor-company">{mentor.placedCompany || 'Company Not Specified'}</p>
                  <p className="mentor-position">{mentor.placedPosition || 'Position Not Specified'}</p>
                  <div className="mentor-details">
                    {mentor.departmentName && (
                      <span className="detail-tag">{mentor.departmentName}</span>
                    )}
                    {mentor.placementYear && (
                      <span className="detail-tag">Batch {mentor.placementYear}</span>
                    )}
                  </div>
                  <div className="contact-buttons">
                    <a href={`mailto:${mentor.email}`} className="contact-btn email">
                      Email
                    </a>
                    {mentor.linkedinProfile && (
                      <a 
                        href={mentor.linkedinProfile.startsWith('http') ? mentor.linkedinProfile : `https://${mentor.linkedinProfile}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="contact-btn linkedin"
                      >
                        LinkedIn
                      </a>
                    )}
                    {mentor.phoneNumber && (
                      <a href={`tel:${mentor.phoneNumber}`} className="contact-btn phone">
                        Call
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="mentors-empty">
            <div className="empty-icon-box">M</div>
            <h3>No Mentors Yet</h3>
            <p>Be the first to register as a mentor and help fellow students!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Mentors;
