import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore, storage } from '../utils/firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// ref as storageRef = Storage mein ek location ka pointer banao
// uploadString      = base64 string (photo) ko Storage mein upload karo
// getDownloadURL    = upload ke baad public URL lo
import { ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';

// ── Component ─────────────────────────────────────────────────────────────────
// onComplete = App.jsx se aaya function — form data wahan bhejega
// user       = App.jsx se aaya logged-in user (uid chahiye photo save karne ke liye)
export default function HealthForm({ onComplete, user }) {
  const navigate = useNavigate();

  // step = abhi form ka kaun sa step chal raha hai (1, 2, ya 3)
  const [step, setStep] = useState(1);

  // photoPreview = local URL — screen pe dikhane ke liye
  const [photoPreview, setPhotoPreview] = useState(null);

  // submitting = true hoga jab Firebase pe data bhej rahe hain
  // isse button disable hoga — double submit se bachne ke liye
  const [submitting, setSubmitting] = useState(false);

  // uploadProgress = photo upload ka progress (0 se 100)
  const [uploadProgress, setUploadProgress] = useState(0);

  // formData = saara form ka data ek jagah
  const [formData, setFormData] = useState({
    fullName:       '',
    age:            '',
    bloodGroup:     '',
    gender:         '',
    studentPhone:   '',
    emergencyPhone: '',
    allergies:      '',
    chronicDisease: '',
    medications:    '',
    hostel:         '',
    rollNo:         '',
    photo:          null,   // base64 string ya object URL — sirf local preview ke liye
  });

  // k = key (field naam), v = value (naya value)
  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  // ── Photo handler ───
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File size check — 5MB se zyada nahi
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo 5MB se chhoti honi chahiye');
      return;
    }

    // FileReader se base64 string banao
    // Kyunki uploadString() ko base64 chahiye, normal File object nahi
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result; // "data:image/jpeg;base64,..."
      setPhotoPreview(base64);            // screen pe dikhao
      set('photo', base64);              // formData mein save karo
    };
    reader.readAsDataURL(file); // file ko base64 mein convert karo
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateStep1 = () => {
    if (!formData.fullName.trim()) { alert('Enter your full name'); return false; }
    if (!formData.age || formData.age < 15 || formData.age > 35) {
      alert('Enter valid age (15-35)'); return false;
    }
    if (!formData.bloodGroup) { alert('Select blood group'); return false; }
    if (!formData.gender)     { alert('Select gender'); return false; }
    return true;
  };
  

  const validateStep2 = () => {
    // Step 2 optional fields hain — koi hard validation nahi
    return true;
  };

  const validateStep3 = () => {
    if (formData.studentPhone.length < 10) {
      alert('Enter valid 10-digit mobile number'); return false;
    }
    if (formData.emergencyPhone.length < 10) {
      alert('Enter valid 10-digit emergency number'); return false;
    }
    if (formData.studentPhone === formData.emergencyPhone) {
      alert('Emergency number should different for your number'); return false;
    }
    return true;
  };

  // ── handleSubmit — Firebase Storage + Firestore ──
  // ye function tab chalta hai jab user step 3 mein "Generate Health Card" dabata hai
  const handleSubmit = async () => {
    // Pehle validate karo
    if (!validateStep3()) return;

    setSubmitting(true);     // button disable karo
    setUploadProgress(0);    // progress reset karo

    try {
      // ── STEP A: Photo Firebase Storage mein upload karo ───
      let photoURL = null; // default: koi photo nahi

      if (formData.photo) {
        // Storage mein path banao: "profile_photos/USER_UID"
        // har user ka apna alag folder hoga
        // user?.uid = agar user hai toh uid lo, warna 'anonymous'
        const uid = user?.uid || 'anonymous';
        const imgRef = storageRef(storage, `profile_photos/${uid}`);

        setUploadProgress(20); // progress dikhao

        // uploadString = base64 string ko Firebase Storage mein bhejo
        // 'data_url' = format batata hai ki ye "data:image/..." wala string hai
        await uploadString(imgRef, formData.photo, 'data_url');

        setUploadProgress(70); // upload ho gaya

        // Upload ke baad public download URL lo
        // Ye URL hamesha valid rahega aur hospital dashboard pe dikhega
        photoURL = await getDownloadURL(imgRef);

        setUploadProgress(90); // URL mil gaya
      }

      // ── STEP B: Firestore mein student profile save karo ───
      const uid = user?.uid || 'anonymous';

      // doc(firestore, 'collection_name', 'document_id')
      // 'student_profiles' = collection (folder jaisa)
      // uid = document ID (har student ka alag)
      const profileRef = doc(firestore, 'student_profiles', uid);

      // setDoc = is document mein ye data save karo
      // agar document pehle se hai toh overwrite ho jayega
      await setDoc(profileRef, {
        // formData ka saara data spread karo
        ...formData,

        // photo field override karo — base64 Firestore mein mat save karo
        // base64 bahut bada hota hai (Firestore mein 1MB limit hai per document)
        photo:     null,

        // Storage se mila hua URL save karo
        // Ye URL chhota hai aur image ko point karta hai
        photoURL:  photoURL,

        // Extra fields add karo
        uid:       uid,

        // serverTimestamp() = Firebase server ki time
        // Client ki time galat ho sakti hai (different timezone, wrong clock)
        // Server time reliable hoti hai
        updatedAt: serverTimestamp(),

        // Pehli baar save karne ki time
        createdAt: serverTimestamp(),
      });

      // ── STEP C: 'users' collection mein bhi fullName + role update karo ──
      // ✅ FIX: App.jsx 'users' collection se profileComplete check karta hai (fullName se).
      // Agar 'users' mein fullName nahi hoga toh App.jsx hamesha form pe bhejta rahega.
      // Isliye yahan bhi users collection update karna zaroori hai.
      await setDoc(doc(firestore, 'users', uid), {
        fullName:  formData.fullName,
        photoURL:  photoURL,
        role:      'student',
        updatedAt: serverTimestamp(),
      }, { merge: true }); // merge: true = sirf ye fields update karo, baki data mat hatao

      setUploadProgress(100); // sab complete!

      // ── STEP D: App.jsx ko data bhejo aur dashboard pe le jao ─────────────
      // onComplete = App.jsx ka function jo user state update karta hai
      // photoURL merge karo taaki dashboard pe photo dikhe
      onComplete({ ...formData, photoURL });

      // 500ms baad navigate — smooth feel ke liye
      setTimeout(() => navigate('/student'), 500);

    } catch (err) {
      // Kuch bhi galat hua — error dikhao
      console.error('Form submit error:', err);

      // Specific error messages
      if (err.code === 'storage/unauthorized') {
        alert('Photo upload permission nahi hai. Firebase Storage rules check karo.');
      } else if (err.code === 'permission-denied') {
        alert('Firestore permission nahi hai. Rules check karo.');
      } else {
        alert('Error saving profile. Try again.\n' + err.message);
      }

    } finally {
      // Chahe success ho ya fail — submitting band karo
      setSubmitting(false);
    }
  };

  // ── CSS helpers ──
  const inp = `w-full bg-[#1d2e3f] border border-[#243548] rounded-xl px-4 py-3 text-sm font-medium text-[#e8f1f8] placeholder:text-[#4d6a82] focus:border-[#247d79] focus:ring-2 focus:ring-[#247d79]/20 transition-all duration-200 outline-none`;
  const lbl = `block text-[10px] font-semibold text-[#8ba5be] uppercase tracking-widest mb-1.5`;
  const sel = `${inp} cursor-pointer`;

  const steps = ['Personal', 'Medical', 'Contact'];

  // ── Render ───
  return (
    <div className="min-h-screen bg-[#0f1923] font-sans relative overflow-hidden">

      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#247d79]/6 blur-[80px] pointer-events-none" />

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-30 bg-[#0f1923]/90 backdrop-blur-xl border-b border-[#243548] px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display text-lg font-bold text-[#e8f1f8]">Health Profile</h2>
            <p className="text-[10px] text-[#8ba5be] font-medium">Step {step} of {steps.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#247d79]/15 border border-[#247d79]/30 flex items-center justify-center text-lg">
            🩺
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-[#1d2e3f] rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-[#247d79] to-[#3d9b96] rounded-full transition-all duration-500"
            style={{ width: `${(step / steps.length) * 100}%` }}
          />
        </div>

        {/* Step labels */}
        <div className="flex mt-2 gap-1">
          {steps.map((s, i) => (
            <span
              key={s}
              className={`text-[9px] font-bold uppercase tracking-wide flex-1 text-center transition-colors
                ${i + 1 <= step ? 'text-[#3d9b96]' : 'text-[#4d6a82]'}`}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6">

        {/* ── STEP 1 — Personal Info ─── */}
        {step === 1 && (
          <div className="space-y-5 animate-slide-up">

            {/* Photo upload */}
            <div className="flex flex-col items-center py-4">
              <label className="relative cursor-pointer group">
                <div className={`w-24 h-24 rounded-3xl border-2 border-dashed overflow-hidden
                  flex flex-col items-center justify-center transition-all duration-300
                  ${photoPreview
                    ? 'border-[#247d79]'
                    : 'border-[#243548] hover:border-[#247d79]/60'}`}>
                  {photoPreview
                    ? <img src={photoPreview} className="w-full h-full object-cover" alt="Preview" />
                    : <>
                        <span className="text-2xl">📸</span>
                        <span className="text-[9px] text-[#4d6a82] font-bold uppercase mt-1">Add Photo</span>
                      </>}
                </div>
                {/* Edit icon jab photo laga ho */}
                {photoPreview && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#247d79] rounded-full flex items-center justify-center text-xs">
                    ✏️
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              </label>
              <p className="text-[9px] text-[#4d6a82] mt-2 uppercase tracking-wider">
                Profile photo · max 5MB (optional)
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label className={lbl}>Full Name *</label>
              <input
                type="text" required
                placeholder="e.g. Rahul Kumar Sharma"
                className={inp}
                value={formData.fullName}
                onChange={e => set('fullName', e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
              />
            </div>

            {/* Age + Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Age *</label>
                <input
                  type="number" min="15" max="35" placeholder="21"
                  className={inp}
                  value={formData.age}
                  onChange={e => set('age', e.target.value.slice(0, 2))}
                />
              </div>
              <div>
                <label className={lbl}>Gender *</label>
                <select className={sel} value={formData.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Blood Group + Roll No */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Blood Group *</label>
                <select className={sel} value={formData.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}>
                  <option value="">Select</option>
                  {['A+','B+','O+','AB+','A-','B-','O-','AB-','Unsure'].map(b => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lbl}>Roll Number</label>
                <input
                  type="text" placeholder="2201CS01"
                  className={inp}
                  value={formData.rollNo}
                  onChange={e => set('rollNo', e.target.value.toUpperCase())}
                />
              </div>
            </div>

            {/* Hostel */}
            <div>
              <label className={lbl}>Hostel / Residence</label>
              <select className={sel} value={formData.hostel} onChange={e => set('hostel', e.target.value)}>
                <option value="">Select hostel</option>
                {['Hostel 1 (Boys)','Hostel 2 (Boys)','Hostel 3 (Boys)','Hostel 4 (Girls)','Hostel 5 (PG)','Off Campus'].map(h => (
                  <option key={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ── STEP 2 — Medical Info ─── */}
        {step === 2 && (
          <div className="space-y-5 animate-slide-up">

            {/* Warning banner */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#f59e0b]/10 border border-[#f59e0b]/25">
              <span className="text-xl mt-0.5">⚠️</span>
              <p className="text-xs text-[#fbbf24] leading-relaxed">
                This medical information can save your life in emergencies. Please fill it accurately.
              </p>
            </div>

            <div>
              <label className={lbl}>Known Allergies</label>
              <textarea
                placeholder="e.g. Penicillin, Peanuts, Dust, Latex…"
                rows={2}
                className={`${inp} resize-none`}
                value={formData.allergies}
                onChange={e => set('allergies', e.target.value)}
              />
            </div>

            <div>
              <label className={lbl}>Chronic Diseases / Conditions</label>
              <textarea
                placeholder="e.g. Asthma, Diabetes Type 2, Epilepsy, Hypertension…"
                rows={2}
                className={`${inp} resize-none`}
                value={formData.chronicDisease}
                onChange={e => set('chronicDisease', e.target.value)}
              />
            </div>

            <div>
              <label className={lbl}>Current Medications</label>
              <textarea
                placeholder="e.g. Metformin 500mg daily, Salbutamol inhaler…"
                rows={2}
                className={`${inp} resize-none`}
                value={formData.medications}
                onChange={e => set('medications', e.target.value)}
              />
            </div>

            {/* Blood group reminder card */}
            {formData.bloodGroup && (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#ef4444]/10 border border-[#ef4444]/20">
                <div className="w-12 h-12 rounded-2xl bg-[#ef4444]/20 flex items-center justify-center text-xl font-black text-[#ef4444]">
                  {formData.bloodGroup}
                </div>
                <div>
                  <p className="text-xs text-[#8ba5be] font-semibold">Blood Group confirmed</p>
                  <p className="text-sm font-bold text-[#e8f1f8]">This will appear on your SOS alert</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3 — Contact + Preview + Submit ── */}
        {step === 3 && (
          <div className="space-y-5 animate-slide-up">

            {/* Student phone */}
            <div>
              <label className={lbl}>Your Mobile Number *</label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-[#1d2e3f] border border-[#243548] rounded-xl text-sm font-semibold text-[#8ba5be]">
                  +91
                </span>
                <input
                  type="tel" required placeholder="10-digit number"
                  maxLength={10}
                  className={`${inp} flex-1`}
                  value={formData.studentPhone}
                  onChange={e => set('studentPhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>
            </div>

            {/* Emergency phone */}
            <div>
              <label className={lbl}>Emergency Contact — Parent / Guardian *</label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-[#1d2e3f] border border-[#243548] rounded-xl text-sm font-semibold text-[#8ba5be]">
                  +91
                </span>
                <input
                  type="tel" required placeholder="Guardian's number"
                  maxLength={10}
                  className={`${inp} flex-1`}
                  value={formData.emergencyPhone}
                  onChange={e => set('emergencyPhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>
              <p className="text-[10px] text-[#4d6a82] mt-1.5 ml-1">
                Hospital staff will call this number in emergencies
              </p>
            </div>

            {/* Health Card Preview */}
            <div className="p-5 rounded-2xl border border-[#243548] bg-[#162230]">
              <p className="text-[10px] font-bold text-[#3d9b96] uppercase tracking-widest mb-3">
                Health Card Preview
              </p>
              <div className="flex items-center gap-3 mb-3">
                {photoPreview
                  ? <img src={photoPreview} className="w-12 h-12 rounded-xl object-cover" alt="Profile" />
                  : <div className="w-12 h-12 rounded-xl bg-[#1d2e3f] flex items-center justify-center text-xl">👤</div>}
                <div>
                  <p className="font-bold text-[#e8f1f8]">{formData.fullName || 'Your Name'}</p>
                  <p className="text-xs text-[#8ba5be]">
                    {formData.rollNo || 'Roll No'} · {formData.hostel || 'Hostel'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ['🩸', formData.bloodGroup || '—', 'Blood'],
                  ['👤', formData.age        || '—', 'Age'],
                  ['⚧',  formData.gender     || '—', 'Gender'],
                ].map(([icon, val, lab]) => (
                  <div key={lab} className="bg-[#1d2e3f] rounded-xl p-2 text-center">
                    <p className="text-lg">{icon}</p>
                    <p className="text-xs font-bold text-[#e8f1f8]">{val}</p>
                    <p className="text-[9px] text-[#4d6a82]">{lab}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload progress bar — sirf tab dikhao jab submit ho raha ho */}
            {submitting && (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-[#8ba5be] font-semibold">
                  <span>
                    {uploadProgress < 70
                      ? '📸 Uploading photo...'
                      : uploadProgress < 90
                      ? '💾 Saving profile...'
                      : '✅ Almost done...'}
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 bg-[#1d2e3f] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-[#247d79] to-[#3d9b96] rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Navigation Buttons ─── */}
        <div className="flex gap-3 mt-8">

          {/* Back button — step 1 pe nahi dikhega */}
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={submitting}
              className="flex-1 py-3.5 rounded-2xl border border-[#243548] text-[#8ba5be]
                font-bold text-sm active:scale-95 transition-all disabled:opacity-40"
            >
              ← Back
            </button>
          )}

          {/* Next / Submit button */}
          {step < 3 ? (
            <button
              onClick={() => {
                // Step 1 se 2 jaate waqt validate karo
                if (step === 1 && !validateStep1()) return;
                // Step 2 se 3 jaate waqt bhi validate kar sakte ho
                if (step === 2 && !validateStep2()) return;
                setStep(s => s + 1);
              }}
              className="flex-1 py-3.5 rounded-2xl bg-linear-to-r from-[#247d79] to-[#1c6360]
                text-white font-bold text-sm shadow-[0_0_20px_rgba(36,125,121,0.3)]
                active:scale-95 transition-all"
            >
              Next →
            </button>
          ) : (
            // Step 3 pe Submit button
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3.5 rounded-2xl bg-linear-to-r from-[#247d79] to-[#1c6360]
                text-white font-bold text-sm shadow-[0_0_20px_rgba(36,125,121,0.3)]
                active:scale-95 transition-all disabled:opacity-50
                flex items-center justify-center gap-2"
            >
              {submitting
                ? <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving…
                  </>
                : '🪪 Generate Health Card →'}
            </button>
          )}
        </div>

        {/* Terms note */}
        <p className="text-center text-[9px] text-[#4d6a82] mt-5 px-4">
          Your data is stored securely on database and is only used for emergency medical purposes.
        </p>
      </div>
    </div>
  );
}
