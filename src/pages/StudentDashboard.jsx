import React, { useState } from 'react';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');

  // Logic to switch between views
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 animate-fade-in">
            <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-teal-100">
              <span className="text-5xl">🧘‍♀️</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-700 leading-tight">Take a deep breath.</h1>
            <p className="text-slate-500 mt-4 text-lg font-light max-w-xs">
              Everything is going to be okay. We are here to support you.
            </p>
          </div>
        );
      case 'ai-chat':
        return (
          <div className="flex-1 p-6 flex flex-col animate-fade-in">
            <h2 className="text-xl font-semibold text-slate-700 mb-4">AI Companion</h2>
            <div className="flex-1 bg-white/50 rounded-3xl p-4 border border-slate-100 shadow-inner">
               <p className="text-slate-400 italic text-sm text-center mt-10">How are you feeling today? Start typing...</p>
            </div>
          </div>
        );
      case 'wellness':
        return (
          <div className="flex-1 p-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-slate-700 mb-6">Wellness Corner</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-5 bg-teal-50/50 rounded-2xl border border-teal-100">
                <p className="text-teal-800 font-medium">Daily Mood Tracker</p>
                <p className="text-teal-600 text-xs">How was your day?</p>
              </div>
              <div className="p-5 bg-sky-50/50 rounded-2xl border border-sky-100">
                <p className="text-sky-800 font-medium">Quick Meditation</p>
                <p className="text-sky-600 text-xs">2-minute breathing exercise</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    // Background uses a soft Sea Blue/Green gradient
    <div className="min-h-screen bg-blue-50 from-slate-50 to-teal-50 flex flex-col pb-28">
      
      {/* Dynamic Main Section */}
      {renderContent()}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.05)] rounded-t-[3rem] px-8 py-5 z-50">
        <div className="flex items-center justify-between relative">
          
          {/* Left: AI Chat Tab */}
          <button 
            onClick={() => setActiveTab('ai-chat')}
            className={`flex flex-col items-center transition-all duration-300 ${activeTab === 'ai-chat' ? 'text-teal-600 scale-110' : 'text-slate-400'}`}
          >
            <div className={`p-2 rounded-xl ${activeTab === 'ai-chat' ? 'bg-teal-50' : ''}`}>
               <span className="text-2xl">☁️</span>
            </div>
            <span className="text-[10px] font-bold mt-1 tracking-widest uppercase">AI Chat</span>
          </button>

          {/* CENTRE: SOS Button (Safety First) */}
          <div className="relative -mt-14">
            <div className="absolute inset-0 bg-rose-200 rounded-full animate-ping opacity-30"></div>
            <button className="relative w-24 h-24 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-xl border-8 border-white active:scale-90 transition-all">
              <span className="text-2xl font-black tracking-tighter">SOS</span>
            </button>
          </div>

          {/* Right: Wellness Tab */}
          <button 
            onClick={() => setActiveTab('wellness')}
            className={`flex flex-col items-center transition-all duration-300 ${activeTab === 'wellness' ? 'text-teal-600 scale-110' : 'text-slate-400'}`}
          >
            <div className={`p-2 rounded-xl ${activeTab === 'wellness' ? 'bg-teal-50' : ''}`}>
               <span className="text-2xl">🌱</span>
            </div>
            <span className="text-[10px] font-bold mt-1 tracking-widest uppercase">Wellness</span>
          </button>
          
        </div>
      </nav>
    </div>
  );
};

export default StudentDashboard;