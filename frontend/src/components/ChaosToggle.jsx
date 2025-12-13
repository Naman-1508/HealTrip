import React, { useState, useEffect } from 'react';
import '../styles/chaos.css';
import { Zap, ZapOff } from 'lucide-react';

export default function ChaosToggle() {
  const [isChaos, setIsChaos] = useState(false);

  useEffect(() => {
    if (isChaos) {
      document.body.classList.add('chaos-mode');
      
      // Play a sound if possible? Maybe too annoying.
      // Let's stick to visual chaos.
    } else {
      document.body.classList.remove('chaos-mode');
    }
    
    return () => {
      document.body.classList.remove('chaos-mode');
    };
  }, [isChaos]);

  return (
    <button
      onClick={() => setIsChaos(!isChaos)}
      className="chaos-toggle-btn flex items-center gap-2"
      title="Toggle Chaos Mode"
    >
      {isChaos ? <ZapOff size={20} /> : <Zap size={20} />}
      {isChaos ? 'NO CHAOS' : 'CHAOS MODE'}
    </button>
  );
}
