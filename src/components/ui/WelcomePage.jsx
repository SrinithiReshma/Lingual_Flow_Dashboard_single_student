import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './WelcomePage.css'; // Import your new CSS file

const WelcomePage = () => {
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch("http://localhost:5000/get-collections");
        const data = await response.json();

        if (Array.isArray(data)) {
          setCollections(data);
        } else {
          console.error("Error fetching collections:", data.error);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchCollections();
  }, []);

  return (
    <div className="welcome-container">
      <div className="welcome-header">
        <h1>Start your testing journey today!</h1>
        <p>Choose an option to get started and begin your language journey with confidence.</p>
        <Link to="/start-test" className="start-button">
          Start a Test
        </Link>
      </div>

      <div className="collection-section">
        <h2>Available Test Collections</h2>
        {collections.length === 0 ? (
          <p className="no-collections">No collections found.</p>
        ) : (
          <ul className="collection-list">
            {collections.map((col) => (
              <li key={col.id} className="collection-item">
                <Link to={`/collection/${col.id}`} className="collection-link">
                  {col.name}
                </Link>
                <Link to={`/evaluate/${col.id}`} className="evaluate-button">
                  Evaluate
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default WelcomePage;
