import React, { useState, useEffect, useRef } from 'react';

const StudentDashboard = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [showMedicalID, setShowMedicalID] = useState(false);
  const [showGovHelpline, setShowGovHelpline] = useState(false);
  const [mood, setMood] = useState(null);
  const [quote, setQuote] = useState("Aapki mental health sabse zaroori hai. ✨");
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  
  // Form ka data yahan se access hoga
  const userData = user || {
    fullName: 'IITP Student', age: '20', bloodGroup: 'O+', 
    emergencyPhone: '9152987821', allergies: 'None', medications: 'None', photo: null 
  };

  // Chat States
  const [messages, setMessages] = useState([{ text: `Hi ${userData.fullName}! Main tera AI friend hoon. Kya baat karni hai?`, sender: 'ai' }]);
  const [inputText, setInputText] = useState('');
  const chatRef = useRef(null); 
   
  // --- GOOGLE MAPS CONNECTIVITY ---
  const findNearestHospital = () => {
    // Ye direct Google Maps par hospitals search karega
    window.open(`https://www.google.com/maps/search/hospitals+near+me`, '_blank');
  }; 

  
  // SOS Logic
  useEffect(() => {
    let timer;
    if (sosActive && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (countdown === 0) {
      alert("ALERT: SOS signal hospital dashboard par bhej diya gaya hai!");
      setSosActive(false);
      setCountdown(5);
    }
    return () => clearInterval(timer);
  }, [sosActive, countdown]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) setUser({ ...userData, photo: URL.createObjectURL(file) });
  };

  const quotes = [
    "You are stronger than you think! 💪",
    "Thoda sa break lena kamzori nahi hai. 🌿",
    "IITP ka star hai tu, fikar mat kar! ✨",
    "Chhoti chhoti jeet ko celebrate karein. 🚀",
    "Tum nhi Kroge to kaun krega!💪",
    "Yaha tak aye ho,itni jldi haar man loge"
  ];

  const govNumbers = [
    { n: "Suicide Prevention (KIRAN)", num: "18005990019" },
    { n: "Women Helpline", num: "1091" },
    { n: "Student Helpline", num: "06115233041" },
    { n: "Child Helpline", num: "1098" }
  ];
  

  const oceanGreen = "bg-[#2D9383]";
  const oceanText = "text-[#2D9383]";
  const mintBg = "bg-[#F0F9F7]";

  return (
    <div className={`min-h-screen ${mintBg} font-sans pb-32 relative overflow-x-hidden`}>
      
      {/* --- TOP HEADER --- */}
      <header className="px-6 py-5 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-[#D1EAE5]">
        <button onClick={() => setShowGovHelpline(!showGovHelpline)} className={`text-[10px] font-black ${oceanGreen} text-white px-3 py-2 rounded-xl shadow-md uppercase`}>
           Govt Counseling 📞
        </button>
        <p className="text-[11px] font-black text-slate-400 italic">IIT PATNA HEALTH</p>
      </header>

      {/* --- GOVT HELPLINE DRAWER --- */}
      {showGovHelpline && (
        <div className="px-6 py-4 bg-white border-b-2 border-rose-500 animate-slide-down">
          <p className="text-[9px] font-bold text-rose-500 mb-3 uppercase tracking-widest text-center">Touch to call immediately</p>
          <div className="grid grid-cols-1 gap-2">
            {govNumbers.map((g, i) => (
              <a key={i} href={`tel:${g.num}`} className="flex justify-between items-center bg-rose-50 p-4 rounded-2xl border border-rose-100 active:scale-95 transition-all">
                <span className="text-xs font-black text-rose-700">{g.n}</span>
                <span className="text-xs font-bold text-rose-400">{g.num} 📞</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* --- SOS OVERLAY --- */}
      {sosActive && (
        <div className="fixed inset-0 'z-100' bg-rose-600/90 backdrop-blur-md flex flex-col items-center justify-center text-white">
          <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center animate-ping absolute opacity-20"></div>
          <h1 className="text-8xl font-black mb-4">{countdown}</h1>
          <p className="text-xl font-bold mb-8 uppercase tracking-widest animate-pulse text-center px-10">Sending Alert to Hospital Dashboard...</p>
          <button onClick={() => {setSosActive(false); setCountdown(5);}} className="bg-white text-rose-600 px-10 py-4 rounded-full font-black uppercase shadow-2xl active:scale-90">STOP SOS</button>
        </div>
      )}

      {/* --- MAIN CONTENT --- */}
      <main className="p-6 overflow-y-auto">
        
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Mood Tracker */}
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-teal-300">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-4 text-center">How are you feeling?</p>
              <div className="flex justify-between text-4xl mb-6">
                {['😢', '😟', '😐', '😊', '🤩', '🔥'].map((e) => (
                  <button key={e} onClick={() => {setMood(e); setQuote(quotes[Math.floor(Math.random()*quotes.length)])}} className={`transition-all ${mood === e ? 'scale-125 rotate-6' : 'opacity-30'}`}>{e}</button>
                ))}
              </div>
              <p className="text-xs font-bold text-slate-600 italic text-center bg-[#F0F9F7] p-5 rounded-3xl border border-teal-300">"{quote}"</p>
            </div>
            {/* NEAREST HOSPITAL (NEW OPTION) */}
            <div onClick={findNearestHospital} className="bg-white p-6 rounded-[2.5rem] border-2 border-teal-200 shadow-sm flex items-center justify-between active:scale-95 transition-all">
               <div className="flex items-center gap-4">
                  <span className="text-4xl bg-teal-50 p-3 rounded-2xl">🏥</span>
                  <div>
                     <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Emergency Help</p>
                     <h3 className="text-sm font-bold text-slate-700">Nearest Hospitals</h3>
                  </div>
               </div>
               <span className="text-teal-400 text-xl font-black">➔</span>
            </div>

            {/* Breathing */}
            <div className="bg-white rounded-[3rem] p-6 shadow-sm border border-teal-300">
              <div className="flex items-center gap-3 mb-4"><span className="text-2xl">🧘</span><p className="font-black text-slate-700 text-xs uppercase">Guided Breathing</p></div>
              <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJid2Y4ZzRyeGZ5ZzRyeGZ5ZzRyeGZ5ZzRyeGZ5ZzRyeGZ5JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKuXzhSUIjGyzpS/giphy.gif" className="w-full h-32 object-cover rounded-4xl mb-4" />
              <p className="text-[10px] text-slate-500 text-center font-bold uppercase tracking-tighter">Inhale 4s ... Hold 4s ... Exhale 4s</p>
            </div>

            {/* Water & Diet Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div onClick={() => alert("💧 WATER BENEFITS:\n1. Energy Booster\n2. Clear Skin\n3. Kidney Health\n4. Brain Focus\n5. Better Digestion\n\n❌ Problem: Headache & Fatigue")} className="p-6 bg-white rounded-[2.5rem] border border-teal-200 shadow-sm flex flex-col items-center justify-between active:scale-95 transition-all">
                <span className="text-3xl mb-2">💧</span><p className="text-[10px] font-black uppercase">Water Intake</p>
              </div>
              <div onClick={() => alert("🥗 2-MIN RECIPES:\n1. Masala Oats\n2. Sprouts Salad\n3. Peanut Butter Banana\n4. Fruit Yogurt\n5. Boiled Eggs\n6. Roasted Makhana\n7. Corn Salad\n8. Protein Shake")} className="p-6 bg-white rounded-[2.5rem] border border-teal-200 shadow-sm flex flex-col items-center justify-between active:scale-95 transition-all">
                <span className="text-3xl mb-2">🥗</span><p className="text-[10px] font-black uppercase">Diet Food</p>
              </div>
            </div>
          </div>
        )}
             
        
        {/* AI CHAT TAB */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-137.5">
             <div className="flex-1 bg-white rounded-[2.5rem] p-6 shadow-inner border border-[#D1EAE5] overflow-y-auto mb-4" ref={chatRef}>
               {messages.map((m, i) => (
                 <div key={i} className={`mb-4 flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[80%] p-4 'rounded-4xl' text-sm font-bold ${m.sender === 'user' ? `${oceanGreen} text-white rounded-tr-none` : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'}`}>{m.text}</div>
                 </div>
               ))}
             </div>
             <div className="flex gap-2 bg-white p-3 rounded-full shadow-lg border border-[#D1EAE5]">
                <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type a message..." className="flex-1 bg-transparent px-4 py-2 outline-none text-sm font-bold" />
                <button onClick={() => {
                  setMessages([...messages, {text: inputText, sender: 'user'}]);
                  setInputText('');
                  // AI logic can be added here
                }} className={`${oceanGreen} text-white w-12 h-12 rounded-full font-black shadow-lg`}>➔</button>
             </div>
          </div>
        )}

        {/* WELLNESS TAB */}
        {activeTab === 'wellness' && (
          <div className="space-y-3">
             <h2 className={`text-xs font-black ${oceanText} uppercase mb-4 text-center tracking-widest italic`}>Student Life Topics</h2>
             {["Anxiety", "Sleep_deprivation", "Procrastination", "Burnout", "Social_isolation", "Identity_crisis", "Cyberbullying", "Exam_fatigue", "Nutrition", "Yoga", "Mindfulness", "Time_management", "Social_anxiety", "Academic_pressure", "Meditation"].map((topic, i) => (
               <button key={i} onClick={() => window.open(`https://en.wikipedia.org/wiki/${topic}`, '_blank')} className="w-full flex justify-between items-center p-5 bg-white border border-[#D1EAE5] 'rounded-4xl' active:scale-95 shadow-sm">
                 <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">{topic.replace('_', ' ')}</span>
                 <span className={`${oceanText} font-black`}>↗</span>
               </button>
             ))}
          </div>
        )}

        {/* PROFILE / MEDICAL ID TAB */}
        {activeTab === 'profile' && (
          <div className="animate-slide-up">
            <div className={`${oceanGreen} p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              
              <div className="flex flex-col items-center mb-8">
                <label className="relative w-32 h-32 rounded-full border-4 border-white/30 overflow-hidden cursor-pointer bg-white/20 flex items-center justify-center shadow-xl">
                  {userData.photo ? <img src={userData.photo} className="w-full h-full object-cover" /> : <span className="text-4xl">📸</span>}
                  <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                </label>
                <p className="text-[10px] mt-2 font-black uppercase opacity-70">Tap to Change Photo</p>
              </div>

              <div className="space-y-4 font-bold text-sm">
                 <div className="border-b border-white/10 pb-2 flex justify-between"><span>Name:</span> <span>{userData.fullName}</span></div>
                 <div className="border-b border-white/10 pb-2 flex justify-between"><span>Age / Blood:</span> <span>{userData.age} / {userData.bloodGroup}</span></div>
                 <div className="border-b border-white/10 pb-2 flex justify-between"><span>Allergies:</span> <span>{userData.allergies}</span></div>
                 <div className="border-b border-white/10 pb-2 flex justify-between"><span>Medications:</span> <span>{userData.medications}</span></div>
                 <a href={`tel:${userData.emergencyPhone}`} className="block bg-white/20 p-4 rounded-2xl text-center text-xs underline">Emergency: {userData.emergencyPhone} 📞</a>
              </div>
            </div>
            <p className="text-[9px] text-center mt-6 text-slate-400 font-black uppercase tracking-[0.2em]">Student Medical Passport v1.0</p>
          </div>
        )}
      </main>

      {/* --- BOTTOM NAVBAR --- */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-teal-300 rounded-t-[3.5rem] px-6 py-6 flex items-center justify-between shadow-2xl z-50">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? oceanText : 'text-slate-300'}`}>
          <span className="text-2xl">🏠</span><span className="text-[8px] font-black uppercase">Home</span>
        </button>
        <button onClick={() => setActiveTab('chat')} className={`flex flex-col items-center gap-1 ${activeTab === 'chat' ? oceanText : 'text-slate-300'}`}>
          <span className="text-2xl">💬</span><span className="text-[8px] font-black uppercase">AI Chat</span>
        </button>

        {/* SOS ROUND BUTTON */}
        <div className="relative -mt-16">
          <button 
            onClick={() => {setSosActive(true); setCountdown(5);}}
            className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center text-white font-black shadow-[0_10px_30px_rgba(244,63,94,0.4)] border-4 border-white active:scale-90 transition-all text-xl"
          >
            SOS
          </button>
        </div>

        <button onClick={() => setActiveTab('wellness')} className={`flex flex-col items-center gap-1 ${activeTab === 'wellness' ? oceanText : 'text-slate-300'}`}>
          <span className="text-2xl">🌿</span><span className="text-[8px] font-black uppercase">Wellness</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? oceanText : 'text-slate-300'}`}>
          <span className="text-2xl">👤</span><span className="text-[8px] font-black uppercase">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default StudentDashboard;