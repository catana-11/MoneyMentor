import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <h1>Choose Your Course</h1>
      <div className="courses-container">
        <div className="row">
          <div className="course-item">
            <Link to="/course/financial-terms">
              <div className="course-circle">
                <img src="https://www.uc.edu/news/articles/2022/03/n21072177/jcr:content/image.img.cq5dam.thumbnail.500.500.jpg/1646246791442.jpg" alt="Course 1" />
              </div>
              <p>Financial Terms for Beginners</p>
            </Link>
          </div>
          <div className="course-item">
            <Link to="/course/investment-options">
              <div className="course-circle">
                <img src="https://qph.cf2.quoracdn.net/main-qimg-1ab03d88b95e1f54113d5509f7a11211-lq" alt="Course 2" />
              </div>
              <p>Learn about the various Investment Options</p>
            </Link>
          </div>
        </div>
        <div className="row">
          <div className="course-item esg-item">
            <Link to="/course/esg">
              <div className="course-circle">
                <img src="https://cdn.corporatefinanceinstitute.com/assets/esg-environmental-social-governance.jpg" alt="Course 3" />
              </div>
              <p>ESG (Environmental, Social, Governance)</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
