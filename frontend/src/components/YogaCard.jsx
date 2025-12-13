import { motion } from "framer-motion";

export default function YogaCard({ title, description, image, time }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="rounded-xl bg-white shadow-lg overflow-hidden border hover:shadow-xl transition"
    >
      <img src={image} alt={title} className="w-full h-40 object-cover" />

      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600 mt-2 text-sm">{description}</p>

        <p className="mt-3 font-medium text-green-600">🕒 {time}</p>

        <button className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
          Register Now
        </button>
      </div>
    </motion.div>
  );
}
