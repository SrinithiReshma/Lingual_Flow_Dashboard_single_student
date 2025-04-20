import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './EvaluatePage.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const EvaluatePage = () => {
  const { collectionId } = useParams();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avgScore, setAvgScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch(`http://localhost:5000/collection/${collectionId}`);
        const data = await res.json();

        if (data.documents) {
          const scoreData = data.documents.map(doc => ({
            name: doc.name || "Unknown",
            total_score: typeof doc.total_score === "number" ? doc.total_score : null,
          })).filter(doc => doc.total_score !== null); // Filter out N/A

          const scoresOnly = scoreData.map(s => s.total_score);
          const average = scoresOnly.reduce((a, b) => a + b, 0) / scoresOnly.length || 0;
          const max = Math.max(...scoresOnly);

          setScores(scoreData);
          setAvgScore(Math.round(average));
          setMaxScore(max);
        } else {
          console.error("No documents found:", data);
        }
      } catch (err) {
        console.error("Error fetching scores:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [collectionId]);

  return (
    <div className="evaluate-container">
  <h1 className="evaluate-title">Evaluation - Total Scores</h1>
  {loading ? (
    <p className="loading-text">Loading...</p>
  ) : (
    <>
      <div className="score-table-container">
        {scores.length === 0 ? (
          <p className="loading-text">No students found in this collection.</p>
        ) : (
          <table className="score-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Total Score</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.total_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {scores.length > 0 && (
        <div className="chart-section">
          <h2>Total Scores Overview</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={scores} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_score" fill="#4f46e5" name="Total Score" />
            </BarChart>
          </ResponsiveContainer>
          <div className="chart-stats">
            <p><strong>Class Average:</strong> {avgScore}</p>
            <p><strong>Highest Score:</strong> {maxScore}</p>
          </div>
        </div>
      )}
    </>
  )}
</div>

  );
};

export default EvaluatePage;
