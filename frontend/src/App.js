import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Cursor from "./components/Cursor";
import Loader from "./components/Loader";
import AnimatedBackground from "./components/AnimatedBackground";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastProvider } from "./components/Toast";
import HomePage from "./pages/HomePage";
import MarketplacePage from "./pages/MarketplacePage";
import GamePage from "./pages/GamePage";
import AccountDetailPage from "./pages/AccountDetailPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import { GAMES_META } from "./lib/utils";
import { getMe } from "./lib/api";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function ThemedBackground() {
  const { pathname } = useLocation();
  const gameMatch = pathname.match(/^\/games\/(.+)/);
  const game = gameMatch ? GAMES_META[gameMatch[1]] : null;
  return <AnimatedBackground accent={game?.accent || "#00F0FF"} accent2={game?.accent2 || "#9D00FF"} />;
}

function Protected({ children }) {
  const user = getMe();
  if (!user) return <Navigate to="/admin25" replace />;
  return children;
}

export default function App() {
  const [loaderDone, setLoaderDone] = useState(false);

  return (
    <BrowserRouter>
      <ToastProvider>
        <ThemedBackground />
        <Cursor />
        {!loaderDone && <Loader onDone={() => setLoaderDone(true)} />}

        <div className={loaderDone ? "opacity-100" : "opacity-0"} style={{ transition: "opacity 600ms ease" }}>
          <ScrollToTop />
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/games/:slug" element={<GamePage />} />
              <Route path="/account/:id" element={<AccountDetailPage />} />
              <Route path="/admin25" element={<AdminLoginPage />} />
              <Route path="/admin" element={<Protected><AdminDashboardPage /></Protected>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div className="min-h-[80vh] grid place-items-center">
      <div className="text-center">
        <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-cyan-300">Error 404</div>
        <h1 className="font-display font-black text-6xl mt-4">Signal Lost</h1>
        <p className="text-white/50 mt-3">This dimension does not exist.</p>
        <a href="/" className="btn-primary inline-flex mt-6">Return to Base</a>
      </div>
    </div>
  );
}
