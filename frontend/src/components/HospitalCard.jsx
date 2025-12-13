import { motion } from "framer-motion";
import { Star, Phone, MapPin, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function HospitalCard({
  name,
  address,
  rating,
  beds,
  image,
  phone,
  coords,
  specialties = [],
}) {
  const [distance, setDistance] = useState(null);
  const [open, setOpen] = useState(false);

  // ⭐ Generate rating stars
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(rating));

  // 📍 Calculate distance using haversine formula
  useEffect(() => {
    if (!coords) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const R = 6371;
      const dLat = ((coords[0] - pos.coords.latitude) * Math.PI) / 180;
      const dLon = ((coords[1] - pos.coords.longitude) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(pos.coords.latitude * (Math.PI / 180)) *
          Math.cos(coords[0] * (Math.PI / 180)) *
          Math.sin(dLon / 2) ** 2;

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c;
      setDistance(d.toFixed(1));
    });
  }, [coords]);

  // 🔵 Bed color
  const bedColor =
    beds > 10
      ? "text-green-600"
      : beds > 5
        ? "text-yellow-500"
        : "text-red-500";

  return (
    <>
      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.03 }}
        className="bg-white rounded-xl shadow-md overflow-hidden border hover:shadow-xl transition cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <img src={image} alt={name} className="w-full h-40 object-cover" />

        <div className="p-4">
          <h3 className="text-xl font-semibold">{name}</h3>
          <p className="text-gray-600 text-sm">{address}</p>

          {/* RATING */}
          <div className="flex items-center gap-1 mt-2">
            {stars.map((filled, i) => (
              <Star
                key={i}
                size={18}
                className={filled ? "text-yellow-500" : "text-gray-300"}
                fill={filled ? "currentColor" : "none"}
              />
            ))}
            <span className="ml-2 font-medium">{rating}</span>
          </div>

          {/* DISTANCE */}
          {distance && (
            <p className="mt-1 text-gray-500 text-sm">📍 {distance} km away</p>
          )}

          {/* SPECIALTIES */}
          <div className="flex flex-wrap gap-2 mt-3">
            {specialties.map((s, i) => (
              <span
                key={i}
                className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded-md"
              >
                {s}
              </span>
            ))}
          </div>

          {/* BEDS */}
          <p className={`mt-3 font-semibold ${bedColor}`}>
            Available Beds: {beds}
          </p>

          <button className="mt-4 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition">
            View Details
          </button>
        </div>
      </motion.div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl relative"
          >
            {/* CLOSE */}
            <button
              className="absolute top-3 right-3"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
            >
              <X size={26} />
            </button>

            {/* IMAGE */}
            <img
              src={image}
              alt={name}
              className="w-full h-48 object-cover rounded-lg"
            />

            {/* NAME */}
            <h2 className="text-2xl font-bold mt-4">{name}</h2>
            <p className="text-gray-600">{address}</p>

            {/* STARS */}
            <p className="mt-2 font-medium">
              ⭐ Rating: {rating} ({stars.filter(Boolean).length}/5)
            </p>

            {/* BEDS */}
            <p className={`mt-1 font-semibold ${bedColor}`}>
              🛏 Beds Available: {beds}
            </p>

            {/* SPECIALTIES */}
            <h3 className="mt-4 font-semibold">Specialties:</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {specialties.map((s, i) => (
                <span
                  key={i}
                  className="bg-gray-100 px-2 py-1 rounded-md text-sm"
                >
                  {s}
                </span>
              ))}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-3 mt-6">
              {/* CALL */}
              <button
                onClick={() => (window.location.href = `tel:${phone}`)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                <Phone size={18} />
                Call
              </button>

              {/* DIRECTIONS */}
              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}`,
                    "_blank",
                  )
                }
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <MapPin size={18} />
                Directions
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
