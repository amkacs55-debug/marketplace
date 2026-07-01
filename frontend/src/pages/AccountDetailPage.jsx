import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, Share2, Phone, Facebook, ShieldCheck, Zap, Eye, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal, SectionLabel } from "../components/Reveal";
import ProductCard from "../components/ProductCard";
import SmartImage, { NaturalImage } from "../components/SmartImage";
import { getPost } from "../lib/api";
import { GAMES_META } from "../lib/utils";
import { formatMnt, t } from "../lib/i18n";
import { useToast } from "../components/Toast";

export default function AccountDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [fav, setFav] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setLoading(true);
    getPost(id)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="pt-40 pb-24 mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="aspect-[4/5] glass rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 glass rounded animate-pulse" />
            <div className="h-4 w-1/2 glass rounded animate-pulse" />
            <div className="h-24 glass rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!data?.post) {
    return (
      <div className="min-h-[70vh] grid place-items-center">
        <div className="text-center">
          <div className="font-display font-black text-3xl">{t.account.notFound}</div>
          <Link to="/marketplace" className="btn-primary mt-6 inline-flex">{t.account.backToMarket}</Link>
        </div>
      </div>
    );
  }

  const { post, related } = data;
  const meta = GAMES_META[post.game_slug] || {};
  const accent = meta.accent || "#00F0FF";
  const accent2 = meta.accent2 || "#9D00FF";
  const images = post.images && post.images.length ? post.images : [];

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t.account.copied);
    } catch {
      toast.error(t.account.copyFail);
    }
  };

  const next = () => setActive((i) => (i + 1) % images.length);
  const prev = () => setActive((i) => (i - 1 + images.length) % images.length);

  return (
    <div className="relative pt-32 pb-24">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <Reveal>
          <Link to={`/games/${post.game_slug}`} className="inline-flex items-center gap-2 text-white/60 hover:text-white transition font-mono text-[10px] tracking-[0.3em] uppercase" data-testid="back-link">
            <ArrowLeft className="w-3.5 h-3.5" /> {t.account.back} · {meta.name || t.nav.marketplace}
          </Link>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <Reveal>
              <div className="relative gradient-border rounded-2xl overflow-hidden group cursor-zoom-in"
                onClick={() => images.length && setLightbox(true)}
                data-testid="account-main-image"
              >
                {images[active] ? (
                  <>
                    <NaturalImage
                      key={active}
                      src={images[active]}
                      alt={post.title}
                      maxHeight={680}
                    />
                    <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(180deg, transparent 70%, rgba(5,7,11,0.5))` }} />
                  </>
                ) : (
                  <div className="aspect-[4/3] w-full grid place-items-center"
                    style={{ background: `linear-gradient(135deg, ${accent}22, ${accent2}22)` }}>
                    <div className="font-display font-black text-4xl opacity-40">{meta.short}</div>
                  </div>
                )}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prev(); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 grid place-items-center rounded-full glass-strong border border-white/10 opacity-0 group-hover:opacity-100 transition z-10"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); next(); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 grid place-items-center rounded-full glass-strong border border-white/10 opacity-0 group-hover:opacity-100 transition z-10"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
                <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                  <div className="px-3 py-1.5 rounded-full glass border font-mono text-[10px] tracking-[0.3em] uppercase"
                    style={{ borderColor: `${accent}66`, color: accent2 }}>
                    {meta.name || post.game_slug}
                  </div>
                  <div className="px-3 py-1.5 rounded-full glass border border-white/10 font-mono text-[10px] tracking-[0.3em] uppercase text-white/80">
                    {post.group}
                  </div>
                </div>
              </div>
            </Reveal>

            {images.length > 1 && (
              <Reveal delay={0.1}>
                <div className="mt-4 grid grid-cols-6 gap-3">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActive(i)}
                      className={`relative aspect-square rounded-lg overflow-hidden border transition ${
                        i === active ? "border-cyan-400" : "border-white/10 hover:border-white/40"
                      }`}
                      style={i === active ? { boxShadow: `0 0 15px ${accent}66` } : {}}
                      data-testid={`thumb-${i}`}
                    >
                      <SmartImage src={img} alt="" padding="p-1" backdrop={true} />
                    </button>
                  ))}
                </div>
              </Reveal>
            )}
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={0.05}>
              <SectionLabel color={accent}>{meta.name || post.game_slug} · {post.group}</SectionLabel>
              <h1 className="font-display font-black text-4xl md:text-5xl mt-4 leading-tight tracking-tight">
                {post.title}
              </h1>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5 text-white/50 text-sm">
                  <Eye className="w-4 h-4" /> {post.views || 0} {t.account.views}
                </div>
                <div className="flex items-center gap-1.5 text-white/50 text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> {t.account.verified}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-6 glass clip-angled p-6 relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
                <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-white/50">{t.account.price}</div>
                <div className="font-display font-black text-5xl mt-1" style={{ color: accent }}>
                  {formatMnt(post.price)}
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {post.phone && (
                    <a href={`tel:${post.phone}`} className="btn-primary" data-testid="contact-phone">
                      <Phone className="w-4 h-4" />
                      <span>{t.account.call}</span>
                    </a>
                  )}
                  {post.facebook && (
                    <a href={post.facebook} target="_blank" rel="noreferrer" className="btn-ghost" data-testid="contact-facebook">
                      <Facebook className="w-4 h-4" />
                      <span>{t.account.message}</span>
                    </a>
                  )}
                  <button
                    onClick={() => { setFav(!fav); toast.info(fav ? t.account.favRemove : t.account.favAdd); }}
                    className={`w-11 h-11 grid place-items-center rounded-lg border transition ${
                      fav ? "border-pink-400/60 text-pink-400 bg-pink-400/10" : "border-white/10 text-white/70 hover:border-pink-400/60 hover:text-pink-400"
                    }`}
                    data-testid="favorite-button"
                  >
                    <Heart className="w-4 h-4" fill={fav ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={share}
                    className="w-11 h-11 grid place-items-center rounded-lg border border-white/10 text-white/70 hover:border-cyan-400/60 hover:text-cyan-300 transition"
                    data-testid="share-button"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-6">
                <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-white/50 mb-3">{t.account.description}</div>
                <p className="text-white/70 leading-relaxed whitespace-pre-wrap">{post.description}</p>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="glass p-4 clip-angled-sm">
                  <ShieldCheck className="w-4 h-4 mb-2" style={{ color: accent2 }} />
                  <div className="font-display font-bold text-base">{t.account.fullTransfer}</div>
                  <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/50 mt-1">{t.account.ownership}</div>
                </div>
                <div className="glass p-4 clip-angled-sm">
                  <Zap className="w-4 h-4 mb-2" style={{ color: accent2 }} />
                  <div className="font-display font-bold text-base">{t.account.handoverValue}</div>
                  <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/50 mt-1">{t.account.handover}</div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {related && related.length > 0 && (
          <section className="mt-24">
            <Reveal>
              <SectionLabel color={accent}>{t.account.relatedLabel}</SectionLabel>
              <h2 className="font-display font-black text-3xl md:text-4xl mt-4">{t.account.relatedTitle}</h2>
            </Reveal>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} post={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      <AnimatePresence>
        {lightbox && images[active] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9990] bg-black/90 backdrop-blur-md grid place-items-center p-6"
            onClick={() => setLightbox(false)}
            data-testid="lightbox"
          >
            <button className="absolute top-6 right-6 w-11 h-11 grid place-items-center rounded-full border border-white/20 text-white" onClick={() => setLightbox(false)}>
              <X className="w-4 h-4" />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={images[active]}
              alt=""
              className="max-w-[90vw] max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 grid place-items-center rounded-full glass border border-white/20"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 grid place-items-center rounded-full glass border border-white/20"><ChevronRight className="w-5 h-5" /></button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
