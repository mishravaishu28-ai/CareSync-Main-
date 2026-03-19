import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

const HealthForm = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    bloodGroup: '',
    studentPhone: '',    // State match honi chahiye input value se
    emergencyPhone: '',  // State match honi chahiye input value se
    allergies: '',
    chronicDisease: '',
    medications: '',
    photo: null 
  });
  Navigate('/StudentDashboard');

  const [photoPreview, setPhotoPreview] = useState(null);

  // Common Class Styles for consistency
  const inputStyle = "w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-500/5 transition-all text-sm text-slate-700 placeholder:text-slate-300";
  const labelStyle = "block text-[10px] font-black text-teal-600 uppercase mb-2 ml-1 tracking-widest";

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPhotoPreview(imageUrl);
      setFormData({ ...formData, photo: imageUrl });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.studentPhone.length < 10 || formData.emergencyPhone.length < 10) {
      alert("Please enter valid 10-digit phone numbers.");
      return;
    }
    onComplete(formData);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center font-sans">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-8 border border-white">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Medical Profile</h1>
          <p className="text-slate-400 text-xs mt-1 font-medium">This information can save lives in emergencies.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* PHOTO SECTION */}
          <div className="flex flex-col items-center mb-4">
            <label className="group relative w-24 h-24 bg-teal-50 rounded-4xl border-2 border-dashed border-teal-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:border-teal-400 hover:bg-teal-100/50 transition-all">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <span className="text-2xl block">📸</span>
                  <span className="text-[9px] font-black text-teal-600 uppercase mt-1">Add Photo</span>
                </div>
              )}
              <input type="file" className="hidden" onChange={handlePhotoChange} accept="image/*" />
            </label>
          </div>

          {/* Full Name */}
          <div>
            <label className={labelStyle}>Full Name</label>
            <input 
              required
              type="text"
              placeholder="Full Name"
              className={inputStyle}
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value.replace(/[^a-zA-Z\s]/g, '')})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Age */}
            <div>
              <label className={labelStyle}>Age</label>
              <input 
                required
                type="number"
                placeholder="Ex: 20"
                className={inputStyle}
                value={formData.age}
                onInput={(e) => e.target.value = e.target.value.slice(0, 3)}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
              />
            </div>
            {/* Blood Group */}
            <div>
              <label className={labelStyle}>Blood Group</label>
              <select 
                required
                className={inputStyle}
                value={formData.bloodGroup}
                onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
              >
                <option value="">Select</option>
                <option value="A+">A+</option><option value="B+">B+</option>
                <option value="O+">O+</option><option value="AB+">AB+</option>
                <option value="A-">A-</option><option value="B-">B-</option>
                <option value="O-">O-</option><option value="AB-">AB-</option>
                <option value="unsure">unsure</option>
              </select>
            </div>
          </div>

          {/* Student Contact */}
          <div>
            <label className={labelStyle}>Your Contact Number</label>
            <input 
              required
              type="tel"
              placeholder="10-digit number"
              className={inputStyle}
              value={formData.studentPhone} 
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, ''); 
                if (val.length <= 10) setFormData({ ...formData, studentPhone: val });
              }}
            />
          </div>

          {/* Emergency Contact */}
          <div>
            <label className={labelStyle}>Emergency Contact (Guardian)</label>
            <input 
              required
              type="tel"
              placeholder="Guardian's 10-digit number"
              className={inputStyle}
              value={formData.emergencyPhone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, ''); 
                if (val.length <= 10) setFormData({ ...formData, emergencyPhone: val });
              }}
            />
          </div>

          {/* Allergies */}
          <div className="space-y-4 pt-2">
            <div>
              <label className={`${labelStyle} text-slate-400`}>Allergies (Optional)</label>
              <textarea 
                placeholder="Penicillin, Peanuts, etc."
                className={`${inputStyle} min-h-20' resize-none`} 
                onChange={(e) => setFormData({...formData, allergies: e.target.value})}
              />
            </div>

            <div>
              <label className={`${labelStyle} text-slate-400`}>Chronic Diseases (Optional)</label>
              <textarea 
                placeholder="Asthma, Diabetes, etc."
                className={`${inputStyle} min-h-20' resize-none`}
                onChange={(e) => setFormData({...formData, chronicDisease: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-teal-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-teal-600/20 hover:bg-teal-700 active:scale-95 transition-all mt-4"
          >
            Save & Generate ID
          </button>
        </form>
      </div>
    </div>
  );
};

export default HealthForm;