import React, { useEffect, useState } from "react";
import { db } from "../utils/firebaseConfig";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";

const hospitals = [
  { name: "City Hospital", distance: "1.2 km", beds: 12 },
  { name: "Apollo Hospital", distance: "2.5 km", beds: 8 },
  { name: "LifeCare Hospital", distance: "3 km", beds: 5 },
];

const HospitalDashboard = () => {
  const [alerts, setAlerts] = useState([]);

  // Real-time Firestore listener
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "alerts"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAlerts(data);
    });

    return () => unsubscribe();
  }, []);

  // Resolve alert
  const resolveAlert = async (id) => {
    await updateDoc(doc(db, "alerts", id), {
      status: "resolved",
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-blue-700 text-white p-6">
        <h2 className="text-2xl font-bold mb-8">CareSync</h2>

        <ul className="space-y-4">
          <li className="hover:bg-blue-600 p-2 rounded">Dashboard</li>
          <li className="hover:bg-blue-600 p-2 rounded">Hospitals</li>
          <li className="hover:bg-blue-600 p-2 rounded">Emergency Cases</li>
          <li className="hover:bg-blue-600 p-2 rounded">Settings</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">
            Hospital Emergency Dashboard
          </h1>

          <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow">
            🚨 Emergency Alerts
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">

          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-gray-500">Total Hospitals</h2>
            <p className="text-2xl font-bold">12</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-gray-500">Available Beds</h2>
            <p className="text-2xl font-bold text-green-600">48</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="text-gray-500">Active Emergencies</h2>
            <p className="text-2xl font-bold text-red-600">
              {alerts.filter(a => a.status !== "resolved").length}
            </p>
          </div>

        </div>

        {/* Hospital List */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">

          <h2 className="text-xl font-semibold mb-4">
            Nearby Hospitals
          </h2>

          {hospitals.map((hospital, index) => (
            <div
              key={index}
              className="flex justify-between border-b py-3"
            >
              <div>
                <p className="font-semibold">{hospital.name}</p>
                <p className="text-gray-500 text-sm">
                  Distance: {hospital.distance}
                </p>
              </div>

              <div className="text-green-600 font-bold">
                Beds: {hospital.beds}
              </div>
            </div>
          ))}

        </div>

        {/* Emergency Alerts */}
        <div className="bg-red-100 p-5 rounded-xl shadow">

          <h2 className="text-lg font-bold text-red-600 mb-3">
            Active Emergency Cases
          </h2>

          {alerts.filter(alert => alert.status !== "resolved").length === 0 && (
            <p>No SOS alerts yet.</p>
          )}

          {alerts
            .filter(alert => alert.status !== "resolved")
            .map((alert) => (

              <div
                key={alert.id}
                className={`bg-white p-5 rounded-xl shadow mb-4 border-l-4 ${
                  alert.type === "mental"
                    ? "border-purple-600"
                    : "border-red-500"
                }`}
              >

                <h2 className={`text-xl font-bold mb-2 ${
                  alert.type === "mental"
                    ? "text-purple-600"
                    : "text-red-600"
                }`}>
                  {alert.type === "mental"
                    ? "🧠 Mental Health Alert"
                    : "🚨 SOS Alert"}
                </h2>

                {/* Student Info */}
                <div className="space-y-1 text-gray-700">
                  <p><b>Name:</b> {alert.name}</p>
                  <p><b>Age:</b> {alert.age}</p>
                  <p><b>Blood Group:</b> {alert.bloodGroup}</p>
                  <p><b>Emergency Phone:</b> {alert.emergencyPhone}</p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-4">

                  <button
                    onClick={() =>
                      window.open("https://www.google.com/maps/search/hospitals+near+me")
                    }
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Track Location
                  </button>

                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Ambulance Sent
                  </button>

                </div>

              </div>

            ))}

        </div>

      </div>
    </div>
  );
};

export default HospitalDashboard;