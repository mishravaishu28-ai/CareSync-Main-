// src/pages/sosbutton/SOSButton.jsx
const SOSButton = ({ onActivate }) => {
  return (
    <div className="relative -mt-14">
      <div className="absolute inset-0 bg-rose-200 rounded-full animate-ping opacity-30"></div>
      <button 
        onClick={onActivate} // This connects to handleSOSClick in the Dashboard
        className="relative w-24 h-24 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-xl border-8 border-white active:scale-90 transition-all"
      >
        <span className="text-2xl font-black tracking-tighter">SOS</span>
      </button>
    </div>
  );
};
export default SOSButton;