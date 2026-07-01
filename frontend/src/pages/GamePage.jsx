import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Trophy } from "lucide-react";
import { Reveal, SectionLabel } from "../components/Reveal";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";
import { getGame, listPosts } from "../lib/api";
import { GAMES_META } from "../lib/utils";
import { formatMnt, formatCount, t } from "../lib/i18n";

export default function GamePage() {
  const { slug } = useParams();
  const meta = GAMES_META[slug];
  const [game, setGame] = useState(null);
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getGame(slug), listPosts({ game: slug, limit: 30 })])
      .then(([g, p]) => {
        setGame(g);
        setPosts(p.items || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (!meta) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center">
          <div className="font-display font-black text-3xl">{t.account.unknownGame}</div>
          <Link to="/" className="btn-primary mt-6 inline-flex">{t.account.returnHome}</Link>
        </div>
      </div>
    );
  }

  const accent = meta.accent;
  const accent2 = meta.accent2;
  const categories = game?.categories || [];
  const stats = game?.stats;

  return (
    <div className="relative">
      {/* HERO */}
      <section className="relative min-h-[85vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={meta.hero} alt={meta.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(5,7,11,0.3), rgba(5,7,11,0.9)), radial-gradient(600px 400px at 80% 20%, ${accent}44, transparent 60%)` }} />
          <div className="absolute inset-0 grid-bg opacity-30" />
        </div>

        <div className="absolute right-10 top-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${accent}55, transparent 70%)`, filter: "blur(60px)" }} />

        <div className="relative z-10 mx-auto max-w-[1400px] w-full px-6 md:px-10 pt-32 pb-16">
          <Reveal>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-full glass border font-mono text-[10px] tracking-[0.35em] uppercase" style={{ borderColor: `${accent}66`, color: accent2 }}>
                {meta.short} · {t.game.battlegroundBadge}
              </div>
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40">/{slug}</span>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="font-display font-black text-6xl md:text-8xl lg:text-[130px] leading-[0.9] tracking-tighter mt-6">
              {meta.name.toUpperCase()}
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-6 max-w-2xl">
              <div className="font-mono text-[11px] tracking-[0.4em] uppercase" style={{ color: accent2 }}>{meta.tagline}</div>
              <p className="mt-3 text-white/70 text-lg leading-relaxed">{meta.intro}</p>
            </div>
          </Reveal>

          {stats && (
            <Reveal delay={0.3}>
              <div className="mt-10 grid grid-cols-3 gap-4 max-w-2xl">
                <StatBox icon={TrendingUp} label={t.game.statListings} value={formatCount(stats.listings || 0)} accent={accent} accent2={accent2} />
                <StatBox icon={Trophy} label={t.game.statAvgPrice} value={formatMnt(stats.avg_price || 0)} accent={accent} accent2={accent2} />
                <StatBox icon={TrendingUp} label={t.game.statPublished} value={formatCount(stats.listings || 0)} accent={accent} accent2={accent2} />
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="relative py-16">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="flex items-end justify-between flex-wrap gap-6">
            <Reveal>
              <SectionLabel color={accent}>{t.game.categoriesLabel}</SectionLabel>
              <h2 className="font-display font-black text-3xl md:text-4xl mt-4">{t.game.categoriesTitle}</h2>
            </Reveal>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => setCategory("all")}
              className={`px-4 py-2.5 rounded-lg border font-mono text-[10px] tracking-[0.3em] uppercase transition ${
                category === "all" ? "text-white" : "border-white/10 text-white/60 hover:text-white hover:border-white/30"
              }`}
              style={category === "all" ? { borderColor: accent, background: `${accent}22`, color: accent2, boxShadow: `0 0 20px ${accent}55` } : {}}
            >
              {t.game.allAccounts}
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2.5 rounded-lg border font-mono text-[10px] tracking-[0.3em] uppercase transition ${
                  category === c ? "text-white" : "border-white/10 text-white/60 hover:text-white hover:border-white/30"
                }`}
                style={category === c ? { borderColor: accent, background: `${accent}22`, color: accent2, boxShadow: `0 0 20px ${accent}55` } : {}}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* LISTINGS */}
      <section className="relative py-8 pb-24">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="flex items-center justify-between mb-8">
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/50">
              {posts.length} {t.game.accountsCounter}
            </div>
            <Link to="/marketplace" className="btn-ghost">{t.game.allMarkets} <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[4/6] glass rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              title={t.game.emptyTitle}
              subtitle={t.game.emptySubtitle}
              accent={accent}
              accent2={accent2}
              testId={`game-${slug}-empty`}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {posts.map((p, i) => (
                <ProductCard key={p.id} post={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, accent, accent2 }) {
  return (
    <div className="glass p-5 clip-angled-sm relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
      <Icon className="w-4 h-4 mb-3" style={{ color: accent2 }} />
      <div className="font-display font-black text-2xl md:text-3xl">{value}</div>
      <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/50 mt-1">{label}</div>
    </div>
  );
}
