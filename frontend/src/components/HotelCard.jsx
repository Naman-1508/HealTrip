import { motion } from "framer-motion";
import { Star, Phone, MapPin, X, BedDouble } from "lucide-react";
import { useState, useEffect } from "react";

export default function HotelCard({
  name,
  location,
  rating,
  price,
  image,
  phone,
  coords,
  amenities = []
}) {
  const [distance, setDistance] = useState(null);
  const [open, setOpen] = useState(false);

  // ⭐ STAR RATING ARRAY
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(rating));

  // 📍 CALCULATE USER DISTANCE
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

  // PRICE BADGE COLOR
  const priceColor =
    Number(price.replace(/[^0-9]/g, "")) > 6000
      ? "text-red-600"
      : Number(price.replace(/[^0-9]/g, "")) > 3500
      ? "text-yellow-600"
      : "text-green-600";

  return (
    <>
      {/* HOTEL CARD */}
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
          <p className="text-gray-600 text-sm">{location}</p>

          {/* ⭐ STAR RATING */}
          <div className="flex items-center mt-2">
            {stars.map((filled, i) => (
              <Star
                key={i}
                size={18}
                className={filled ? "text-yellow-500" : "text-gray-300"}
                fill={filled ? "currentColor" : "none"}
              />
            ))}
            <span className="ml-2 text-sm font-medium">{rating}</span>
          </div>

          {/* DISTANCE */}
          {distance && (
            <p className="text-gray-500 text-sm mt-1">
              📍 {distance} km away
            </p>
          )}

          {/* AMENITIES TAGS */}
          <div className="flex flex-wrap gap-2 mt-3">
            {amenities.map((tag, i) => (
              <span
                key={i}
                className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* PRICE BADGE */}
          <p className={`mt-3 font-semibold ${priceColor}`}>
            {price} / night
          </p>

          <button className="mt-4 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition">
            View Details
          </button>
        </div>
      </motion.div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl relative"
          >
            {/* Close Button */}
            <button
              className="absolute top-3 right-3"
              onClick={() => setOpen(false)}
            >
              <X size={26} />
            </button>

            {/* Image */}
            <img
              src={image}
              alt={name}
              className="w-full h-48 object-cover rounded-lg"
            />

            {/* Details */}
            <h2 className="text-2xl font-bold mt-4">{name}</h2>
            <p className="text-gray-600">{location}</p>

            {/* Rating */}
            <p className="mt-2 font-medium">
              ⭐ Rating: {rating} ({stars.filter(Boolean).length}/5)
            </p>

            {/* Price */}
            <p className={`mt-1 font-semibold ${priceColor}`}>
              💰 {price} per night
            </p>

            {/* Amenities */}
            <h3 className="mt-4 font-semibold">Amenities:</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {amenities.map((s, i) => (
                <span className="bg-gray-100 px-2 py-1 rounded-md text-sm">
                  {s}
                </span>
              ))}
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-6 flex gap-3">
              {/* CALL */}
              <button
                onClick={() => (window.location.href = `tel:${phone}`)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                <Phone size={18} /> Call Hotel
              </button>

              {/* GOOGLE MAPS */}
              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${coords[0]},${coords[1]}`,
                    "_blank"
                  )
                }
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <MapPin size={18} /> Directions
              </button>
            </div>

            {/* Booking Button */}
            <button className="mt-4 w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2">
              <BedDouble size={20} />
              Book Room
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}
