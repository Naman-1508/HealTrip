import React, { createContext, useState, useContext } from "react";

const TripContext = createContext();

export const TripProvider = ({ children }) => {
  const [tripDetails, setTripDetails] = useState(null);

  const updateTrip = (details) => setTripDetails(details);

  return (
    <TripContext.Provider value={{ tripDetails, updateTrip }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => useContext(TripContext);
