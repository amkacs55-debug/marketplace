import React from "react";
import { Link } from "react-router-dom";
import { Twitter, Instagram, Youtube, Twitch, Github, MessagesSquare } from "lucide-react";
import { t } from "../lib/i18n";

export default function Footer() {
  return (
    <footer className="relative mt-32 border-t border-white/5">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(500px 300px at 50% 0%, rgba(0,240,255,0.10), transparent 60%)" }} />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-10 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 relative">
                <div className="absolute inset-0 rounded-md" style={{ background: "linear-gradient(135deg, #00F0FF, #9D00FF)" }} />
                <div className="absolute inset-[2px] rounded-md bg-[#05070B] grid place-items-center">
                  <span className="font-display font-black text-sm bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #00F0FF, #9D00FF)" }}>NX</span>
                </div>
              </div>
              <div>
                <div className="font-display font-black text-xl">{t.brand}</div>
                <div className="font-mono text-[9px] tracking-[0.35em] text-white/50">{t.tagline}</div>
              </div>
            </div>
            <p className="mt-5 text-sm text-white/60 max-w-md leading-relaxed">
              {t.footer.body}
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Twitter, Instagram, Youtube, Twitch, MessagesSquare, Github].map((Icon, i) => (
                <button
                  key={i}
                  type="button"
                  className="w-9 h-9 grid place-items-center rounded-full border border-white/10 hover:border-cyan-400/60 hover:text-cyan-300 transition text-white/70"
                  aria-label="social"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-cyan-300 mb-4">{t.footer.games}</div>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/games/mobile-legends" className="hover:text-white">Mobile Legends</Link></li>
              <li><Link to="/games/pubg-mobile" className="hover:text-white">PUBG Mobile</Link></li>
              <li><Link to="/games/standoff-2" className="hover:text-white">Standoff 2</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-cyan-300 mb-4">{t.footer.market}</div>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/marketplace" className="hover:text-white">{t.footer.browseAll}</Link></li>
              <li><Link to="/marketplace?sort=newest" className="hover:text-white">{t.footer.latest}</Link></li>
              <li><Link to="/marketplace?sort=price_desc" className="hover:text-white">{t.footer.featured}</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-cyan-300 mb-4">{t.footer.company}</div>
            <ul className="space-y-2 text-sm text-white/70">
              <li><span className="text-white/60">{t.footer.about}</span></li>
              <li><span className="text-white/60">{t.footer.support}</span></li>
              <li><span className="text-white/60">{t.footer.terms}</span></li>
              <li><Link to="/admin25" className="hover:text-white">{t.footer.adminLink}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-3 pt-6 border-t border-white/5">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40">
            © {new Date().getFullYear()} {t.brand} — {t.footer.copyright}
          </div>
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40">
            {t.footer.handmade}
          </div>
        </div>
      </div>
    </footer>
  );
}
