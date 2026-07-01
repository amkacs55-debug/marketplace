import React from "react";
import { motion } from "framer-motion";

/**
 * Premium empty-state with an animated cinematic SVG illustration.
 * Used across marketplace / game pages / admin lists when no real data exists.
 */
export default function EmptyState({
  title = "Одоогоор бүртгэл байхгүй байна.",
  subtitle = "Админ анхны бүртгэлээ нийтэлмэгц эндээс харагдана.",
  accent = "#00F0FF",
  accent2 = "#9D00FF",
  testId = "empty-state",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
      className="relative glass clip-angled p-8 md:p-16 overflow-hidden"
      data-testid={testId}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(500px 300px at 50% 0%, ${accent}22, transparent 60%),
                       radial-gradient(500px 300px at 50% 100%, ${accent2}22, transparent 60%)`,
        }}
      />

      <div className="relative flex flex-col items-center text-center max-w-lg mx-auto">
        {/* Animated SVG illustration */}
        <div className="relative w-40 h-40 md:w-52 md:h-52">
          {/* Outer rotating ring */}
          <motion.svg
            viewBox="0 0 200 200"
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          >
            <defs>
              <linearGradient id="es-g1" x1="0" x2="1">
                <stop offset="0%" stopColor={accent} />
                <stop offset="100%" stopColor={accent2} />
              </linearGradient>
            </defs>
            <circle
              cx="100" cy="100" r="94"
              fill="none"
              stroke="url(#es-g1)"
              strokeWidth="1"
              strokeDasharray="6 12"
              opacity="0.65"
            />
            <circle cx="100" cy="6" r="3" fill={accent} />
            <circle cx="100" cy="194" r="2" fill={accent2} />
          </motion.svg>

          {/* Middle counter-rotating ring */}
          <motion.svg
            viewBox="0 0 200 200"
            className="absolute inset-6"
            animate={{ rotate: -360 }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          >
            <circle
              cx="100" cy="100" r="80"
              fill="none"
              stroke={accent}
              strokeWidth="0.6"
              opacity="0.45"
              strokeDasharray="2 8"
            />
            <path
              d="M100 20 L120 90 L100 100 L80 90 Z"
              fill="none"
              stroke={accent}
              strokeWidth="1.2"
              opacity="0.6"
            />
          </motion.svg>

          {/* Inner pulsing core */}
          <div className="absolute inset-0 grid place-items-center">
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl relative"
                style={{
                  background: `linear-gradient(135deg, ${accent}, ${accent2})`,
                  boxShadow: `0 0 40px ${accent}66, inset 0 0 30px rgba(255,255,255,0.15)`,
                }}
              >
                <div className="absolute inset-[3px] rounded-2xl bg-[#05070B] grid place-items-center">
                  <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10">
                    <path
                      d="M12 2L3 7v10l9 5 9-5V7l-9-5z"
                      stroke={accent}
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 12l9-5M12 12v10M12 12L3 7"
                      stroke={accent2}
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Corner sparks */}
          {[0, 90, 180, 270].map((deg, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full"
              style={{
                background: i % 2 ? accent2 : accent,
                boxShadow: `0 0 12px ${i % 2 ? accent2 : accent}`,
                transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-95px)`,
              }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
            />
          ))}
        </div>

        <div className="font-mono text-[10px] tracking-[0.4em] uppercase mt-8" style={{ color: accent }}>
          Хоосон Талбар
        </div>
        <h3 className="font-display font-black text-2xl md:text-3xl mt-3 tracking-tight">
          {title}
        </h3>
        <p className="text-white/55 mt-3 leading-relaxed text-sm md:text-base">
          {subtitle}
        </p>
      </div>
    </motion.div>
  );
}
