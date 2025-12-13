import { motion } from "framer-motion";
import { PhoneCall, MapPin, Ambulance, AlertTriangle } from "lucide-react";

export default function EmergencySOS() {
  const handleSOS = () => {
    alert(
      "🚨 SOS Alert Sent!\nNearby hospitals and emergency contacts notified.",
    );
  };

  const handleCall = () => {
    window.location.href = "tel:108"; // India ambulance number
  };

  const handleLocationShare = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        alert(
          `📍 Location Sent:\nLat: ${pos.coords.latitude}, Long: ${pos.coords.longitude}`,
        );
      });
    } else {
      alert("Location access denied.");
    }
  };

  return (
    <div className="pt-28 px-6 pb-20 min-h-screen bg-red-50 flex flex-col items-center">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <AlertTriangle className="text-red-600 w-16 h-16 mx-auto" />
        <h1 className="text-4xl font-bold text-red-700 mt-4">Emergency SOS</h1>
        <p className="text-gray-700 mt-2">
          Immediate assistance will be sent to your location.
        </p>
      </motion.div>

      {/* SOS BUTTON */}
      <motion.button
        onClick={handleSOS}
        whileTap={{ scale: 0.9 }}
        animate={{
          scale: [1, 1.08, 1],
          boxShadow: [
            "0 0 0px rgba(220,38,38,0.4)",
            "0 0 40px rgba(220,38,38,0.6)",
            "0 0 0px rgba(220,38,38,0.4)",
          ],
        }}
        transition={{ repeat: Infinity, duration: 1.2 }}
        className="w-56 h-56 bg-red-600 text-white rounded-full flex items-center justify-center text-4xl font-bold shadow-xl border-4 border-red-300"
      >
        SOS
      </motion.button>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-14 w-full max-w-3xl">
        {/* CALL AMBULANCE */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white border rounded-xl p-6 flex flex-col items-center shadow-md"
        >
          <Ambulance className="text-red-600 w-10 h-10" />
          <h3 className="font-semibold mt-3">Call Ambulance</h3>
          <p className="text-gray-600 text-sm text-center">
            Connect with emergency services immediately
          </p>
          <button
            onClick={handleCall}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Call 108
          </button>
        </motion.div>

        {/* SHARE LOCATION */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white border rounded-xl p-6 flex flex-col items-center shadow-md"
        >
          <MapPin className="text-red-600 w-10 h-10" />
          <h3 className="font-semibold mt-3">Share Location</h3>
          <p className="text-gray-600 text-sm text-center">
            Send your GPS location to emergency contacts
          </p>
          <button
            onClick={handleLocationShare}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Share Location
          </button>
        </motion.div>

        {/* CONTACT NEARBY HOSPITALS */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white border rounded-xl p-6 flex flex-col items-center shadow-md"
        >
          <PhoneCall className="text-red-600 w-10 h-10" />
          <h3 className="font-semibold mt-3">Nearby Hospitals</h3>
          <p className="text-gray-600 text-sm text-center">
            Notify nearby hospitals about your emergency
          </p>
          <button
            onClick={() => (window.location.href = "/hospitals")}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            View Hospitals
          </button>
        </motion.div>
      </div>
    </div>
  );
}
