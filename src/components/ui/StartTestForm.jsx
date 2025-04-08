import React, { useState } from 'react';
import axios from 'axios';

const StartTestForm = () => {
  const [collectionName, setCollectionName] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!collectionName.trim()) {
      setStatus('❌ Collection name cannot be empty.');
      return;
    }
    try {
      setStatus('⏳ Creating new test collection...');
      const res = await axios.post('http://localhost:3000/create-test', {
        collectionName: collectionName.trim()
      });
      setStatus(` ${res.data.message}`);
    } catch (error) {
      console.error(error);
      setStatus('❌ Failed to create collection.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-center">Start New Test</h2>
      <form onSubmit={handleSubmit}>
        <input
          id="collectionName"
          name="collectionName"
          type="text"
          placeholder="Enter test name"
          value={collectionName}
          onChange={(e) => setCollectionName(e.target.value)}
          className="w-full p-2 mb-3 border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Start Test
        </button>
      </form>
      {status && <p className="mt-3 text-center text-sm text-gray-700">{status}</p>}
    </div>
  );
};

export default StartTestForm;