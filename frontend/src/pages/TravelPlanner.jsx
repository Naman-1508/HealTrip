import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import MagicBento from "../components/MagicBento";
import Threads from "../components/Threads";
import { Plane, Hotel, Car, Hospital, Search, MapPin, Calendar, Users } from "lucide-react";
import toast from "react-hot-toast";

// Comprehensive hardcoded data for demo
const MOCK_DATA = {
  flights: {
    "delhi-bangalore": [
      { airline: "IndiGo", flightNumber: "6E-532", origin: "Delhi", destination: "Bangalore", departureTime: "2024-12-15T08:00:00", arrivalTime: "2024-12-15T10:45:00", price: 5400, duration: "2h 45m", stops: 0 },
      { airline: "Air India", flightNumber: "AI-803", origin: "Delhi", destination: "Bangalore", departureTime: "2024-12-15T14:30:00", arrivalTime: "2024-12-15T17:15:00", price: 6100, duration: "2h 45m", stops: 0 },
      { airline: "Vistara", flightNumber: "UK-811", origin: "Delhi", destination: "Bangalore", departureTime: "2024-12-15T18:00:00", arrivalTime: "2024-12-15T20:45:00", price: 7200, duration: "2h 45m", stops: 0 },
      { airline: "SpiceJet", flightNumber: "SG-456", origin: "Delhi", destination: "Bangalore", departureTime: "2024-12-15T11:00:00", arrivalTime: "2024-12-15T13:45:00", price: 4800, duration: "2h 45m", stops: 0 },
    ],
    "mumbai-bangalore": [
      { airline: "IndiGo", flightNumber: "6E-345", origin: "Mumbai", destination: "Bangalore", departureTime: "2024-12-16T09:00:00", arrivalTime: "2024-12-16T10:30:00", price: 4200, duration: "1h 30m", stops: 0 },
      { airline: "Air India", flightNumber: "AI-612", origin: "Mumbai", destination: "Bangalore", departureTime: "2024-12-16T15:00:00", arrivalTime: "2024-12-16T16:30:00", price: 4800, duration: "1h 30m", stops: 0 },
      { airline: "Vistara", flightNumber: "UK-723", origin: "Mumbai", destination: "Bangalore", departureTime: "2024-12-16T19:00:00", arrivalTime: "2024-12-16T20:30:00", price: 5500, duration: "1h 30m", stops: 0 },
    ],
  },
  hotels: {
    "bangalore": [
      { name: "Grand Palace Hotel", location: "MG Road, Bangalore", rating: 4.3, pricePerNight: 4500, images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"], amenities: ["WiFi", "Pool", "Gym"] },
      { name: "Sunrise Resort", location: "Whitefield, Bangalore", rating: 4.5, pricePerNight: 5200, images: ["https://images.unsplash.com/photo-1551776235-dde6d4829808"], amenities: ["WiFi", "Spa", "Restaurant"] },
      { name: "Royal Inn", location: "Koramangala, Bangalore", rating: 4.1, pricePerNight: 3800, images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945"], amenities: ["WiFi", "Parking"] },
      { name: "Luxury Suites", location: "Indiranagar, Bangalore", rating: 4.7, pricePerNight: 6500, images: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb"], amenities: ["WiFi", "Pool", "Spa", "Gym"] },
    ],
    "delhi": [
      { name: "Delhi Grand", location: "Connaught Place, Delhi", rating: 4.4, pricePerNight: 5500, images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"], amenities: ["WiFi", "Restaurant"] },
      { name: "Capital Heights", location: "Karol Bagh, Delhi", rating: 4.2, pricePerNight: 4200, images: ["https://images.unsplash.com/photo-1551776235-dde6d4829808"], amenities: ["WiFi", "Gym"] },
    ],
  },
  cabs: {
    "bangalore": [
      { driverName: "Ramesh Kumar", vehicleModel: "Toyota Etios", vehicleType: "Sedan", location: "Bangalore", pricePerKm: 18, basePrice: 150, rating: 4.5 },
      { driverName: "Vikram Singh", vehicleModel: "Innova Crysta", vehicleType: "SUV", location: "Bangalore", pricePerKm: 25, basePrice: 300, rating: 4.7 },
      { driverName: "Suresh Reddy", vehicleModel: "Swift Dzire", vehicleType: "Sedan", location: "Bangalore", pricePerKm: 16, basePrice: 120, rating: 4.6 },
      { driverName: "Anil Sharma", vehicleModel: "Ertiga", vehicleType: "SUV", location: "Bangalore", pricePerKm: 22, basePrice: 250, rating: 4.4 },
    ],
    "delhi": [
      { driverName: "Rajesh Verma", vehicleModel: "Honda City", vehicleType: "Sedan", location: "Delhi", pricePerKm: 20, basePrice: 180, rating: 4.3 },
      { driverName: "Deepak Sharma", vehicleModel: "Hyundai Aura", vehicleType: "Sedan", location: "Delhi", pricePerKm: 15, basePrice: 100, rating: 4.5 },
    ],
  },
  hospitals: {
    "bangalore": [
      { name: "Manipal Hospital", address: "Whitefield, Bangalore", rating: 4.4, specializations: ["Neurosurgery", "Pediatrics", "Cardiology"], images: ["https://images.unsplash.com/photo-1586773860418-d37222d8fce3"] },
      { name: "Fortis Hospital", address: "Bannerghatta Road, Bangalore", rating: 4.2, specializations: ["Cancer Care", "Urology", "Orthopedics"], images: ["https://images.unsplash.com/photo-1600962815726-457c3ca38f7d"] },
      { name: "Apollo Hospital", address: "HSR Layout, Bangalore", rating: 4.6, specializations: ["Cardiology", "Neurology", "Emergency Care"], images: ["https://images.unsplash.com/photo-1586773860418-d37222d8fce3"] },
      { name: "Columbia Asia", address: "Hebbal, Bangalore", rating: 4.3, specializations: ["General Medicine", "Surgery", "ICU"], images: ["https://images.unsplash.com/photo-1600962815726-457c3ca38f7d"] },
    ],
    "delhi": [
      { name: "AIIMS Delhi", address: "Ansari Nagar, Delhi", rating: 4.8, specializations: ["All Specialties", "Research", "Emergency"], images: ["https://images.unsplash.com/photo-1586773860418-d37222d8fce3"] },
      { name: "Max Hospital", address: "Saket, Delhi", rating: 4.5, specializations: ["Cardiology", "Oncology", "Neurology"], images: ["https://images.unsplash.com/photo-1600962815726-457c3ca38f7d"] },
    ],
  },
};

export default function TravelPlanner() {
  const [activeTab, setActiveTab] = useState("flights");
  
  // Search states
  const [flightSearch, setFlightSearch] = useState({ from: "", to: "", date: "" });
  const [locationSearch, setLocationSearch] = useState("");
  
  // Results
  const [flights, setFlights] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [cabs, setCabs] = useState([]);
  const [hospitals, setHospitals] = useState([]);

  // Search Flights
  const handleFlightSearch = () => {
    if (!flightSearch.from || !flightSearch.to) {
      toast.error("Please enter origin and destination");
      return;
    }

    const key = `${flightSearch.from.toLowerCase()}-${flightSearch.to.toLowerCase()}`;
    const results = MOCK_DATA.flights[key] || [];
    
    setFlights(results);
    if (results.length > 0) {
      toast.success(`Found ${results.length} flights!`);
    } else {
      toast.error("No flights found for this route");
    }
  };

  // Search Location-based services
  const handleLocationSearch = () => {
    if (!locationSearch) {
      toast.error("Please enter a location");
      return;
    }

    const loc = locationSearch.toLowerCase();
    const hotelResults = MOCK_DATA.hotels[loc] || [];
    const cabResults = MOCK_DATA.cabs[loc] || [];
    const hospitalResults = MOCK_DATA.hospitals[loc] || [];

    setHotels(hotelResults);
    setCabs(cabResults);
    setHospitals(hospitalResults);

    const total = hotelResults.length + cabResults.length + hospitalResults.length;
    if (total > 0) {
      toast.success(`Found ${hotelResults.length} hotels, ${cabResults.length} cabs, ${hospitalResults.length} hospitals`);
    } else {
      toast.error("No results found for this location");
    }
  };

  return (
    <div className="relative pt-28 px-8 pb-20 min-h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Background Threads */}
      <div className="absolute inset-0 z-0">
        <Threads amplitude={1} distance={0} color={[0.4, 0.2, 0.8]} />
      </div>
      
      <div className="relative z-10">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-heading font-bold text-white mb-2">
          Travel Planner
        </h1>
        <p className="text-zinc-400 font-light">
          Plan your medical tourism journey with flights, hotels, cabs, and nearby hospitals.
        </p>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex gap-2 mb-8 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800">
          <TabsTrigger
            value="flights"
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
              activeTab === "flights"
                ? "bg-blue-600 text-white"
                : "bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <Plane className="w-4 h-4" />
            Flights
          </TabsTrigger>
          <TabsTrigger
            value="hotels"
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
              activeTab === "hotels"
                ? "bg-yellow-600 text-white"
                : "bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <Hotel className="w-4 h-4" />
            Hotels
          </TabsTrigger>
          <TabsTrigger
            value="cabs"
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
              activeTab === "cabs"
                ? "bg-purple-600 text-white"
                : "bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <Car className="w-4 h-4" />
            Cabs
          </TabsTrigger>
          <TabsTrigger
            value="hospitals"
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
              activeTab === "hospitals"
                ? "bg-red-600 text-white"
                : "bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <Hospital className="w-4 h-4" />
            Hospitals
          </TabsTrigger>
        </TabsList>

        {/* Flights Tab */}
        <TabsContent value="flights">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Search */}
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-500" />
                Search Flights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="From (e.g., Delhi)"
                  value={flightSearch.from}
                  onChange={(e) => setFlightSearch({ ...flightSearch, from: e.target.value })}
                  className="px-4 py-3 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="text"
                  placeholder="To (e.g., Bangalore)"
                  value={flightSearch.to}
                  onChange={(e) => setFlightSearch({ ...flightSearch, to: e.target.value })}
                  className="px-4 py-3 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="date"
                  value={flightSearch.date}
                  onChange={(e) => setFlightSearch({ ...flightSearch, date: e.target.value })}
                  className="px-4 py-3 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  onClick={handleFlightSearch}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Search
                </button>
              </div>
              <p className="text-xs text-zinc-500 mt-2">Try: Delhi → Bangalore or Mumbai → Bangalore</p>
            </div>

            {/* Results */}
            {flights.length > 0 && (
              <div>
                <h3 className="text-2xl font-semibold mb-4">Available Flights ({flights.length})</h3>
                <MagicBento
                  cards={flights.map(f => ({
                    title: `${f.airline} ${f.flightNumber}`,
                    description: `${f.origin} → ${f.destination}`,
                    label: f.stops === 0 ? "Non-Stop" : `${f.stops} Stop`,
                    color: "rgba(59, 130, 246, 0.3)",
                    content: (
                      <div className="flex flex-col h-full">
                        <h3 className="font-heading text-xl font-bold">{f.airline}</h3>
                        <p className="text-sm text-zinc-400">{f.flightNumber}</p>
                        <p className="text-xs text-zinc-500 mt-3">
                          {new Date(f.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} → {new Date(f.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <div className="mt-auto pt-4 border-t border-zinc-800 flex justify-between items-center">
                          <div>
                            <p className="text-2xl font-bold text-blue-400">₹{f.price}</p>
                            <p className="text-xs text-zinc-500">{f.duration}</p>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition">
                            Book Now
                          </button>
                        </div>
                      </div>
                    )
                  }))}
                  glowColor="59, 130, 246"
                  enableStars={true}
                />
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* Hotels Tab */}
        <TabsContent value="hotels">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Search */}
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-yellow-500" />
                Search Hotels
              </h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Enter city (e.g., Bangalore, Delhi)"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600"
                />
                <button
                  onClick={handleLocationSearch}
                  className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-semibold"
                >
                  Search
                </button>
              </div>
              <p className="text-xs text-zinc-500 mt-2">Try: Bangalore or Delhi</p>
            </div>

            {/* Results */}
            {hotels.length > 0 && (
              <div>
                <h3 className="text-2xl font-semibold mb-4">Available Hotels ({hotels.length})</h3>
                <MagicBento
                  cards={hotels.map(h => ({
                    title: h.name,
                    description: h.location,
                    label: "Hotel",
                    color: "rgba(234, 179, 8, 0.3)",
                    content: (
                      <div className="flex flex-col h-full">
                        <div className="h-32 w-full rounded-lg overflow-hidden mb-4">
                          <img src={h.images[0]} alt={h.name} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="font-heading text-lg font-bold">{h.name}</h3>
                        <p className="text-sm text-zinc-400">{h.location}</p>
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {h.amenities.map((a, i) => (
                            <span key={i} className="text-xs bg-zinc-800 px-2 py-1 rounded-full">{a}</span>
                          ))}
                        </div>
                        <div className="mt-auto pt-4 border-t border-zinc-800 flex justify-between items-center">
                          <div>
                            <p className="text-2xl font-bold text-yellow-400">₹{h.pricePerNight}</p>
                            <p className="text-xs text-zinc-500">per night</p>
                          </div>
                          <div className="text-right">
                            <p className="text-yellow-400 font-semibold">★ {h.rating}</p>
                            <button className="mt-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm font-semibold transition">
                              Book
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  }))}
                  glowColor="234, 179, 8"
                  enableStars={true}
                />
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* Cabs Tab */}
        <TabsContent value="cabs">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Search */}
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-500" />
                Search Cabs
              </h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Enter city (e.g., Bangalore, Delhi)"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <button
                  onClick={handleLocationSearch}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
                >
                  Search
                </button>
              </div>
              <p className="text-xs text-zinc-500 mt-2">Try: Bangalore or Delhi</p>
            </div>

            {/* Results */}
            {cabs.length > 0 && (
              <div>
                <h3 className="text-2xl font-semibold mb-4">Available Cabs ({cabs.length})</h3>
                <MagicBento
                  cards={cabs.map(c => ({
                    title: c.driverName,
                    description: `${c.vehicleModel} • ${c.vehicleType}`,
                    label: c.vehicleType,
                    color: "rgba(168, 85, 247, 0.3)",
                    content: (
                      <div className="flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-2xl">
                            🚗
                          </div>
                          <div>
                            <h3 className="font-heading text-lg font-bold">{c.driverName}</h3>
                            <p className="text-sm text-zinc-400">{c.vehicleModel}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p className="text-zinc-400">Vehicle: <span className="text-white">{c.vehicleType}</span></p>
                          <p className="text-zinc-400">Base Fare: <span className="text-white">₹{c.basePrice}</span></p>
                          <p className="text-zinc-400">Per KM: <span className="text-white">₹{c.pricePerKm}</span></p>
                        </div>
                        <div className="mt-auto pt-4 border-t border-zinc-800 flex justify-between items-center">
                          <div className="flex items-center gap-1">
                            <span className="text-purple-400 text-xl">★</span>
                            <span className="font-semibold">{c.rating}</span>
                          </div>
                          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold transition">
                            Book Ride
                          </button>
                        </div>
                      </div>
                    )
                  }))}
                  glowColor="168, 85, 247"
                  enableStars={true}
                />
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* Hospitals Tab */}
        <TabsContent value="hospitals">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Search */}
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                Search Hospitals
              </h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Enter city (e.g., Bangalore, Delhi)"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <button
                  onClick={handleLocationSearch}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  Search
                </button>
              </div>
              <p className="text-xs text-zinc-500 mt-2">Try: Bangalore or Delhi</p>
            </div>

            {/* Results */}
            {hospitals.length > 0 && (
              <div>
                <h3 className="text-2xl font-semibold mb-4">Nearby Hospitals ({hospitals.length})</h3>
                <MagicBento
                  cards={hospitals.map(h => ({
                    title: h.name,
                    description: h.address,
                    label: "Hospital",
                    color: "rgba(239, 68, 68, 0.3)",
                    content: (
                      <div className="flex flex-col h-full">
                        <div className="h-32 w-full rounded-lg overflow-hidden mb-4">
                          <img src={h.images[0]} alt={h.name} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="font-heading text-lg font-bold">{h.name}</h3>
                        <p className="text-sm text-zinc-400 mb-3">{h.address}</p>
                        <div className="flex gap-1 flex-wrap mb-3">
                          {h.specializations.slice(0, 3).map((s, i) => (
                            <span key={i} className="text-xs bg-red-900/30 text-red-300 px-2 py-1 rounded-full border border-red-800">
                              {s}
                            </span>
                          ))}
                        </div>
                        <div className="mt-auto pt-4 border-t border-zinc-800 flex justify-between items-center">
                          <div className="flex items-center gap-1">
                            <span className="text-red-400 text-xl">★</span>
                            <span className="font-semibold">{h.rating}</span>
                          </div>
                          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition">
                            View Details
                          </button>
                        </div>
                      </div>
                    )
                  }))}
                  glowColor="239, 68, 68"
                  enableStars={true}
                />
              </div>
            )}
          </motion.div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
