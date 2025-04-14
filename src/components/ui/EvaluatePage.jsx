import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">Evaluation - Total Scores</h1>
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <>
          <div className="max-w-2xl mx-auto bg-white shadow p-6 rounded mb-8">
            {scores.length === 0 ? (
              <p className="text-gray-600 text-center">No students found in this collection.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="border-b p-2">Student Name</th>
                    <th className="border-b p-2">Total Score</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((item, index) => (
                    <tr key={index}>
                      <td className="border-b p-2">{item.name}</td>
                      <td className="border-b p-2">{item.total_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {scores.length > 0 && (
            <div className="max-w-4xl mx-auto bg-white shadow p-6 rounded">
              <h2 className="text-xl font-semibold mb-4 text-center">Total Scores Overview</h2>
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
              <div className="text-center mt-4 text-gray-700">
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
