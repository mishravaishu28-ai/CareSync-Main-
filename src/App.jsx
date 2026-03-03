import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import HospitalView from './pages/HospitalView';
import SOSButton from './components/SOSButton';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/hospitals" element={<HospitalView />} />
          <Route path="/sos" element={<SOSButton />} />
        </Routes>
        <Navbar />
      </div>
    </Router>
  );
}

export default App;