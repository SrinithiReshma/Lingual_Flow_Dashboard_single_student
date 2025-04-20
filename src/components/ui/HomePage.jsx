import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import boy from 'C:/Users/srini/Desktop/english-proficiency-dashboard/src/boy.png';

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
Welcome to <strong>LingualFlow</strong>  <br></br>
Empowering <strong>teachers</strong> to monitor their students' English speaking skills through clear, interactive graphs.  
Gain insights into student progress, identify areas for improvement, and enhance your teaching effectiveness.

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
