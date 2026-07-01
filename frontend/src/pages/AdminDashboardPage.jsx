import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { Plus, Edit, Trash2, Eye, LayoutDashboard, Package, HardDrive, DollarSign, Users, Gamepad2, LogOut, Sparkles } from "lucide-react";
import { getMe, logout, listPosts, analytics, deletePost } from "../lib/api";
import { GAMES_META, GROUPS, formatPrice, formatCompact } from "../lib/utils";
import { useToast } from "../components/Toast";
import PostForm from "./PostForm";
import { Reveal } from "../components/Reveal";

const ACCENTS = ["#00F0FF", "#9D00FF", "#22F5A0", "#FFC857", "#FF4D6D"];

export default function AdminDashboardPage() {
  const user = getMe();
  const nav = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [groupFilter, setGroupFilter] = useState("");
  const [gameFilter, setGameFilter] = useState("");

  useEffect(() => {
    if (!user) { nav("/admin25"); return; }
    refresh();
  }, []); // eslint-disable-line

  const refresh = () => {
    analytics().then(setStats).catch(() => {});
    reloadPosts();
  };

  const reloadPosts = () => {
    const p = { status: null, limit: 100 };
    if (groupFilter) p.group = groupFilter;
    if (gameFilter) p.game = gameFilter;
    listPosts(p).then((d) => setPosts(d.items || [])).catch(() => {});
  };

  useEffect(() => { reloadPosts(); }, [groupFilter, gameFilter]); // eslint-disable-line

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing permanently?")) return;
    try {
      await deletePost(id);
      toast.success("Listing deleted");
      refresh();
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  const handleLogout = () => { logout(); nav("/"); };

  if (!user) return null;

  return (
    <div className="relative pt-32 pb-24">
      <div className="mx-auto max-w-[1500px] px-6 md:px-10">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-cyan-300">Command Center</div>
            <h1 className="font-display font-black text-5xl md:text-6xl mt-3 tracking-tight">
              Operator <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(120deg, #00F0FF, #9D00FF)" }}>Console</span>
            </h1>
            <p className="text-white/50 mt-2">Signed in as <span className="text-cyan-300 font-mono uppercase text-xs tracking-widest">{user.username} · {user.role}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setCreating(true)} className="btn-primary" data-testid="admin-new-post">
              <Plus className="w-4 h-4" /> <span>New Listing</span>
            </button>
            <button onClick={handleLogout} className="btn-ghost" data-testid="admin-logout"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10 flex flex-wrap gap-2 border-b border-white/5">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "listings", label: "Listings", icon: Package },
            { id: "groups", label: "Groups", icon: Users },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-2 px-5 py-3 font-mono text-[10px] tracking-[0.3em] uppercase transition ${
                tab === t.id ? "text-white" : "text-white/50 hover:text-white/80"
              }`}
              data-testid={`admin-tab-${t.id}`}
            >
              <t.icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
              {tab === t.id && (
                <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, #00F0FF, #9D00FF)", boxShadow: "0 0 12px rgba(0,240,255,0.6)" }} />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-10">
              <OverviewTab stats={stats} />
            </motion.div>
          )}
          {tab === "listings" && (
            <motion.div key="listings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-10">
              <ListingsTab
                posts={posts}
                onEdit={setEditing}
                onDelete={handleDelete}
                groupFilter={groupFilter}
                setGroupFilter={setGroupFilter}
                gameFilter={gameFilter}
                setGameFilter={setGameFilter}
              />
            </motion.div>
          )}
          {tab === "groups" && (
            <motion.div key="groups" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-10">
              <GroupsTab stats={stats} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Post form modal */}
      <AnimatePresence>
        {(creating || editing) && (
          <PostForm
            editing={editing}
            onClose={() => { setCreating(false); setEditing(null); }}
            onSaved={() => { setCreating(false); setEditing(null); refresh(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color = "#00F0FF", trend, delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <div className="glass p-6 clip-angled relative overflow-hidden group hover:border-white/20 transition">
        <div className="absolute inset-x-0 top-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
        <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-20 blur-2xl" style={{ background: color }} />
        <div className="relative flex items-center justify-between">
          <Icon className="w-5 h-5" style={{ color }} />
          {trend && (
            <span className="font-mono text-[10px] tracking-widest text-emerald-400">{trend}</span>
          )}
        </div>
        <div className="mt-6 font-display font-black text-3xl md:text-4xl">{value}</div>
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/50 mt-1">{label}</div>
      </div>
    </Reveal>
  );
}

function OverviewTab({ stats }) {
  if (!stats) return <div className="glass p-10 rounded-2xl animate-pulse h-40" />;
  const t = stats.totals;

  const gameData = (stats.per_game || []).map((g, i) => ({
    name: GAMES_META[g._id]?.name || g._id || "Unknown",
    value: g.count,
    fill: GAMES_META[g._id]?.accent || ACCENTS[i % ACCENTS.length],
  }));

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={Package} label="Total Posts" value={formatCompact(t.posts)} color="#00F0FF" delay={0} />
        <StatCard icon={Sparkles} label="Published" value={formatCompact(t.published)} color="#9D00FF" delay={0.05} />
        <StatCard icon={Edit} label="Drafts" value={formatCompact(t.drafts)} color="#FFC857" delay={0.1} />
        <StatCard icon={Eye} label="Total Views" value={formatCompact(t.views)} color="#22F5A0" delay={0.15} />
        <StatCard icon={DollarSign} label="GMV" value={formatPrice(t.revenue)} color="#FF7A18" delay={0.2} />
        <StatCard icon={HardDrive} label="Storage" value={`${t.storage_mb} MB`} color="#4CC2FF" delay={0.25} />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2 glass clip-angled p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-cyan-300">Post Activity · 7d</div>
              <div className="font-display font-bold text-xl mt-1">Weekly Momentum</div>
            </div>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.timeline}>
                <defs>
                  <linearGradient id="fillCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00F0FF" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#00F0FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#ffffff10" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="#ffffff60" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff60" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "rgba(11,18,32,0.9)", border: "1px solid rgba(0,240,255,0.3)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#00F0FF" }}
                />
                <Area type="monotone" dataKey="count" stroke="#00F0FF" strokeWidth={2} fill="url(#fillCyan)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By Game */}
        <div className="glass clip-angled p-6">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-purple-300">By Game</div>
          <div className="font-display font-bold text-xl mt-1">Distribution</div>
          <div className="h-[240px] mt-2">
            {gameData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={gameData} innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value">
                    {gameData.map((d, i) => <Cell key={i} fill={d.fill} stroke="#05070B" strokeWidth={2} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "rgba(11,18,32,0.9)", border: "1px solid rgba(157,0,255,0.3)", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-full grid place-items-center text-white/40 text-sm">No data yet</div>}
          </div>
          <div className="mt-2 space-y-2">
            {gameData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: d.fill }} /><span className="text-white/70">{d.name}</span></div>
                <span className="font-mono text-white/80">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent */}
      <div className="mt-8 glass clip-angled p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-cyan-300">Recent</div>
            <div className="font-display font-bold text-xl mt-1">Latest Listings</div>
          </div>
        </div>
        {stats.recent && stats.recent.length > 0 ? (
          <div className="space-y-2">
            {stats.recent.map((p) => (
              <Link key={p.id} to={`/account/${p.id}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition">
                <div className="w-12 h-12 rounded-md overflow-hidden bg-white/5 flex-shrink-0">
                  {p.images && p.images[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-contain" /> : <div className="w-full h-full grid place-items-center text-xs text-white/40">—</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/90 truncate">{p.title}</div>
                  <div className="font-mono text-[10px] tracking-widest uppercase text-white/40">{p.group} · {GAMES_META[p.game_slug]?.short}</div>
                </div>
                <div className="font-display font-bold text-cyan-300">{formatPrice(p.price)}</div>
              </Link>
            ))}
          </div>
        ) : <div className="text-sm text-white/40 py-4">No listings yet.</div>}
      </div>
    </div>
  );
}

