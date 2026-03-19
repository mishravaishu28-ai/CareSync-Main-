const BottomNav = () => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 pb-6 shadow-lg">
    <button className="flex flex-col items-center text-blue-600">
      <span className="text-xs font-bold">Home</span>
    </button>
    <button className="flex flex-col items-center text-gray-400">
      <span className="text-xs font-bold">AI Chat</span>
    </button>
    <button className="flex flex-col items-center text-gray-400">
      <span className="text-xs font-bold">Profile</span>
    </button>
  </div>
);