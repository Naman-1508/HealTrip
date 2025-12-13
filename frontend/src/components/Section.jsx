import { motion } from "framer-motion";
import React from "react";

const Section = React.forwardRef(({ children, className = "" }, ref) => {
  return (
    <section
      ref={ref}
      className={`relative min-h-screen w-full flex flex-col justify-center items-center overflow-hidden snap-start ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-7xl px-6 md:px-12"
      >
        {children}
      </motion.div>
    </section>
  );
});

Section.displayName = "Section";

export default Section;
