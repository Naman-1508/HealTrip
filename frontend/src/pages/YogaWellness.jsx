import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Brain, Heart, MapPin, DollarSign, Clock, Filter } from "lucide-react";
import BackgroundSwitcher from "../components/BackgroundSwitcher";
import MagicBento from "../components/MagicBento";
import toast from "react-hot-toast";

export default function YogaWellness() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("yoga"); // "yoga" or "mental"
  const [yogaSessions, setYogaSessions] = useState([]);
  const [mentalSessions, setMentalSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("");
  const [focus, setFocus] = useState("");

  // Fetch yoga sessions
  useEffect(() => {
    fetchYogaSessions();
  }, []);

  // Fetch mental health sessions
  useEffect(() => {
    fetchMentalSessions();
  }, []);

  const fetchYogaSessions = async () => {
    try {
      const url = city && focus 
        ? `http://localhost:8005/api/recommend/yoga?city=${city}&focus=${focus}`
        : `http://localhost:8005/api/sessions/yoga`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setYogaSessions(data.slice(0, 12)); // Limit to 12 sessions
      }
    } catch (error) {
      console.error("Error fetching yoga sessions:", error);
      toast.error("Failed to load yoga sessions");
    } finally {
      setLoading(false);
    }
  };

  const fetchMentalSessions = async () => {
    try {
      const url = city && focus
        ? `http://localhost:8004/api/recommend/mental?city=${city}&type=${focus}`
        : `http://localhost:8004/api/sessions/mental`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setMentalSessions(data.slice(0, 12)); // Limit to 12 sessions
      }
    } catch (error) {
      console.error("Error fetching mental health sessions:", error);
      toast.error("Failed to load mental health sessions");
    }
  };

  const handleSearch = () => {
    setLoading(true);
    if (activeTab === "yoga") {
      fetchYogaSessions();
    } else {
      fetchMentalSessions();
    }
  };

  const currentSessions = activeTab === "yoga" ? yogaSessions : mentalSessions;

  return (
    <div className="pt-28 px-8 pb-20 min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <BackgroundSwitcher />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-heading font-bold text-white mb-4">
            Wellness & Mental Relief
          </h1>
          <p className="text-zinc-400 max-w-2xl font-light">
            Discover curated yoga and mental health sessions designed to reduce stress, 
            improve mental clarity, and support overall well-being during your healing journey.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("yoga")}
            className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
              activeTab === "yoga"
                ? "bg-purple-600 text-white"
                : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            <Sparkles className="w-5 h-5" />
            Yoga Sessions
          </button>
          <button
            onClick={() => setActiveTab("mental")}
            className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
              activeTab === "mental"
                ? "bg-blue-600 text-white"
                : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            <Brain className="w-5 h-5" />
            Mental Health
          </button>
        </div>

        {/* Filters */}
        <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold">Search & Filter</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="City (e.g., Mumbai, Delhi)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="px-4 py-3 bg-zinc-800/50 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
            <input
              type="text"
              placeholder={activeTab === "yoga" ? "Focus (e.g., stress, meditation)" : "Type (e.g., anxiety, depression)"}
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              className="px-4 py-3 bg-zinc-800/50 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Sessions Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-zinc-400">Loading sessions...</p>
          </div>
        ) : currentSessions.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">No sessions found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentSessions.map((session, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition group"
              >
                {/* Session Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition">
                      {activeTab === "yoga" ? session.Center_Name : session.Session_Name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <MapPin className="w-4 h-4" />
                      {session.City}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    session.Cluster_Name === "Premium" 
                      ? "bg-purple-500/20 text-purple-400"
                      : session.Cluster_Name === "Standard"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-green-500/20 text-green-400"
                  }`}>
                    {session.Cluster_Name || "Standard"}
                  </div>
                </div>

                {/* Session Details */}
                <div className="space-y-3 mb-4">
                  {activeTab === "yoga" ? (
                    <>
                      <div className="flex items-center gap-2 text-sm text-zinc-300">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="font-medium">Style:</span> {session.Yoga_Style || "Hatha"}
                      </div>
                      {session.Amenities && (
                        <div className="text-sm text-zinc-400">
                          <span className="font-medium text-zinc-300">Amenities:</span> {session.Amenities}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-sm text-zinc-300">
                        <Brain className="w-4 h-4 text-blue-400" />
                        <span className="font-medium">Type:</span> {session.Session_Type || "Individual"}
                      </div>
                      {session.Topics && (
                        <div className="text-sm text-zinc-400">
                          <span className="font-medium text-zinc-300">Topics:</span> {session.Topics}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-white">
                      ₹{(activeTab === "yoga" ? session.Price : session.Fee)?.toLocaleString('en-IN') || 0}
                    </span>
                    <span className="text-sm text-zinc-400">/session</span>
                  </div>
                  <button 
                    onClick={() => navigate('/payment', { state: { type: 'wellness', data: session } })}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition active:scale-95"
                  >
                    Book Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
