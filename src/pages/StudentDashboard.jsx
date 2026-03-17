import { db } from "../utils/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import React, { useState, useEffect, useRef } from "react";

const StudentDashboard = ({ user, setUser }) => {

  const [activeTab, setActiveTab] = useState("home");
  const [showGovHelpline, setShowGovHelpline] = useState(false);
  const [mood, setMood] = useState(null);
  const [quote, setQuote] = useState("Aapki mental health sabse zaroori hai ✨");
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const userData = user || {
    fullName: "IITP Student",
    age: "20",
    bloodGroup: "O+",
    emergencyPhone: "9152987821",
    allergies: "None",
    medications: "None",
    photo: null
  };

  const [messages, setMessages] = useState([
    { text: `Hi ${userData.fullName}! Main tera AI friend hoon.`, sender: "ai" }
  ]);

  const [inputText, setInputText] = useState("");
  const chatRef = useRef(null);

  // GOOGLE MAPS
  const findNearestHospital = () => {
    window.open(
      "https://www.google.com/maps/search/hospitals+near+me",
      "_blank"
    );
  };

  // 🚨 SEND SOS ALERT TO FIRESTORE
  const sendSOS = async () => {
    try {
      await addDoc(collection(db, "alerts"), {
        name: userData.fullName,
        age: userData.age,
        bloodGroup: userData.bloodGroup,
        emergencyPhone: userData.emergencyPhone,
        time: new Date(),
        status: "active",
        type: "sos"   // ✅ important addition
      });

      alert("SOS Alert Sent to Hospital Dashboard 🚨");

    } catch (error) {
      console.error("Error sending SOS:", error);
    }
  };

  // SOS Countdown Logic
  useEffect(() => {
    let timer;

    if (sosActive && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } 
    else if (countdown === 0) {
      sendSOS();
      setSosActive(false);
      setCountdown(5);
    }

    return () => clearInterval(timer);

  }, [sosActive, countdown]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUser({ ...userData, photo: URL.createObjectURL(file) });
    }
  };

  const quotes = [
    "You are stronger than you think 💪",
    "Thoda sa break lena kamzori nahi hai 🌿",
    "IITP ka star hai tu ✨",
    "Chhoti chhoti jeet celebrate karo 🚀",
  ];

  const oceanGreen = "bg-[#2D9383]";
  const oceanText = "text-[#2D9383]";
  const mintBg = "bg-[#F0F9F7]";

  return (
    <div className={`min-h-screen ${mintBg} font-sans pb-32`}>

      {/* HEADER */}
      <header className="px-6 py-5 flex justify-between bg-white border-b">
        <button
          onClick={() => setShowGovHelpline(!showGovHelpline)}
          className={`${oceanGreen} text-white px-3 py-2 rounded`}
        >
          Govt Counseling
        </button>

        <p className="text-sm font-bold text-gray-500">
          IIT PATNA HEALTH
        </p>
      </header>

      {/* SOS OVERLAY */}
      {sosActive && (
        <div className="fixed inset-0 bg-red-600 flex flex-col items-center justify-center text-white z-50">

          <h1 className="text-7xl font-bold">{countdown}</h1>

          <p className="mb-6 font-bold">
            Sending Alert to Hospital Dashboard
          </p>

          <button
            onClick={() => {
              setSosActive(false);
              setCountdown(5);
            }}
            className="bg-white text-red-600 px-6 py-3 rounded"
          >
            STOP SOS
          </button>

        </div>
      )}

      {/* MAIN */}
      <main className="p-6 space-y-6">

        {/* MOOD */}
        <div className="bg-white p-6 rounded-xl shadow">

          <p className="text-center mb-4 font-bold">
            How are you feeling?
          </p>

          <div className="flex justify-between text-3xl">

            {["😢","😟","😐","😊","🤩"].map((e)=>(
              <button
                key={e}
                onClick={()=>{
                  setMood(e);
                  setQuote(quotes[Math.floor(Math.random()*quotes.length)]);
                }}
              >
                {e}
              </button>
            ))}

          </div>

          <p className="mt-4 text-center text-gray-600">
            "{quote}"
          </p>

        </div>

        {/* HOSPITAL */}
        <div
          onClick={findNearestHospital}
          className="bg-white p-6 rounded-xl shadow flex justify-between cursor-pointer"
        >

          <div>
            <p className="text-red-500 text-sm font-bold">
              Emergency Help
            </p>

            <p className="font-bold">
              Nearest Hospitals
            </p>

          </div>

          <span>🏥</span>

        </div>

      </main>

      {/* BOTTOM NAVBAR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-4">

        <button onClick={()=>setActiveTab("home")}>
          🏠
        </button>

        <button onClick={()=>setActiveTab("chat")}>
          💬
        </button>

        {/* SOS BUTTON */}
        <button
          onClick={()=>setSosActive(true)}
          className="bg-red-500 text-white w-16 h-16 rounded-full font-bold"
        >
          SOS
        </button>

        <button onClick={()=>setActiveTab("wellness")}>
          🌿
        </button>

        <button onClick={()=>setActiveTab("profile")}>
          👤
        </button>

      </nav>

    </div>
  );
};

export default StudentDashboard;