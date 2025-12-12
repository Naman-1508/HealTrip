import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function MapView({ hospitals }) {
  const [position, setPosition] = useState([12.9716, 77.5946]); // Default: Bangalore

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, []);

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-md border">
      <MapContainer center={position} zoom={13} className="w-full h-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        {/* User Location Marker */}
        <Marker position={position}>
          <Popup>You are here</Popup>
        </Marker>

        {/* Hospital Markers */}
        {hospitals?.map((h, index) => (
          <Marker key={index} position={h.coords}>
            <Popup>
              <strong>{h.name}</strong>
              <br />
              Beds Available: {h.beds}
              <br />
              Rating: {h.rating}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
