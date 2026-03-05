export default function Navbar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-pink-700 border-t p-4 flex justify-around shadow-lg">
      <span className="text-blue-600 font-bold cursor-pointer">Home</span>
      <span className="text-white cursor-pointer">Hospitals</span>
      <span className="text-white cursor-pointer">SOS</span>
    </nav>
  
  );
}