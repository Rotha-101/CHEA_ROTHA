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
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
        transition={{ 
          type: "spring",
          stiffness: 40,
          damping: 20,
          mass: 1,
          delay: delay,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
