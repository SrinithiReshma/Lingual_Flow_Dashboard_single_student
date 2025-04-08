// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StudentList from "./StudentList";
import Dashboard from "./Dashboard";
import TestPage from "./components/ui/TestPage"; // ✅ Import the TestPage

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StudentList />} />
        <Route path="/dashboard/:id" element={<Dashboard />} />
        <Route path="/start-test" element={<TestPage />} /> {}
      </Routes>
    </Router>
  );
}

export default App;
