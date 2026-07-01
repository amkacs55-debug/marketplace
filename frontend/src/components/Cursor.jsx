import React, { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function Cursor() {
  const ref = useRef(null);
  const dotRef = useRef(null);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.6 });

  useEffect(() => {
    const onMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const onOver = (e) => {
      const t = e.target;
      if (!ref.current) return;
      const interactive = t.closest("a,button,[data-cursor='hover'],input,textarea,select,[role='button']");
      if (interactive) ref.current.classList.add("hover");
      else ref.current.classList.remove("hover");
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, [x, y]);

  return (
    <>
      <motion.div ref={ref} className="nx-cursor" style={{ x: sx, y: sy }} />
      <motion.div ref={dotRef} className="nx-cursor-dot" style={{ x, y }} />
    </>
  );
}
