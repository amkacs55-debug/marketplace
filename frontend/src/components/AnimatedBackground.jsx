import React, { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Animated global background with:
 *  - Aurora blobs
 *  - Grid overlay
 *  - Particle canvas (light)
 *  - Mouse parallax gradients
 *  - Animated noise
 *  - Scanning energy line
 */
export default function AnimatedBackground({ accent = "#00F0FF", accent2 = "#9D00FF" }) {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const smx = useSpring(mx, { stiffness: 60, damping: 20 });
  const smy = useSpring(my, { stiffness: 60, damping: 20 });
  const t1x = useTransform(smx, [0, 1], ["-8%", "8%"]);
  const t1y = useTransform(smy, [0, 1], ["-6%", "6%"]);
  const t2x = useTransform(smx, [0, 1], ["8%", "-8%"]);
  const t2y = useTransform(smy, [0, 1], ["6%", "-6%"]);

  useEffect(() => {
    const onMove = (e) => {
      mx.set(e.clientX / window.innerWidth);
      my.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };
    resize();
    window.addEventListener("resize", resize);

    const N = Math.min(120, Math.floor((window.innerWidth * window.innerHeight) / 18000));
    const parts = Array.from({ length: N }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25 * dpr,
      vy: (Math.random() - 0.5) * 0.25 * dpr,
      r: (Math.random() * 1.3 + 0.4) * dpr,
      hue: Math.random() > 0.5 ? accent : accent2,
      a: Math.random() * 0.5 + 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      parts.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.hue;
        ctx.globalAlpha = p.a;
        ctx.shadowColor = p.hue;
        ctx.shadowBlur = 10 * dpr;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(render);
    };
    render();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [accent, accent2]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base */}
      <div className="absolute inset-0" style={{ background: "#05070B" }} />

      {/* Aurora with parallax */}
      <motion.div
        className="absolute -inset-[20%]"
        style={{ x: t1x, y: t1y, filter: "blur(90px)", opacity: 0.55 }}
      >
        <div
          className="w-full h-full"
          style={{
            background: `radial-gradient(600px 350px at 20% 25%, ${accent}66, transparent 60%),
                         radial-gradient(700px 400px at 80% 30%, ${accent2}55, transparent 60%),
                         radial-gradient(800px 500px at 50% 90%, #0088FF44, transparent 60%)`,
          }}
        />
      </motion.div>

      {/* Second parallax layer */}
      <motion.div
        className="absolute -inset-[30%]"
        style={{ x: t2x, y: t2y, filter: "blur(100px)", opacity: 0.3 }}
      >
        <div
          className="w-full h-full"
          style={{
            background: `radial-gradient(500px 400px at 70% 60%, ${accent}44, transparent 60%),
                         radial-gradient(600px 500px at 20% 80%, ${accent2}44, transparent 60%)`,
          }}
        />
      </motion.div>

      {/* Grid */}
      <div className="absolute inset-0 grid-bg" />

      {/* Particles */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Scan line */}
      <div className="absolute left-0 right-0 h-40 opacity-[0.08]"
        style={{
          background: `linear-gradient(180deg, transparent, ${accent}, transparent)`,
          animation: "scanLine 9s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes scanLine {
          0%, 100% { top: -20%; }
          50% { top: 120%; }
        }
      `}</style>

      {/* Noise */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='7'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1400px 900px at 50% 40%, transparent 40%, rgba(0,0,0,0.45) 90%)",
        }}
      />
    </div>
  );
}
