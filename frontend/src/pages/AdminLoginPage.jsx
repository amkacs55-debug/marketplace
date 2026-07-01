import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, User } from "lucide-react";
import { login } from "../lib/api";
import { useToast } from "../components/Toast";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    try {
      const data = await login(username, password);
      toast.success(`Welcome back, ${data.user.username}`);
      nav("/admin");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center pt-24 pb-16 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        className="w-full max-w-[440px]"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl grid place-items-center relative">
            <div className="absolute inset-0 rounded-2xl" style={{ background: "linear-gradient(135deg, #00F0FF, #9D00FF)" }} />
            <div className="absolute inset-[2px] rounded-2xl bg-[#05070B] grid place-items-center">
              <Shield className="w-5 h-5 text-cyan-300" />
            </div>
          </div>
          <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-cyan-300 mt-6">Restricted Access</div>
          <h1 className="font-display font-black text-4xl md:text-5xl mt-3 tracking-tight">
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(120deg, #ffffff, #9D00FF)" }}>
              Operator Console
            </span>
          </h1>
          <p className="text-white/50 text-sm mt-3">Authenticate to access the command center.</p>
        </div>

        <div className="glass-strong clip-angled p-8 relative overflow-hidden" data-testid="admin-login-panel">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />

          <form onSubmit={submit} className="space-y-5" autoComplete="off">
            <div>
              <label className="font-mono text-[10px] tracking-[0.35em] uppercase text-white/60 block mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#05070B] border border-white/10 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 outline-none rounded-lg pl-11 pr-4 py-3.5 text-sm placeholder:text-white/30"
                  placeholder="admin"
                  data-testid="admin-username-input"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="font-mono text-[10px] tracking-[0.35em] uppercase text-white/60 block mb-2">Access Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#05070B] border border-white/10 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 outline-none rounded-lg pl-11 pr-4 py-3.5 text-sm placeholder:text-white/30"
                  placeholder="•••••••••"
                  data-testid="admin-password-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center disabled:opacity-60 mt-4"
              data-testid="admin-login-submit"
            >
              {loading ? <span className="font-mono">Authenticating…</span> : <span>Authenticate</span>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between font-mono text-[10px] tracking-[0.25em] uppercase text-white/40">
            <span>Route: /admin25</span>
            <span className="text-cyan-300">Encrypted · JWT</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
