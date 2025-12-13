import React from "react";
import { useChaos } from "../contexts/ChaosContext";
import Threads from "./Threads";
import LiquidEther from "./LiquidEther";

export default function BackgroundSwitcher({
  threadsProps = {},
  liquidEtherProps = {},
}) {
  const { isChaos } = useChaos();

  // Default props for Threads (elegant mode)
  const defaultThreadsProps = {
    amplitude: 1,
    distance: 0,
    color: [0.4, 0.2, 0.8],
    ...threadsProps,
  };

  // Default props for LiquidEther (chaos mode)
  const defaultLiquidEtherProps = {
    colors: ["#5227FF", "#FF9FFC", "#B19EEF"],
    mouseForce: 20,
    cursorSize: 100,
    autoDemo: true,
    autoSpeed: 0.5,
    autoIntensity: 2.2,
    ...liquidEtherProps,
  };

  return (
    <>
      {isChaos ? (
        <LiquidEther {...defaultLiquidEtherProps} />
      ) : (
        <Threads {...defaultThreadsProps} />
      )}
    </>
  );
}
