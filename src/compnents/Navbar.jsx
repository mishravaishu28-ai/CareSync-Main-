import { Link } from 'react-router-dom';
import { Home, Hospital, AlertTriangle } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="flex justify-around p-4 bg-white shadow-md fixed bottom-0 w-full">
      <Link to="/"><Home /></Link>
      <Link to="/hospitals"><Hospital /></Link>
      <Link to="/sos"><AlertTriangle className="text-red-600" /></Link>
    </nav>
  );
}