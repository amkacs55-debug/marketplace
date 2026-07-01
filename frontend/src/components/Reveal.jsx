import React from "react";
import { motion } from "framer-motion";

export function Reveal({ children, delay = 0, y = 40, className = "", ...rest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function SectionLabel({ children, color = "#00F0FF" }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 12px ${color}` }} />
      <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-white/70">{children}</span>
    </div>
  );
}
