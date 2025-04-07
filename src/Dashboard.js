import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    ComposedChart, Bar, XAxis, YAxis, Tooltip, ReferenceDot,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    PieChart, Pie, Cell
} from "recharts";
import "./Dashboard.css";

const API_URL = "https://cloud.appwrite.io/v1/databases/67d5be53002f133cb332/collections/67d5be71001688b1cb93/documents/67d5c113003c26d94f03";
const API_KEY = 'standard_849d30cfda41bec486c6cc6abbbffa650686f26fd69e3e76e6a8ebcea3cc02df1ed74daec826e4e5cc3eccb438be781f8e751ad7fad17074222134d9a8ed15c155f5beed2a68a9282d2bea4435683fe5dd4887b79bd0e264880a1b1b8d8b328746cded7335cf8a8247c4cd01a5fd07c10ee60cce46dd0317874f6ce26e6b97c9';

const COLORS = ["#4A90E2", "#50E3C2", "#F5A623", "#D0021B", "#9B9B9B"];

function Dashboard() {
    const [studentData, setStudentData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(API_URL, {
            headers: {
                "X-Appwrite-Project": "67d5bc1d002708a5e2b8",
                "X-Appwrite-Key": API_KEY
            }
        }).then((response) => {
            setStudentData(response.data);
        }).catch(error => {
            console.error("Error fetching data:", error);
            setError("Failed to load data. Please try again later.");
        });
    }, []);

    if (error) return <h2 className="error">{error}</h2>;
    if (!studentData) return <h2 className="loading">Loading...</h2>;

    const scores = [
        { skill: "Vocabulary", score: studentData.vocab_score },
        { skill: "Pronunciation", score: studentData.pronunciation_score },
        { skill: "Fluency", score: studentData.fluency_score },
        { skill: "Context", score: studentData.context_score },
        { skill: "Grammar", score: studentData.grammar_score }
    ];

    const totalScore = studentData.total_score || 0;

    return (
        <div className="dashboard-container">
            <h1 className="title">English Proficiency Dashboard</h1>
            <h2 className="subtitle">{studentData.name}'s Performance</h2>

            {/* Total Score Gauge Chart */}
            <div className="gauge-container">
                <h3 className="section-title">Overall Score</h3>
                <PieChart width={350} height={350}>
                    <Pie
                        data={[
                            { name: "Score", value: totalScore },
                            { name: "Remaining", value: 100 - totalScore }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        startAngle={180}
                        endAngle={0}
                        fill="#4A90E2"
                        dataKey="value"
                    >
                        <Cell fill="#4A90E2" />
                        <Cell fill="#e0e0e0" />
                    </Pie>
                </PieChart>
                <div className="gauge-score">{totalScore.toFixed(2)}%</div>
            </div>

            {/* Score Visualization */}
            <div className="charts-container">
                <h3 className="section-title">Performance Overview</h3>

                <div className="charts-grid">
                    {/* Bar Chart */}
                    <div className="chart-box">
                        <h4 className="chart-title">Score Breakdown</h4>
                        <ComposedChart width={400} height={250} data={scores} layout="vertical">
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis dataKey="skill" type="category" width={100} />
                            <Tooltip />
                            <Bar dataKey={() => 100} barSize={22} fill="#e0e0e0" opacity={0.6} />
                            <Bar dataKey="score" barSize={10} fill="#4A90E2" />
                            <ReferenceDot x={100} r={6} stroke="red" fill="red" />
                        </ComposedChart>
                    </div>

                    {/* Radar Chart */}
                    <div className="chart-box">
                        <h4 className="chart-title">Skill Radar</h4>
                        <RadarChart cx={200} cy={125} outerRadius={90} width={400} height={250} data={scores}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="skill" />
                            <PolarRadiusAxis domain={[0, 100]} />
                            <Radar name="Proficiency" dataKey="score" stroke="#4A90E2" fill="#4A90E2" fillOpacity={0.6} />
                            <Tooltip />
                        </RadarChart>
                    </div>

                    {/* Pie Chart */}
                    <div className="chart-box" style={{ gridColumn: "span 3" }}>
                        <h4 className="chart-title">Score Distribution</h4>
                        <PieChart width={400} height={300}>
                            <Pie
                                data={scores}
                                dataKey="score"
                                nameKey="skill"
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
                                fill="#8884d8"
                                label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                            >
                                {scores.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </div>
                </div>
            </div>

            {/* Vocabulary Suggestions */}
            <div className="vocab-container">
                <h3 className="section-title">Vocabulary Suggestions</h3>
                <div className="vocab-grid">
                    {studentData.vocab_suggestion?.split("\n").map((item, index) => {
                        const [word, alternatives] = item.split(":").map(str => str.trim());
                        return word && alternatives ? (
                            <div key={index} className="vocab-card">
                                <h4 className="vocab-word">{word}</h4>
                                <p className="vocab-alternatives">Alternatives: <span>{alternatives}</span></p>
                            </div>
                        ) : null;
                    })}
                </div>
            </div>

            {/* Grammar Suggestions */}
            <div className="grammar-container">
                <h3 className="section-title">Grammar Suggestions</h3>
                <div className="grammar-list">
                    {studentData.grammar_suggestion
                        .split("\n* ")
                        .filter(Boolean)
                        .map((item, index) => {
                            const parts = item.split("->").map(str => str.trim());
                            return parts.length === 2 ? (
                                <div key={index} className="grammar-item">
                                    <div className="mistake">Mistake: {parts[0]}</div>
                                    <div className="correction">Correction: {parts[1]}</div>
                                </div>
                            ) : null;
                        })}
                </div>
            </div>

            {/* Mispronounced Words */}
            
        </div>
    );
}

export default Dashboard;
