import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StudentList from "./StudentList";
import Dashboard from "./Dashboard";
import TestPage from "./components/ui/TestPage";
import WelcomePage from "./components/ui/WelcomePage"; // ✅ New Import

import CollectionDetailsPage from './components/ui/CollectionDetailsPage';
import EvaluatePage from './components/ui/EvaluatePage';

// Inside <Routes>:

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} /> {/* ✅ Welcome Page as front */}
        <Route path="/collection/:collectionId" element={<CollectionDetailsPage />} />
        
        <Route path="/students" element={<StudentList />} />
        <Route path="/dashboard/:id" element={<Dashboard />} />
        <Route path="/start-test" element={<TestPage />} />
        <Route path="/evaluate/:collectionId" element={<EvaluatePage />} />

      </Routes>
    </Router>
  );
}

export default App;
