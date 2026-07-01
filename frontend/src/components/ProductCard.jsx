import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Eye, Heart, Zap } from "lucide-react";
import { GAMES_META } from "../lib/utils";
import { formatMnt, t } from "../lib/i18n";
import SmartImage from "./SmartImage";

export default function ProductCard({ post, index = 0 }) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });

  const game = GAMES_META[post.game_slug] || {};
  const accent = game.accent || "#00F0FF";

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mx.set(x);
    my.set(y);
  };
  const handleLeave = () => { mx.set(0); my.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay: index * 0.04, ease: [0.2, 0.8, 0.2, 1] }}
      style={{ perspective: 1000 }}
      className="group relative"
      data-testid={`product-card-${post.id}`}
    >
      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="relative gradient-border overflow-hidden rounded-2xl bg-[#0B1220]/60 backdrop-blur-xl"
      >
        <Link to={`/account/${post.id}`} className="block relative aspect-[4/5] overflow-hidden">
          {post.images && post.images[0] ? (
            <>
              <SmartImage
                src={post.images[0]}
                alt={post.title}
                padding="p-3"
                imgClassName="transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.05]"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(180deg, transparent 55%, rgba(5,7,11,0.85) 100%), radial-gradient(400px 220px at 50% 0%, ${accent}22, transparent 60%)`,
                }}
              />
            </>
          ) : (
            <div
              className="w-full h-full grid place-items-center"
              style={{
                background: `linear-gradient(135deg, ${accent}22, ${game.accent2 || "#9D00FF"}22)`,
              }}
            >
              <div className="font-display font-black text-3xl opacity-40">{game.short || "NX"}</div>
            </div>
          )}
          <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
            <div className="px-2.5 py-1 rounded-full glass border border-white/10 font-mono text-[9px] tracking-[0.25em] uppercase text-white/80">
              {game.name || post.game_slug}
            </div>
            <div className="px-2.5 py-1 rounded-full font-mono text-[9px] tracking-[0.25em] uppercase"
              style={{ background: `${accent}22`, border: `1px solid ${accent}66`, color: accent }}>
              {post.group}
            </div>
          </div>
          <div className="absolute top-3 right-3 z-10">
            <div className="px-2 py-1 rounded-full glass border border-white/10 flex items-center gap-1">
              <Eye className="w-3 h-3 text-white/70" />
              <span className="font-mono text-[10px] text-white/70">{post.views || 0}</span>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 tilt-shine z-10" />
        </Link>

        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <Link to={`/account/${post.id}`} className="font-display font-bold text-white text-[15px] leading-snug line-clamp-2 hover:text-cyan-300 transition">
              {post.title}
            </Link>
            <button className="w-8 h-8 rounded-full grid place-items-center border border-white/10 text-white/60 hover:text-pink-400 hover:border-pink-400/60 transition" data-testid={`favorite-${post.id}`}>
              <Heart className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-white/50 line-clamp-2">{post.description}</p>
          <div className="flex items-end justify-between mt-2">
            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40">{t.account.price}</div>
              <div className="font-display font-black text-2xl mt-0.5" style={{ color: accent }}>
                {formatMnt(post.price)}
              </div>
            </div>
            <Link
              to={`/account/${post.id}`}
              className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.25em] uppercase text-white/80 hover:text-white transition"
              data-testid={`view-${post.id}`}
            >
              <Zap className="w-3 h-3" style={{ color: accent }} />
              <span>Дэлгэрэнгүй</span>
            </Link>
          </div>
        </div>

        <div className="pointer-events-none absolute top-2 left-2 w-4 h-4 border-l border-t" style={{ borderColor: `${accent}88` }} />
        <div className="pointer-events-none absolute bottom-2 right-2 w-4 h-4 border-r border-b" style={{ borderColor: `${accent}88` }} />
      </motion.div>
    </motion.div>
  );
}
