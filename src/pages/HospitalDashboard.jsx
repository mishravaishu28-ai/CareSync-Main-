 import React, { useEffect, useState } from "react";
import { db } from "../utils/firebaseConfig";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";

const HospitalDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  // 🔹 Firestore listener
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

  // 🔹 Resolve alert
  const resolveAlert = async (id) => {
    try {
      await updateDoc(doc(db, "alerts", id), {
        status: "resolved",
      });
    } catch (error) {
      console.error("Error resolving alert:", error);
    }
  };

  const activeAlerts = alerts.filter((a) => a.status !== "resolved");

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold text-blue-600">
          Hospital Emergency Dashboard
        </h1>

        {/* MENU BUTTON */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="bg-blue-600 text-white px-4 py-2 rounded-full shadow"
          >
            ☰ Menu
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-xl border z-50">

              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                Dashboard
              </button>

              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                Hospitals
              </button>

              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                Emergency Cases
              </button>

              <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                Settings
              </button>

            </div>
          )}
        </div>

      </div>

      {/* ALERT COUNT */}
      <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow mb-6 inline-block">
        🚨 {activeAlerts.length} Active Alerts
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-gray-500">Total Alerts</h2>
          <p className="text-2xl font-bold">{alerts.length}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-gray-500">Active Alerts</h2>
          <p className="text-2xl font-bold text-red-600">
            {activeAlerts.length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="text-gray-500">Resolved Alerts</h2>
          <p className="text-2xl font-bold text-green-600">
            {alerts.filter((a) => a.status === "resolved").length}
          </p>
        </div>

      </div>

      {/* ALERT LIST */}
      <div className="bg-red-100 p-5 rounded-xl shadow">

        <h2 className="text-lg font-bold text-red-600 mb-3">
          Emergency Cases
        </h2>

        {activeAlerts.length === 0 && (
          <p className="text-gray-600">No active alerts.</p>
        )}

        {activeAlerts.map((alert) => (
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

            <div className="space-y-1 text-gray-700">
              <p><b>Name:</b> {alert.name || "N/A"}</p>
              <p><b>Age:</b> {alert.age || "N/A"}</p>
              <p><b>Blood Group:</b> {alert.bloodGroup || "N/A"}</p>
              <p><b>Emergency Phone:</b> {alert.emergencyPhone || "N/A"}</p>
            </div>

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
                Mark Resolved
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
};

export default HospitalDashboard;