import { motion } from "framer-motion";
import { User, Activity, HeartPulse, Map, Hospital, Stethoscope } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import MagicBento from "../components/MagicBento";

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();

  const stats = [
    { label: "Recent Diagnoses", value: 3, icon: Stethoscope, color: "text-green-600" },
    { label: "Saved Hospitals", value: 5, icon: Hospital, color: "text-blue-600" },
    { label: "Travel Risk Score", value: "Low", icon: Map, color: "text-yellow-600" },
  ];

  const recentDiagnoses = [
    { condition: "Viral Fever", date: "2 days ago" },
    { condition: "Mild Migraine", date: "1 week ago" },
    { condition: "Dehydration", date: "3 weeks ago" },
  ];

  const recommendations = [
    "Drink 2–3 liters of water daily.",
    "Practice deep breathing for 10 minutes.",
    "Avoid long travel without breaks.",
    "Maintain a balanced sleep schedule.",
  ];

  if (!isLoaded) {
    return (
      <div className="pt-28 px-8 pb-20 min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="pt-28 px-8 pb-20 min-h-screen bg-zinc-950 text-white">

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-heading font-bold text-white mb-8"
      >
        Welcome back, {user.firstName}!
      </motion.h1>

      {/* GRID START */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 bg-black/40 backdrop-blur-md rounded-xl shadow-lg border border-white/10 p-6"
        >
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <h2 className="mt-4 text-xl font-heading font-semibold text-white">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-zinc-400 text-sm">{user.primaryEmailAddress?.emailAddress}</p>
            <button 
              onClick={() => navigate("/profile")}
              className="mt-4 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Edit Profile
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="lg:col-span-3">
          <MagicBento
            cards={stats.map(s => ({
              title: s.value,
              description: s.label,
              label: "Stat",
              icon: <s.icon size={24} className={s.color} />,
              color: "rgba(0,0,0,0.5)",
            }))}
            enableStars={true}
            enableSpotlight={true}
            enableTilt={true}
            spotlightRadius={200}
            glowColor="56, 189, 248" // Light blue/cyan glow
          />
        </div>

      </div>
      {/* GRID END */}

      {/* Recent Diagnoses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-14 bg-black/40 backdrop-blur-md rounded-xl shadow-md border border-white/10 p-6"
      >
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="text-green-600" /> Recent Diagnoses
        </h2>

        <ul className="space-y-3">
          {recentDiagnoses.map((d, i) => (
            <li
              key={i}
              className="flex justify-between p-3 bg-zinc-900/50 rounded-md border border-white/5"
            >
              <span className="font-medium text-zinc-200">{d.condition}</span>
              <span className="text-zinc-500">{d.date}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-14 bg-black/40 backdrop-blur-md rounded-xl shadow-md border border-white/10 p-6"
      >
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <HeartPulse className="text-red-600" /> Wellness Recommendations
        </h2>

        <ul className="list-disc pl-6 space-y-2 text-zinc-300">
          {recommendations.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </motion.div>

    </div>
  );
}
