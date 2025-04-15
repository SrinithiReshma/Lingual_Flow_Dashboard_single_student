import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StudentList from "./StudentList";
import Dashboard from "./Dashboard";
import TestPage from "./components/ui/TestPage";
import WelcomePage from "./components/ui/WelcomePage"; // ✅ New Import
import CollectionDetailsPage from './components/ui/CollectionDetailsPage';
import EvaluatePage from './components/ui/EvaluatePage';
import HomePage from './components/ui/HomePage'; // ✅ Front Page

function App() {
  return (
    <Router>
      <Routes>
        {/* Front page: HomePage */}
        <Route path="/" element={<HomePage />} /> {/* ✅ HomePage as front */}

        {/* Other Routes */}
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/collection/:collectionId" element={<CollectionDetailsPage />} />
        <Route path="/students" element={<StudentList />} />
        <Route path="/dashboard/:id" element={<Dashboard />} />
        <Route path="/start-test" element={<TestPage />} />
        <Route path="/evaluate/:collectionId" element={<EvaluatePage />} />
        <Route path="/dashboard/:collectionId/:id" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
