import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Loader({ onDone }) {
  const [pct, setPct] = useState(0);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    let raf;
    let start = performance.now();
    const D = 2100;
    const step = (now) => {
      const t = Math.min((now - start) / D, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setPct(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(step);
      else {
        setTimeout(() => {
          setHide(true);
          onDone && onDone();
        }, 350);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <AnimatePresence>
      {!hide && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[9998] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          data-testid="loader-overlay"
        >
          {/* Background layers */}
          <div className="absolute inset-0 bg-[#05070B]" />
          <div className="absolute inset-0 aurora" />
          <div className="absolute inset-0 grid-bg opacity-40" />
          {/* Stars */}
          {Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              className="star"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}

          <div className="relative flex flex-col items-center gap-8">
            <div className="relative">
              <div className="loader-ring" />
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ rotate: -360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <div
                  className="w-[110px] h-[110px] rounded-full border border-white/10"
                  style={{ background: "conic-gradient(from 0deg, transparent, rgba(0,240,255,0.15), transparent)" }}
                />
              </motion.div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="font-display font-black text-2xl bg-clip-text text-transparent"
                    style={{ backgroundImage: "linear-gradient(135deg, #00F0FF, #9D00FF)" }}>
                    NX
                  </div>
                  <div className="font-mono text-[10px] tracking-[0.3em] text-white/60 mt-1">
                    {pct.toString().padStart(3, "0")}%
                  </div>
                </div>
              </div>
            </div>

            <div className="relative w-[280px] h-[2px] bg-white/8 overflow-hidden">
              <motion.div
                className="h-full"
                style={{
                  width: `${pct}%`,
                  background: "linear-gradient(90deg, #00F0FF, #9D00FF)",
                  boxShadow: "0 0 12px rgba(0,240,255,0.6)",
                }}
              />
            </div>

            <div className="text-center">
              <div className="font-display font-black text-4xl md:text-5xl tracking-tight">
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #ffffff, #9D00FF)" }}>
                  NEXUS ARENA
                </span>
              </div>
              <div className="font-mono text-[10px] tracking-[0.5em] text-white/50 mt-2 uppercase">
                Initializing Battle Grid
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
