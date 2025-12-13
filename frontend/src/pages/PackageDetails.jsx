import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BackgroundSwitcher from "../components/BackgroundSwitcher";
import { ArrowLeft, MapPin, Star, Plane, Hotel, Hospital, Calendar, Users, CreditCard, Check } from "lucide-react";
import toast from "react-hot-toast";

// Helper to safely format address/location
const formatAddress = (data) => {
  if (!data) return "Location unavailable";
  
  // Handle if data itself is the string
  if (typeof data === 'string') return data;
  
  // Handle fallback data or schema variations where it might be 'address' or 'location'
  const addr = data.location || data.address || data; // 'data' fallback for when only the address object is passed

  if (!addr) return "Location unavailable";

  if (typeof addr === 'string') return addr;
  
  if (typeof addr === 'object') {
    const city = addr.city || '';
    const country = addr.country || '';
    // Filter out empty parts and join
    const parts = [city, country].filter(p => p && p.trim().length > 0);
    return parts.length > 0 ? parts.join(', ') : "Location unavailable";
  }
  
  return "Location unavailable";
};

export default function PackageDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hospital } = location.state || {}; // hospital object

  const [hotels, setHotels] = useState([]);
  const [flights, setFlights] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [loadingFlights, setLoadingFlights] = useState(false);
  
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [packageDuration, setPackageDuration] = useState(3);
  const [travelers, setTravelers] = useState(1);
  const [originCity, setOriginCity] = useState("");

  const hospitalAddressStr = formatAddress(hospital);

  // Redirect if no hospital selected
  useEffect(() => {
    if (!hospital) {
      navigate("/travel-planner");
    }
  }, [hospital, navigate]);

  // Auto-load hotels when component mounts
  useEffect(() => {
    if (hospitalAddressStr) {
      loadHotels();
    }
  }, [hospital]);

  const loadHotels = async () => {
    setLoadingHotels(true);
    try {
      // Use formatted string
      const response = await fetch(`http://localhost:8000/recommend?location=${hospitalAddressStr}`);
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const transformedHotels = data.results.slice(0, 6).map(h => ({
            name: h.Hotel_Name,
            location: h.City,
            rating: h.Hotel_Rating,
            pricePerNight: h.Hotel_Price,
            image: getRandomImage(h.Hotel_Name),
            amenities: h.amenities ? h.amenities.split(' ').slice(0, 4) : ["WiFi", "Parking"]
          }));
          setHotels(transformedHotels);
          setSelectedHotel(transformedHotels[0]); // Auto-select first
        }
      }
    } catch (error) {
      console.error("Hotel API Error:", error);
    } finally {
      setLoadingHotels(false);
    }
  };

  // Helper function to format duration from minutes to "Xh Ym"
  const formatDuration = (duration) => {
    // If duration is a number (minutes), convert to "Xh Ym" format
    if (typeof duration === 'number') {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    // If already formatted string, return as is
    return duration;
  };

  // VISA LOGIC
  const [visaInfo, setVisaInfo] = useState(null);
  
  useEffect(() => {
     const fetchVisa = async () => {
         try {
             // Use destination country from selected flight, or default to India
             let country = "India";
             
             // If user has selected a flight, extract destination country
             if (selectedFlight && selectedFlight.destination) {
                 // Try to extract country from destination
                 // For international flights, destination might be like "Bangkok, Thailand"
                 const destParts = selectedFlight.destination.split(',');
                 if (destParts.length > 1) {
                     country = destParts[destParts.length - 1].trim();
                 }
             }
             
             const res = await fetch('http://localhost:8003/visa-requirements', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ country, visa_type: "Medical" })
             });
             if (res.ok) {
                 const data = await res.json();
                 setVisaInfo(data);
             }
         } catch (e) {
             console.error("Visa Fetch Error", e);
         }
     };
     fetchVisa();
  }, [selectedFlight]);

  const loadFlights = async () => {
    if (!originCity) {
      toast.error("Please enter your origin city");
      return;
    }

    setLoadingFlights(true);
    try {
      const response = await fetch(`http://localhost:8002/recommend-flights?origin=${originCity}&destination=${hospitalAddressStr}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const mappedFlights = data.slice(0, 4).map((f, i) => ({
            airline: f.airline,
            flightNumber: `HT-${100 + i}`,
            origin: f.origin,
            destination: f.destination,
            departureTime: new Date().setHours(8 + i, 0),
            arrivalTime: new Date().setHours(8 + i + (f.duration_minutes / 60), (f.duration_minutes % 60)),
            price: f.price,
            duration: `${Math.floor(f.duration_minutes / 60)}h ${f.duration_minutes % 60}m`,
            stops: f.stops
          }));
          setFlights(mappedFlights);
          setSelectedFlight(mappedFlights[0]); // Auto-select first
        }
      }
    } catch (error) {
      console.error("Flight API Error:", error);
    } finally {
      setLoadingFlights(false);
    }
  };

  const getRandomImage = (name) => {
    const images = [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
      "https://images.unsplash.com/photo-1551776235-dde6d4829808",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return images[Math.abs(hash) % images.length];
  };

  const calculateTotal = () => {
    const hotelCost = selectedHotel ? selectedHotel.pricePerNight * packageDuration : 0;
    const flightCost = selectedFlight ? selectedFlight.price * travelers * 2 : 0; // Round trip
    const hospitalEstimate = 50000; // Placeholder
    return hotelCost + flightCost + hospitalEstimate;
  };

  const handleBookPackage = () => {
    if (!selectedHotel || !selectedFlight) {
      toast.error("Please select both hotel and flight");
      return;
    }
    
    // Prepare package data for payment
    const packageData = {
      hospital: {
        name: hospital.name,
        city: hospital.city,
        rating: hospital.rating,
        specialty: hospital.specialty
      },
      hotel: {
        name: selectedHotel.name,
        pricePerNight: selectedHotel.pricePerNight,
        rating: selectedHotel.rating
      },
      flight: {
        airline: selectedFlight.airline,
        origin: selectedFlight.origin,
        destination: selectedFlight.destination,
        price: selectedFlight.price,
        duration: selectedFlight.duration_minutes
      },
      packageDetails: {
        duration: packageDuration,
        travelers: travelers,
        totalAmount: calculateTotal()
      },
      breakdown: {
        hospitalCost: 50000,
        hotelCost: selectedHotel.pricePerNight * packageDuration,
        flightCost: selectedFlight.price * travelers * 2
      }
    };
    
    toast.success("Redirecting to payment...");
    navigate('/payment', { state: { packageData } });
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white">
      <div className="absolute inset-0 z-0">
        <BackgroundSwitcher />
      </div>

      <div className="relative z-10">
        {/* Clean Header */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center gap-4">
            <button
              onClick={() => navigate("/travel-planner")}
              className="p-2 hover:bg-white/5 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Complete Medical Package</h1>
              <p className="text-sm text-zinc-400">Flights + Hotel + Hospital</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* Hospital Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/80 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center">
                    <Hospital className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{hospital.name}</h2>
                    <div className="flex items-center gap-3 text-sm text-zinc-400 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {hospitalAddressStr}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        {hospital.rating || 4.5}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Specialty</p>
                  <p className="text-zinc-400 text-sm mb-3">{hospital.specialty}</p>
                  {hospital.summary && (
                    <>
                      <p className="text-xs text-zinc-500 mb-1">About</p>
                      <p className="text-zinc-400 text-sm leading-relaxed">{hospital.summary}</p>
                    </>
                  )}
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 px-5 py-3 rounded-xl text-center">
                <p className="text-xs text-emerald-100 mb-1">Match Score</p>
                <p className="text-2xl font-bold">
                  {hospital.match 
                    ? (hospital.match * 100).toFixed(0) 
                    : hospital.rating 
                      ? ((hospital.rating / 5) * 100).toFixed(0)
                      : '85'}%
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Flights Section */}
              <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <Plane className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold">Select Flight</h3>
                </div>

                <div className="flex gap-3 mb-5">
                  <input
                    type="text"
                    placeholder="Your city (e.g., Delhi)"
                    value={originCity}
                    onChange={(e) => setOriginCity(e.target.value)}
                    className="flex-1 px-4 py-3 bg-zinc-800/50 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                  <button
                    onClick={loadFlights}
                    disabled={loadingFlights}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition disabled:opacity-50"
                  >
                    {loadingFlights ? "Loading..." : "Search"}
                  </button>
                </div>

                {flights.length > 0 && (
                  <div className="space-y-2">
                    {flights.map((flight, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedFlight(flight)}
                        className={`p-4 rounded-lg border cursor-pointer transition ${
                          selectedFlight === flight
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-zinc-700/50 hover:border-zinc-600 bg-zinc-800/30"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{flight.airline}</p>
                            <p className="text-sm text-zinc-400">{formatDuration(flight.duration)} • {flight.stops} stops</p>
                          </div>
                          <p className="text-lg font-bold text-blue-400">₹{(flight.price || flight.Price || 0).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hotels Section */}
              <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-violet-600/20 rounded-lg flex items-center justify-center">
                    <Hotel className="w-5 h-5 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-bold">Select Hotel</h3>
                </div>

                {loadingHotels ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : hotels.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {hotels.map((hotel, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedHotel(hotel)}
                        className={`rounded-lg overflow-hidden border cursor-pointer transition ${
                          selectedHotel === hotel
                            ? "border-violet-500 ring-2 ring-violet-500/30"
                            : "border-zinc-700/50 hover:border-zinc-600"
                        }`}
                      >
                        <img src={hotel.image} alt={hotel.name} className="w-full h-28 object-cover" />
                        <div className="p-3 bg-zinc-800/50">
                          <p className="font-semibold text-sm truncate">{hotel.name}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-zinc-400">★ {hotel.rating}</span>
                            <span className="text-violet-400 font-bold text-sm">₹{hotel.pricePerNight.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                   <div className="text-center py-12 border border-dashed border-zinc-700 rounded-xl">
                      <Hotel className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                      <p className="text-zinc-400">No hotels found near {hospitalAddressStr}</p>
                      <button onClick={loadHotels} className="mt-3 text-violet-400 text-sm hover:underline">Retry Search</button>
                   </div>
                )}
              </div>

               {/* VISA REQUIREMENTS SECTION */}
               {visaInfo && (
                <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                   <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-orange-400" /> 
                    </div>
                    <h3 className="text-lg font-bold">Visa Requirements ({visaInfo.country})</h3>
                  </div>
                  
                  <div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700/50">
                     <p className="text-sm text-zinc-300 mb-2 font-bold">Required Documents:</p>
                     <ul className="list-disc pl-5 text-sm text-zinc-400 mb-4 space-y-1">
                        {visaInfo.required_documents?.slice(0, 4).map((d, i) => (
                          <li key={i}>{d}</li>
                        )) || <li>Standard documents required</li>}
                     </ul>
                     <div className="flex justify-between items-center text-xs text-zinc-500 border-t border-zinc-700/50 pt-3">
                        <span>Processing: {visaInfo.processing_time}</span>
                        <span>{visaInfo.financial_requirements}</span>
                     </div>
                  </div>
                </div>
               )}
            </div>

            {/* Sidebar - Package Summary */}
            <div className="lg:col-span-1">
              <div className="bg-zinc-900/80 backdrop-blur-sm rounded-xl p-6 border border-white/10 sticky top-28">
                <h3 className="text-lg font-bold mb-6">Package Summary</h3>

                {/* Inputs */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Duration
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={packageDuration}
                      onChange={(e) => setPackageDuration(parseInt(e.target.value))}
                      className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Travelers
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={travelers}
                      onChange={(e) => setTravelers(parseInt(e.target.value))}
                      className="w-full px-4 py-2.5 bg-zinc-800/50 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2.5 mb-6 pb-6 border-b border-zinc-700/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Hospital</span>
                    <span className="font-medium">₹50,000</span>
                  </div>
                  {selectedHotel && (
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Hotel × {packageDuration}</span>
                      <span className="font-medium">₹{(selectedHotel.pricePerNight * packageDuration).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedFlight && (
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Flights × {travelers}</span>
                      <span className="font-medium">₹{(selectedFlight.price * travelers * 2).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold">Total</span>
                  <span className="text-2xl font-bold text-emerald-400">₹{calculateTotal().toLocaleString()}</span>
                </div>

                {/* Book Button */}
                <button
                  onClick={handleBookPackage}
                  disabled={!selectedHotel || !selectedFlight}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-lg font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Book Package
                </button>

                {/* Includes */}
                <div className="mt-6 pt-6 border-t border-zinc-700/50">
                  <p className="text-xs font-semibold text-zinc-400 mb-3">INCLUDES</p>
                  <div className="space-y-2">
                    {["Round-trip flights", "Hotel stay", "Hospital consultation", "24/7 support"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
