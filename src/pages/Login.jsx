import React, { useState } from 'react';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student'); // Default is student 

  const handleLogin = (e) => {
    e.preventDefault();
    if(email!==""){
        setUser({email:email,role:role});
        console.log("Logging in as:", role, "Email:", email);
    } else{
        alert("(please enter your email!");
    } 
    // Yahan Shivam ka Firebase Auth logic aayega
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-2">Welcome Back</h2>
        <p className="text-gray-500 text-center mb-8">Please login to continue</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 uppercase ml-1 mb-1">Email Address</label>
            <input 
              type="email" 
              required 
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 uppercase ml-1 mb-1">Login As</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="student">Student (I need help)</option>
              <option value="hospital">Hospital (I want to help)</option>
            </select>
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-blue-700 active:scale-[0.97] transition-all"
          >
            Login
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-400">
          Secure & Private • 24/7 Support
        </p>
      </div>
    </div>
  );
};

export default Login;