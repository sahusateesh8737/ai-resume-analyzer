import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AnalysisResult from './pages/AnalysisResult';
import JobBoard from './pages/JobBoard';
import ResumeBuilder from './pages/ResumeBuilder';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analysis/:id" element={<AnalysisResult />} />
        <Route path="/resume/:id/builder" element={<ResumeBuilder />} />
        <Route path="/jobs" element={<JobBoard />} />
      </Routes>
    </Router>
  );
}

export default App;
