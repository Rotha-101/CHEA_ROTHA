import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface SectionRevealProps {
  children: ReactNode;
  delay?: number;
  width?: "fit-content" | "100%";
}

export default function SectionReveal({ children, delay = 0, width = "100%" }: SectionRevealProps) {
  return (
    <div style={{ position: "relative", width, overflow: "visible" }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
        transition={{ 
          duration: 1.2, 
          delay: delay,
          ease: [0.22, 1, 0.36, 1] 
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
