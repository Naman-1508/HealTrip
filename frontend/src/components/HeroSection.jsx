import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import TextReveal from "./TextReveal";
import Threads from "./Threads";


export default function HeroSection({ 
  badge = "AI-Powered Health Travel",
  title1 = "Heal Better",
  title2 = "Travel Smarter.",
  description = "Experience the future of medical tourism. AI-diagnostics, premium hospital networks, and curated wellness retreats—seamlessly integrated.",
  primaryButton = { text: "Get Started", link: "/signup" },
  secondaryButton = { text: "View Destinations", link: "/hospitals" }
}) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yText = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const yBg = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden bg-zinc-950 flex flex-col items-center justify-center pt-20"
    >
      {/* ======= ABSTRACT BACKGROUND ======= */}
      <div className="absolute inset-0 z-0 bg-zinc-950">
        <Threads amplitude={3} distance={1} color={[0.4, 0.8, 1.0]} enableMouseInteraction={true} />
        <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-purple-900/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-blue-900/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.05\'/%3E%3C/svg%3E")' }} />
      </div>

      {/* ======= CONTENT ======= */}
      <motion.div
        style={{ y: yText, opacity: opacityText }}
        className="relative z-10 flex flex-col items-center px-4 max-w-5xl mx-auto text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
        >
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-zinc-300 tracking-wide uppercase">{badge}</span>
        </motion.div>

        <div className="flex flex-col items-center">
          <TextReveal className="text-6xl md:text-8xl lg:text-9xl font-heading font-extrabold text-white tracking-tighter leading-[0.9] md:leading-[0.85] text-center justify-center">
            {title1}
          </TextReveal>
          <TextReveal delay={0.3} className="text-6xl md:text-8xl lg:text-9xl font-heading font-extrabold text-zinc-500 tracking-tighter leading-[0.9] md:leading-[0.85] text-center justify-center">
            {title2}
          </TextReveal>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mt-8 text-lg md:text-xl text-zinc-400 max-w-2xl font-light leading-relaxed"
        >
          {description}
        </motion.p>

        {/* BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="mt-10 flex flex-col md:flex-row gap-4"
        >
          <Link to={primaryButton.link}>
            <button className="px-8 py-4 rounded-full bg-white text-black font-heading font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              {primaryButton.text}
            </button>
          </Link>
          <Link to={secondaryButton.link}>
            <button className="px-8 py-4 rounded-full border border-zinc-700 text-white font-heading font-medium text-lg hover:bg-white/5 transition-colors duration-300">
              {secondaryButton.text}
            </button>
          </Link>
        </motion.div>
      </motion.div>

      {/* ======= FLOATING ELEMENTS (Optional decorative) ======= */}
      <motion.div
        style={{ y: yBg }}
        className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-zinc-950 to-transparent z-20"
      />
    </section>
  );
}
