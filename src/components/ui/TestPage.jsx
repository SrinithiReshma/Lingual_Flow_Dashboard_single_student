// src/components/ui/TestPage.jsx
import React, { useState } from 'react';

const TestPage = () => {
  const [collectionName, setCollectionName] = useState('');
  const [message, setMessage] = useState('');

  const handleCreateTest = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/create-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collectionName }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('Network error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <form onSubmit={handleCreateTest} className="bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-bold mb-4">Create New Test</h2>
        <input
          type="text"
          placeholder="Enter test name"
          value={collectionName}
          onChange={(e) => setCollectionName(e.target.value)}
          className="border px-3 py-2 rounded mb-4 w-full"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Test
        </button>
        {message && <p className="mt-4 text-center">{message}</p>}
      </form>
    </div>
  );
};

export default TestPage;