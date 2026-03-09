import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import HealthForm from './pages/HealthForm';

function App() {
  const [user, setUser] = useState(null); 
  // Fixed naming: variables must match!
  const [healthData, setHealthData] = useState(null);

  return (
    <Router>
      <Routes>

        
        {/* 1. Login/Home Route */}
        <Route 
          path="/" 
          element={!user ? <Login setUser={setUser} /> : <Navigate to={`/${user.role}`} />} 
        />

        {/* 2. Unified Student Route (Logic fixed) */}
        <Route 
         path="/student" 
         element={
           user?.role === 'student' ? (
            !healthData ? (
            <HealthForm onComplete={(data) => setHealthData(data)} />
           ) : (
            <StudentDashboard 
             healthData={healthData} 
             setHealthData={setHealthData} 
             user={user} 
            />
            )
           ) : (
               <Navigate to="/" />
             ) 
           }    
       />
        {/* 3. Hospital Route */}
        <Route 
          path="/hospital" 
          element={user?.role === 'hospital' ? <HospitalDashboard /> : <Navigate to="/" />} 
        />
         
        {/* 4. Catch-all: Redirect unknown paths to Login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;