import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const WelcomePage = () => {
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch("http://localhost:5000/get-collections");
        const data = await response.json();

        if (Array.isArray(data)) {
          setCollections(data);
        } else {
          console.error("Error fetching collections:", data.error);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchCollections();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-100 px-4 py-8">
      <h1 className="text-4xl font-bold mb-4 text-blue-700">Welcome to the English Proficiency Dashboard</h1>
      <p className="mb-4 text-lg text-gray-700">Choose an option to get started:</p>

      <Link
        to="/start-test"
        className="mb-8 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
      >
        Start a Test
      </Link>

      <div className="w-full max-w-md bg-white rounded shadow p-4">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">Available Test Collections:</h2>
        {collections.length === 0 ? (
          <p className="text-gray-600">No collections found.</p>
        ) : (
          <ul className="space-y-2">
            {collections.map((col) => (
              <li key={col.id} className="border p-2 rounded bg-gray-50 hover:bg-gray-100">
                <Link to={`/collection/${col.id}`} className="text-blue-600 hover:underline">
                  {col.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default WelcomePage;
