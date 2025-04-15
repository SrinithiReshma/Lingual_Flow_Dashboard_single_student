import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import boy from 'D:/Lingual_flow_dash/src/boy.png';

const HomePage = () => {
  return (
    <div className="home-container">
      {/* Header */}
      <header className="header">
        <h1 className="brand-name">LingualFlow</h1>
      </header>

      {/* Main Content */}
      <div className="content-container">
        {/* Left Container with Info */}
        <div className="info-container">
        <h2>Track Student Progress with Ease</h2>
<p>
  Welcome to <strong>LingualFlow</strong> 
  Easily monitor your students' learning journey with clear, interactive graphs.  
  Get insights into their progress, identify areas for improvement, and make teaching more effective.
</p>

          <Link to="/Welcome" className="learn-more-link">
            Get Started →
          </Link>
        </div>

        {/* Right Container with Image */}
        <div className="image-container">
          <img src={boy} alt="Language Learning" />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