function ListingsTab({ posts, onEdit, onDelete, groupFilter, setGroupFilter, gameFilter, setGameFilter }) {
  return (
    <div>
      <div className="glass clip-angled p-4 flex flex-wrap items-center gap-3">
        <select value={gameFilter} onChange={(e) => setGameFilter(e.target.value)} className="bg-[#05070B] border border-white/10 rounded px-3 py-2 text-xs font-mono uppercase tracking-widest" data-testid="admin-filter-game">
          <option value="">All Games</option>
          {Object.values(GAMES_META).map((g) => <option key={g.slug} value={g.slug}>{g.name}</option>)}
        </select>
        <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} className="bg-[#05070B] border border-white/10 rounded px-3 py-2 text-xs font-mono uppercase tracking-widest" data-testid="admin-filter-group">
          <option value="">All Groups</option>
          {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <div className="font-mono text-[10px] tracking-widest uppercase text-white/40 ml-auto">{posts.length} results</div>
      </div>

      <div className="mt-6 glass clip-angled overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/5 font-mono text-[10px] tracking-widest uppercase text-white/50">
          <div className="col-span-5">Title</div>
          <div className="col-span-2">Game</div>
          <div className="col-span-2">Group</div>
          <div className="col-span-1">Price</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        {posts.length === 0 ? (
          <div className="p-10 text-center text-white/40">No listings yet. Create one from the top-right button.</div>
        ) : posts.map((p) => (
          <div key={p.id} className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-white/5 last:border-0 items-center hover:bg-white/[0.02] transition">
            <div className="col-span-5 flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded overflow-hidden bg-white/5 flex-shrink-0 relative">
                {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-contain" /> : <div className="w-full h-full grid place-items-center text-xs text-white/40">—</div>}
              </div>
              <div className="truncate">
                <div className="text-sm text-white/90 truncate">{p.title}</div>
                <div className="font-mono text-[9px] tracking-widest uppercase text-white/40">{p.category || "general"}</div>
              </div>
            </div>
            <div className="col-span-2 font-mono text-[10px] tracking-widest uppercase" style={{ color: GAMES_META[p.game_slug]?.accent2 || "#fff" }}>{GAMES_META[p.game_slug]?.short || p.game_slug}</div>
            <div className="col-span-2 font-mono text-xs text-white/70">{p.group}</div>
            <div className="col-span-1 font-display font-bold text-cyan-300">{formatPrice(p.price)}</div>
            <div className="col-span-1">
              <span className={`px-2 py-1 rounded text-[10px] font-mono uppercase tracking-widest ${
                p.status === "published" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30" : "bg-yellow-500/10 text-yellow-300 border border-yellow-500/30"
              }`}>{p.status}</span>
            </div>
            <div className="col-span-1 flex items-center gap-2 justify-end">
              <Link to={`/account/${p.id}`} className="w-8 h-8 grid place-items-center rounded border border-white/10 text-white/60 hover:text-cyan-300 hover:border-cyan-400/40 transition"><Eye className="w-3.5 h-3.5" /></Link>
              <button onClick={() => onEdit(p)} className="w-8 h-8 grid place-items-center rounded border border-white/10 text-white/60 hover:text-purple-300 hover:border-purple-400/40 transition" data-testid={`edit-${p.id}`}><Edit className="w-3.5 h-3.5" /></button>
              <button onClick={() => onDelete(p.id)} className="w-8 h-8 grid place-items-center rounded border border-white/10 text-white/60 hover:text-red-300 hover:border-red-400/40 transition" data-testid={`delete-${p.id}`}><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GroupsTab({ stats }) {
  const per = stats?.per_group || [];
  const map = Object.fromEntries(per.map((g) => [g._id, g]));
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {GROUPS.map((g, i) => {
        const data = map[g] || { count: 0, revenue: 0 };
        const acc = ACCENTS[i];
        return (
          <Reveal key={g} delay={i * 0.1}>
            <div className="glass clip-angled p-8 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-30" style={{ background: acc }} />
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: acc }}>Group Tier</div>
              <div className="font-display font-black text-3xl md:text-4xl mt-2">{g}</div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="glass-strong p-3 rounded-lg">
                  <div className="font-mono text-[9px] tracking-widest uppercase text-white/50">Listings</div>
                  <div className="font-display font-bold text-2xl mt-1">{data.count}</div>
                </div>
                <div className="glass-strong p-3 rounded-lg">
                  <div className="font-mono text-[9px] tracking-widest uppercase text-white/50">GMV</div>
                  <div className="font-display font-bold text-2xl mt-1" style={{ color: acc }}>{formatPrice(data.revenue)}</div>
                </div>
              </div>
              <Link to={`/marketplace?group=${encodeURIComponent(g)}`} className="btn-ghost mt-6 w-full justify-center">Browse Group</Link>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
