// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StudentList from "./StudentList";
import Dashboard from "./Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StudentList />} />
        <Route path="/dashboard/:id" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
