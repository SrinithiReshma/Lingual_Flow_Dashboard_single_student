import React, { useEffect, useState } from 'react'; 
import './WelcomePage.css';
import './Modal.css'; // CSS for modal styling
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
  const [collections, setCollections] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

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

  const handleCreateTest = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/create-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionName }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setCollectionName('');
        window.location.reload();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('Network error');
    }
  };

  const handleStudentAnalyse = (e) => {
    e.preventDefault();
    if (studentId.trim()) {
      navigate(`/analyse/${studentId}`);
    }
  };

  return (
    <div className="welcome-container">
      <div className="welcome-header">
        <h1>Start your testing journey today!</h1>
        <p>Choose an option to get started and begin your language journey with confidence.</p>
        <button onClick={() => setIsModalOpen(true)} className="start-button">
          Start a Test
        </button>
        <button onClick={() => setIsStudentModalOpen(true)} className="start-button" style={{ marginLeft: '10px' }}>
          Analyse Particular Student
        </button>
      </div>

      <div className="collection-section">
        <h2>Available Test Collections</h2>
        {collections.length === 0 ? (
          <p className="no-collections">No collections found.</p>
        ) : (
          <ul className="collection-list">
            {collections.map((col) => (
              <li key={col.id} className="collection-item">
                <a href={`/collection/${col.id}`} className="collection-link">{col.name}</a>
                <a href={`/evaluate/${col.id}`} className="evaluate-button">Evaluate</a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Test Creation Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-button" onClick={() => { setIsModalOpen(false); setMessage(''); }}>
              &times;
            </button>
            <form onSubmit={handleCreateTest}>
              <h2>Create New Test</h2>
              <input
                type="text"
                placeholder="Enter test name"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                required
              />
              <button type="submit" className="modal-create-button">Create Test</button>
              {message && <p className="modal-message">{message}</p>}
            </form>
          </div>
        </div>
      )}

      {/* Student Analyse Modal */}
      {isStudentModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-button" onClick={() => { setIsStudentModalOpen(false); setMessage(''); }}>
              &times;
            </button>
            <form onSubmit={handleStudentAnalyse}>
              <h2>Enter Student ID</h2>
              <input
                type="text"
                placeholder="Enter student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
              <button type="submit" className="modal-create-button">Analyse</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomePage;
