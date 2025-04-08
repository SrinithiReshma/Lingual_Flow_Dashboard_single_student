import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const CollectionDetailsPage = () => {
  const { collectionId } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(`http://localhost:5000/collection/${collectionId}`);
        const data = await res.json();
        setStudents(data.documents || []);
      } catch (err) {
        console.error("Error fetching student data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [collectionId]);

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      <h2 className="text-3xl font-bold mb-4 text-blue-700">Student Details</h2>
      <Link to="/" className="text-blue-500 underline mb-4 block">← Back to Welcome</Link>

      {loading ? (
        <p>Loading...</p>
      ) : students.length === 0 ? (
        <p>No student data found for this collection.</p>
      ) : (
        <div className="bg-white p-4 rounded shadow">
          <ul className="space-y-4">
            {students.map((student) => (
              <li key={student.$id} className="border-b pb-2">
                <p><strong>Student ID:</strong> {student.student_id}</p>
                <p><strong>Name:</strong> {student.name}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CollectionDetailsPage;
