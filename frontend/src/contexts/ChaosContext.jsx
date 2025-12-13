import React, { createContext, useContext, useState, useEffect } from 'react';

const ChaosContext = createContext();

export function ChaosProvider({ children }) {
  const [isChaos, setIsChaos] = useState(false);

  useEffect(() => {
    if (isChaos) {
      document.body.classList.add('chaos-mode');
    } else {
      document.body.classList.remove('chaos-mode');
    }
    
    return () => {
      document.body.classList.remove('chaos-mode');
    };
  }, [isChaos]);

  return (
    <ChaosContext.Provider value={{ isChaos, setIsChaos }}>
      {children}
    </ChaosContext.Provider>
  );
}

export function useChaos() {
  const context = useContext(ChaosContext);
  if (context === undefined) {
    throw new Error('useChaos must be used within a ChaosProvider');
  }
  return context;
}
