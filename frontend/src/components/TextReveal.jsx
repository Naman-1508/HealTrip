import { motion } from "framer-motion";

export default function TextReveal({ children, className = "", delay = 0 }) {
    // Split text into words, then characters
    const text = typeof children === "string" ? children : "";
    const words = text.split(" ");

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.03, delayChildren: delay * i },
        }),
    };

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
        hidden: {
            opacity: 0,
            y: 20,
            filter: "blur(10px)",
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={`flex flex-wrap ${className}`}
        >
            {words.map((word, index) => (
                <span key={index} className="mr-[0.25em] whitespace-nowrap overflow-hidden flex">
                    {Array.from(word).map((char, index) => (
                        <motion.span variants={child} key={index}>
                            {char}
                        </motion.span>
                    ))}
                </span>
            ))}
        </motion.div>
    );
}
