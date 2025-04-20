import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import './AnalyseStudent.css';

const AnalyseStudent = () => {
  const { studentId } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentScores = async () => {
      try {
        const response = await fetch(`http://localhost:5000/analyse-student/${studentId}`);
        const data = await response.json();

        const filteredData = data
          .filter(result => !isNaN(result.total_score))
          .map((item, index) => ({
            ...item,
            order: index + 1,
            total_score: Number(item.total_score),
            vocab_score: Number(item.vocab_score),
            pronunciation_score: Number(item.pronunciation_score),
            fluency_score: Number(item.fluency_score),
            context_score: Number(item.context_score),
            grammar_score: Number(item.grammar_score),
          }));

        setResults(filteredData);
      } catch (error) {
        console.error("Error fetching student results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentScores();
  }, [studentId]);

  const renderChart = (dataKey, color, label) => (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={results} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="collection" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={dataKey} stroke={color} activeDot={{ r: 8 }} name={label} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  if (loading || results.length === 0) return null;

  return (
    <div className="analyse-container">
      <h1 className="analyse-title">Student Performance Analysis</h1>
      {renderChart("total_score", "#8884d8", "Total Score")}
      {renderChart("vocab_score", "#82ca9d", "Vocabulary Score")}
      {renderChart("pronunciation_score", "#ff7300", "Pronunciation Score")}
      {renderChart("fluency_score", "#ffc658", "Fluency Score")}
      {renderChart("context_score", "#ff6384", "Context Score")}
      {renderChart("grammar_score", "#36a2eb", "Grammar Score")}
    </div>
  );
};

export default AnalyseStudent;
