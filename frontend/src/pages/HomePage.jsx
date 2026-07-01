import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck, Rocket, Zap } from "lucide-react";
import Hero3D from "../components/Hero3D";
import { Reveal, SectionLabel } from "../components/Reveal";
import { GAMES_META } from "../lib/utils";
import { formatMnt, formatCount, t } from "../lib/i18n";
import { listPosts } from "../lib/api";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";

const FEATURES = [
  { icon: ShieldCheck, title: t.home.featureVerifiedTitle, body: t.home.featureVerifiedBody },
  { icon: Rocket, title: t.home.featureHandoverTitle, body: t.home.featureHandoverBody },
  { icon: Sparkles, title: t.home.featureCurationTitle, body: t.home.featureCurationBody },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [totals, setTotals] = useState({ total: 0 });

  useEffect(() => {
    listPosts({ limit: 8, sort: "newest" })
      .then((d) => {
        setFeatured(d.items || []);
        setTotals({ total: d.total || 0 });
      })
      .catch(() => {});
  }, []);

  const heroStats = [
    { k: t.home.statAccounts, v: formatCount(totals.total) },
    { k: t.home.statVerified, v: t.home.verifiedValue },
    { k: t.home.statHandover, v: t.home.handoverValue },
  ];

  return (
    <div className="relative">
      {/* HERO */}
      <section className="relative min-h-[100vh] w-full flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/18223728/pexels-photo-18223728.jpeg"
            alt="controller"
            className="absolute inset-0 w-full h-full object-cover opacity-[0.22]"
            loading="eager"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(5,7,11,0.4) 0%, rgba(5,7,11,0.8) 60%, rgba(5,7,11,1) 100%)" }} />
        </div>

        <div className="absolute inset-0 z-[1]">
          <Hero3D />
        </div>

        <div className="relative z-10 mx-auto max-w-[1400px] w-full px-6 md:px-10 pt-40 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <Reveal>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-cyan-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
                    <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-cyan-300">{t.home.seasonLive}</span>
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40">v1.0</span>
                </div>
              </Reveal>

              <Reveal delay={0.05}>
                <h1 className="font-display font-black text-[13vw] sm:text-[10vw] lg:text-[104px] leading-[0.92] tracking-tighter mt-5">
                  <span className="block">{t.home.heroLine1}</span>
                  <span className="block bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(120deg, #00F0FF 0%, #9D00FF 50%, #00F0FF 100%)", backgroundSize: "200% 100%", animation: "borderShift 6s linear infinite" }}>
                    {t.home.heroBrand}
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={0.15}>
                <p className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed">
                  {t.home.heroBody}
                </p>
              </Reveal>

              <Reveal delay={0.25}>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link to="/marketplace" className="btn-primary" data-testid="hero-cta-marketplace">
                    <span>{t.home.ctaMarketplace}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/games/mobile-legends" className="btn-ghost" data-testid="hero-cta-games">
                    <span>{t.home.ctaGames}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={0.4}>
                <div className="mt-14 grid grid-cols-3 gap-3 md:gap-6 max-w-2xl">
                  {heroStats.map((s, i) => (
                    <div key={i} className="glass p-4 md:p-5 clip-angled-sm relative overflow-hidden">
                      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
                      <div className="font-display font-black text-2xl md:text-3xl">{s.v}</div>
                      <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/50 mt-1">{s.k}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            <div className="hidden lg:block lg:col-span-4">
              <Reveal delay={0.3} y={60}>
                <div className="relative">
                  <div className="glass-strong clip-angled p-6 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: "radial-gradient(400px 200px at 100% 0%, #00F0FF33, transparent)" }} />
                    <SectionLabel>{t.home.liveFeedLabel}</SectionLabel>
                    <div className="mt-5 space-y-3 min-h-[180px]">
                      {featured.length === 0 ? (
                        <div className="py-8 text-center">
                          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40">Хоосон</div>
                          <div className="font-display font-bold text-lg mt-2 text-white/70">{t.home.liveFeedEmptyTitle}</div>
                          <p className="text-xs text-white/40 mt-2">{t.home.liveFeedEmptyBody}</p>
                        </div>
                      ) : (
                        featured.slice(0, 3).map((r, i) => {
                          const meta = GAMES_META[r.game_slug] || {};
                          return (
                            <motion.div
                              key={r.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + i * 0.1 }}
                              className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-md grid place-items-center font-mono text-[10px] font-bold flex-shrink-0"
                                  style={{ background: `${meta.accent}22`, color: meta.accent2 || meta.accent, border: `1px solid ${meta.accent}44` }}>
                                  {meta.short || "NX"}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm text-white/90 truncate">{r.title}</div>
                                  <div className="font-mono text-[9px] text-white/40 tracking-widest uppercase">{t.account.verified}</div>
                                </div>
                              </div>
                              <div className="font-display font-bold text-white flex-shrink-0 ml-3">{formatMnt(r.price)}</div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none" style={{ background: "linear-gradient(180deg, transparent, #05070B)" }} />
      </section>

      {/* SUPPORTED GAMES */}
      <section className="relative py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <Reveal>
            <SectionLabel>{t.home.supportedLabel}</SectionLabel>
            <h2 className="font-display font-black text-5xl md:text-6xl mt-4 tracking-tight">
              {t.home.supportedTitle1} <span className="text-cyan-300">{t.home.supportedTitle2}</span>{t.home.supportedTitle3}
            </h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.values(GAMES_META).map((g, i) => (
              <Reveal key={g.slug} delay={i * 0.1}>
                <Link to={`/games/${g.slug}`} className="group relative block h-[500px] overflow-hidden rounded-2xl gradient-border" data-testid={`game-card-${g.slug}`}>
                  <img src={g.hero} alt={g.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.08]" />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(5,7,11,0.2), rgba(5,7,11,0.95))` }} />
                  <div className="absolute inset-0" style={{ background: `radial-gradient(400px 220px at 50% 100%, ${g.accent}66, transparent 60%)` }} />

                  <div className="relative h-full flex flex-col justify-between p-6">
                    <div className="flex items-center justify-between">
                      <div className="px-3 py-1.5 rounded-full glass font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: g.accent2, borderColor: `${g.accent}66` }}>
                        {g.short}
                      </div>
                      <div className="w-10 h-10 grid place-items-center rounded-full border border-white/20 group-hover:border-white/70 transition">
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                      </div>
                    </div>

                    <div>
                      <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-white/60">{g.tagline}</div>
                      <div className="font-display font-black text-4xl md:text-5xl mt-3 leading-none tracking-tight">
                        {g.name}
                      </div>
                      <p className="mt-3 text-sm text-white/60 max-w-sm line-clamp-2">{g.intro}</p>
                    </div>
                  </div>

                  <div className="pointer-events-none absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2" style={{ borderColor: g.accent2 }} />
                  <div className="pointer-events-none absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2" style={{ borderColor: g.accent2 }} />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED / EMPTY */}
      <section className="relative py-24">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <Reveal>
              <SectionLabel>{t.home.latestLabel}</SectionLabel>
              <h2 className="font-display font-black text-4xl md:text-5xl mt-4 tracking-tight">{t.home.latestTitle}</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <Link to="/marketplace" className="btn-ghost">
                <span>{t.home.allListings}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Reveal>
          </div>
          <div className="mt-12">
            {featured.length === 0 ? (
              <EmptyState
                title="Одоогоор бүртгэл байхгүй байна."
                subtitle="Админ анхны бүртгэлээ нийтэлмэгц эндээс харагдана."
                testId="home-empty"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featured.slice(0, 8).map((p, i) => (
                  <ProductCard key={p.id} post={p} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative py-32">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4">
              <Reveal>
                <SectionLabel color="#9D00FF">{t.home.featuresLabel}</SectionLabel>
                <h2 className="font-display font-black text-4xl md:text-5xl mt-4 tracking-tight leading-[0.95]">
                  {t.home.featuresTitle1}<br/><span className="text-purple-400">{t.home.featuresTitle2}</span>{t.home.featuresTitle3}
                </h2>
                <p className="mt-5 text-white/60 leading-relaxed max-w-md">
                  {t.home.featuresBody}
                </p>
              </Reveal>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {FEATURES.map((f, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="glass p-6 clip-angled h-full relative overflow-hidden group hover:border-cyan-400/40 transition">
                    <div className="w-12 h-12 rounded-xl grid place-items-center mb-5" style={{ background: "linear-gradient(135deg, rgba(0,240,255,0.15), rgba(157,0,255,0.15))", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <f.icon className="w-5 h-5 text-cyan-300" />
                    </div>
                    <div className="font-display font-bold text-xl">{f.title}</div>
                    <p className="mt-3 text-sm text-white/60 leading-relaxed">{f.body}</p>
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition"
                      style={{ background: "radial-gradient(circle, #00F0FF, transparent)" }}
                    />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl gradient-border">
              <div className="absolute inset-0" style={{ background: "radial-gradient(600px 400px at 20% 50%, #00F0FF33, transparent), radial-gradient(600px 400px at 80% 50%, #9D00FF33, transparent), #0B1220" }} />
              <div className="relative p-10 md:p-16 grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <SectionLabel>{t.home.ctaLabel}</SectionLabel>
                  <h3 className="font-display font-black text-4xl md:text-5xl mt-4 tracking-tight leading-[1.02]">
                    {t.home.ctaTitle1}<br/>{t.home.ctaTitle2}
                  </h3>
                </div>
                <div className="flex md:justify-end items-center gap-4 flex-wrap">
                  <Link to="/marketplace" className="btn-primary">
                    <Zap className="w-4 h-4" /> {t.home.ctaEnter}
                  </Link>
                  <Link to="/games/mobile-legends" className="btn-ghost">{t.home.ctaBrowse}</Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
