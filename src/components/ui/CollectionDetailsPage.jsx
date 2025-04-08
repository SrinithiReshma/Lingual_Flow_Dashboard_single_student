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
    <div className="min-h-screen bg-gray-100 px-6 py-8 flex flex-col items-center">
      <h2 className="text-4xl font-bold mb-4 text-blue-700 text-center">Student Details</h2>
      <Link to="/" className="text-blue-600 underline mb-6 text-lg text-center">← Back to Welcome</Link>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : students.length === 0 ? (
        <p className="text-center text-gray-500">No student data found for this collection.</p>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-4xl">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-blue-200 text-blue-900 text-lg">
                <th className="py-4 px-6 border-b">Student ID</th>
                <th className="py-4 px-6 border-b">Name</th>
                <th className="py-4 px-6 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.$id} className="hover:bg-gray-50 text-gray-800">
                  <td className="py-4 px-6 border-b">{student.student_id}</td>
                  <td className="py-4 px-6 border-b">{student.name}</td>
                  <td className="py-4 px-6 border-b">
                    <Link
                      to={`/take-test/${student.$id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-5 rounded-full transition"
                    >
                      Take Test
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CollectionDetailsPage;
