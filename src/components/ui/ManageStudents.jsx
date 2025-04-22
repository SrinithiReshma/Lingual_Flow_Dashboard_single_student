import './ManageStudents.css';

import React, { useEffect, useState } from 'react';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');

  const fetchStudents = async () => {
    const res = await fetch('http://localhost:5000/students');
    const data = await res.json();
    setStudents(data);
  };

  const addStudent = async () => {
    await fetch('http://localhost:5000/add-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, name }),
    });
    setStudentId('');
    setName('');
    fetchStudents();
  };

  const deleteStudent = async (id) => {
    await fetch(`http://localhost:5000/delete-student/${id}`, { method: 'DELETE' });
    fetchStudents();
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="manage-students-container">
      <h2>Manage Students</h2>
      <div className="manage-students-form">
        <input
          type="text"
          placeholder="Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Student Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={addStudent}>Add Student</button>
      </div>

      <ul className="students-list">
        {students.map((s) => (
          <li key={s.$id}>
            <span>{s.name} ({s.student_id})</span>
            <button onClick={() => deleteStudent(s.$id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageStudents;
