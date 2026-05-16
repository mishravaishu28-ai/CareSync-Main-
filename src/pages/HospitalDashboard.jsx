import React, { useEffect, useState, useRef } from 'react';
import { db } from '../utils/firebaseConfig';
import { ref, onValue, update, off } from 'firebase/database';

// HospitalDashboard is what the hospital staff sees on their screen.
// It connects to Firebase Realtime Database and listens for SOS alerts in real time.
//
// When a student presses SOS, their data appears here within 1-2 seconds.
// Each alert card shows every field from the student's health form:
//   name, age, gender, roll number, hostel, blood group, allergies,
//   chronic diseases, medications, student phone, guardian phone,
//   photo, and a clickable live GPS location link.
//
// The alarm keeps ringing until the hospital clicks "Stop Alarm" or resolves the case.

// ─────────────────────────────────────────────────────────────────────────────
// ALARM SYSTEM
//
// We use the Web Audio API to generate a beep sound programmatically.
// This is better than using an audio file because:
//   1. No extra file to host or load
//   2. Works offline
//   3. We can control it precisely (start, stop, repeat)
//
// An OscillatorNode generates a continuous tone (like a sine wave generator).
// A GainNode controls the volume (gain = amplification factor).
// We connect them: oscillator → gain → speakers
// ─────────────────────────────────────────────────────────────────────────────

// This object manages the alarm state.
// We keep it outside the component so it doesn't reset on every re-render.
const alarmState = {
  audioCtx: null,      // AudioContext - the browser's audio engine
  isRunning: false,    // are we currently beeping?
  timerId: null,       // setTimeout ID so we can cancel the next scheduled beep
};

// Plays one beep then schedules the next one.
// This recursive pattern creates the repeating alarm effect.
function playBeep() {
  if (!alarmState.isRunning || !alarmState.audioCtx) return;

  const ctx = alarmState.audioCtx;

  // OscillatorNode generates a pure tone
  const osc = ctx.createOscillator();
  // GainNode controls volume - 0 = silent, 1 = full volume
  const gainNode = ctx.createGain();

  // Connect the audio graph: oscillator → volume → output
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  // 880 Hz is the musical note A5 - it's sharp and hard to ignore
  osc.frequency.value = 880;
  osc.type = 'sine';

  const startTime = ctx.currentTime;

  // Schedule volume changes to create a smooth beep shape (no clicks)
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.45, startTime + 0.08);  // fade in quickly
  gainNode.gain.setValueAtTime(0.45, startTime + 0.28);
  gainNode.gain.linearRampToValueAtTime(0, startTime + 0.48);     // fade out

  osc.start(startTime);
  osc.stop(startTime + 0.5); // play for half a second

  // Schedule the next beep 2 seconds after this one started
  alarmState.timerId = setTimeout(playBeep, 2000);
}

function startAlarm() {
  if (alarmState.isRunning) return; // already running, don't start a duplicate
  alarmState.isRunning = true;
  // AudioContext must be created after a user interaction (browser security rule)
  alarmState.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  playBeep();
}

function stopAlarm() {
  alarmState.isRunning = false;
  clearTimeout(alarmState.timerId);
  alarmState.timerId = null;
  if (alarmState.audioCtx) {
    alarmState.audioCtx.close(); // releases audio resources
    alarmState.audioCtx = null;
  }
}
// HELPER FUNCTIONS


// Converts a Firebase timestamp to a readable time like "2:35 PM"
function formatTime(timestamp) {
  if (!timestamp) return '—';
  return new Date(typeof timestamp === 'number' ? timestamp : timestamp * 1000)
    .toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// Builds the initials from a name: "Rahul Kumar" → "RK"
// Used as a fallback when there's no photo
function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
}

// Picks a color based on the first character of the name
// This makes avatars consistent - same person always gets same color
function getAvatarColor(name) {
  const colors = ['#ef4444', '#f97316', '#8b5cf6', '#0ea5e9', '#10b981', '#ec4899', '#14b8a6'];
  return colors[(name?.charCodeAt(0) || 0) % colors.length];
}


// AVATAR COMPONENT
// Shows the student's photo if available, otherwise shows colored initials

