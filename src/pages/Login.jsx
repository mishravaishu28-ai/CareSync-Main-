import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../utils/firebaseConfig';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from "firebase/firestore";
import { firestore as db } from "../utils/firebaseConfig"; 

export default function Auth({ setUser }) {
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('student');
  const [step, setStep] = useState(1);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const recaptchaVerifierRef = useRef(null);

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    hospName: '',
    hospID: '',
    hospContact: '',
  });

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer(x => x - 1), 1000);
    }

    return () => clearInterval(interval);
  }, [step, timer]);
            
  const updateField = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  function setupRecaptcha() {
    
    if (recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current.clear();
      recaptchaVerifierRef.current = null;
    }

    
    recaptchaVerifierRef.current = new RecaptchaVerifier(
      auth,         
      'recaptcha-container',
      {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA verified');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired, please try again');
          alert('reCAPTCHA expired. Please try again.');
        },
      }
    );

    return recaptchaVerifierRef.current;
  }

 
  async function handleSendOtp(e) {
    e?.preventDefault();
    setLoading(true);

    try {
      const verifier = setupRecaptcha(); 

      const phoneWithCode = `+91${formData.phone}`; 
      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneWithCode,
        verifier
      );

      window.confirmationResult = confirmation;
      setStep(2);
      setTimer(60);

    } catch (err) {
      console.error('OTP send error:', err);

     
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }

      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (otp.length < 6) {
      alert('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const result = await window.confirmationResult.confirm(otp);

      if (result.user) {
        const userData = {
          uid: result.user.uid,
          role: role,
          phone: formData.phone,
          email: formData.email,
          ...(role === 'hospital' && {
            hospName: formData.hospName,
            hospID: formData.hospID,
            hospContact: formData.hospContact,
          }),
        };

        await setDoc(doc(db, 'users', result.user.uid), userData, { merge: true });
        console.log('Saved to users:', userData);

        setUser(userData);
        navigate(role === 'student' ? '/form' : '/hospital');
      }
    } catch (err) {
      console.error('OTP verify error:', err);
      alert('Wrong OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = `
    w-full bg-[#1d2e3f] border border-[#243548] rounded-2xl px-4 py-3.5
    text-sm font-medium text-[#e8f1f8] placeholder:text-[#4d6a82]
    focus:border-[#247d79] focus:ring-2 focus:ring-[#247d79]/20
    transition-all duration-200 outline-none
  `;

  const labelClass = `block text-[10px] font-semibold text-[#8ba5be] uppercase tracking-widest mb-1.5`;

  return (
    <div className="min-h-screen bg-[#0f1923] flex items-center justify-center p-4 relative overflow-hidden font-sans">

      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-125 h-125 rounded-full bg-[#247d79]/8 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-75 h-75 rounded-full bg-[#f59e0b]/5 blur-[80px] pointer-events-none" />

      <div className={`relative w-full max-w-105 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[22px] bg-linear-to-br from-[#247d79] to-[#1c6360] shadow-[0_0_32px_rgba(36,125,121,0.4)] mb-4">
            <span className="text-3xl">⚕️</span>
          </div>
          <h1 className="text-2xl font-bold text-[#e8f1f8] tracking-tight">CareSync</h1>
          <p className="text-xs text-[#8ba5be] mt-1 tracking-wide">IIT Patna Health Portal</p>
        </div>

        <div className="bg-[#162230]/80 backdrop-blur-xl rounded-4xl border border-[#243548] shadow-[0_8px_40px_rgba(0,0,0,0.4)] overflow-hidden">
          <div className="p-6 sm:p-8">

            <div className="flex bg-[#0f1923] rounded-2xl p-1 mb-6">
              {[['login', 'Sign In'], ['signup', 'Sign Up']].map(([m, label]) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setStep(1); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300
                    ${mode === m
                      ? 'bg-linear-to-r from-[#247d79] to-[#1c6360] text-white shadow-[0_0_16px_rgba(36,125,121,0.35)]'
                      : 'text-[#4d6a82] hover:text-[#8ba5be]'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex gap-3 mb-6">
              {[['student', 'Student', '🎓'], ['hospital', 'Hospital', '🏥']].map(([r, label, icon]) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border text-xs font-bold uppercase tracking-wide transition-all duration-200
                    ${role === r
                      ? 'border-[#247d79] bg-[#247d79]/15 text-[#3d9b96] shadow-[0_0_16px_rgba(36,125,121,0.2)]'
                      : 'border-[#243548] text-[#4d6a82] hover:border-[#2d4156]'}`}
                >
                  <span className="text-xl">{icon}</span>
                  {label}
                </button>
              ))}
            </div>

            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="you@iitpatna.ac.in"
                    className={inputClass}
                    value={formData.email}
                    onChange={e => updateField('email', e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Mobile Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit number"
                    maxLength={10}
                    className={inputClass}
                    value={formData.phone}
                    onChange={e => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  />
                </div>

                {mode === 'signup' && role === 'hospital' && (
                  <div className="space-y-3 p-4 rounded-2xl border border-[#247d79]/30 bg-[#091e1d]/40">
                    <p className="text-[10px] font-bold text-[#3d9b96] uppercase tracking-widest">Hospital Details</p>
                    <input type="text" required placeholder="Hospital Name" className={inputClass} onChange={e => updateField('hospName', e.target.value)} />
                    <input type="text" required placeholder="Registration ID" className={inputClass} onChange={e => updateField('hospID', e.target.value)} />
                    <input type="tel" required placeholder="Official Contact Number" className={inputClass} onChange={e => updateField('hospContact', e.target.value)} />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-linear-to-r from-[#247d79] to-[#1c6360] text-white font-bold text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(36,125,121,0.35)] hover:shadow-[0_0_32px_rgba(36,125,121,0.55)] active:scale-95 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending OTP…</>
                    : `Continue as ${role === 'student' ? 'Student' : 'Hospital'} →`}
                </button>
              </form>
            )}

            {step === 2 && (
              <div className="text-center space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-[#247d79]/15 border border-[#247d79]/30 flex items-center justify-center mx-auto text-2xl">
                  📩
                </div>
                <p className="text-sm text-[#8ba5be]">
                  OTP sent to <span className="text-[#e8f1f8] font-semibold">+91 {formData.phone}</span>
                </p>

                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={`${inputClass} text-center text-2xl font-bold tracking-[0.8rem] py-4`}
                  placeholder="——————"
                />

                <p className="text-xs text-[#4d6a82]">
                  {timer > 0
                    ? <>Resend in <span className="text-[#3d9b96] font-bold">{timer}s</span></>
                    : <button type="button" onClick={handleSendOtp} className="text-[#3d9b96] font-bold">Resend OTP</button>}
                </p>

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length < 6}
                  className="w-full py-4 rounded-2xl bg-linear-to-r from-[#247d79] to-[#1c6360] text-white font-bold text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(36,125,121,0.35)] active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying…</>
                    : 'Verify & Continue →'}
                </button>

                <button type="button" onClick={() => setStep(1)} className="text-xs text-[#4d6a82] hover:text-[#8ba5be] transition-colors">
                  ← Back
                </button>
              </div>
            )}

          
            <div id="recaptcha-container" />

            <p className="text-center text-xs text-[#4d6a82] mt-6">
              {mode === 'login' ? "New here? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setStep(1); }}
                className="text-[#3d9b96] font-bold hover:text-[#72bdb8] transition-colors"
              >
                {mode === 'login' ? 'Create account' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] text-[#4d6a82] mt-5">
          CareSync PWA v2.0 · IIT Patna
        </p>
      </div>
    </div>
  );
}
