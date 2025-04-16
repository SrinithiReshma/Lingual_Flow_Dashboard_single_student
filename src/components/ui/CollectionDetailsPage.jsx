import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Client, Storage, ID } from 'appwrite';
import axios from 'axios';
import './CollectionDetailsPage.css'; // Import your new CSS file

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
          window.location.reload();
          
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
      window.location.reload();
      
    } catch (error) {
      console.error("❌ Upload failed:", error);
      alert("❌ Failed to upload audio file.");
    }
  };

  const handleAnalyse = async (studentId, collectionId) => {
    const res = await fetch(`http://localhost:5000/students/${collectionId}/${studentId}`);
    const data = await res.json();

    if (!data.audio_url) {
      alert("❌ No file uploaded for this student.");
      return;
    }
    

    

    try {
      const response = await axios.post("http://localhost:5000/transcribe", {
        studentId,
        audioURL: data.audio_url,
        collectionId, // Ensure this is passed
      });
     
      alert("✅ Successfully stored in database. Ready to view dashboard.");
      // Handle the response here
    } catch (error) {
      console.error("API Error:", error);
          alert("❌ Failed to analyze audio.");

    }
  };

  const handleView = (studentId, collectionId) => {
    // Fetch student data to check if 'total_score' is empty
    fetch(`http://localhost:5000/students/${collectionId}/${studentId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.total_score) {
          alert("❌ Audio file not analyzed yet. Total score is missing.");
        } else {
          // If total_score is not empty, navigate to the dashboard
          window.location.href = `/dashboard/${collectionId}/${studentId}`;
        }
      })
      .catch(error => {
        console.error("Error fetching student data:", error);
        alert("❌ Failed to fetch student data.");
      });
  };
  
  

  return (
    <div className="details-container">
      <h2 className="title">Student Details</h2>
      <Link to="/" className="back-link">← Back to Welcome</Link>

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : students.length === 0 ? (
        <p className="loading-text">No student data found for this collection.</p>
      ) : (
        <div className="student-table-container">
          <table className="student-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.$id}>
                  <td>{student.student_id}</td>
                  <td>{student.name}</td>
                  <td className="actions">
                    {recordingStudentId === student.$id ? (
                      <button onClick={stopRecording} className="btn stop-btn">Stop</button>
                    ) : (
                      <button onClick={() => startRecording(student.$id)} className="btn start-btn">Take Test</button>
                    )}

                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => handleFileChange(e, student.$id)}
                      className="file-input"
                    />

                    {selectedFiles[student.$id] && (
                      <button onClick={() => submitUpload(student.$id)} className="btn submit-btn">Submit</button>
                    )}

                    
                      <button
                        onClick={() => handleAnalyse(student.$id, collectionId)}
                        className="btn analyse-btn"
                      >
                        Analyse
                      </button>
                    

                      <button
  onClick={() => handleView(student.$id, collectionId)}
  className="btn dashboard-btn"
>
  View
</button>

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
