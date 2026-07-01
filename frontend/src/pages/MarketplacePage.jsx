import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { Reveal, SectionLabel } from "../components/Reveal";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";
import { listPosts } from "../lib/api";
import { GAMES_META, GROUPS } from "../lib/utils";
import { t } from "../lib/i18n";

const SORTS = [
  { value: "newest", label: t.market.sortNewest },
  { value: "oldest", label: t.market.sortOldest },
  { value: "price_desc", label: t.market.sortHigh },
  { value: "price_asc", label: t.market.sortLow },
];

export default function MarketplacePage() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [sort, setSort] = useState(params.get("sort") || "newest");
  const [game, setGame] = useState(params.get("game") || "");
  const [group, setGroup] = useState(params.get("group") || "");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const tm = setTimeout(() => {
      setLoading(true);
      const p = {};
      if (q) p.q = q;
      if (sort) p.sort = sort;
      if (game) p.game = game;
      if (group) p.group = group;
      listPosts(p)
        .then((d) => {
          setItems(d.items || []);
          setTotal(d.total || 0);
        })
        .catch(() => setItems([]))
        .finally(() => setLoading(false));

      const sp = new URLSearchParams();
      Object.entries(p).forEach(([k, v]) => v && sp.set(k, v));
      setParams(sp, { replace: true });
    }, 250);
    return () => clearTimeout(tm);
  }, [q, sort, game, group]); // eslint-disable-line

  const clearFilters = () => {
    setQ(""); setSort("newest"); setGame(""); setGroup("");
  };

  const hasFilters = q || game || group || sort !== "newest";

  return (
    <div className="relative pt-32 pb-24">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
          <SectionLabel>{t.market.label}</SectionLabel>
          <div className="flex flex-wrap items-end justify-between gap-6 mt-4">
            <div>
              <h1 className="font-display font-black text-5xl md:text-6xl tracking-tight">
                {t.market.title1}{" "}
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(120deg, #00F0FF, #9D00FF)" }}>{t.market.title2}</span>
              </h1>
              <p className="mt-3 text-white/60 max-w-xl">
                {t.market.subtitle}
              </p>
            </div>
            <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-white/50">
              <span className="text-cyan-300 font-bold">{total}</span> · {t.market.listingsCounter}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10 glass clip-angled p-4 md:p-5 flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.market.searchPlaceholder}
                data-testid="marketplace-search-input"
                className="w-full bg-[#05070B]/50 border border-white/10 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 outline-none rounded-lg pl-11 pr-4 py-3 text-sm placeholder:text-white/30"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Chip
                items={[{ value: "", label: t.market.allGames }, ...Object.values(GAMES_META).map((g) => ({ value: g.slug, label: g.name }))]}
                value={game}
                onChange={setGame}
                dataTestid="filter-game"
              />
              <Chip
                items={[{ value: "", label: t.market.allGroups }, ...GROUPS.map((g) => ({ value: g, label: g }))]}
                value={group}
                onChange={setGroup}
                dataTestid="filter-group"
              />
              <Chip items={SORTS} value={sort} onChange={setSort} dataTestid="filter-sort" />

              {hasFilters && (
                <button onClick={clearFilters} className="text-white/60 hover:text-white flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest" data-testid="filter-clear">
                  <X className="w-3.5 h-3.5" /> {t.market.clear}
                </button>
              )}
            </div>
          </div>
        </Reveal>

        <div className="mt-10 min-h-[300px]">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[4/6] glass rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              title={t.market.emptyTitle}
              subtitle={t.market.emptySubtitle}
              testId="marketplace-empty"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="marketplace-grid">
              {items.map((p, i) => (
                <ProductCard key={p.id} post={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({ items, value, onChange, dataTestid }) {
  const [open, setOpen] = useState(false);
  const current = items.find((i) => i.value === value) || items[0];
  return (
    <div className="relative" data-testid={dataTestid}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="px-4 py-2.5 rounded-lg border border-white/10 hover:border-cyan-400/60 bg-[#05070B]/50 text-white/80 text-xs font-mono uppercase tracking-widest transition flex items-center gap-2"
      >
        <span>{current?.label}</span>
        <span className="text-cyan-300">▾</span>
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute z-50 top-full mt-2 min-w-[180px] glass-strong rounded-lg overflow-hidden border border-white/10"
            >
              {items.map((i) => (
                <button
                  key={i.value}
                  onClick={() => { onChange(i.value); setOpen(false); }}
                  className={`block w-full text-left px-4 py-2.5 text-xs font-mono uppercase tracking-widest transition ${
                    value === i.value ? "bg-cyan-400/10 text-cyan-300" : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {i.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
