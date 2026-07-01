import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Search, Shield, LogOut, ChevronRight } from "lucide-react";
import { getMe, logout } from "../lib/api";
import { t } from "../lib/i18n";

const links = [
  { to: "/", label: t.nav.home },
  { to: "/marketplace", label: t.nav.marketplace },
  { to: "/games/mobile-legends", label: t.nav.ml },
  { to: "/games/pubg-mobile", label: t.nav.pubg },
  { to: "/games/standoff-2", label: t.nav.so2 },
];

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(getMe());
  const { scrollY } = useScroll();
  const nav = useNavigate();
  const loc = useLocation();

  useMotionValueEvent(scrollY, "change", (v) => {
    const prev = scrollY.getPrevious();
    if (v > prev && v > 120) setHidden(true);
    else setHidden(false);
  });

  useEffect(() => {
    setUser(getMe());
  }, [loc.pathname]);

  const handleLogout = () => {
    logout();
    setUser(null);
    nav("/");
  };

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: hidden ? -110 : 0 }}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 pt-4">
        <div className="glass-strong clip-angled px-4 md:px-6 py-3 flex items-center justify-between relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-accent-blue/60 to-transparent" />
          <Link to="/" className="flex items-center gap-3" data-testid="nav-logo">
            <div className="relative w-9 h-9 grid place-items-center">
              <div className="absolute inset-0 rounded-md" style={{ background: "linear-gradient(135deg, #00F0FF, #9D00FF)" }} />
              <div className="absolute inset-[2px] rounded-md bg-[#05070B] grid place-items-center">
                <span className="font-display font-black text-[13px] bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #00F0FF, #9D00FF)" }}>NX</span>
              </div>
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-display font-black text-lg tracking-tight">{t.brand}</span>
              <span className="font-mono text-[9px] tracking-[0.3em] text-white/50 mt-0.5">{t.tagline}</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `nav-link font-display uppercase text-[11px] tracking-[0.22em] font-semibold transition-colors ${
                    isActive ? "text-white active" : "text-white/70 hover:text-white"
                  }`
                }
                data-testid={`nav-link-${l.to.replace(/\W+/g, "-")}`}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/marketplace"
              className="hidden md:inline-flex items-center gap-2 text-white/70 hover:text-white transition"
              data-testid="nav-search"
            >
              <Search className="w-4 h-4" />
              <span className="font-mono text-[10px] tracking-[0.25em] uppercase">{t.nav.search}</span>
            </Link>
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/admin" className="btn-ghost !py-2 !px-3" data-testid="nav-admin-dashboard">
                  <Shield className="w-4 h-4" />
                  <span>{t.nav.admin}</span>
                </Link>
                <button className="btn-ghost !py-2 !px-3" onClick={handleLogout} data-testid="nav-logout">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/admin25" className="btn-primary hidden md:inline-flex" data-testid="nav-admin-login">
                <span>{t.nav.admin}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}

            <button
              onClick={() => setOpen((o) => !o)}
              className="lg:hidden p-2 rounded-md border border-white/10 text-white/90"
              data-testid="nav-mobile-toggle"
              aria-label={t.nav.menu}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden mx-auto max-w-[1400px] px-4 md:px-8 mt-2"
          >
            <div className="glass-strong clip-angled p-4 flex flex-col gap-3">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `font-display uppercase text-xs tracking-[0.22em] py-2 border-b border-white/5 ${
                      isActive ? "text-white" : "text-white/70"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              {user ? (
                <div className="flex items-center gap-2 mt-2">
                  <Link to="/admin" className="btn-ghost flex-1 justify-center" onClick={() => setOpen(false)}>{t.nav.admin}</Link>
                  <button onClick={handleLogout} className="btn-ghost">{t.nav.logout}</button>
                </div>
              ) : (
                <Link to="/admin25" className="btn-primary mt-2 justify-center" onClick={() => setOpen(false)}>{t.nav.admin}</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
