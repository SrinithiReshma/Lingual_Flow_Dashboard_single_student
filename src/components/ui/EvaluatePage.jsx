import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './EvaluatePage.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

const EvaluatePage = () => {
  const { collectionId } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avgScore, setAvgScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [skillAverages, setSkillAverages] = useState([]);
  const [gradeDistribution, setGradeDistribution] = useState([]);
  const [skillScoresByStudent, setSkillScoresByStudent] = useState([]);
  const [skillDistributions, setSkillDistributions] = useState([]);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch(`http://localhost:5000/collection/${collectionId}`);
        const data = await res.json();

        if (data.documents) {
          const validStudents = data.documents.filter(doc => typeof doc.total_score === "number");

          setStudents(validStudents);

          const scoresOnly = validStudents.map(s => s.total_score);
          const avg = scoresOnly.reduce((a, b) => a + b, 0) / scoresOnly.length || 0;
          const max = Math.max(...scoresOnly);
          setAvgScore(Math.round(avg));
          setMaxScore(max);

          const skills = ["vocab_score", "pronunciation_score", "fluency_score", "context_score", "grammar_score"];
          
          // Radar skill averages
          const skillAvgs = skills.map(skill => {
            const scores = validStudents.map(s => s[skill] || 0);
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length || 0;
            return { skill: skill.replace('_score', '').toUpperCase(), average: Math.round(avg) };
          });
          setSkillAverages(skillAvgs);

          // Skill score per student (for stacked bar chart)
          const skillByStudent = validStudents.map(s => ({
            name: s.name || "Unknown",
            vocab: s.vocab_score || 0,
            pronunciation: s.pronunciation_score || 0,
            fluency: s.fluency_score || 0,
            context: s.context_score || 0,
            grammar: s.grammar_score || 0,
          }));
          setSkillScoresByStudent(skillByStudent);

          // Skill distributions (for bar chart comparison)
          const dist = skills.map(skill => {
            const all = validStudents.map(s => s[skill] || 0);
            return {
              skill: skill.replace('_score', '').toUpperCase(),
              min: Math.min(...all),
              max: Math.max(...all),
              avg: Math.round(all.reduce((a, b) => a + b, 0) / all.length || 0),
            };
          });
          setSkillDistributions(dist);

          // Grade distribution
          const gradeMap = {};
          validStudents.forEach(s => {
            const grade = s.grade || "Ungraded";
            gradeMap[grade] = (gradeMap[grade] || 0) + 1;
          });
          const distribution = Object.keys(gradeMap).map((grade, index) => ({
            name: grade,
            value: gradeMap[grade],
            color: COLORS[index % COLORS.length]
          }));
          setGradeDistribution(distribution);
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
      <h1 className="evaluate-title">Evaluation - Class Overview</h1>

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : (
        <>
          {/* Table */}
          <div className="score-table-container">
            <table className="score-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Total Score</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {students.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name || "Unknown"}</td>
                    <td>{item.total_score}</td>
                    <td>{item.grade || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Scores */}
          <div className="chart-section">
            <h2>Total Scores Overview</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={students} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
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

          {/* Radar Chart */}
          <div className="chart-section">
            <h2>Class Skill Averages</h2>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={skillAverages} cx="50%" cy="50%" outerRadius="80%">
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Average Score" dataKey="average" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="chart-section">
            <h2>Grade Distribution</h2>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* New: Skill Breakdown per Student */}
          <div className="chart-section">
            <h2>Skill Breakdown per Student</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={skillScoresByStudent} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="vocab" stackId="a" fill="#4f46e5" name="Vocabulary" />
                <Bar dataKey="pronunciation" stackId="a" fill="#10b981" name="Pronunciation" />
                <Bar dataKey="fluency" stackId="a" fill="#f59e0b" name="Fluency" />
                <Bar dataKey="context" stackId="a" fill="#ef4444" name="Context" />
                <Bar dataKey="grammar" stackId="a" fill="#6366f1" name="Grammar" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* New: Skill Distribution Summary */}
          <div className="chart-section">
            <h2>Skill Distribution Summary</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={skillDistributions} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="skill" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="min" fill="#e11d48" name="Minimum" />
                <Bar dataKey="avg" fill="#3b82f6" name="Average" />
                <Bar dataKey="max" fill="#22c55e" name="Maximum" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default EvaluatePage;
