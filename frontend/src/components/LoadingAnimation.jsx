import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingAnimation({ onComplete }) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading time (e.g., 2.5 seconds)
        const timer = setTimeout(() => {
            setLoading(false);
            if (onComplete) setTimeout(onComplete, 800); // Call onComplete after exit animation (0.8s)
        }, 2800);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black overflow-hidden"
                >
                    {/* BACKGROUND GRIDS */}
                    <div className="absolute inset-0 opacity-20"
                        style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '30px 30px' }}
                    />

                    <div className="relative z-10 flex flex-col items-center">
                        {/* SVG ANIMATION */}
                        <svg width="300" height="150" viewBox="0 0 300 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Heartbeat Path */}
                            <motion.path
                                d="M10 75 H50 L65 30 L85 120 L100 75 H150"
                                stroke="white"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                            />

                            {/* Flight Path (Connecting from heartbeat) */}
                            <motion.path
                                d="M150 75 C 200 75, 230 75, 280 20"
                                stroke="white"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeDasharray="10 10"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1, delay: 1.5, ease: "easeOut" }}
                            />

                            {/* Plane Icon */}
                            <motion.g
                                initial={{ "--offset-distance": "0%", opacity: 0 }}
                                animate={{ "--offset-distance": "100%", opacity: 1 }}
                                transition={{ duration: 1, delay: 1.5, ease: "easeOut" }}
                                style={{
                                    offsetPath: 'path("M150 75 C 200 75, 230 75, 280 20")',
                                    offsetRotate: 'auto',
                                    offsetDistance: "var(--offset-distance)"
                                }}
                            >
                                <path d="M2 12 L10 2 L20 12 L16 12 L24 20 L2 12 Z" fill="white" transform="rotate(90) scale(1.5)" />
                                {/* Simple Plane shape: rotated to point forward along path */}
                                <path
                                    d="M22 12 L2 2 L6 12 L2 22 L22 12 Z"
                                    fill="#38bdf8"
                                    stroke="white"
                                    strokeWidth="2"
                                />
                            </motion.g>
                        </svg>

                        {/* TEXT REVEAL */}
                        <div className="mt-8 overflow-hidden">
                            <motion.h1
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="text-4xl font-heading font-bold text-white tracking-widest text-center"
                            >
                                HEAL TRIP
                            </motion.h1>
                        </div>

                        <div className="overflow-hidden">
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.8, duration: 0.8 }}
                                className="text-sm font-light text-zinc-500 tracking-[0.3em] uppercase mt-2"
                            >
                                Health • Travel • Future
                            </motion.p>
                        </div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
