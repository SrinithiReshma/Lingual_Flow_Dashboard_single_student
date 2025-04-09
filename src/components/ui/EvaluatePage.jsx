import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const EvaluatePage = () => {
  const { collectionId } = useParams();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch(`http://localhost:5000/collection/${collectionId}`);
        const data = await res.json();

        if (data.documents) {
          const scoreData = data.documents.map(doc => ({
            name: doc.name || "Unknown",
            total_score: doc.total_score ?? "N/A"
          }));
          setScores(scoreData);
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
        <div className="max-w-2xl mx-auto bg-white shadow p-6 rounded">
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
      )}
    </div>
  );
};

export default EvaluatePage;
