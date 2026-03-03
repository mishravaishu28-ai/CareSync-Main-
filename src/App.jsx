import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard top par rahega */}
      <Dashboard />
      
      {/* Navbar hamesha bottom par "fixed" rahega */}
      <Navbar />
    </div>
  );
}

export default App;