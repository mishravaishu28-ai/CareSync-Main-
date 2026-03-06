import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import HospitalDashboard from './pages/HospitalDashboard';

function App() {
  // Logic 1: State management. User shuru me 'null' hai.
  const [user, setUser] = useState(null); 

  return (
    <Router>
      <Routes>
        {/* Logic 2: Conditional Rendering. 
            Agar user null hai, toh Login dikhao. 
            Jaise hi Login se data aayega, ye Navigate kar dega user.role par. */}
        <Route 
          path="/" 
          element={!user ? <Login setUser={setUser} /> : <Navigate to={`/${user.role}`} />} 
        />

        {/* Logic 3: Protected Routes. 
            Ye check karta hai ki kya user ka role 'student' hai? 
            Nahi toh wapas "/" (login) par bhej deta hai. */}
        <Route 
          path="/student" 
          element={user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/" />} 
        />
        
        <Route 
          path="/hospital" 
          element={user?.role === 'hospital' ? <HospitalDashboard /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;