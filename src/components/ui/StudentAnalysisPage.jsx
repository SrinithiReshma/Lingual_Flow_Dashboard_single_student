import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
    <div className="p-8 text-center">
      <h2 className="text-3xl font-bold text-purple-700 mb-4">Grammar Analysis</h2>
      <p className="text-lg text-gray-800">{message}</p>
    </div>
  );
};

export default StudentAnalysisPage;
