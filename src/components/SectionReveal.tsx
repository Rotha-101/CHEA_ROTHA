import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface SectionRevealProps {
  children: ReactNode;
  delay?: number;
  width?: "fit-content" | "100%";
}

export default function SectionReveal({ children, delay = 0, width = "100%" }: SectionRevealProps) {
  return (
    <div style={{ position: "relative", width, overflow: "hidden" }}>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ 
          duration: 0.8, 
          delay: delay,
          ease: [0.21, 0.47, 0.32, 0.98] // Custom ease for a smooth "pop"
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
