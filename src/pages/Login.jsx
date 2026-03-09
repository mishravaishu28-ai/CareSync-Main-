import React, { useState, useEffect } from 'react';

const Auth = () => {
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'forgot'
  const [role, setRole] = useState('student'); // 'student', 'hospital'
  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [timer, setTimer] = useState(60);
  const [formData, setFormData] = useState({
    email: '', phone: '', password: '', 
    hospName: '', hospID: '', hospContact: ''
  });

  // Timer logic for OTP
  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleAction = (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2); // OTP mangne ke liye step 2 par le jayein
      setTimer(60);
    } else {
      alert(`${mode.toUpperCase()} Successful! Redirecting to Dashboard...`);
      // Yahan Dashboard navigation ka logic aayega
    }
  };

  const oceanGreen = "bg-[#2D9383]";
  const oceanText = "text-[#2D9383]";
  const mintBg = "bg-[#F0F9F7]";

  return (
    <div className={`min-h-screen ${mintBg} flex items-center justify-center p-6 font-sans`}>
      <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl border border-[#D1EAE5]">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className={`text-2xl font-black ${oceanText} uppercase tracking-widest`}>
            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">IIT Patna Health Portal</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleAction} className="space-y-4">
            
            {/* Role Selection (Only for Signup) */}
            {mode === 'signup' && (
              <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl mb-4">
                <button type="button" onClick={() => setRole('student')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${role === 'student' ? `${oceanGreen} text-white shadow-md` : 'text-slate-400'}`}>Student</button>
                <button type="button" onClick={() => setRole('hospital')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${role === 'hospital' ? `${oceanGreen} text-white shadow-md` : 'text-slate-400'}`}>Hospital</button>
              </div>
            )}

            {/* Common Fields */}
            <input type="email" placeholder="Email Address" required className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-[#2D9383] text-sm font-bold" />
            
            {mode === 'signup' && (
              <input type="tel" placeholder="Mobile Number" required className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-[#2D9383] text-sm font-bold" />
            )}

            {/* Hospital Specific Fields */}
            {mode === 'signup' && role === 'hospital' && (
              <div className="space-y-4 animate-slide-down">
                <input type="text" placeholder="Hospital Name" required className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-[#2D9383] text-sm font-bold" />
                <input type="text" placeholder="Hospital Registration ID" required className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-[#2D9383] text-sm font-bold" />
                <input type="tel" placeholder="Official Contact No." required className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-[#2D9383] text-sm font-bold" />
              </div>
            )}

            {mode !== 'forgot' && (
              <input type="password" placeholder="Password" required className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-[#2D9383] text-sm font-bold" />
            )}

            {/* Forgot Password Link */}
            {mode === 'login' && (
              <button type="button" onClick={() => {setMode('forgot'); setStep(1);}} className="text-[10px] font-black text-rose-400 uppercase tracking-widest block ml-auto">Forgot Password?</button>
            )}

            <button type="submit" className={`w-full ${oceanGreen} text-white py-4 rounded-2xl font-black uppercase shadow-lg active:scale-95 transition-all mt-4`}>
              {mode === 'forgot' ? 'Send OTP' : 'Continue'}
            </button>
          </form>
        ) : (
          /* STEP 2: OTP VERIFICATION */
          <div className="space-y-6 animate-slide-up text-center">
            <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
              <span className="text-4xl">📩</span>
              <p className="text-xs font-bold text-slate-500 mt-4">We've sent a code to your device</p>
              <div className="flex gap-2 justify-center mt-6">
                {[1, 2, 3, 4].map((i) => (
                  <input key={i} type="text" maxLength="1" className="w-12 h-14 text-center text-xl font-black bg-white rounded-xl border-2 border-slate-100 focus:border-[#2D9383] outline-none" />
                ))}
              </div>
              <p className={`text-[10px] mt-6 font-black ${timer > 0 ? 'text-slate-400' : 'text-rose-500'}`}>
                {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP Now'}
              </p>
            </div>
            <button onClick={handleAction} className={`w-full ${oceanGreen} text-white py-4 rounded-2xl font-black uppercase shadow-lg`}>Verify & {mode === 'login' ? 'Sign In' : 'Proceed'}</button>
            <button onClick={() => setStep(1)} className="text-[10px] font-black text-slate-300 uppercase">Go Back</button>
          </div>
        )}

        {/* Footer Toggle */}
        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
          {mode === 'login' ? (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Don't have an account? <span onClick={() => {setMode('signup'); setStep(1);}} className={`${oceanText} cursor-pointer`}>Create One</span>
            </p>
          ) : (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Already have an account? <span onClick={() => {setMode('login'); setStep(1);}} className={`${oceanText} cursor-pointer`}>Login Here</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;