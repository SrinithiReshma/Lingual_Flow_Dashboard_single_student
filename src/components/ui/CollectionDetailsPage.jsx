import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Client, Storage, ID } from 'appwrite';
import axios from 'axios';
const CollectionDetailsPage = () => {
  const [selectedFiles, setSelectedFiles] = useState({});
  const { collectionId } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [recordingStudentId, setRecordingStudentId] = useState(null);

  // ✅ Appwrite setup
  const client = new Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject("67d5bc1d002708a5e2b8");

  const storage = new Storage(client);
  const BUCKET_ID = "67d6b0640008a8a3986b";

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

  const startRecording = async (studentId) => {
    try {

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([audioBlob], `${studentId}.webm`, { type: 'audio/webm' });

        try {
          // ✅ Upload to Appwrite Storage
          const res = await storage.createFile(BUCKET_ID, ID.unique(), file);

          const audioURL = `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${res.$id}/view?project=67d5bc1d002708a5e2b8`;

          // ✅ Update backend with audio_url
          await fetch(`http://localhost:5000/students/${studentId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audio_url: audioURL, collectionId: collectionId }),
          });
          
          alert("✅ Recording uploaded & student updated.");
        } catch (error) {
          console.error("❌ Upload failed:", error);
          alert("❌ Failed to upload audio.");
        }

        setRecordingStudentId(null);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setRecordingStudentId(studentId);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
  };
  const handleFileChange = (event, studentId) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFiles((prev) => ({ ...prev, [studentId]: file }));
  };
  const submitUpload = async (studentId) => {
    const file = selectedFiles[studentId];
    if (!file) {
      alert("❌ No file selected.");
      return;
    }
  
    try {
      const res = await storage.createFile(BUCKET_ID, ID.unique(), file);
  
      const audioURL = `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${res.$id}/view?project=67d5bc1d002708a5e2b8`;
  
      await fetch(`http://localhost:5000/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio_url: audioURL, collectionId: collectionId }),
      });
  
      alert("✅ Audio file uploaded and student updated.");
      setSelectedFiles((prev) => ({ ...prev, [studentId]: null }));
    } catch (error) {
      console.error("❌ Upload failed:", error);
      alert("❌ Failed to upload audio file.");
    }
  };
  const handleAnalyse = async (studentId, audioURL, collectionId) => {
    console.log("DEBUG:", { studentId, audioURL, collectionId });
  
    if (!studentId || !audioURL || !collectionId) {
      console.error("Missing required fields", { studentId, audioURL, collectionId });
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:5000/transcribe", {
        studentId,
        audioURL,
        collectionId // Ensure this is passed
      });
      // Handle the response here
    } catch (error) {
      console.error("API Error:", error);
    }
  };
  
  
  
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
                  <td className="py-4 px-6 border-b space-x-4">
                    {recordingStudentId === student.$id ? (
                      <button
                        onClick={stopRecording}
                        className="bg-red-600 hover:bg-red-700 text-white py-2 px-5 rounded-full transition"
                      >
                        Stop
                      </button>
                    ) : (
                      <button
                        onClick={() => startRecording(student.$id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-5 rounded-full transition"
                      >
                        Take Test
                      </button>
                      
                    )}
                     <input
  type="file"
  accept="audio/*"
  onChange={(e) => handleFileChange(e, student.$id)}
  className="block w-full text-sm text-gray-600
             file:mr-4 file:py-2 file:px-4
             file:rounded-full file:border-0
             file:text-sm file:font-semibold
             file:bg-blue-50 file:text-blue-700
             hover:file:bg-blue-100"
/>

{selectedFiles[student.$id] && (
  <button
    onClick={() => submitUpload(student.$id)}
    className="mt-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-full transition"
  >
    Submit
  </button>
)}
{student.audio_url && (
  <button
    onClick={() => handleAnalyse(student.$id, student.audio_url,collectionId)}
    className="mt-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-full transition"
  >
    Analyse
  </button>
)}

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
