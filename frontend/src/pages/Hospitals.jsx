import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BackgroundSwitcher from "../components/BackgroundSwitcher";
import MagicBento from "../components/MagicBento";
import CircularGallery from "../components/CircularGallery";
import { Search, Filter, Stethoscope, MapPin } from "lucide-react";

// Helper to safely format address/location from various structures
const formatAddress = (data) => {
  if (!data) return "Location unavailable";

  // Handle fallback data or schema variations where it might be 'address' or 'location'
  const addr = data.location || data.address;

  if (!addr) return "Location unavailable";

  if (typeof addr === "string") return addr;

  if (typeof addr === "object") {
    const city = addr.city || "";
    const country = addr.country || "";
    // Filter out empty parts and join
    const parts = [city, country].filter((p) => p && p.trim().length > 0);
    return parts.length > 0 ? parts.join(", ") : "Location unavailable";
  }

  return "Location unavailable";
};

export default function Hospitals() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false); // Added loading state for dropdown
  const searchRef = useRef(null);

  // Premium Hospital Images (Defined at top for scope access)
  const defaultImages = [
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1587351021759-3e566b9af922?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&q=80&w=1000",
  ];

  // Common specialties for filter
  const specialties = [
    "All",
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Oncology",
    "Pediatrics",
    "Dermatology",
    "Gastroenterology",
    "Ophthalmology",
  ];

  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input to prevent rapid API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Hospitals (Hybrid: ML + Backend)
  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const promises = [];

      // 1. Backend Search (Name/Specialty)
      let backendUrl = "http://localhost:5000/api/hospitals?limit=50";
      if (debouncedSearch) backendUrl += `&search=${debouncedSearch}`;
      if (specialty && specialty !== "All")
        backendUrl += `&treatment=${specialty}`;
      promises.push(
        axios.get(backendUrl).catch((e) => ({ data: { success: false } })),
      );

      // 2. ML Search (City-based) - Only if search query exists
      if (debouncedSearch && debouncedSearch.length > 2) {
        promises.push(
          axios
            .get(
              `http://localhost:8001/hospitals-by-city?city=${debouncedSearch}`,
            )
            .catch((e) => ({ data: [] })),
        );
      }

      const results = await Promise.all(promises);
      const backendData = results[0].data?.success
        ? results[0].data.data.hospitals
        : [];
      const mlData = results[1]?.data || [];

      // Transform ML Data to match Frontend Schema
      const mlHospitals = Array.isArray(mlData)
        ? mlData.map((h, i) => ({
            _id: `ml_${i}_${h.name.replace(/\s/g, "_")}`,
            name: h.name,
            address: { city: h.city || debouncedSearch, country: "India" }, // ML usually returns Indian cities
            rating: h.rating || 4.5,
            image: defaultImages[i % defaultImages.length], // Assign random premium image
            images: [{ url: defaultImages[i % defaultImages.length] }],
            specialties: [{ name: h.specialty || "General" }],
            specialty: h.specialty || "General",
            description:
              h.summary || "Top rated hospital in " + (h.city || "India"),
          }))
        : [];

      // Merge: Prioritize ML results for City searches
      // Deduplicate by name
      const allHospitals = [...mlHospitals, ...backendData];
      const uniqueHospitals = Array.from(
        new Map(allHospitals.map((item) => [item.name, item])).values(),
      );

      setHospitals(uniqueHospitals);
    } catch (error) {
      console.error("Failed to fetch hospitals", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [debouncedSearch, specialty]);

  // Fetch Suggestions (Hybrid Dropdown)

  useEffect(() => {
    if (search.length > 2) {
      const fetchSuggestions = async () => {
        setLoadingSuggestions(true);
        try {
          const promises = [
            axios
              .get(
                `http://localhost:5000/api/hospitals?search=${search}&limit=5`,
              )
              .catch((e) => ({ data: { success: false } })), // Backend
            axios
              .get(`http://localhost:8001/hospitals-by-city?city=${search}`)
              .catch((e) => ({ data: [] })), // ML
          ];

          const results = await Promise.all(promises);
          const backendSugg = results[0].data?.success
            ? results[0].data.data.hospitals
            : [];
          const mlSuggRaw = results[1]?.data || [];

          // Transform ML Suggestions
          const mlSugg = Array.isArray(mlSuggRaw)
            ? mlSuggRaw.slice(0, 5).map((h, i) => ({
                _id: `ml_sugg_${i}`,
                name: h.name,
                address: { city: h.city || search, country: "India" },
                image: defaultImages[i % defaultImages.length],
                images: [{ url: defaultImages[i % defaultImages.length] }],
              }))
            : [];

          // Merge & Deduplicate
          const combined = [...mlSugg, ...backendSugg];
          const unique = Array.from(
            new Map(combined.map((item) => [item.name, item])).values(),
          ).slice(0, 5);

          setSuggestions(unique);
          setShowDropdown(true);
        } catch (error) {
          console.error("Failed to fetch suggestions", error);
        } finally {
          setLoadingSuggestions(false);
        }
      };

      const timer = setTimeout(fetchSuggestions, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [search]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Premium Hospital Images moved to top

  // Gallery items logic
  let galleryItems = [];
  if (hospitals.length > 0) {
    galleryItems = hospitals.slice(0, 15).map((h, i) => ({
      image:
        h.images?.[0]?.url ||
        h.image ||
        defaultImages[i % defaultImages.length],
      text: h.name,
      onClick: () => navigate("/package", { state: { hospital: h } }),
    }));
  } else {
    const indianHospitals = [
      { name: "Apollo Hospitals", city: "New Delhi", country: "India" },
      { name: "AIIMS Delhi", city: "New Delhi", country: "India" },
      { name: "Medanta The Medicity", city: "Gurgaon", country: "India" },
      { name: "Fortis Healthcare", city: "Mumbai", country: "India" },
      { name: "Max Super Speciality", city: "New Delhi", country: "India" },
      { name: "Manipal Hospitals", city: "Bangalore", country: "India" },
      { name: "Lilavati Hospital", city: "Mumbai", country: "India" },
    ];
    galleryItems = defaultImages.map((img, i) => {
      const hosp = indianHospitals[i % indianHospitals.length];
      return {
        image: img,
        text: hosp.name,
        onClick: () =>
          navigate("/package", {
            state: {
              hospital: {
                _id: "dummy_" + i,
                name: hosp.name,
                address: { city: hosp.city, country: hosp.country },
                rating: 4.8,
                specialty: "Multi-Specialty",
                image: img,
                images: [{ url: img }],
              },
            },
          }),
      };
    });
  }

  while (galleryItems.length > 0 && galleryItems.length < 10) {
    galleryItems.push(...galleryItems);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-x-hidden">
      <div className="absolute inset-0 z-0">
        <BackgroundSwitcher />
      </div>

      <div className="relative z-10 w-full pt-28 mb-10">
        <div className="text-center mb-8 px-6">
          <h1 className="text-5xl md:text-6xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Global Health
          </h1>
          <p className="text-zinc-400 mt-2 text-lg max-w-2xl mx-auto">
            Explore top-tier medical facilities worldwide through our curated 3D
            showcase.
          </p>
        </div>

        {galleryItems.length > 0 ? (
          <div className="w-full h-[600px]">
            <CircularGallery
              items={galleryItems}
              bend={3}
              textColor="#ffffff"
              borderRadius={0.05}
            />
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-zinc-500">
            Loading Gallery...
          </div>
        )}
      </div>

      {/* Restored the missing container div for the Search/Grid section */}
      <div className="relative z-10 px-6 pb-20 max-w-7xl mx-auto">
        {/* FILTERS & SEARCH DROPDOWN */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 bg-zinc-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur-xl shadow-2xl z-50 relative">
          <div className="relative flex-1" ref={searchRef}>
            <Search className="absolute left-3 top-3 text-zinc-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by specialty, disease, or city..."
              className="w-full pl-10 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => {
                if (search.length > 1) setShowDropdown(true);
              }}
            />

            {/* DROPDOWN MENU - Z-Index 100 */}
            {showDropdown && search.length > 1 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-[100] max-h-80 overflow-y-auto ring-1 ring-white/10">
                {loadingSuggestions ? (
                  <div className="p-4 text-center text-zinc-500 text-sm">
                    Searching...
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((s) => (
                    <div
                      key={s._id}
                      className="p-3 hover:bg-zinc-900 cursor-pointer flex items-center gap-3 transition-colors border-b border-zinc-800/50 last:border-none"
                      onClick={() => {
                        navigate("/package", { state: { hospital: s } });
                        setShowDropdown(false);
                      }}
                    >
                      <img
                        src={s.images?.[0]?.url || s.image || defaultImages[0]}
                        alt={s.name}
                        className="w-10 h-10 rounded-lg object-cover bg-zinc-800"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white max-w-[200px] truncate">
                          {s.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <MapPin size={12} />
                          <span className="truncate max-w-[180px]">
                            {formatAddress(s)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-zinc-500 text-sm">
                    No hospitals found for "{search}"
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative w-full md:w-64">
            <Filter className="absolute left-3 top-3 text-zinc-500 w-5 h-5" />
            <select
              className="w-full pl-10 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none appearance-none cursor-pointer"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            >
              <option value="">All Specialties</option>
              {specialties.map((s) => (
                <option key={s} value={s} className="bg-zinc-900">
                  {s} Specialty
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* HOSPITALS GRID (Magic Bento) */}
        {!loading && (
          <MagicBento
            cards={hospitals.map((h) => {
              const addressStr = formatAddress(h);

              return {
                title: h.name,
                description: addressStr,
                label: "Top Choice",
                color: "rgba(16, 185, 129, 0.2)",
                icon: <Stethoscope size={20} className="text-emerald-400" />,
                content: (
                  <div className="flex flex-col h-full">
                    <div className="h-40 w-full rounded-lg overflow-hidden mb-4 relative">
                      {h.images && h.images.length > 0 ? (
                        <img
                          src={h.images[0].url || h.images[0]}
                          alt={h.name}
                          className="w-full h-full object-cover transform hover:scale-105 transition duration-700"
                        />
                      ) : (
                        <img
                          src={
                            h.image ||
                            "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d"
                          }
                          alt={h.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1">
                        <span className="text-yellow-400">★</span>{" "}
                        {h.rating ? h.rating.toFixed(1) : 4.5}
                      </div>
                    </div>

                    <h3 className="font-heading text-lg font-bold text-white truncate">
                      {h.name}
                    </h3>
                    <p className="text-sm text-zinc-400 mb-3 truncate">
                      {addressStr}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {h.specialties &&
                        Array.isArray(h.specialties) &&
                        h.specialties.slice(0, 3).map((spec, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-1 rounded-full"
                          >
                            {typeof spec === "object"
                              ? spec.name || "Specialty"
                              : spec}
                          </span>
                        ))}
                    </div>

                    <button
                      onClick={() =>
                        navigate("/package", { state: { hospital: h } })
                      }
                      className="mt-auto w-full py-2 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-lg transition-colors"
                    >
                      View Packages
                    </button>
                  </div>
                ),
              };
            })}
            glowColor="16, 185, 129"
            enableStars={false}
          />
        )}
      </div>
    </div>
  );
}
