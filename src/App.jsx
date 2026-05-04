import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth, firestore } from './utils/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import Auth              from './pages/Login';
import HealthForm        from './pages/HealthForm';
import StudentDashboard  from './pages/StudentDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import HealthChat        from './pages/HealthChat';

// Loading screen shown while Firebase checks if the user is already logged in.
// Without this, logged-in users would see a flash of the login page on refresh.
function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f1923', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: 44, height: 44, border: '3px solid #243548', borderTopColor: '#247d79', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
      <p style={{ color: '#8ba5be', fontSize: 14, fontWeight: 600, margin: 0 }}>Loading CareSync…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  // user holds all the logged-in person's data.
  // null = nobody is logged in.
  const [user, setUser] = useState(null);

  // authChecked becomes true once Firebase tells us whether someone is logged in.
  // We don't show any page until this is done, to avoid a flash of the wrong screen.
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {

      if (firebaseUser) {
        try {
          // Auth.js 'users' collection mein save karta hai, isliye wohi padhte hain
          const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));

          if (userDoc.exists()) {
            const data = userDoc.data();
            console.log('Loaded user from Firestore:', data);
            setUser({ uid: firebaseUser.uid, ...data });
          } else {
            console.log('No user doc found, setting student fallback');
            setUser({ uid: firebaseUser.uid, role: 'student', phone: firebaseUser.phoneNumber || '' });
          }
        } catch (err) {
          console.error('Profile load error:', err);
          setUser({ uid: firebaseUser.uid, role: 'student', phone: firebaseUser.phoneNumber || '' });
        }
      } else {
        setUser(null);
      }

      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  // Merge form data into the user state when HealthForm is submitted
  function handleFormComplete(formData) {
    setUser(prev => ({ ...prev, ...formData }));
  }

  // A student's profile is considered complete if they have filled their name
  const profileComplete = Boolean(user?.fullName);

  if (!authChecked) return <LoadingScreen />;

  return (
    <BrowserRouter>
      <Routes>

        {/* Login / Signup page - if already logged in, redirect to the right place */}
        <Route path="/" element={
          !user
            ? <Auth setUser={setUser} />
            : user.role === 'hospital'
              ? <Navigate to="/hospital" replace />
              : profileComplete
                ? <Navigate to="/student" replace />
                : <Navigate to="/form" replace />
        } />

        {/* Health form - only for students who haven't filled it yet */}
        <Route path="/form" element={
          user?.role === 'student' && !profileComplete
            ? <HealthForm onComplete={handleFormComplete} user={user} />
            : <Navigate to="/" replace />
        } />

        {/* Student dashboard - only after the form is complete */}
        <Route path="/student" element={
          user?.role === 'student' && profileComplete
            ? <StudentDashboard user={user} setUser={setUser} />
            : <Navigate to="/" replace />
        } />

        {/* Hospital dashboard - only for hospital accounts */}
        <Route path="/hospital" element={
          user?.role === 'hospital'
            ? <HospitalDashboard />
            : <Navigate to="/" replace />
        } />

        {/* AI Chat - any logged-in user */}
        <Route path="/chat" element={
          user
            ? <HealthChat />
            : <Navigate to="/" replace />
        } />

        {/* Any unknown URL goes back to home */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
