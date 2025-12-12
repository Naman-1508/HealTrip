import { useState } from "react";
import HospitalCard from "../components/HospitalCard";
import MapView from "../components/MapView";
import Threads from "../components/Threads";
import MagicBento from "../components/MagicBento";

export default function Hospitals() {
  const [search, setSearch] = useState("");

  // ✅ SAMPLE HOSPITAL DATA (Matches HospitalCard props)
  const hospitals = [
    {
      name: "Apollo Hospital",
      address: "HSR Layout, Bangalore",
      rating: 4.6,
      beds: 18,
      phone: "+918044111111",
      coords: [12.9121, 77.6446],
      image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3",
      specialties: [
        "Cardiology",
        "Neurology",
        "Orthopedics",
        "Emergency Care",
        "General Surgery"
      ]
    },
    {
      name: "Fortis Healthcare",
      address: "Bannerghatta Road, Bangalore",
      rating: 4.3,
      beds: 7,
      phone: "+918066222222",
      coords: [12.9081, 77.6042],
      image: "https://images.unsplash.com/photo-1600962815726-457c3ca38f7d",
      specialties: [
        "Cancer Care",
        "Urology",
        "Heart Institute",
        "Critical Care",
        "Radiology"
      ]
    },
    {
      name: "Manipal Hospital",
      address: "Whitefield, Bangalore",
      rating: 4.4,
      beds: 3,
      phone: "+918030333333",
      coords: [12.9698, 77.7500],
      image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3",
      specialties: [
        "Neurosurgery",
        "Pediatrics",
        "General Medicine",
        "Trauma Care"
      ]
    },
    {
      name: "Columbia Asia Hospital",
      address: "Hebbal, Bangalore",
      rating: 4.1,
      beds: 14,
      phone: "+918022444444",
      coords: [13.0358, 77.5970],
      image: "https://images.unsplash.com/photo-1580281657525-38b0c2ebfe8e",
      specialties: [
        "Dermatology",
        "ENT",
        "Internal Medicine",
        "Intensive Care Unit"
      ]
    },
    {
      name: "Narayana Health City",
      address: "Bommasandra, Bangalore",
      rating: 4.5,
      beds: 22,
      phone: "+918022666666",
      coords: [12.8200, 77.6800],
      image: "https://images.unsplash.com/photo-1576765974033-3f1593a1b89b",
      specialties: [
        "Cardiac Sciences",
        "Transplants",
        "Oncology",
        "Neonatal ICU"
      ]
    },
    {
      name: "Aster CMI Hospital",
      address: "Hebbal, Bangalore",
      rating: 4.4,
      beds: 9,
      phone: "+918030777777",
      coords: [13.0453, 77.5975],
      image: "https://images.unsplash.com/photo-1586141240621-3e1c4d342b41",
      specialties: [
        "Gastroenterology",
        "Pulmonology",
        "Nephrology",
        "Critical Care"
      ]
    }
  ];

  // 🔍 FILTER HOSPITALS BY SEARCH
  const filtered = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.address.toLowerCase().includes(search.toLowerCase()) ||
      h.specialties.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="pt-28 px-6 pb-20 min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Threads amplitude={1} distance={0} color={[0.4, 0.2, 0.8]} />
      </div>

      <div className="relative z-10">

        <h1 className="text-4xl font-heading font-bold text-white">Nearby Hospitals</h1>
        <p className="text-zinc-400 mt-2 font-light">
          Find hospitals near you with availability, specialties, ratings & more.
        </p>

        {/* SEARCH BAR */}
        <div className="mt-6 flex justify-center">
          <input
            type="text"
            placeholder="Search hospitals or locations..."
            className="w-full max-w-xl px-4 py-3 bg-zinc-900 border border-zinc-800 text-white rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none placeholder-zinc-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* MAP VIEW */}
        <div className="mt-10">
          <MapView hospitals={filtered} />
        </div>

        {/* HOSPITALS GRID */}
        <div className="mt-12">
          <MagicBento
            cards={filtered.map(h => ({
              title: h.name,
              description: h.address,
              label: "Hospital",
              color: "rgba(0,0,0,0.5)",
              content: (
                <div className="flex flex-col h-full">
                  <div className="h-32 w-full rounded-lg overflow-hidden mb-4">
                    <img src={h.image} alt={h.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-heading text-lg font-bold">{h.name}</h3>
                  <p className="text-sm text-zinc-400 mb-2">{h.address}</p>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {h.specialties.slice(0, 3).map((spec, i) => (
                      <span key={i} className="text-[10px] bg-zinc-800 px-2 py-1 rounded-full text-zinc-300">
                        {spec}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex justify-between items-center text-xs text-zinc-500 pt-3 border-t border-zinc-800">
                    <span>{h.phone}</span>
                    <span className="text-green-400">★ {h.rating}</span>
                  </div>
                </div>
              )
            }))}
            glowColor="59, 130, 246" // Blue glow for hospitals
            enableStars={true}
          />
        </div>
      </div>
    </div>
  );
}
