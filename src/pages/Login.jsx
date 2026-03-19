import React, { useState, useEffect } from 'react';
import { auth } from "../utils/firebaseConfig";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

const Auth = ({ setUser }) => { // FIX 1: Prop added
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); 
  const [role, setRole] = useState('student'); 
  const [step, setStep] = useState(1); 
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(""); 
  const [formData, setFormData] = useState({
    email: '', phone: '', password: '', 
    hospName: '', hospID: '', hospContact: ''
  });
  
  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
    }
  };

  const handleAction = async (e) => {
    if (e) e.preventDefault();
    try {
      setupRecaptcha();
      const formatPh = `+91${formData.phone}`; 
      const confirmation = await signInWithPhoneNumber(auth, formatPh, window.recaptchaVerifier);
      window.confirmationResult = confirmation;
      setStep(2); 
      setTimer(60);
    } catch (error) {
      console.error("SMS Error:", error);
      alert("OTP Error. Check Console.");
    }
  };

  const verifyOtp = async (e) => {
    if (e) e.preventDefault(); 
    try {
      const result = await window.confirmationResult.confirm(otp);
      if (result.user) {
        // FIX 2: Update user state
        setUser({ uid: result.user.uid, role: role });
        navigate(role === 'student' ? "/student" : "/hospital"); 
      }
    } catch (error) {
      alert("Wrong OTP! Try again...");
    }
  };

  const oceanGreen = "bg-[#2D9383]";
  const oceanText = "text-[#2D9383]";
  const mintBg = "bg-[#F0F9F7]";

  return (
    <div className={`min-h-screen ${mintBg} flex items-center justify-center p-6 font-sans`}>
      <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl border border-[#D1EAE5]">
        
        <div className="text-center mb-8">
          <h2 className={`text-2xl font-black ${oceanText} uppercase tracking-widest`}>
            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">IIT Patna Health Portal</p>
        </div>

        {/* FIX 3: Dynamic onSubmit */}
        <form onSubmit={step === 1 ? handleAction : verifyOtp} className="space-y-4">
          {step === 1 ? (
            <>
              {mode === 'signup' && (
                <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl mb-4">
                  <button type="button" onClick={() => setRole('student')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${role === 'student' ? `${oceanGreen} text-white shadow-md` : 'text-slate-400'}`}>Student</button>
                  <button type="button" onClick={() => setRole('hospital')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${role === 'hospital' ? `${oceanGreen} text-white shadow-md` : 'text-slate-400'}`}>Hospital</button>
                </div>
              )}

              <input type="email" placeholder="Email Address" required className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-[#2D9383] text-sm font-bold" />
              
              <input 
                type="tel" 
                placeholder="Mobile Number (10 digit)" 
                required 
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-[#2D9383] text-sm font-bold" 
              />

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

              <button type="submit" className={`w-full ${oceanGreen} text-white py-4 rounded-2xl font-black uppercase shadow-lg`}>
                {mode === 'forgot' ? 'Send OTP' : 'Continue'}
              </button>
            </>
          ) : (
            <div className="space-y-6 animate-slide-up text-center">
              <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                <span className="text-4xl">📩</span>
                <p className="text-xs font-bold text-slate-500 mt-4">We've sent a code to your device</p>
                <input 
                  type="text" 
                  maxLength="6" 
                  placeholder="000000"
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full mt-6 p-4 text-center text-xl font-black bg-white rounded-2xl border-2 border-slate-100 focus:border-[#2D9383] outline-none tracking-[0.5rem]" 
                />
                <p className={`text-[10px] mt-6 font-black ${timer > 0 ? 'text-slate-400' : 'text-rose-500'}`}>
                  {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP Now'}
                </p>
              </div>
              {/* Change type to button to prevent form double-submit */}
              <button type="button" onClick={verifyOtp} className={`w-full ${oceanGreen} text-white py-4 rounded-2xl font-black uppercase shadow-lg`}>
                Verify & {mode === 'login' ? 'Sign In' : 'Proceed'}
              </button>
              <button type="button" onClick={() => setStep(1)} className="text-[10px] font-black text-slate-300 uppercase">Go Back</button>
            </div>
          )}
          <div id="recaptcha-container"></div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => {setMode(mode === 'login' ? 'signup' : 'login'); setStep(1);}} className={`${oceanText} cursor-pointer`}>
              {mode === 'login' ? 'Create One' : 'Login Here'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;