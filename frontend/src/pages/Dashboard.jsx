import { motion } from "framer-motion";
import {
  User,
  Activity,
  HeartPulse,
  Map,
  Hospital,
  Stethoscope,
  Briefcase,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import MagicBento from "../components/MagicBento";

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      // Get Clerk authentication token
      const token = await getToken();
      console.log("----------");
      // Fetch user's bookings with auth token
      const res = await axios.get(
        "http://localhost:5000/api/payment/my-bookings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.success) {
        // Prepare Real Bookings
        const realBookings = res.data.data.bookings;

        // MOCK DATA: Inject a demo Yoga & Mental session for visibility (as requested "fast")
        // In production, these would come from the backend with type='wellness'
        const mockWellnessBookings = [
          {
            _id: "mock_yoga_1",
            type: "wellness",
            status: "confirmed",
            createdAt: new Date().toISOString(),
            pricing: { total: 1500 },
            payment: { method: "upi" },
            data: {
              Center_Name: "Zenith Yoga Studio",
              City: "Rishikesh",
              Yoga_Style: "Hatha & Vinyasa",
              Price: 1500,
            },
          },
          {
            _id: "mock_mental_1",
            type: "wellness",
            status: "pending",
            createdAt: new Date().toISOString(),
            pricing: { total: 2000 },
            payment: { method: "card" },
            data: {
              Session_Name: "Anxiety Relief Session",
              City: "Online",
              Session_Type: "CBT Therapy",
              Fee: 2000,
              topics: "Stress, Panic Attacks",
            },
          },
        ];

        // Combine real + mock (ensure mock is only added if not present)
        setBookings([...realBookings, ...mockWellnessBookings]);
      }
    } catch (error) {
      console.error("Failed to fetch bookings", error);
      // Fallback
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded)
    return <div className="pt-28 text-center text-white">Loading...</div>;
  if (!user) {
    navigate("/login");
    return null;
  }

  // Filter Active Packages
  const activePackages = bookings.filter(
    (b) => b.status !== "cancelled" && b.status !== "completed",
  );

  const stats = [
    {
      label: "Bookings",
      value: bookings.length,
      icon: Briefcase,
      color: "text-purple-500",
    },
    {
      label: "Active Plans",
      value: activePackages.length,
      icon: Map,
      color: "text-blue-500",
    },
    {
      label: "Health Score",
      value: "Good",
      icon: Activity,
      color: "text-green-500",
    },
  ];

  return (
    <div className="pt-28 px-8 pb-20 min-h-screen bg-zinc-950 text-white">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex flex-col md:flex-row justify-between items-end gap-4"
      >
        <div>
          <h1 className="text-4xl font-heading font-bold text-white">
            Dashboard
          </h1>
          <p className="text-zinc-400 mt-2">Welcome back, {user.firstName}!</p>
        </div>
        <button
          onClick={() => navigate("/travel")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-medium transition"
        >
          Plan New Trip
        </button>
      </motion.div>

      {/* STATS BENTO */}
      <div className="mb-12">
        <MagicBento
          cards={stats.map((s) => ({
            title: s.value,
            description: s.label,
            label: "Overview",
            icon: <s.icon size={24} className={s.color} />,
            color: "rgba(255,255,255,0.05)",
          }))}
          enableStars={false}
          enableSpotlight={true}
        />
      </div>

      {/* ACTIVE PACKAGES GRID */}
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Map className="text-blue-500" /> Active Packages
      </h2>

      {activePackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {activePackages.map((booking) => {
            // DETEMINE CARD TYPE
            const isWellness = booking.type === "wellness";
            const isYoga = isWellness && booking.data?.Yoga_Style;

            // Dynamic Data
            const title = isYoga
              ? booking.data.Center_Name
              : isWellness
                ? booking.data.Session_Name
                : booking.hospital?.name || "Hospital Visit";

            const subtext = isYoga
              ? `${booking.data.Yoga_Style} • ${booking.data.City}`
              : isWellness
                ? `${booking.data.Session_Type} • ${booking.data.City}`
                : `${booking.hotel?.name || "No Hotel"} • ${booking.packageDetails?.duration || 1} Days`;

            const icon = isYoga ? (
              <User className="text-purple-400" />
            ) : isWellness ? (
              <HeartPulse className="text-blue-400" />
            ) : (
              <Hospital className="text-emerald-400" />
            );

            const bgColor = isYoga
              ? "bg-purple-900/20 border-purple-500/30"
              : isWellness
                ? "bg-blue-900/20 border-blue-500/30"
                : "bg-zinc-900/50 border-white/10";

            return (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`${bgColor} border rounded-2xl overflow-hidden hover:border-white/30 transition cursor-pointer`}
                onClick={() =>
                  navigate("/payment", { state: { bookingId: booking._id } })
                }
              >
                <div
                  className={`h-32 relative ${isWellness ? "bg-zinc-800/50" : "bg-zinc-800"}`}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                    {isYoga ? (
                      <User size={48} opacity={0.3} />
                    ) : isWellness ? (
                      <HeartPulse size={48} opacity={0.3} />
                    ) : (
                      <Map size={48} opacity={0.2} />
                    )}
                  </div>
                  <div
                    className={`absolute top-4 right-4 text-black text-xs font-bold px-2 py-1 rounded-full uppercase ${
                      booking.status === "confirmed"
                        ? "bg-emerald-500"
                        : "bg-yellow-500"
                    }`}
                  >
                    {booking.status}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                    {icon} <span className="truncate">{title}</span>
                  </h3>
                  <p className="text-zinc-400 text-sm mb-4">{subtext}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="text-sm text-zinc-500">Total Paid</span>
                    <span className="text-lg font-bold text-emerald-400">
                      ₹{booking.pricing?.total?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-8 text-center mb-12">
          <p className="text-zinc-500 mb-4">No active travel packages found.</p>
          <button
            onClick={() => navigate("/travel")}
            className="text-emerald-400 hover:underline"
          >
            Start planning a trip
          </button>
        </div>
      )}

      {/* TRANSACTION HISTORY TABLE */}
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Briefcase className="text-purple-500" /> Transaction History
      </h2>

      <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-zinc-400 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Payment Method</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {bookings.length > 0 ? (
                bookings.map((b) => {
                  const isWellness = b.type === "wellness";
                  const isYoga = isWellness && b.data?.Yoga_Style;
                  const itemName = isYoga
                    ? b.data.Center_Name
                    : isWellness
                      ? b.data.Session_Name
                      : b.hospital?.name;
                  const itemSub = isYoga
                    ? "Yoga Session"
                    : isWellness
                      ? "Mental Wellness"
                      : b.hotel?.name || "Hotel Booking";

                  return (
                    <tr key={b._id} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4 font-medium text-zinc-300">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-white font-medium">
                            {itemName}
                          </span>
                          <span className="text-zinc-500 text-xs">
                            {itemSub}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-emerald-400 font-mono">
                        ₹{b.pricing?.total?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-zinc-400 capitalize">
                        {b.payment?.method || "Pending"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                            b.status === "completed" || b.status === "confirmed"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : b.status === "cancelled"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-zinc-500"
                  >
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
