import YogaCard from "../components/YogaCard";
import WellnessSchedule from "../components/WellnessSchedule";
import { motion } from "framer-motion";
import Threads from "../components/Threads";
import MagicBento from "../components/MagicBento";

export default function YogaWellness() {
  const yogaSessions = [
    {
      title: "Morning Yoga for Mindfulness",
      description: "A gentle session to awaken your body and calm your mind.",
      image: "https://images.unsplash.com/photo-1552058544-f2b08422138a",
      time: "6:00 AM - 7:00 AM",
    },
    {
      title: "Breathing Techniques for Stress Relief",
      description: "Learn pranayama techniques to reduce anxiety and stabilize breathing.",
      image: "https://images.unsplash.com/photo-1526403228783-0077c3f48e0e",
      time: "11:00 AM - 12:00 PM",
    },
    {
      title: "Evening Meditation",
      description: "A relaxing guided meditation to release the day’s stress.",
      image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b",
      time: "5:30 PM - 6:30 PM",
    },
  ];

  const schedule = [
    { activity: "Sunrise Yoga", time: "6:00 AM" },
    { activity: "Deep Breathing", time: "11:00 AM" },
    { activity: "Mindfulness Meditation", time: "5:30 PM" },
  ];

  return (
    <div className="pt-28 px-8 pb-20 min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Threads amplitude={1} distance={0} color={[0.4, 0.2, 0.8]} />
      </div>

      <div className="relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-heading font-bold text-white mb-6"
        >
          Yoga & Mental Relief Shivir
        </motion.h1>

        <p className="text-zinc-400 max-w-2xl font-light">
          HealTrip brings wellness to your journey. Join our curated yoga and meditation shivirs designed to reduce stress, improve mental clarity, and support overall well-being during travel or recovery.
        </p>

        {/* Schedule Section */}
        <div className="mt-10">
          <WellnessSchedule schedule={schedule} />
        </div>

        {/* Session Cards */}
        <h2 className="text-3xl font-heading font-semibold mt-12 mb-4 text-white">
          Upcoming Sessions
        </h2>

        <div className="mb-12">
          <MagicBento
            cards={yogaSessions.map(s => ({
              title: s.title,
              description: s.time,
              label: "Session",
              color: "rgba(0,0,0,0.5)",
              content: (
                <div className="flex flex-col h-full">
                  <div className="h-32 w-full rounded-lg overflow-hidden mb-4">
                    <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-heading text-lg font-bold">{s.title}</h3>
                  <p className="text-sm text-zinc-400 mb-2">{s.description}</p>
                  <div className="mt-auto text-xs text-green-400 uppercase tracking-widest">
                    {s.time}
                  </div>
                </div>
              )
            }))}
            glowColor="34, 197, 94" // Green glow for nature/yoga
            enableStars={true}
          />
        </div>
      </div>
    </div>
  );
}
