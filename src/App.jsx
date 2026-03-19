import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Login'; // Make sure path is correct
import HealthForm from './pages/HealthForm';
import StudentDashboard from './pages/StudentDashboard';
import HospitalDashboard from './pages/HospitalDashboard';

function App() {
  const [user, setUser] = useState(null); 
  const [healthData, setHealthData] = useState(null);

  return (
    <Router>
      <Routes>
        {/* Login Page Route */}
        <Route 
          path="/" 
          element={!user ? <Auth setUser={setUser} /> : <Navigate to={`/${user.role}`} />} 
        />

        {/* Student Logic: If no health data, show Form, else Dashboard */}
        <Route 
          path="/student" 
          element={
            user?.role === 'student' ? (
              !healthData ? (
                <HealthForm onComplete={(data) => setHealthData(data)} />
              ) : (
                <StudentDashboard healthData={healthData} user={user} />
              )
            ) : <Navigate to="/" />
          } 
        />

        {/* Hospital Route */}
        <Route 
          path="/hospital" 
          element={user?.role === 'hospital' ? <HospitalDashboard /> : <Navigate to="/" />} 
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;