// StudentList.js
import React, { useEffect, useState } from "react";
import { Client, Databases } from "appwrite";
import { useNavigate } from "react-router-dom";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67d5bc1d002708a5e2b8");

const databases = new Databases(client);

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await databases.listDocuments(
          "67d5be53002f133cb332",
          "67d5be71001688b1cb93"
        );
        setStudents(res.documents);
      } catch (error) {
        console.error("Error fetching student list:", error);
      }
    }

    fetchStudents();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Student Records</h2>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {students.map((student) => (
          <li
            key={student.$id}
            style={{
              margin: "10px 0",
              padding: "10px",
              background: "#f0f0f0",
              cursor: "pointer",
              borderRadius: "5px",
            }}
            onClick={() => navigate(`/dashboard/${student.$id}`)}
          >
            {student.name} ({student.email})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentList;
