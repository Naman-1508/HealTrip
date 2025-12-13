import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ScrollStack, { ScrollStackItem } from "../components/ScrollStack";
import Threads from "../components/Threads";
import { Plane, Hotel, Hospital, Search } from "lucide-react";
import toast from "react-hot-toast";

// Image pools for visual variety
const HOTEL_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
  "https://images.unsplash.com/photo-1551776235-dde6d4829808",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb",
  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa",
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32"
];

export default function TravelPlanner() {
  const navigate = useNavigate();

  // Separate Search States
  const [flightSearch, setFlightSearch] = useState({ from: "", to: "", date: "" });
  const [hotelLocation, setHotelLocation] = useState("");
  const [hospitalCity, setHospitalCity] = useState("");
  
  // Filter States
  const [flightFilters, setFlightFilters] = useState({ maxPrice: "", airline: "" });
  const [hotelFilters, setHotelFilters] = useState({ minRating: "", maxPrice: "" });
  const [hospitalFilters, setHospitalFilters] = useState({ specialty: "", minRating: "" });
  
  // Results
  const [flights, setFlights] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  
  // Unfiltered results (for client-side filtering)
  const [allFlights, setAllFlights] = useState([]);
  const [allHotels, setAllHotels] = useState([]);
  const [allHospitals, setAllHospitals] = useState([]);

  // Loaders
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [loadingFlights, setLoadingFlights] = useState(false);

  // Search Flights (Backend Port 8002)
  const handleFlightSearch = async () => {
    if (!flightSearch.from || !flightSearch.to) {
      toast.error("Please enter origin and destination");
      return;
    }

    setLoadingFlights(true);

    try {
        const response = await fetch(`http://localhost:8002/recommend-flights?origin=${flightSearch.from}&destination=${flightSearch.to}`);
        if(response.ok) {
            const data = await response.json();
            if(data && data.length > 0) {
                // Map ML data to UI
                const mappedFlights = data.map((f, i) => ({
                    airline: f.airline,
                    flightNumber: `HT-${100+i}`, // Synthesized
                    origin: f.origin, 
                    destination: f.destination,
                    departureTime: new Date().setHours(8 + i, 0), // Mock times for demo
                    arrivalTime: new Date().setHours(8 + i + (f.duration_minutes/60), (f.duration_minutes%60)),
                    price: f.price,
                    duration: `${Math.floor(f.duration_minutes/60)}h ${f.duration_minutes%60}m`,
                    stops: f.stops
                }));
                setAllFlights(mappedFlights);
                setFlights(mappedFlights);
                toast.success(`Found ${data.length} flights!`);
            } else {
                setFlights([]);
                toast.error("No flights found for this route");
            }
        } else {
             toast.error("Flight Service Error");
        }
    } catch(err) {
        console.error(err);
        toast.error("Could not connect to Flight Service");
    } finally {
        setLoadingFlights(false);
    }
  };

  // Image Utilities
  const PLACEHOLDER_IMAGES = [
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d",
    "https://images.unsplash.com/photo-1586773860418-d37222d8fce3",
    "https://images.unsplash.com/photo-1516549655169-df83a253836f",
    "https://images.unsplash.com/photo-1587351021759-3e566b9af6f7"
  ];

  const getRandomImage = (name, type = 'hotel') => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const list = type === 'hotel' ? HOTEL_IMAGES : PLACEHOLDER_IMAGES;
    return list[Math.abs(hash) % list.length];
  };

  // 1. HOTEL SEARCH (Backend Port 8000)
  const handleHotelSearch = async () => {
    if (!hotelLocation) {
      toast.error("Please enter a city");
      return;
    }

    setLoadingHotels(true);
    const loc = hotelLocation.toLowerCase();

    try {
      const response = await fetch(`http://localhost:8000/recommend?location=${loc}`);
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const transformedHotels = data.results.map(h => ({
            name: h.Hotel_Name,
            location: h.City,
            rating: h.Hotel_Rating,
            pricePerNight: h.Hotel_Price,
            images: [getRandomImage(h.Hotel_Name, 'hotel')], 
            amenities: h.amenities ? h.amenities.split(' ').slice(0, 5) : ["WiFi", "Parking"]
          }));
          setAllHotels(transformedHotels);
          setHotels(transformedHotels);
          toast.success(`Found ${data.count} hotels in ${loc}`);
        } else {
           setHotels([]);
           toast.error("No hotels found");
        }
      } else {
        toast.error("Hotel Service Error");
      }
    } catch (error) {
      console.error("Hotel API Error:", error);
      toast.error("Could not connect to Hotel Service");
    } finally {
      setLoadingHotels(false);
    }
  };

  // 2. HOSPITAL SEARCH (Backend Port 8001)
  const handleHospitalSearch = async () => {
    if (!hospitalCity) {
      toast.error("Please enter a city");
      return;
    }

    setLoadingHospitals(true);
    
    try {
      // Calls ML City-based Service
      const response = await fetch(`http://localhost:8001/hospitals-by-city?city=${encodeURIComponent(hospitalCity)}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const transformedHospitals = data.map(h => ({
            name: h.name,
            address: h.city,
            rating: h.rating,
            specialty: h.summary.slice(0, 50), // Extract specialty from summary
            images: [getRandomImage(h.name, 'hospital')],
            match: h.match_score
          }));
          setAllHospitals(transformedHospitals);
          setHospitals(transformedHospitals);
          toast.success(`Found ${data.length} hospitals in ${hospitalCity}!`);
        } else {
          setAllHospitals([]);
          setHospitals([]);
          toast.error("No hospitals found in this city");
        }
      } else {
         toast.error("Hospital Service Error");
      }
    } catch (error) {
       console.error("Hospital API Error:", error);
       toast.error("Could not connect to Hospital Service");
    } finally {
      setLoadingHospitals(false);
    }
  };

  // 3. VISA SEARCH (Backend Port 8003)
  const [visaSearch, setVisaSearch] = useState("");
  const [visaResult, setVisaResult] = useState(null);
  const [loadingVisa, setLoadingVisa] = useState(false);

  const handleVisaCheck = async () => {
      if (!visaSearch) {
          toast.error("Please enter a country");
          return;
      }
      setLoadingVisa(true);
      try {
          // POST request to Visa Service
          const response = await fetch('http://localhost:8003/visa-requirements', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ country: visaSearch, visa_type: "Tourist" })
          });

          if (response.ok) {
              const data = await response.json();
              setVisaResult(data);
              toast.success(`Visa info loaded for ${data.country}`);
          } else {
              toast.error("Visa info not available");
          }
      } catch (error) {
          console.error("Visa API Error:", error);
          toast.error("Could not connect to Visa Service");
      } finally {
          setLoadingVisa(false);
      }
  };

  // Apply filters
  const applyFilters = () => {
    // Filter flights
    let filteredFlights = [...allFlights];
    if (flightFilters.maxPrice) {
      filteredFlights = filteredFlights.filter(f => f.price <= parseFloat(flightFilters.maxPrice));
    }
    if (flightFilters.airline) {
      filteredFlights = filteredFlights.filter(f => f.airline.toLowerCase().includes(flightFilters.airline.toLowerCase()));
    }
    setFlights(filteredFlights);

    // Filter hotels
    let filteredHotels = [...allHotels];
    if (hotelFilters.minRating) {
      filteredHotels = filteredHotels.filter(h => h.rating >= parseFloat(hotelFilters.minRating));
    }
    if (hotelFilters.maxPrice) {
      filteredHotels = filteredHotels.filter(h => h.pricePerNight <= parseFloat(hotelFilters.maxPrice));
    }
    setHotels(filteredHotels);

    // Filter hospitals
    let filteredHospitals = [...allHospitals];
    if (hospitalFilters.specialty) {
      filteredHospitals = filteredHospitals.filter(h => 
        h.specialty.toLowerCase().includes(hospitalFilters.specialty.toLowerCase())
      );
    }
    if (hospitalFilters.minRating) {
      filteredHospitals = filteredHospitals.filter(h => h.rating >= parseFloat(hospitalFilters.minRating));
    }
    setHospitals(filteredHospitals);
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Background Threads */}
      <div className="absolute inset-0 z-0">
        <Threads amplitude={1} distance={0} color={[0.4, 0.2, 0.8]} />
      </div>

      <div className="relative z-10 h-screen">
        <ScrollStack 
          itemDistance={50} 
          itemStackDistance={30} 
          stackPosition="15%" 
          itemScale={0.05} 
          blurAmount={2}
        >

          {/* Intro Card */}
          <ScrollStackItem>
             <div className="w-full max-w-4xl mx-auto p-4 pt-20 text-center mb-20">
               <motion.div
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
               >
                 <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-4">
                   Travel Planner
                 </h1>
                 <p className="text-zinc-400 font-light text-xl">
                   Your complete medical tourism journey in one flow.
                 </p>
                 <p className="text-zinc-600 text-sm mt-4">Scroll to explore</p>
               </motion.div>
             </div>
          </ScrollStackItem>

          {/* FLIGHTS CARD */}
          <ScrollStackItem>
             <div className="w-full max-w-5xl mx-auto h-[80vh] overflow-y-auto custom-scrollbar bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl mb-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-600/20 rounded-xl">
                  <Plane className="w-6 h-6 text-blue-500" />
                </div>
                <h2 className="text-3xl font-heading font-bold">Flights</h2>
              </div>

              {/* Search */}
              <div className="bg-black/40 rounded-xl p-6 border border-white/5 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="From (e.g., Delhi)"
                    value={flightSearch.from}
                    onChange={(e) => setFlightSearch({ ...flightSearch, from: e.target.value })}
                    className="px-4 py-3 bg-zinc-800 border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="To (e.g., Bangalore)"
                    value={flightSearch.to}
                    onChange={(e) => setFlightSearch({ ...flightSearch, to: e.target.value })}
                    className="px-4 py-3 bg-zinc-800 border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                  <input
                    type="date"
                    value={flightSearch.date}
                    onChange={(e) => setFlightSearch({ ...flightSearch, date: e.target.value })}
                    className="px-4 py-3 bg-zinc-800 border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                  <button
                    onClick={handleFlightSearch}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold"
                  >
                    Find Flights
                  </button>
                </div>
              </div>

              {/* Flight Filters */}
              {allFlights.length > 0 && (
                <div className="bg-zinc-800/50 rounded-lg p-4 mb-6 border border-zinc-700">
                  <h3 className="text-sm font-bold text-blue-400 mb-3">Filters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="number"
                      placeholder="Max price (₹)"
                      value={flightFilters.maxPrice}
                      onChange={(e) => setFlightFilters({...flightFilters, maxPrice: e.target.value})}
                      className="px-3 py-2 bg-zinc-900 border-zinc-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Filter by airline..."
                      value={flightFilters.airline}
                      onChange={(e) => setFlightFilters({...flightFilters, airline: e.target.value})}
                      className="px-3 py-2 bg-zinc-900 border-zinc-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      onClick={applyFilters}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition font-bold"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}

              {/* Results */}
              {flights.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {flights.map((f, i) => (
                    <div key={i} className="bg-zinc-800/50 p-6 rounded-xl border border-white/5 flex justify-between items-center hover:bg-zinc-800 transition">
                       <div>
                          <h3 className="text-xl font-bold">{f.airline} <span className="text-sm font-normal text-zinc-400">{f.flightNumber}</span></h3>
                          <p className="text-zinc-400 mt-1">{f.origin} → {f.destination}</p>
                          <p className="text-sm text-zinc-500">{new Date(f.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(f.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-2xl font-bold text-blue-400">₹{f.price}</p>
                          <button 
                           onClick={() => navigate('/payment', { state: { type: 'flight', data: f } })}
                           className="mt-2 px-4 py-2 bg-white text-black rounded-lg text-sm font-bold hover:bg-gray-200 active:scale-95 transition-transform"
                          >
                            Book
                          </button>
                       </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-zinc-600">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Search for flights to start your journey</p>
                </div>
              )}
            </div>
          </ScrollStackItem>

          {/* HOTELS CARD */}
          <ScrollStackItem>
              <div className="w-full max-w-5xl mx-auto h-[80vh] overflow-y-auto custom-scrollbar bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl mb-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-violet-600/20 rounded-xl">
                  <Hotel className="w-6 h-6 text-violet-500" />
                </div>
                <h2 className="text-3xl font-heading font-bold">Hotels</h2>
              </div>

              <div className="flex gap-4 mb-8">
                <input
                  type="text"
                  placeholder="Enter city for hotels..."
                  value={hotelLocation}
                  onChange={(e) => setHotelLocation(e.target.value)}
                  className="flex-1 px-4 py-3 bg-zinc-800 border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-violet-600 outline-none"
                />
                <button
                  onClick={handleHotelSearch}
                  className="px-8 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition font-bold"
                  disabled={loadingHotels}
                >
                  {loadingHotels ? "Searching..." : "Search All"}
                </button>
              </div>

              {/* Hotel Filters */}
              {allHotels.length > 0 && (
                <div className="bg-zinc-800/50 rounded-lg p-4 mb-6 border border-zinc-700">
                  <h3 className="text-sm font-bold text-violet-400 mb-3">Filters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="number"
                      placeholder="Min rating (e.g., 4.0)"
                      value={hotelFilters.minRating}
                      onChange={(e) => setHotelFilters({...hotelFilters, minRating: e.target.value})}
                      className="px-3 py-2 bg-zinc-900 border-zinc-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Max price per night (₹)"
                      value={hotelFilters.maxPrice}
                      onChange={(e) => setHotelFilters({...hotelFilters, maxPrice: e.target.value})}
                      className="px-3 py-2 bg-zinc-900 border-zinc-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                    />
                    <button
                      onClick={applyFilters}
                      className="px-4 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 transition font-bold"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}

              {loadingHotels && (
                 <div className="text-center py-10">
                    <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-zinc-400">Fetching best rates...</p>
                 </div>
              )}

              {!loadingHotels && hotels.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {hotels.map((h, i) => (
                      <div key={i} className="bg-zinc-800 rounded-xl overflow-hidden border border-white/5 group">
                         <div className="h-48 overflow-hidden relative">
                           <img src={h.images[0]} alt={h.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                           <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-violet-400 font-bold">★ {h.rating}</div>
                         </div>
                         <div className="p-4">
                            <h3 className="font-bold text-lg truncate">{h.name}</h3>
                            <p className="text-zinc-400 text-sm">{h.location}</p>
                            <div className="flex flex-wrap gap-1 my-3">
                               {h.amenities.slice(0, 3).map((a, idx) => (
                                  <span key={idx} className="text-[10px] bg-zinc-700 px-2 py-1 rounded-full">{a}</span>
                               ))}
                            </div>
                            <div className="flex justify-between items-center mt-4">
                               <p className="text-xl font-bold text-violet-400">₹{h.pricePerNight}</p>
                               <button 
                                 onClick={() => navigate('/payment', { state: { type: 'hotel', data: h } })}
                                 className="px-3 py-1.5 bg-violet-600 rounded-md text-sm font-bold hover:bg-violet-700 active:scale-95 transition-transform"
                               >
                                 Book
                               </button>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
              )}
            </div>
          </ScrollStackItem>

          {/* VISA CARD */}
          <ScrollStackItem>
             <div className="w-full max-w-5xl mx-auto min-h-[50vh] bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl mb-10">
               <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-orange-600/20 rounded-xl">
                  {/* Using Plane temporarily as Globe might not be imported, but we can import it */}
                  <Plane className="w-6 h-6 text-orange-500" />
                </div>
                <h2 className="text-3xl font-heading font-bold">Visa Checker</h2>
              </div>

               <div className="flex gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Enter destination country (e.g., India, USA)"
                  value={visaSearch}
                  onChange={(e) => setVisaSearch(e.target.value)}
                  className="flex-1 px-4 py-3 bg-zinc-800 border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-orange-600 outline-none"
                />
                <button
                  onClick={handleVisaCheck}
                  className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-bold"
                  disabled={loadingVisa}
                >
                  {loadingVisa ? "Checking..." : "Check Requirements"}
                </button>
              </div>

              {visaResult && (
                <div className="bg-zinc-800/50 rounded-xl p-6 border border-white/5 mt-6">
                  <h3 className="text-xl font-bold text-orange-400 mb-4">Visa Requirements for {visaResult.country}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold mb-2">Required Documents</h4>
                      <ul className="list-disc pl-5 text-zinc-300 space-y-1">
                        {visaResult.required_documents?.map((doc, i) => (
                          <li key={i}>{doc}</li>
                        )) || <li>No specific documents listed.</li>}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold mb-2">Additional Notes</h4>
                      <p className="text-zinc-400 text-sm">{visaResult.special_notes}</p>
                      <div className="mt-4 p-3 bg-orange-900/20 rounded-lg border border-orange-500/20">
                         <p className="text-xs text-orange-300">
                           Processing Time: {visaResult.processing_time}<br/>
                           Financials: {visaResult.financial_requirements}
                         </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
             </div>
          </ScrollStackItem>

          {/* HOSPITALS CARD (Existing) */}
          <ScrollStackItem>
             <div className="w-full max-w-5xl mx-auto h-[80vh] overflow-y-auto custom-scrollbar bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
               <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-emerald-600/20 rounded-xl">
                  <Hospital className="w-6 h-6 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-heading font-bold">Hospitals</h2>
              </div>

               {/* Search for Hospitals */}
               <div className="flex gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Enter city (e.g., Bangalore, Mumbai, Delhi)"
                  value={hospitalCity}
                  onChange={(e) => setHospitalCity(e.target.value)}
                  className="flex-1 px-4 py-3 bg-zinc-800 border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none"
                />
                <button
                  onClick={handleHospitalSearch}
                  className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-bold"
                  disabled={loadingHospitals}
                >
                  {loadingHospitals ? "Searching..." : "Search Hospitals"}
                </button>
              </div>

              {/* Hospital Filters */}
              {allHospitals.length > 0 && (
                <div className="bg-zinc-800/50 rounded-lg p-4 mb-6 border border-zinc-700">
                  <h3 className="text-sm font-bold text-emerald-400 mb-3">Filters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Filter by specialty..."
                      value={hospitalFilters.specialty}
                      onChange={(e) => setHospitalFilters({...hospitalFilters, specialty: e.target.value})}
                      className="px-3 py-2 bg-zinc-900 border-zinc-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Min rating (e.g., 4.0)"
                      value={hospitalFilters.minRating}
                      onChange={(e) => setHospitalFilters({...hospitalFilters, minRating: e.target.value})}
                      className="px-3 py-2 bg-zinc-900 border-zinc-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button
                      onClick={applyFilters}
                      className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition font-bold"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}

               {loadingHospitals && (
                 <div className="text-center py-10">
                    <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-zinc-400">Analyzing medical data...</p>
                 </div>
              )}

               {!loadingHospitals && hospitals.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {hospitals.map((h, i) => (
                       <div key={i} className="bg-zinc-800 rounded-xl overflow-hidden border border-white/5 flex flex-col">
                          <img src={h.images[0]} alt={h.name} className="h-40 w-full object-cover" />
                          <div className="p-5 flex-1 flex flex-col">
                             <h3 className="text-xl font-bold">{h.name}</h3>
                             <p className="text-zinc-400 text-sm mb-2">{h.address}</p>
                             <p className="text-xs text-emerald-300 mb-4 bg-emerald-900/30 px-2 py-1 rounded inline-block">{h.specialty}</p>
                             <div className="mt-auto flex justify-between items-center gap-2">
                                <span className="flex items-center gap-1 text-emerald-400 font-bold"><span className="text-lg">★</span> {h.rating.toFixed(1)}</span>
                                <button 
                                  onClick={() => navigate('/package', { state: { hospital: h } })}
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition"
                                >
                                  View Package →
                                </button>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              ) : (
                !loadingHospitals && (
                  <div className="text-center py-10 text-zinc-500">
                     Enter a medical condition to see AI-ranked hospital recommendations
                  </div>
                )
              )}
             </div>
          </ScrollStackItem>

        </ScrollStack>
      </div>
    </div>
  );
}

