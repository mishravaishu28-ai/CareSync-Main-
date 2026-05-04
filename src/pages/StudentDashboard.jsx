import React, { useState, useEffect, useRef } from 'react';
import { getGeminiResponse, isCrisis, isPanic } from '../utils/geminiApi';
import { Send } from 'lucide-react';
import { db } from '../utils/firebaseConfig';
import { ref, push, serverTimestamp } from 'firebase/database';

// ─────────────────────────────────────────────────────────────────────────────
// BREATHING EXERCISE COMPONENT
//
// A real guided breathing session with a live animated circle.
// Three phases run in a loop: Inhale 4s → Hold 4s → Exhale 6s.
//
// The circle grows during inhale and shrinks during exhale using
// CSS transform: scale() with a smooth transition. The scale value
// is calculated from how far through the current phase we are.
// ─────────────────────────────────────────────────────────────────────────────

const BREATH_PHASES = [
  { name: 'inhale', duration: 4, label: 'Breathe In',  color: '#247d79' },
  { name: 'hold',   duration: 4, label: 'Hold',        color: '#f59e0b' },
  { name: 'exhale', duration: 6, label: 'Breathe Out', color: '#3d9b96' },
];

function BreathingExercise() {
  const [running,  setRunning]  = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(BREATH_PHASES[0].duration);
  const [cycles,   setCycles]   = useState(0);

  const current = BREATH_PHASES[phaseIdx];

  // Runs the per-second countdown. When timeLeft hits 0, moves to next phase.
  useEffect(() => {
    if (!running) return;
    const tick = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          const nextIdx = (phaseIdx + 1) % BREATH_PHASES.length;
          setPhaseIdx(nextIdx);
          if (nextIdx === 0) setCycles(c => c + 1); // full round done
          return BREATH_PHASES[nextIdx].duration;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick); // stops the interval when phase changes
  }, [running, phaseIdx]);

  // Progress: 0.0 = just started this phase, 1.0 = phase about to end
  const progress = (current.duration - timeLeft) / current.duration;

  // Circle scale changes smoothly based on phase
  const scale = !running           ? 1.0
    : current.name === 'inhale'    ? 1.0 + progress * 0.5  // grows 1.0 → 1.5
    : current.name === 'hold'      ? 1.5                    // stays big
    : 1.5 - progress * 0.5;                                 // shrinks 1.5 → 1.0

  function toggle() {
    if (running) {
      setRunning(false);
      setPhaseIdx(0);
      setTimeLeft(BREATH_PHASES[0].duration);
      setCycles(0);
    } else {
      setPhaseIdx(0);
      setTimeLeft(BREATH_PHASES[0].duration);
      setRunning(true);
    }
  }

  return (
    <div style={{ background: '#162230', borderRadius: 24, padding: 20, border: '1px solid #243548', textAlign: 'center' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🧘</span>
          <p style={{ fontWeight: 800, color: '#e8f1f8', fontSize: 12, textTransform: 'uppercase', margin: 0 }}>Guided Breathing</p>
        </div>
        {cycles > 0 && (
          <span style={{ fontSize: 10, fontWeight: 700, color: '#247d79', background: 'rgba(36,125,121,0.2)', borderRadius: 20, padding: '2px 10px' }}>
            {cycles} {cycles === 1 ? 'cycle' : 'cycles'}
          </span>
        )}
      </div>

      {/* Animated circle — the core visual */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 148, marginBottom: 16 }}>
        {/*
          Outer ring scales up and down.
          transition: transform 0.8s ease creates the smooth breathing animation.
          'ease' feels more natural than 'linear' because it accelerates and
          decelerates just like real breathing does.
        */}
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          border: `2px solid ${running ? current.color : '#243548'}50`,
          background: `${running ? current.color : '#243548'}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: `scale(${scale})`,
          transition: 'transform 0.8s ease, background 0.5s, border-color 0.5s',
        }}>
          {/* Inner solid circle */}
          <div style={{
            width: 68, height: 68, borderRadius: '50%',
            background: running
              ? `linear-gradient(135deg,${current.color},${current.color}bb)`
              : 'linear-gradient(135deg,#243548,#1d2e3f)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: running ? `0 0 20px ${current.color}50` : 'none',
            transition: 'background 0.5s, box-shadow 0.5s',
          }}>
            {running ? (
              <>
                <p style={{ fontSize: 9, fontWeight: 800, color: 'white', margin: 0, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                  {current.label}
                </p>
                <p style={{ fontSize: 24, fontWeight: 900, color: 'white', margin: 0, lineHeight: 1.1 }}>
                  {timeLeft}
                </p>
              </>
            ) : (
              <p style={{ fontSize: 10, fontWeight: 700, color: '#8ba5be', margin: 0 }}>Tap Start</p>
            )}
          </div>
        </div>
      </div>

      {/* Phase pills — highlights which phase is active */}
      {running && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 14 }}>
          {BREATH_PHASES.map((p, i) => (
            <div key={p.name} style={{
              padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
              background: i === phaseIdx ? `${p.color}25` : '#1d2e3f',
              color:      i === phaseIdx ? p.color : '#4d6a82',
              border:     `1px solid ${i === phaseIdx ? p.color + '40' : '#243548'}`,
              transition: 'all 0.4s',
            }}>
              {p.label} {p.duration}s
            </div>
          ))}
        </div>
      )}

      {/* Start / Stop button */}
      <button
        onClick={toggle}
        style={{
          padding: '10px 28px', borderRadius: 20, fontWeight: 800, fontSize: 12,
          cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 0.5, border: 'none',
          background: running ? 'rgba(239,68,68,0.18)' : 'linear-gradient(135deg,#247d79,#1c6360)',
          color:      running ? '#ef4444' : 'white',
          boxShadow:  running ? 'none' : '0 0 14px rgba(36,125,121,0.3)',
          transition: 'all 0.2s',
        }}
      >
        {running ? 'Stop Session' : 'Start Session'}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// StudentDashboard is the main screen for students after they log in and fill the form.
// It has 4 tabs: Home, AI Chat, Wellness, and Profile (My Card).
// The SOS button in the middle of the nav bar is the most important feature.
//
// Props:
//   user    - all the student's data (from HealthForm + login)
//   setUser - lets this component update the user data (for photo change)
// ─────────────────────────────────────────────────────────────────────────────

export default function StudentDashboard({ user, setUser }) {

  // activeTab controls which tab content is visible
  const [activeTab, setActiveTab] = useState('home');

  // showHelpline toggles the emergency numbers drawer at the top
  const [showHelpline, setShowHelpline] = useState(false);

  // Mood tracker - null means no mood selected yet
  const [mood, setMood] = useState(null);
  const [quote, setQuote] = useState('Your health is your wealth. 💙');

  // SOS states
  const [sosActive, setSosActive] = useState(false);      // is the SOS countdown showing?
  const [countdown, setCountdown] = useState(5);          // countdown from 5 to 0
  const [sosSent, setSosSent] = useState(false);          // show success toast after sending
  const [sosLocation, setSosLocation] = useState(null);   // GPS coordinates if available
  const [locationLoading, setLocationLoading] = useState(false); // waiting for GPS

  // Chat states
  const [chatLoading, setChatLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [showCrisisBanner, setShowCrisisBanner] = useState(false);

  // useRef for chat scroll - we need direct DOM access to scroll to the bottom
  // useRef doesn't cause re-renders when it changes, which is what we want here
  const chatRef = useRef(null);

  // Chat message history - each message has a role ('user' or 'model') and text
  const [messages, setMessages] = useState([{
    role: 'model',
    parts: [{ text: "Hey! I'm your CareSync health buddy 💙\nI'm here for health questions, stress, or just a chat. What's going on today?" }],
  }]);

  // Fall back to default values if any field is missing from the user object
  // The || operator means: use the left side, but if it's empty/null/undefined, use the right side
  const userData = {
    fullName:      user?.fullName      || 'IITP Student',
    age:           user?.age           || '',
    bloodGroup:    user?.bloodGroup    || '',
    gender:        user?.gender        || '',
    studentPhone:  user?.studentPhone  || '',
    emergencyPhone:user?.emergencyPhone|| '',
    allergies:     user?.allergies     || 'None',
    chronicDisease:user?.chronicDisease|| 'None',
    medications:   user?.medications   || 'None',
    hostel:        user?.hostel        || 'IIT Patna',
    rollNo:        user?.rollNo        || '',
    photo:         user?.photoURL      || user?.photo || null,
  };

  // Auto-scroll chat to the bottom whenever a new message appears
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, chatLoading]);

  // ── SOS Flow ────────────────────────────────────────────────────────────────

  // Step 1: Student taps SOS button
  // We immediately start getting GPS location while the countdown runs
  async function startSOS() {
    setSosActive(true);
    setCountdown(5);
    setLocationLoading(true);

    // Request GPS coordinates from the browser
    // enableHighAccuracy: true makes the browser try harder to get accurate GPS
    // timeout: 6000 means give up after 6 seconds if GPS isn't working
    // maximumAge: 0 means don't use a cached location - get a fresh one
    const location = await new Promise(resolve => {
      if (!navigator.geolocation) {
        resolve(null); // GPS not supported on this device
        return;
      }
      navigator.geolocation.getCurrentPosition(
        position => resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
        () => resolve(null), // GPS failed or user denied permission
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
      );
    });

    setSosLocation(location);
    setLocationLoading(false);
  }

  // Step 2: The countdown runs via useEffect
  // This effect watches both sosActive and countdown
  // Every second, if SOS is active and countdown > 0, it decrements the countdown
  // When countdown hits 0, it fires the SOS to Firebase
  useEffect(() => {
    let timer;
    if (sosActive && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (sosActive && countdown === 0) {
      sendSOSToFirebase();
    }
    // Cleanup: clear the interval every time this effect re-runs
    // This prevents multiple intervals stacking up
    return () => clearInterval(timer);
  }, [sosActive, countdown]);

  // Step 3: Push all student data + GPS to Firebase Realtime Database
  // The hospital dashboard is listening to this database path
  // As soon as this runs, the hospital sees the alert within 1-2 seconds
  async function sendSOSToFirebase() {
    try {
      // Build the location string and Maps link
      // If GPS worked, we use the exact coordinates
      // If not, we fall back to the campus address
      const locationString = sosLocation
        ? `${sosLocation.lat.toFixed(6)},${sosLocation.lng.toFixed(6)}`
        : 'IIT Patna Campus, Bihta, Patna';

      const googleMapsLink = sosLocation
        ? `https://www.google.com/maps?q=${sosLocation.lat},${sosLocation.lng}`
        : 'https://www.google.com/maps/search/IIT+Patna+Campus';

      // push() creates a new entry in emergency_alerts with an auto-generated ID
      // Every field from the student's health form is included here
      // This is exactly what the hospital dashboard will read and display
      await push(ref(db, 'emergency_alerts'), {

        // Personal info
        studentName:     userData.fullName,
        age:             userData.age,
        gender:          userData.gender,
        rollNo:          userData.rollNo,
        hostel:          userData.hostel,

        // Contact numbers
        phone:           userData.studentPhone,
        emergencyPhone:  userData.emergencyPhone,

        // Medical info - critical for the hospital to know
        bloodGroup:      userData.bloodGroup,
        allergies:       userData.allergies,
        chronicDisease:  userData.chronicDisease,
        medications:     userData.medications,

        // Photo URL from Firebase Storage (not the base64 - that's too large)
        photo:           userData.photo,

        // Location data
        location:        locationString,
        mapsLink:        googleMapsLink,
        locationAccurate: sosLocation !== null, // true = GPS worked, false = campus fallback

        // Meta
        status:    'active',           // hospital will change this to 'resolved'
        timestamp: serverTimestamp(),  // Firebase server time
        uid:       user?.uid || 'anonymous',
      });

      setSosSent(true);
      setTimeout(() => setSosSent(false), 5000); // hide toast after 5 seconds

    } catch (error) {
      console.error('SOS send error:', error);
      alert('SOS could not be sent. Please call 112 directly.');
    }

    // Reset everything regardless of success or failure
    setSosActive(false);
    setCountdown(5);
    setSosLocation(null);
  }

  // ── AI Chat ──────────────────────────────────────────────────────────────────

  async function handleChatSend() {
    if (!inputText.trim() || chatLoading) return;

    const userMessage = inputText.trim();

    // Check for crisis keywords before sending to AI
    // If crisis detected, show the counselor numbers banner immediately
    if (isCrisis(userMessage) || isPanic(userMessage)) {
      setShowCrisisBanner(true);
    }

    // Add the user's message to the chat history
    const updatedMessages = [...messages, { role: 'user', parts: [{ text: userMessage }] }];
    setMessages(updatedMessages);
    setInputText('');
    setChatLoading(true);

    try {
      // Pass the full message history so the AI has context of the conversation
      const aiReply = await getGeminiResponse(userMessage, messages);
      setMessages([...updatedMessages, { role: 'model', parts: [{ text: aiReply }] }]);
    } catch {
      setMessages([...updatedMessages, { role: 'model', parts: [{ text: 'Connection error. Please try again!' }] }]);
    } finally {
      setChatLoading(false);
    }
  }

  // Update the user's profile photo locally (not saved to Firebase - that's in HealthForm)
  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (file) setUser(prev => ({ ...prev, photo: URL.createObjectURL(file) }));
  }

  const quotes = [
    'You are stronger than you think. 💪',
    'Rest is productive too. 🌿',
    'One step at a time. ✨',
    'Celebrate the small wins. 🚀',
    'Your health is your wealth. 💙',
  ];

  const helplineNumbers = [
    { name: 'iCall TISS',          number: '9152987821',  color: '#3d9b96' },
    { name: 'Vandrevala 24/7',      number: '18602662345', color: '#f59e0b' },
    { name: 'IITP Medical Centre',  number: '06123028000', color: '#ef4444' },
    { name: 'Suicide Prevention',   number: '18005990019', color: '#8b5cf6' },
    { name: 'Women Helpline',       number: '1091',        color: '#ec4899' },
    { name: 'National Ambulance',   number: '102',         color: '#22c55e' },
  ];

  const TEAL  = '#247d79';
  const BG    = '#0f1923';
  const CARD  = '#162230';
  const RAISED= '#1d2e3f';
  const BORDER= '#243548';
  const INK   = '#e8f1f8';
  const MUTED = '#8ba5be';
  const SUBTLE= '#4d6a82';
  const RED   = '#ef4444';
  const AMBER = '#f59e0b';

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: "'DM Sans', system-ui, sans-serif", paddingBottom: 90 }}>

      {/* Crisis banner - slides down when dangerous keywords are detected in chat */}
      {showCrisisBanner && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, background: 'linear-gradient(135deg,#dc2626,#7c3aed)', padding: '16px 20px' }}>
          <div className="flex items-center justify-between mb-3">
            <p style={{ color: 'white', fontWeight: 800, fontSize: 13, margin: 0 }}>🆘 Please reach out now</p>
            <button onClick={() => setShowCrisisBanner(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontWeight: 800 }}>✕</button>
          </div>
          {[['iCall TISS', '9152987821'], ['Vandrevala 24/7', '18602662345'], ['IITP Medical', '06123028000']].map(([label, num]) => (
            <a key={num} href={`tel:${num}`} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '8px 12px', color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 12, marginBottom: 6 }}>
              <span>{label}</span><span>{num} 📞</span>
            </a>
          ))}
        </div>
      )}

      {/* SOS sent toast notification */}
      {sosSent && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: '#059669', color: 'white', padding: '12px 24px', borderRadius: 24, fontWeight: 800, fontSize: 13, zIndex: 300, whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          ✅ SOS alert sent to hospital dashboard!
        </div>
      )}

      {/* Full screen SOS overlay - shows during the countdown */}
      {sosActive && (
        /*
          WHY zIndex: 9999?
          Previously zIndex was 150. But the sticky header has zIndex: 50,
          and some browsers stack backdrop-filter elements on top of children.
          Setting 9999 guarantees this overlay is above everything on the page.

          WHY two separate divs?
          The outer div is the red background + backdrop blur.
          The inner div holds all the content (countdown, text, button).
          We keep them separate so the button's onClick is never blocked
          by the background div's event handling.
        */
        <div style={{
          position: 'fixed', inset: 0,
          zIndex: 9999,                         // above everything
          background: 'rgba(220,38,38,0.93)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',    // Safari support
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}>
          {/* Pulsing rings - decorative, pointer-events none so they don't block clicks */}
          <div style={{
            position: 'absolute',
            width: 192, height: 192,
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.3)',
            animation: 'ping 1.2s ease-out infinite',
            pointerEvents: 'none',   // IMPORTANT: this lets clicks pass through to the button
          }} />
          <div style={{
            position: 'absolute',
            width: 288, height: 288,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.15)',
            animation: 'ping 1.2s ease-out infinite',
            animationDelay: '0.3s',
            pointerEvents: 'none',
          }} />

          {/* Countdown number */}
          <h1 style={{ fontSize: 108, fontWeight: 900, margin: 0, lineHeight: 1, position: 'relative', zIndex: 1 }}>
            {countdown}
          </h1>

          {/* Status text */}
          <p style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center', padding: '0 32px', margin: '8px 0 6px', position: 'relative', zIndex: 1 }}>
            {locationLoading ? '📍 Getting your location…' : '🚨 Sending SOS to hospital…'}
          </p>
          <p style={{ fontSize: 11, opacity: 0.75, margin: '0 0 32px', position: 'relative', zIndex: 1 }}>
            {sosLocation ? '📍 GPS location acquired ✓' : !locationLoading ? '📍 Campus location will be used' : ''}
          </p>

          {/*
            Cancel button.
            position: relative + zIndex: 1 makes sure it sits on top of the
            decorative ping rings (which are position: absolute).
            The rings have pointerEvents: none so they never intercept this click.
          */}
          <button
            onClick={() => {
              setSosActive(false);
              setCountdown(5);
              setSosLocation(null);
              setLocationLoading(false);
            }}
            style={{
              position: 'relative',
              zIndex: 1,
              background: 'white',
              color: '#ef4444',
              padding: '16px 40px',
              borderRadius: 50,
              fontWeight: 900,
              fontSize: 15,
              border: 'none',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: 1,
              touchAction: 'manipulation',   // removes 300ms tap delay on mobile
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            ✕ Cancel SOS
          </button>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={{ background: `${CARD}e0`, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${BORDER}`, padding: '12px 20px', position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        <button
          onClick={() => setShowHelpline(v => !v)}
          style={{ fontSize: 10, fontWeight: 800, background: `${TEAL}20`, border: `1px solid ${TEAL}40`, color: '#3d9b96', padding: '8px 12px', borderRadius: 12, cursor: 'pointer', textTransform: 'uppercase' }}
        >
          Helplines 📞
        </button>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: INK, margin: 0 }}>CareSync</p>
          <p style={{ fontSize: 8, color: SUBTLE, fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>IIT Patna</p>
        </div>

        {/* Live indicator dot */}
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 3px rgba(34,197,94,0.3)' }} />
      </header>

      {/* Helpline drawer - slides open when button is tapped */}
      {showHelpline && (
        <div style={{ background: CARD, borderBottom: `2px solid ${RED}`, padding: '12px 16px' }}>
          <p style={{ fontSize: 9, fontWeight: 800, color: RED, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', margin: '0 0 8px' }}>
            Touch to call immediately
          </p>
          {helplineNumbers.map(({ name, number, color }) => (
            <a
              key={number}
              href={`tel:${number}`}
              style={{ display: 'flex', justifyContent: 'space-between', background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 12, padding: '10px 14px', marginBottom: 6, textDecoration: 'none' }}
            >
              <span style={{ fontSize: 12, fontWeight: 800, color: INK }}>{name}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color, fontFamily: 'monospace' }}>{number} 📞</span>
            </a>
          ))}
        </div>
      )}

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <main style={{ padding: '16px 16px 0', maxWidth: 540, margin: '0 auto' }}>

        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Welcome greeting */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: CARD, borderRadius: 20, border: `1px solid ${BORDER}` }}>
              {userData.photo
                ? <img src={userData.photo} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${TEAL}` }} alt="Me" />
                : <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${TEAL}20`, border: `2px solid ${TEAL}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: SUBTLE, margin: 0 }}>Good to see you,</p>
                <p style={{ fontSize: 15, fontWeight: 800, color: INK, margin: 0 }}>{userData.fullName} 👋</p>
              </div>
              {userData.bloodGroup && (
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 9, color: SUBTLE, margin: 0, textTransform: 'uppercase' }}>Blood</p>
                  <p style={{ fontSize: 14, fontWeight: 800, color: RED }}>{userData.bloodGroup}</p>
                </div>
              )}
            </div>

            {/* Mood tracker */}
            <div style={{ background: CARD, borderRadius: 24, padding: 20, border: `1px solid ${BORDER}` }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: SUBTLE, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', margin: '0 0 14px' }}>
                How are you feeling today?
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                {['😔', '😟', '😐', '🙂', '😊', '🔥'].map((emoji, index) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setMood(index);
                      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: mood === index ? 32 : 24, opacity: mood === index ? 1 : 0.4, transform: mood === index ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.2s' }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {mood !== null && (
                <div style={{ background: RAISED, borderRadius: 16, padding: '10px 14px', textAlign: 'center' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: MUTED, margin: 0, fontStyle: 'italic' }}>"{quote}"</p>
                </div>
              )}
            </div>

            {/* Nearest hospitals button */}
            <button
              onClick={() => window.open('https://www.google.com/maps/search/hospitals+near+me', '_blank')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', background: CARD, borderRadius: 22, border: `1px solid ${BORDER}`, cursor: 'pointer', width: '100%' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, background: `${RED}20`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏥</div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: 9, color: RED, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>Emergency Help</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: INK, margin: '2px 0 0' }}>Find Nearest Hospitals</p>
                </div>
              </div>
              <span style={{ color: TEAL, fontSize: 18, fontWeight: 900 }}>→</span>
            </button>

            {/* Guided Breathing — real animated exercise */}
            <BreathingExercise />

            {/* Quick info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { icon: '💧', label: 'Water Tips', msg: '💧 Stay hydrated!\n\n• 8-10 glasses daily minimum\n• Drink more during exams and summer\n• Prevents headaches and fatigue\n• Set reminders every 2 hours' },
                { icon: '🥗', label: 'Quick Meals', msg: '🥗 Quick hostel recipes:\n\n1. Masala Oats (5 min)\n2. Sprouts Salad\n3. Peanut Butter Banana\n4. Boiled Eggs\n5. Roasted Makhana\n6. Fruit with Curd' },
                { icon: '😴', label: 'Sleep Tips', msg: '😴 Better sleep habits:\n\n• 7-8 hours minimum\n• No screens 30 min before bed\n• Same sleep time every day\n• Keep your room cool and dark' },
                { icon: '🏃', label: 'Exercise', msg: '🏃 Stay active on campus:\n\n• 20 min walk = instant mood boost\n• IITP Gym: 6am-9pm daily\n• Sports complex is free for students\n• Use stairs instead of elevator' },
              ].map(({ icon, label, msg }) => (
                <button
                  key={label}
                  onClick={() => alert(msg)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '18px 12px', background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, cursor: 'pointer' }}
                >
                  <span style={{ fontSize: 28 }}>{icon}</span>
                  <p style={{ fontSize: 10, fontWeight: 800, color: INK, textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>{label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI CHAT TAB */}
        {activeTab === 'chat' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)' }}>

            {/* Chat header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: CARD, borderRadius: 20, marginBottom: 12, border: `1px solid ${BORDER}` }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: `${TEAL}20`, border: `1px solid ${TEAL}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: INK, margin: 0 }}>CareSync AI</p>
                <p style={{ fontSize: 10, color: '#22c55e', fontWeight: 600, margin: 0 }}>● Online · Health Buddy</p>
              </div>
            </div>

            {/* Message list - ref lets us auto-scroll to the bottom */}
            <div
              ref={chatRef}
              style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 2, marginBottom: 12 }}
              className="no-scrollbar"
            >
              {/* Disclaimer */}
              <div style={{ background: `${AMBER}15`, border: `1px solid ${AMBER}30`, borderRadius: 14, padding: '10px 14px', marginBottom: 4 }}>
                <p style={{ fontSize: 10, color: '#fbbf24', fontWeight: 700, margin: 0 }}>
                  ⚠️ AI advice is informational only. See a doctor for serious concerns.
                </p>
              </div>

              {messages.map((message, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {message.role === 'model' && (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${TEAL}20`, border: `1px solid ${TEAL}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginRight: 8, alignSelf: 'flex-end' }}>
                      🤖
                    </div>
                  )}
                  <div style={{
                    maxWidth: '78%',
                    padding: '12px 16px',
                    fontSize: 13,
                    lineHeight: 1.65,
                    fontWeight: 500,
                    whiteSpace: 'pre-wrap',
                    borderRadius: message.role === 'user' ? '20px 20px 4px 20px' : '4px 20px 20px 20px',
                    background: message.role === 'user' ? `linear-gradient(135deg,${TEAL},#1c6360)` : RAISED,
                    color: INK,
                    border: message.role === 'user' ? 'none' : `1px solid ${BORDER}`,
                  }}>
                    {message.parts[0].text}
                  </div>
                </div>
              ))}

              {/* Typing indicator - three bouncing dots */}
              {chatLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${TEAL}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
                  <div style={{ background: RAISED, borderRadius: '4px 20px 20px 20px', border: `1px solid ${BORDER}`, padding: '12px 16px', display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map(i => (
                      // Each dot has a different animation delay creating a wave effect
                      <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: TEAL, animation: `bounce 1s ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chat input bar */}
            <div style={{ display: 'flex', gap: 8, background: RAISED, padding: 8, borderRadius: 50, border: `1.5px solid ${BORDER}` }}>
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleChatSend()}
                placeholder="Tell me how you're feeling…"
                disabled={chatLoading}
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, fontWeight: 500, color: INK, padding: '4px 14px' }}
              />
              <button
                onClick={handleChatSend}
                disabled={chatLoading}
                style={{ width: 44, height: 44, background: chatLoading ? SUBTLE : `linear-gradient(135deg,${TEAL},#1c6360)`, border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}
              >
                <Send size={18} color="white" />
              </button>
            </div>
          </div>
        )}

        {/* WELLNESS TAB */}
        {activeTab === 'wellness' && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 800, color: TEAL, textTransform: 'uppercase', textAlign: 'center', marginBottom: 16, letterSpacing: 1 }}>
              Student Life Topics
            </p>
            {/*
              Wikipedia links for each wellness topic.
              replace(/ /g, '_') converts spaces to underscores for the URL.
              _blank opens in a new tab so the student doesn't leave the app.
            */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                ['😰', 'Anxiety'], ['😴', 'Sleep Issues'], ['🔄', 'Procrastination'],
                ['🔥', 'Burnout'], ['🏝️', 'Social Isolation'], ['💻', 'Cyberbullying'],
                ['📚', 'Exam Fatigue'], ['🥗', 'Nutrition'], ['🧘', 'Yoga'],
                ['🧠', 'Mindfulness'], ['⏰', 'Time Management'], ['🎓', 'Academic Pressure'],
              ].map(([icon, label]) => (
                <button
                  key={label}
                  onClick={() => window.open(`https://en.wikipedia.org/wiki/${label.replace(/ /g, '_')}`, '_blank')}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 14px', background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: INK }}>{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE / MY CARD TAB */}
        {activeTab === 'profile' && (
          <div style={{ paddingBottom: 24 }}>
            {/* Health card with gradient background */}
            <div style={{ borderRadius: 28, overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }}>

              {/* Card top section - teal gradient */}
              <div style={{ background: `linear-gradient(135deg,${TEAL},#1c6360)`, padding: '24px 20px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>

                  {/* Tapping the photo opens file picker */}
                  <label style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.4)', overflow: 'hidden', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                      {userData.photo
                        ? <img src={userData.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : '👤'}
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>✏️</div>
                    <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                  </label>

                  <div>
                    <p style={{ fontSize: 9, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1.2, margin: 0, color: 'white' }}>Student Health Card</p>
                    <h2 style={{ fontSize: 19, fontWeight: 800, margin: '4px 0 2px', color: 'white' }}>{userData.fullName || 'Your Name'}</h2>
                    <p style={{ fontSize: 11, opacity: 0.7, margin: 0, color: 'white' }}>{userData.rollNo || '—'} · {userData.hostel || 'IIT Patna'}</p>
                  </div>
                </div>

                {/* Three stat pills */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {[['🩸', userData.bloodGroup || '—', 'Blood'], ['👤', userData.age || '—', 'Age'], ['⚧', userData.gender || '—', 'Gender']].map(([icon, val, lab]) => (
                    <div key={lab} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: '10px 8px', textAlign: 'center' }}>
                      <p style={{ fontSize: 16, margin: '0 0 2px' }}>{icon}</p>
                      <p style={{ fontSize: 13, fontWeight: 800, margin: 0, color: 'white' }}>{val}</p>
                      <p style={{ fontSize: 8, opacity: 0.7, margin: '2px 0 0', textTransform: 'uppercase', color: 'white' }}>{lab}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card bottom section - dark background */}
              <div style={{ background: RAISED, padding: '16px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {[
                    ['⚠️ Allergies', userData.allergies],
                    ['💊 Medications', userData.medications],
                    ['🏥 Condition', userData.chronicDisease],
                    ['📍 Hostel', userData.hostel],
                  ].map(([label, value]) => (
                    <div key={label} style={{ background: CARD, borderRadius: 12, padding: '10px 12px' }}>
                      <p style={{ fontSize: 9, color: SUBTLE, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 3px' }}>{label}</p>
                      <p style={{ fontSize: 12, fontWeight: 700, color: INK, margin: 0 }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Emergency contact buttons */}
                <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>
                  <p style={{ fontSize: 9, color: SUBTLE, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Emergency Contacts</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      [userData.studentPhone, 'My Number', '#3d9b96'],
                      [userData.emergencyPhone, 'Guardian', AMBER],
                    ].filter(([num]) => num).map(([num, label, color]) => (
                      <a key={label} href={`tel:${num}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 12, padding: '10px 14px', textDecoration: 'none' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: INK }}>{label}</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color, fontFamily: 'monospace' }}>+91 {num} 📞</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <p style={{ textAlign: 'center', fontSize: 9, color: SUBTLE, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginTop: 10 }}>CareSync Medical Passport v2.0</p>
          </div>
        )}
      </main>

      {/* ── Bottom Navigation Bar ───────────────────────────────────────────── */}
      {/*
        The nav bar is fixed to the bottom of the screen.
        The SOS button floats above it using a negative top margin.
        This is a common mobile pattern to make the primary action stand out.
      */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: `${CARD}f5`, backdropFilter: 'blur(20px)', borderTop: `1px solid ${BORDER}`, borderRadius: '28px 28px 0 0', padding: '10px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 -8px 40px rgba(0,0,0,0.4)', zIndex: 60 }}>

        {[{ id: 'home', icon: '⊞', label: 'Home' }, { id: 'chat', icon: '💬', label: 'AI Chat' }].map(({ id, icon, label }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', color: activeTab === id ? TEAL : SUBTLE, minWidth: 48 }}>
            <span style={{ fontSize: 22 }}>{icon}</span>
            <span style={{ fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
          </button>
        ))}

        {/* SOS button - floats above the nav bar */}
        <div style={{ marginTop: -48 }}>
          <button
            onClick={startSOS}
            style={{ width: 68, height: 68, background: 'linear-gradient(135deg,#ef4444,#dc2626)', borderRadius: '50%', border: '4px solid #0f1923', color: 'white', fontWeight: 900, fontSize: 15, cursor: 'pointer', boxShadow: '0 0 0 4px rgba(239,68,68,0.25), 0 8px 24px rgba(239,68,68,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            SOS
          </button>
          <p style={{ fontSize: 7, fontWeight: 800, color: RED, textTransform: 'uppercase', textAlign: 'center', marginTop: 4 }}>Emergency</p>
        </div>

        {[{ id: 'wellness', icon: '🌿', label: 'Wellness' }, { id: 'profile', icon: '🪪', label: 'My Card' }].map(({ id, icon, label }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', color: activeTab === id ? TEAL : SUBTLE, minWidth: 48 }}>
            <span style={{ fontSize: 22 }}>{icon}</span>
            <span style={{ fontSize: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
