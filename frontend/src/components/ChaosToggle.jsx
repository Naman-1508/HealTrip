import React from "react";
import "../styles/chaos.css";
import { Zap, ZapOff } from "lucide-react";
import { useChaos } from "../contexts/ChaosContext";

export default function ChaosToggle() {
  const { isChaos, setIsChaos } = useChaos();

  return (
    <button
      onClick={() => setIsChaos(!isChaos)}
      className="chaos-toggle-btn flex items-center gap-2"
      title="Toggle Chaos Mode"
    >
      {isChaos ? <ZapOff size={20} /> : <Zap size={20} />}
      {isChaos ? "NO CHAOS" : "CHAOS MODE"}
    </button>
  );
}