function Avatar({ name, photo, size = 52 }) {
  const color = getAvatarColor(name);

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${color}`, flexShrink: 0 }}
      />
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${color}22`, border: `2px solid ${color}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.3, color, flexShrink: 0,
    }}>
      {getInitials(name)}
    </div>
  );
}


// DETAIL MODAL
//
// Opens when hospital staff taps on an alert card.
// Shows EVERY field from the student's health form so the hospital
// has complete information before sending help.
function DetailModal({ alert, onClose, onResolve }) {

  // Simple row component for displaying a label and value pair
  function InfoRow({ label, value, highlighted }) {
    if (!value || value === 'None' || value === 'N/A') {
      // Still show the row but with a muted value
      return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 10, paddingBottom: 10, borderBottom: '1px solid rgba(36,53,72,0.5)' }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#4d6a82', textTransform: 'uppercase', letterSpacing: 0.6, flexShrink: 0, marginRight: 12 }}>{label}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#4d6a82', textAlign: 'right' }}>—</span>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 10, paddingBottom: 10, borderBottom: '1px solid rgba(36,53,72,0.5)' }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#4d6a82', textTransform: 'uppercase', letterSpacing: 0.6, flexShrink: 0, marginRight: 12 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: highlighted ? '#ef4444' : '#e8f1f8', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
      </div>
    );
  }

  return (
    // Clicking the backdrop closes the modal
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 16 }}
    >
      {/* stopPropagation prevents clicks inside from closing the modal */}
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#162230', borderRadius: 28, width: '100%', maxWidth: 440, maxHeight: '92vh', overflowY: 'auto', border: '1px solid #243548', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}
      >
        {/* Red gradient header */}
        <div style={{ background: 'linear-gradient(135deg,#dc2626,#991b1b)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14, borderRadius: '28px 28px 0 0' }}>

          {/* Avatar with pulsing ring */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Avatar name={alert.studentName || '?'} photo={alert.photo} size={52} />
            {/* The pulsing ring animates using CSS keyframes injected in the parent */}
            <div style={{ position: 'absolute', inset: -6, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.5)', animation: 'sosRing 1.4s ease-out infinite' }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>
              🚨 Active SOS · #{alert.id?.slice(-5)}
            </p>
            <p style={{ color: 'white', fontSize: 19, fontWeight: 800, margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {alert.studentName || 'Unknown Student'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, margin: '2px 0 0' }}>
              {[alert.rollNo, alert.hostel].filter(Boolean).join(' · ') || 'IIT Patna'}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontWeight: 800, fontSize: 16, flexShrink: 0 }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '20px 24px' }}>

          {/* Blood group - extra prominent because it's critical */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 18, marginBottom: 20 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#ef4444', flexShrink: 0 }}>
              {alert.bloodGroup || '?'}
            </div>
            <div>
              <p style={{ fontSize: 9, color: '#ef4444', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 2px' }}>Blood Group</p>
              <p style={{ fontSize: 12, color: '#e8f1f8', fontWeight: 700, margin: 0 }}>Critical for blood transfusion decisions</p>
            </div>
          </div>

          {/* Section: Personal details */}
          <p style={{ fontSize: 10, fontWeight: 800, color: '#8ba5be', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 2px' }}>Personal Details</p>
          <InfoRow label="Full Name"  value={alert.studentName} />
          <InfoRow label="Age"        value={alert.age} />
          <InfoRow label="Gender"     value={alert.gender} />
          <InfoRow label="Roll No"    value={alert.rollNo} />
          <InfoRow label="Hostel"     value={alert.hostel} />

          {/* Section: Medical info */}
          <p style={{ fontSize: 10, fontWeight: 800, color: '#8ba5be', textTransform: 'uppercase', letterSpacing: 1, margin: '18px 0 2px' }}>Medical Information</p>
        
          <InfoRow label="Allergies"       value={alert.allergies}      highlighted />
          <InfoRow label="Chronic Disease" value={alert.chronicDisease} highlighted />
          <InfoRow label="Medications"     value={alert.medications} />

          {/* Section: Contact numbers */}
          <p style={{ fontSize: 10, fontWeight: 800, color: '#8ba5be', textTransform: 'uppercase', letterSpacing: 1, margin: '18px 0 2px' }}>Contact Numbers</p>
          <InfoRow label="Student Phone"  value={alert.phone ? `+91 ${alert.phone}` : null} />
          <InfoRow label="Guardian Phone" value={alert.emergencyPhone ? `+91 ${alert.emergencyPhone}` : null} />

          {/* Section: Location */}
          <p style={{ fontSize: 10, fontWeight: 800, color: '#8ba5be', textTransform: 'uppercase', letterSpacing: 1, margin: '18px 0 8px' }}>Location</p>

        
          <a
            href={alert.mapsLink || 'https://maps.google.com/?q=IIT+Patna'}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(36,125,121,0.15)', border: '1px solid rgba(36,125,121,0.35)', borderRadius: 18, textDecoration: 'none', marginBottom: 20 }}
          >
            <div>
              <p style={{ fontSize: 11, fontWeight: 800, color: '#3d9b96', margin: '0 0 3px' }}>
                {alert.locationAccurate ? '📍 GPS Location — Accurate' : '📍 Campus Location — Estimated'}
              </p>
              <p style={{ fontSize: 10, color: '#8ba5be', margin: 0 }}>
                {alert.location || 'IIT Patna Campus'}
              </p>
            </div>
            <span style={{ color: '#3d9b96', fontWeight: 900, fontSize: 18 }}>↗</span>
          </a>

          {/* Action buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <a href={alert.mapsLink || 'https://maps.google.com/?q=IIT+Patna'} target="_blank" rel="noreferrer"
              style={{ display: 'block', padding: '13px 0', background: '#2563EB', color: 'white', border: 'none', borderRadius: 14, fontWeight: 800, fontSize: 12, cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>
              📍 Open Maps
            </a>
            <a href={`tel:${alert.phone}`}
              style={{ display: 'block', padding: '13px 0', background: '#059669', color: 'white', border: 'none', borderRadius: 14, fontWeight: 800, fontSize: 12, cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>
              📞 Call Student
            </a>
            <a href={`tel:${alert.emergencyPhone}`}
              style={{ display: 'block', padding: '13px 0', background: 'rgba(245,158,11,0.2)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 14, fontWeight: 800, fontSize: 12, cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>
              📞 Call Guardian
            </a>
            <button
              onClick={() => { onResolve(alert.id); onClose(); }}
              style={{ padding: '13px 0', background: '#1d2e3f', color: '#8ba5be', border: '1px solid #243548', borderRadius: 14, fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
              ✅ Resolve Case
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 9, color: '#4d6a82', marginTop: 16 }}>
            Alert sent at {formatTime(alert.timestamp)} · ID #{alert.id?.slice(-5)}
          </p>
        </div>
      </div>
    </div>
  );
}


// ALERT CARD
// The compact card shown in the main list for each SOS alert

function AlertCard({ alert, isNew, isAlarming, onOpen, onResolve, onStopAlarm }) {
  const isResolved = alert.status === 'resolved';

  return (
    <div
      onClick={() => !isResolved && onOpen(alert)}
      style={{
        background: '#162230',
        borderRadius: 22,
        border: isNew ? '2px solid #ef4444' : isResolved ? '1px solid #243548' : '1px solid rgba(239,68,68,0.4)',
        padding: '16px 18px',
        cursor: isResolved ? 'default' : 'pointer',
        opacity: isResolved ? 0.6 : 1,
        marginBottom: 12,
        boxShadow: isNew ? '0 0 0 3px rgba(239,68,68,0.12), 0 4px 24px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* "LIVE" badge shown on brand-new alerts for 8 seconds */}
      {isNew && (
        <div style={{ position: 'absolute', top: 0, right: 0, background: '#ef4444', color: 'white', fontSize: 9, fontWeight: 800, padding: '4px 12px', borderBottomLeftRadius: 12, letterSpacing: 1 }}>
          LIVE SOS
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

        {/* Avatar with pulsing ring for active alerts */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Avatar name={alert.studentName || '?'} photo={alert.photo} size={48} />
          {!isResolved && (
            <div style={{ position: 'absolute', inset: -5, borderRadius: '50%', border: '2px solid #ef4444', animation: 'sosRing 1.4s ease-out infinite' }} />
          )}
        </div>

        {/* Main info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <p style={{ fontWeight: 800, fontSize: 15, color: '#e8f1f8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {alert.studentName || 'Unknown Student'}
            </p>
            <span style={{ fontSize: 10, color: '#4d6a82', fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>
              {formatTime(alert.timestamp)}
            </span>
          </div>

          <p style={{ fontSize: 11, color: '#8ba5be', margin: '2px 0 6px', fontWeight: 500 }}>
            {[alert.rollNo, alert.hostel].filter(Boolean).join(' · ') || 'IIT Patna'}
          </p>

          {/* Info pills - the most critical details visible without opening the modal */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {alert.bloodGroup && (
              <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.12)', borderRadius: 8, padding: '2px 8px' }}>
                🩸 {alert.bloodGroup}
              </span>
            )}
            <span style={{ fontSize: 10, fontWeight: 700, color: '#3d9b96', background: 'rgba(36,125,121,0.15)', borderRadius: 8, padding: '2px 8px' }}>
              {alert.locationAccurate ? '📍 GPS ✓' : '📍 Campus'}
            </span>
            {alert.allergies && alert.allergies !== 'None' && (
              <span style={{ fontSize: 10, fontWeight: 700, color: '#f97316', background: 'rgba(249,115,22,0.12)', borderRadius: 8, padding: '2px 8px' }}>
                ⚠️ Allergy
              </span>
            )}
            {alert.chronicDisease && alert.chronicDisease !== 'None' && (
              <span style={{ fontSize: 10, fontWeight: 700, color: '#f97316', background: 'rgba(249,115,22,0.12)', borderRadius: 8, padding: '2px 8px' }}>
                🏥 Condition
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick action buttons - active alerts only */}
      {!isResolved && (
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          {isAlarming && (
            <button
              onClick={e => { e.stopPropagation(); onStopAlarm(alert.id); }}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '9px 12px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#ef4444', borderRadius: 12, fontWeight: 800, fontSize: 11, cursor: 'pointer' }}
            >
              🔕 Stop Alarm
            </button>
          )}
          <button
            onClick={e => { e.stopPropagation(); window.open(alert.mapsLink || 'https://maps.google.com/?q=IIT+Patna', '_blank'); }}
            style={{ flex: 1, padding: '9px 0', background: 'rgba(36,125,121,0.15)', border: '1px solid rgba(36,125,121,0.35)', color: '#3d9b96', borderRadius: 12, fontWeight: 700, fontSize: 11, cursor: 'pointer' }}
          >
            📍 Maps
          </button>
          <button
            onClick={e => { e.stopPropagation(); window.open(`tel:${alert.phone}`); }}
            style={{ flex: 1, padding: '9px 0', background: 'rgba(5,150,105,0.12)', border: '1px solid rgba(5,150,105,0.3)', color: '#22c55e', borderRadius: 12, fontWeight: 700, fontSize: 11, cursor: 'pointer' }}
          >
            📞 Call
          </button>
          <button
            onClick={e => { e.stopPropagation(); onResolve(alert.id); }}
            style={{ flex: 1, padding: '9px 0', background: '#1d2e3f', border: '1px solid #243548', color: '#8ba5be', borderRadius: 12, fontWeight: 700, fontSize: 11, cursor: 'pointer' }}
          >
            ✅ Clear
          </button>
        </div>
      )}

      {isResolved && (
        <p style={{ fontSize: 11, color: '#22c55e', fontWeight: 700, marginTop: 10, textAlign: 'right' }}>✓ Resolved</p>
      )}
    </div>
  );
}
// MAIN COMPONENT
export default function HospitalDashboard() {
  // Full list of alerts from Firebase, sorted newest first
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Which tab is active: 'active', 'all', or 'resolved'
  const [activeFilter, setActiveFilter] = useState('active');

  // Which alert is open in the detail modal (null = none)
  const [openAlert, setOpenAlert] = useState(null);

  // Set of alert IDs showing the "LIVE" badge (cleared after 8 seconds)
  const [newAlertIds, setNewAlertIds] = useState(new Set());

  // Set of alert IDs whose alarm is currently ringing
  // We use a Set because it automatically handles duplicates
  const [alarmingIds, setAlarmingIds] = useState(new Set());

  // Stores the previous alert count to detect when new ones arrive
  // useRef is used because changing it shouldn't cause a re-render
  const previousCount = useRef(0);

  // ── Firebase Listener ───
  useEffect(() => {
    // Request notification permission when the dashboard loads
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const alertsRef = ref(db, 'emergency_alerts');

    // onValue fires immediately with current data, then again whenever data changes
    // This is how the hospital sees SOS alerts appear in real time without refreshing
    const unsubscribe = onValue(alertsRef, snapshot => {
      const data = snapshot.val();

      if (data) {
        // Firebase stores data as an object: { alertId1: {...}, alertId2: {...} }
        // We convert it to an array so we can use .map() and .sort() on it
        const alertList = Object.entries(data)
          .map(([id, alertData]) => ({ id, ...alertData }))
          .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)); // newest first

        // Detect brand new alerts
        // If we have more alerts than last time, and this isn't the first load, something new arrived
        if (previousCount.current > 0 && alertList.length > previousCount.current) {
          const newestAlert = alertList[0];

          if (newestAlert.status === 'active') {
            // Show the LIVE badge for 8 seconds
            setNewAlertIds(prev => new Set([...prev, newestAlert.id]));
            setTimeout(() => {
              setNewAlertIds(prev => {
                const updated = new Set(prev);
                updated.delete(newestAlert.id);
                return updated;
              });
            }, 8000);

            // Start the alarm for this specific alert
            setAlarmingIds(prev => new Set([...prev, newestAlert.id]));
            startAlarm();

            // Browser notification (works even when tab is in background)
            if (Notification.permission === 'granted') {
              new Notification('🚨 SOS Alert Received!', {
                body: [
                  `${newestAlert.studentName || 'Student'} — ${newestAlert.hostel || 'IIT Patna'}`,
                  newestAlert.bloodGroup ? `Blood Group: ${newestAlert.bloodGroup}` : '',
                  newestAlert.allergies && newestAlert.allergies !== 'None' ? `⚠️ Allergy: ${newestAlert.allergies}` : '',
                  newestAlert.locationAccurate ? '📍 GPS location available' : '📍 Campus location',
                ].filter(Boolean).join('\n'),
                icon: '/favicon.ico',
                requireInteraction: true, // notification stays until clicked
              });
            }
          }
        }

        previousCount.current = alertList.length;
        setAlerts(alertList);
      } else {
        setAlerts([]);
      }

      setLoading(false);
    });

    // Cleanup: stop listening to Firebase when the component unmounts
    // Also stop the alarm
    return () => {
      off(alertsRef);
      stopAlarm();
    };
  }, []); // Empty array = run only once when component mounts

  // ── Resolve an alert ───
  // update() only changes the 'status' field - everything else stays the same
  async function resolveAlert(alertId) {
    try {
      await update(ref(db, `emergency_alerts/${alertId}`), { status: 'resolved' });
      stopAlarmForAlert(alertId);
      if (openAlert?.id === alertId) setOpenAlert(null);
    } catch (err) {
      alert('Error resolving alert: ' + err.message);
    }
  }

  // ── Stop alarm for one specific alert ─────────────────────────────────────
  function stopAlarmForAlert(alertId) {
    setAlarmingIds(prev => {
      const updated = new Set(prev);
      updated.delete(alertId);
      // If no more alerts are alarming, stop the sound completely
      if (updated.size === 0) stopAlarm();
      return updated;
    });
  }

  // ── Derived data ───
  const activeAlerts   = alerts.filter(a => a.status !== 'resolved');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved');
  const displayedAlerts =
    activeFilter === 'active'   ? activeAlerts   :
    activeFilter === 'resolved' ? resolvedAlerts : alerts;

  return (
    <>
      {/* Inject the CSS keyframe animation for the pulsing ring effect */}
      {/* We do this once here so all Avatar + AlertCard components can use it */}
      <style>{`
        @keyframes sosRing {
          0%   { transform: scale(1);   opacity: 0.7; }
          70%  { transform: scale(1.9); opacity: 0;   }
          100% { transform: scale(1.9); opacity: 0;   }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#0f1923', fontFamily: "'DM Sans', system-ui, sans-serif" }}>

        {/* Red alarm bar at very top when alerts are ringing */}
        {alarmingIds.size > 0 && (
          <div style={{ background: 'linear-gradient(90deg,#dc2626,#b91c1c)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px' }}>
            <p style={{ color: 'white', fontSize: 11, fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              🚨 {alarmingIds.size} Active SOS Alarm{alarmingIds.size > 1 ? 's' : ''} — Respond Now
            </p>
            <button
              onClick={() => { setAlarmingIds(new Set()); stopAlarm(); }}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 8, cursor: 'pointer', textTransform: 'uppercase' }}
            >
              🔕 Mute All
            </button>
          </div>
        )}

        {/* Nav bar */}
        <nav style={{ background: 'rgba(22,34,48,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #243548', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, position: 'sticky', top: alarmingIds.size > 0 ? 38 : 0, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, background: 'linear-gradient(135deg,#dc2626,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏥</div>
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: '#e8f1f8' }}>
                CareSync <span style={{ color: '#ef4444' }}>Hospital</span>
              </p>
              <p style={{ margin: 0, fontSize: 9, color: '#4d6a82', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                IIT Patna · Emergency Dashboard
              </p>
            </div>
          </div>

          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.1)', padding: '6px 12px', borderRadius: 20, border: '1px solid rgba(34,197,94,0.25)' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 3px rgba(34,197,94,0.3)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e' }}>Live</span>
          </div>
        </nav>

        {/* Stats row */}
        <div style={{ padding: '18px 20px 0', maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              { label: 'Total',      value: alerts.length,         bg: '#162230',              color: '#e8f1f8', border: '#243548' },
              { label: 'Active SOS', value: activeAlerts.length,   bg: 'rgba(239,68,68,0.1)',  color: '#ef4444', border: 'rgba(239,68,68,0.35)', glow: activeAlerts.length > 0 },
              { label: 'Resolved',   value: resolvedAlerts.length, bg: 'rgba(34,197,94,0.1)',  color: '#22c55e', border: 'rgba(34,197,94,0.3)' },
            ].map(({ label, value, bg, color, border, glow }) => (
              <div key={label} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 20, padding: '16px 14px', textAlign: 'center', boxShadow: glow && value > 0 ? `0 0 20px rgba(239,68,68,0.2)` : undefined }}>
                <p style={{ fontSize: 28, fontWeight: 900, color, margin: 0 }}>{value}</p>
                <p style={{ fontSize: 9, fontWeight: 700, color: `${color}90`, margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: 0.7 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ padding: '14px 20px 0', maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 6, background: '#1d2e3f', borderRadius: 16, padding: 4 }}>
            {[
              ['active',   `Active (${activeAlerts.length})`],
              ['all',      `All (${alerts.length})`],
              ['resolved', `Resolved (${resolvedAlerts.length})`],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                style={{
                  flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer', borderRadius: 12,
                  fontWeight: 700, fontSize: 11, transition: 'all 0.2s',
                  background: activeFilter === key ? 'linear-gradient(135deg,#247d79,#1c6360)' : 'transparent',
                  color: activeFilter === key ? 'white' : '#4d6a82',
                  boxShadow: activeFilter === key ? '0 0 12px rgba(36,125,121,0.3)' : undefined,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Alert list */}
        <div style={{ padding: '16px 20px 48px', maxWidth: 720, margin: '0 auto' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12 }}>
              <div style={{ width: 40, height: 40, border: '3px solid #243548', borderTopColor: '#247d79', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: 13, color: '#4d6a82', fontWeight: 600, margin: 0 }}>Connecting to Firebase…</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : displayedAlerts.length === 0 ? (
            <div style={{ background: '#162230', border: '1.5px dashed #243548', borderRadius: 24, padding: '60px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 40, marginBottom: 12 }}>🟢</p>
              <p style={{ fontWeight: 700, color: '#22c55e', fontSize: 16, margin: 0 }}>All clear — no active alerts</p>
              <p style={{ color: '#4d6a82', fontSize: 13, marginTop: 6 }}>Monitoring in real time</p>
            </div>
          ) : (
            displayedAlerts.map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                isNew={newAlertIds.has(alert.id)}
                isAlarming={alarmingIds.has(alert.id)}
                onOpen={setOpenAlert}
                onResolve={resolveAlert}
                onStopAlarm={stopAlarmForAlert}
              />
            ))
          )}
        </div>
      </div>

      {/* Detail modal - shown when a card is tapped */}
      {openAlert && (
        <DetailModal
          alert={openAlert}
          onClose={() => setOpenAlert(null)}
          onResolve={resolveAlert}
        />
      )}
    </>
  );
}