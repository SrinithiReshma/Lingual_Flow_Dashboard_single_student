import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import './StudentAnalysisPage.css'; // Import your new CSS file

const StudentAnalysisPage = () => {
  const { collectionId, studentId } = useParams();
  const [message, setMessage] = useState("Analyzing...");

  useEffect(() => {
    const runAnalysis = async () => {
      try {
        const response = await fetch(`http://localhost:5000/analyze/${collectionId}/${studentId}`);
        const data = await response.json();
        setMessage(`✅ Analysis Completed: ${JSON.stringify(data)}`);
      } catch (error) {
        console.error("Analysis error:", error);
        setMessage("❌ Error during analysis.");
      }
    };

    runAnalysis();
  }, [collectionId, studentId]);

  return (
    <div className="analysis-container">
      <div className="analysis-header">
        <h2>Grammar Analysis</h2>
        <p>Your student's grammar analysis results are displayed here.</p>
      </div>

      <div className="analysis-content">
        <p className="analysis-message">{message}</p>
      </div>
    </div>
  );
};

export default StudentAnalysisPage;
