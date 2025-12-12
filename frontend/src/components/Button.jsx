import { motion } from "framer-motion";
import { useState, useRef } from "react";

export default function Button({ children, onClick, className = "", variant = "primary" }) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const ref = useRef(null);

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const x = (clientX - (left + width / 2)) * 0.35; // Magnetic strength
        const y = (clientY - (top + height / 2)) * 0.35;
        setPosition({ x, y });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    const variants = {
        primary: "bg-white text-zinc-950 border border-white hover:text-white",
        outline: "bg-transparent text-white border border-white/20 hover:border-white",
        ghost: "bg-transparent text-zinc-400 hover:text-white"
    };

    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className={`
        relative overflow-hidden rounded-full px-8 py-3 
        text-sm font-heading font-bold uppercase tracking-wider
        transition-colors duration-500 ease-out group
        ${variants[variant]} ${className}
      `}
        >
            {/* Fill Effect */}
            <span className="absolute inset-0 w-full h-full bg-zinc-950 scale-0 group-hover:scale-[150%] rounded-full transition-transform duration-700 ease-[0.19,1,0.22,1] -z-10 origin-center" />

            <span className="relative z-10 pointer-events-none">{children}</span>
        </motion.button>
    );
}
