import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  LayoutDashboard, TrendingUp, GitBranch, Wallet, BarChart3, Radar as RadarIcon,
  AlertTriangle, Leaf, Lightbulb, MessageSquare, FileText, Settings as SettingsIcon,
  UploadCloud, Mic, Volume2, Sparkles, ChevronRight, X, Send, Download, Globe,
  ArrowUpRight, ArrowDownRight, CheckCircle2, ShieldAlert, Zap, Gauge as GaugeIcon,
  Lock, Mail, LogOut, Loader2, UserPlus
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, RadialBarChart, RadialBar, ScatterChart, Scatter, Legend
} from "recharts";

/* ============================== DESIGN TOKENS ============================== */
const C = {
  primary: "#4F46E5",
  secondary: "#8B5CF6",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
  bg: "#09090B",
  card: "#18181B",
  cardAlt: "#151518",
  text: "#FAFAFA",
  muted: "#A1A1AA",
  border: "rgba(255,255,255,0.08)",
};
const GRAD = "linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)";
const GRAD_SOFT = "linear-gradient(135deg, rgba(79,70,229,0.15) 0%, rgba(139,92,246,0.15) 100%)";

/* ============================== TRANSLATIONS ============================== */
const T = {
  en: {
    dashboard: "Dashboard", forecast: "Forecast", scenario: "Scenario Simulator",
    budget: "Budget Optimizer", campaigns: "Campaign Analysis", risk: "Risk Radar",
    anomaly: "Anomaly Detection", benchmark: "Benchmarking", carbon: "Carbon Impact",
    explain: "Explainability", assistant: "AI Assistant", reports: "Reports", settings: "Settings",
    tagline: "Autonomous Marketing Decision Intelligence Platform",
  },
  es: {
    dashboard: "Panel", forecast: "Pronóstico", scenario: "Simulador de Escenarios",
    budget: "Optimizador de Presupuesto", campaigns: "Análisis de Campañas", risk: "Radar de Riesgo",
    anomaly: "Detección de Anomalías", benchmark: "Comparativa", carbon: "Impacto de Carbono",
    explain: "Explicabilidad", assistant: "Asistente IA", reports: "Informes", settings: "Ajustes",
    tagline: "Plataforma Autónoma de Inteligencia de Decisiones de Marketing",
  },
  fr: {
    dashboard: "Tableau de bord", forecast: "Prévision", scenario: "Simulateur de Scénarios",
    budget: "Optimiseur de Budget", campaigns: "Analyse des Campagnes", risk: "Radar de Risque",
    anomaly: "Détection d'Anomalies", benchmark: "Analyse Comparative", carbon: "Impact Carbone",
    explain: "Explicabilité", assistant: "Assistant IA", reports: "Rapports", settings: "Paramètres",
    tagline: "Plateforme Autonome d'Intelligence Décisionnelle Marketing",
  },
};

/* ============================== MOCK DATA ============================== */
const CHANNELS = [
  { name: "Google Ads", key: "google", color: "#4F46E5", roas: 4.8, ctr: 3.4, cpa: 18.2, base: 26 },
  { name: "Meta Ads", key: "meta", color: "#8B5CF6", roas: 3.1, ctr: 2.1, cpa: 24.5, base: 22 },
  { name: "LinkedIn", key: "linkedin", color: "#22C55E", roas: 2.4, ctr: 0.9, cpa: 41.0, base: 10 },
  { name: "YouTube", key: "youtube", color: "#F59E0B", roas: 2.9, ctr: 1.4, cpa: 30.2, base: 12 },
  { name: "Email", key: "email", color: "#EF4444", roas: 6.2, ctr: 5.8, cpa: 6.4, base: 8 },
  { name: "Display", key: "display", color: "#38BDF8", roas: 1.6, ctr: 0.5, cpa: 52.0, base: 14 },
  { name: "SEO", key: "seo", color: "#F472B6", roas: 5.4, ctr: 4.1, cpa: 9.8, base: 8 },
];

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(42);

function generateForecast(horizon) {
  const data = [];
  const base = 42000;
  for (let i = -30; i <= horizon; i++) {
    const seasonal = Math.sin(i / 9) * 2200;
    const trend = i * 145;
    const noise = (rnd() - 0.5) * 1800;
    const value = base + trend + seasonal + noise;
    const widen = i > 0 ? 1 + i * 0.018 : 1;
    const point = {
      day: i,
      label: i <= 0 ? `D${i}` : `D+${i}`,
      actual: i <= 0 ? Math.round(value) : null,
      predicted: i >= 0 ? Math.round(value + i * 12) : null,
      lower: i >= 0 ? Math.round((value + i * 12) - 1400 * widen) : null,
      upper: i >= 0 ? Math.round((value + i * 12) + 1400 * widen) : null,
    };
    data.push(point);
  }
  return data;
}

const SCENARIOS = [
  { name: "Conservative", color: "#22C55E", revMult: 1.04, roas: 3.2, risk: 18, confidence: 92 },
  { name: "Expected", color: "#4F46E5", revMult: 1.18, roas: 3.9, risk: 32, confidence: 85 },
  { name: "Aggressive Growth", color: "#8B5CF6", revMult: 1.42, roas: 3.4, risk: 58, confidence: 68 },
  { name: "Market Boom", color: "#F59E0B", revMult: 1.65, roas: 4.6, risk: 44, confidence: 61 },
  { name: "Economic Downturn", color: "#EF4444", revMult: 0.76, roas: 2.1, risk: 74, confidence: 71 },
].map((s) => ({
  ...s,
  revenue: Math.round(1260000 * s.revMult),
  profit: Math.round(1260000 * s.revMult * 0.31),
}));

const RISK_DATA = [
  { risk: "Budget Risk", value: 38 },
  { risk: "Campaign Risk", value: 52 },
  { risk: "Seasonality Risk", value: 64 },
  { risk: "Revenue Risk", value: 29 },
  { risk: "Channel Dependency", value: 46 },
];

const SHAP_FEATURES = [
  { name: "Historical Revenue Trend", impact: 0.31 },
  { name: "Google Search Spend", impact: 0.24 },
  { name: "Seasonality (Holiday Index)", impact: 0.18 },
  { name: "Meta Ads Saturation", impact: -0.14 },
  { name: "Email Retargeting Reach", impact: 0.11 },
  { name: "Display Ad Fatigue", impact: -0.09 },
  { name: "Competitor Ad Density", impact: -0.06 },
];

const BENCHMARK = [
  { metric: "ROAS", you: 3.9, industry: 3.1 },
  { metric: "CTR %", you: 2.6, industry: 2.1 },
  { metric: "CPA ($)", you: 21.4, industry: 27.8 },
  { metric: "Conv. Rate %", you: 4.1, industry: 3.3 },
];

const CAMPAIGNS = [
  { name: "Summer Sale Blitz", channel: "Google Ads", spend: 18400, revenue: 88300, clicks: 42100, conv: 1210, ctr: 3.8, cpa: 15.2, roas: 4.8 },
  { name: "Retarget Cart Abandon", channel: "Email", spend: 4200, revenue: 26800, clicks: 9800, conv: 640, ctr: 6.1, cpa: 6.6, roas: 6.4 },
  { name: "Brand Awareness Q3", channel: "YouTube", spend: 22000, revenue: 41200, clicks: 51000, conv: 380, ctr: 1.2, cpa: 57.9, roas: 1.9 },
  { name: "LinkedIn ABM Push", channel: "LinkedIn", spend: 9600, revenue: 24100, clicks: 3100, conv: 210, ctr: 0.8, cpa: 45.7, roas: 2.5 },
  { name: "Display Remarketing", channel: "Display", spend: 12500, revenue: 15800, clicks: 18400, conv: 220, ctr: 0.4, cpa: 56.8, roas: 1.3 },
  { name: "Meta Lookalike Scale", channel: "Meta Ads", spend: 26100, revenue: 79200, clicks: 61200, conv: 1480, ctr: 2.3, cpa: 17.6, roas: 3.0 },
  { name: "SEO Content Sprint", channel: "SEO", spend: 6000, revenue: 33900, clicks: 22800, conv: 590, ctr: 4.3, cpa: 10.2, roas: 5.7 },
  { name: "Holiday Flash Promo", channel: "Google Ads", spend: 15800, revenue: 61400, clicks: 33900, conv: 980, ctr: 3.6, cpa: 16.1, roas: 3.9 },
];

const ANOMALIES = [
  { day: "Jul 3", metric: "Meta Spend", change: "+64%", type: "spike", note: "Unusual overnight spend spike on Meta Ads — auto-bid ceiling likely misconfigured." },
  { day: "Jul 8", metric: "Google ROAS", change: "-31%", type: "drop", note: "Sharp ROAS drop on Google Search — competitor bidding surge detected in the category." },
  { day: "Jul 11", metric: "Conversions", change: "+22%", type: "spike", note: "Conversion spike aligned with Email retargeting send — positive anomaly, consider scaling." },
];

const COPILOT_SUGGESTIONS = [
  { icon: TrendingUp, text: "Google Search ROAS has climbed 12% this week — consider shifting an extra 8% of budget from Display.", color: C.success },
  { icon: AlertTriangle, text: "Meta Ads is showing early signs of budget saturation. Diminishing returns detected above ₹28,000/day.", color: C.warning },
  { icon: ShieldAlert, text: "Channel dependency risk is rising — 48% of revenue now relies on Google Ads alone.", color: C.danger },
  { icon: Sparkles, text: "Holiday seasonality index is trending up. Forecast suggests a 14% demand lift starting next week.", color: C.secondary },
];

function fmtCurrency(n) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

/* ============================== AUTH / "DATABASE" LAYER ==============================
   Accounts are stored in the artifact's shared persistent storage (window.storage,
   shared=true), which acts as a simple multi-user table everyone using this artifact
   reads and writes to. Passwords are never stored in plain text — only a SHA-256 hash.
   The signed-in session itself is kept in personal (non-shared) storage, so it's local
   to this browser/account only. ============================== */
const AUTH_KEY_PREFIX = "users:";
const SESSION_KEY = "session_email";

async function hashPassword(password) {
  const enc = new TextEncoder().encode("forecastiq_v1_" + password);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function dbGetUser(email) {
  try {
    const res = await window.storage.get(AUTH_KEY_PREFIX + email.toLowerCase(), true);
    return res ? JSON.parse(res.value) : null;
  } catch (e) {
    return null;
  }
}

async function dbSaveUser(user) {
  await window.storage.set(AUTH_KEY_PREFIX + user.email.toLowerCase(), JSON.stringify(user), true);
}

async function getSession() {
  try {
    const res = await window.storage.get(SESSION_KEY, false);
    return res ? res.value : null;
  } catch (e) {
    return null;
  }
}

async function setSession(email) {
  try { await window.storage.set(SESSION_KEY, email, false); } catch (e) {}
}

async function clearSession() {
  try { await window.storage.delete(SESSION_KEY, false); } catch (e) {}
}

/* ============================== SMALL UI PRIMITIVES ============================== */
function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const from = display;
    const dur = 700;
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (value - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line
  }, [value]);
  return <span>{prefix}{display.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{suffix}</span>;
}

function Card({ children, style, className = "" }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle, right }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="rounded-xl p-2" style={{ background: GRAD_SOFT }}>
            <Icon size={18} color={C.secondary} />
          </div>
        )}
        <div>
          <h3 style={{ color: C.text, fontSize: 18, fontWeight: 600 }}>{title}</h3>
          {subtitle && <p style={{ color: C.muted, fontSize: 13 }}>{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

function KPICard({ label, value, prefix, suffix, decimals, delta, icon: Icon }) {
  const up = delta >= 0;
  return (
    <Card className="p-5" style={{ minWidth: 0 }}>
      <div className="flex items-center justify-between mb-3">
        <span style={{ color: C.muted, fontSize: 13 }}>{label}</span>
        {Icon && <Icon size={16} color={C.muted} />}
      </div>
      <div style={{ color: C.text, fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
      </div>
      {delta !== undefined && (
        <div className="flex items-center gap-1 mt-2" style={{ color: up ? C.success : C.danger, fontSize: 12.5 }}>
          {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(delta)}% vs last period
        </div>
      )}
    </Card>
  );
}

function Pill({ children, color = C.primary }) {
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
    >
      {children}
    </span>
  );
}

/* ============================== NAV ============================== */
const NAV = [
  { id: "dashboard", icon: LayoutDashboard },
  { id: "forecast", icon: TrendingUp },
  { id: "scenario", icon: GitBranch },
  { id: "budget", icon: Wallet },
  { id: "campaigns", icon: BarChart3 },
  { id: "risk", icon: RadarIcon },
  { id: "anomaly", icon: AlertTriangle },
  { id: "benchmark", icon: BarChart3 },
  { id: "carbon", icon: Leaf },
  { id: "explain", icon: Lightbulb },
  { id: "assistant", icon: MessageSquare },
  { id: "reports", icon: FileText },
  { id: "settings", icon: SettingsIcon },
];

function Sidebar({ page, setPage, lang }) {
  const dict = T[lang];
  return (
    <div
      className="h-full flex flex-col shrink-0"
      style={{ width: 232, background: "#0c0c0f", borderRight: `1px solid ${C.border}` }}
    >
      <div className="px-5 py-6 flex items-center gap-2.5">
        <div className="rounded-xl w-9 h-9 flex items-center justify-center" style={{ background: GRAD }}>
          <Sparkles size={18} color="#fff" />
        </div>
        <div>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>ForecastIQ</div>
          <div style={{ color: C.muted, fontSize: 10.5 }}>AI DECISION PLATFORM</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4" style={{ scrollbarWidth: "thin" }}>
        {NAV.map((item) => {
          const active = page === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-left transition-all"
              style={{
                background: active ? GRAD_SOFT : "transparent",
                color: active ? C.text : C.muted,
                border: active ? `1px solid ${C.primary}55` : "1px solid transparent",
              }}
            >
              <Icon size={16} color={active ? C.secondary : C.muted} />
              <span style={{ fontSize: 13.5, fontWeight: active ? 600 : 500 }}>{dict[item.id]}</span>
            </button>
          );
        })}
      </div>
      <div className="p-4 mx-3 mb-4 rounded-xl" style={{ background: GRAD_SOFT, border: `1px solid ${C.primary}33` }}>
        <div className="flex items-center gap-2 mb-1">
          <Zap size={14} color={C.secondary} />
          <span style={{ color: C.text, fontSize: 12, fontWeight: 600 }}>Copilot Active</span>
        </div>
        <p style={{ color: C.muted, fontSize: 11, lineHeight: 1.4 }}>Monitoring 8 campaigns in real time.</p>
      </div>
    </div>
  );
}

function LoginPage({ onAuthenticated }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) { setError("Enter an email and password."); return; }
    if (mode === "signup" && !name.trim()) { setError("Enter your name."); return; }
    setBusy(true);
    try {
      const existing = await dbGetUser(email);
      const passwordHash = await hashPassword(password);

      if (mode === "signup") {
        if (existing) { setError("An account with that email already exists — sign in instead."); setBusy(false); return; }
        const user = { email: email.trim().toLowerCase(), name: name.trim(), passwordHash, createdAt: Date.now() };
        await dbSaveUser(user);
        await setSession(user.email);
        onAuthenticated(user);
      } else {
        if (!existing) { setError("No account found with that email — sign up first."); setBusy(false); return; }
        if (existing.passwordHash !== passwordHash) { setError("Incorrect password."); setBusy(false); return; }
        await setSession(existing.email);
        onAuthenticated(existing);
      }
    } catch (err) {
      setError("Something went wrong talking to storage. Please try again.");
    }
    setBusy(false);
  }

  async function handleDemo() {
    setBusy(true);
    setError("");
    try {
      const demoEmail = "demo@forecastiq.ai";
      const demoPassword = "demo1234";
      let user = await dbGetUser(demoEmail);
      const passwordHash = await hashPassword(demoPassword);
      if (!user) {
        user = { email: demoEmail, name: "Demo User", passwordHash, createdAt: Date.now() };
        await dbSaveUser(user);
      }
      await setSession(user.email);
      onAuthenticated(user);
    } catch (err) {
      setError("Couldn't start the demo session. Please try again.");
    }
    setBusy(false);
  }

  return (
    <div className="flex items-center justify-center h-screen" style={{ background: C.bg }}>
      <div className="w-full max-w-sm px-6">
        <div className="flex flex-col items-center mb-8">
          <div className="rounded-2xl w-14 h-14 flex items-center justify-center mb-4" style={{ background: GRAD }}>
            <Sparkles size={26} color="#fff" />
          </div>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 20 }}>ForecastIQ AI</div>
          <div style={{ color: C.muted, fontSize: 12.5, marginTop: 2, textAlign: "center" }}>
            Autonomous Marketing Decision Intelligence Platform
          </div>
        </div>

        <Card className="p-6">
          <div className="flex rounded-xl p-1 mb-5" style={{ background: C.cardAlt }}>
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className="flex-1 py-2 rounded-lg text-sm font-medium"
              style={{ background: mode === "login" ? GRAD : "transparent", color: mode === "login" ? "#fff" : C.muted }}
            >
              Sign in
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); }}
              className="flex-1 py-2 rounded-lg text-sm font-medium"
              style={{ background: mode === "signup" ? GRAD : "transparent", color: mode === "signup" ? "#fff" : C.muted }}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <div className="flex items-center gap-2 rounded-xl px-3.5 py-2.5" style={{ background: C.cardAlt, border: `1px solid ${C.border}` }}>
                <UserPlus size={15} color={C.muted} />
                <input
                  value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name"
                  className="flex-1 bg-transparent outline-none" style={{ color: C.text, fontSize: 13.5 }}
                />
              </div>
            )}
            <div className="flex items-center gap-2 rounded-xl px-3.5 py-2.5" style={{ background: C.cardAlt, border: `1px solid ${C.border}` }}>
              <Mail size={15} color={C.muted} />
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Work email"
                className="flex-1 bg-transparent outline-none" style={{ color: C.text, fontSize: 13.5 }}
              />
            </div>
            <div className="flex items-center gap-2 rounded-xl px-3.5 py-2.5" style={{ background: C.cardAlt, border: `1px solid ${C.border}` }}>
              <Lock size={15} color={C.muted} />
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
                className="flex-1 bg-transparent outline-none" style={{ color: C.text, fontSize: 13.5 }}
              />
            </div>

            {error && (
              <div className="rounded-lg px-3 py-2" style={{ background: `${C.danger}18`, border: `1px solid ${C.danger}44`, color: C.danger, fontSize: 12.5 }}>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={busy}
              className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              style={{ background: GRAD, color: "#fff", opacity: busy ? 0.7 : 1 }}
            >
              {busy ? <Loader2 size={15} className="animate-spin" /> : null}
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="flex items-center gap-2 my-4">
            <div className="flex-1 h-px" style={{ background: C.border }} />
            <span style={{ color: C.muted, fontSize: 11 }}>or</span>
            <div className="flex-1 h-px" style={{ background: C.border }} />
          </div>
          <button
            onClick={handleDemo} disabled={busy}
            className="w-full py-2.5 rounded-xl text-sm font-medium"
            style={{ background: C.cardAlt, color: C.text, border: `1px solid ${C.border}` }}
          >
            Continue with demo account
          </button>
        </Card>

        <p style={{ color: C.muted, fontSize: 11, textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
          Accounts are stored in this artifact's shared storage, so they're visible to
          anyone using this app instance — use a demo password, not a real one.
        </p>
      </div>
    </div>
  );
}

function TopBar({ lang, setLang, page, user, onLogout }) {
  const dict = T[lang];
  return (
    <div
      className="flex items-center justify-between px-6 py-4 shrink-0"
      style={{ borderBottom: `1px solid ${C.border}` }}
    >
      <div>
        <div style={{ color: C.muted, fontSize: 12 }}>ForecastIQ AI / {dict[page]}</div>
        <div style={{ color: C.text, fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>{dict[page]}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: C.cardAlt, border: `1px solid ${C.border}` }}>
          <Globe size={13} color={C.muted} />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            style={{ background: "transparent", color: C.text, fontSize: 12.5, border: "none", outline: "none" }}
          >
            <option style={{ background: C.card }} value="en">English</option>
            <option style={{ background: C.card }} value="es">Español</option>
            <option style={{ background: C.card }} value="fr">Français</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{ background: GRAD, color: "#fff" }}
            title={user?.email}
          >
            {(user?.name || user?.email || "?").slice(0, 2).toUpperCase()}
          </div>
          <button onClick={onLogout} className="p-1.5 rounded-lg" style={{ color: C.muted, border: `1px solid ${C.border}` }} title="Sign out">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================== CHART TOOLTIP ============================== */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg px-3 py-2" style={{ background: "#1f1f24", border: `1px solid ${C.border}`, fontSize: 12 }}>
      <div style={{ color: C.muted, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}</div>
      ))}
    </div>
  );
}

/* ============================== DASHBOARD PAGE ============================== */
function DashboardPage() {
  const data = useMemo(() => generateForecast(90), []);
  const pieData = CHANNELS.map((c) => ({ name: c.name, value: c.base, color: c.color }));
  const [showCopilot, setShowCopilot] = useState(true);
  const [uploadState, setUploadState] = useState(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadState({ status: "validating", name: file.name });
    setTimeout(() => {
      setUploadState({
        status: "done",
        name: file.name,
        rows: 1240,
        missing: 18,
        outliers: 6,
        preview: CAMPAIGNS.slice(0, 4),
      });
    }, 1100);
  }

  return (
    <div className="p-6 space-y-6">
      {showCopilot && (
        <Card className="p-4 flex items-start gap-3" style={{ background: GRAD_SOFT, border: `1px solid ${C.primary}44` }}>
          <div className="rounded-lg p-2" style={{ background: GRAD }}>
            <Sparkles size={16} color="#fff" />
          </div>
          <div className="flex-1">
            <div style={{ color: C.text, fontWeight: 600, fontSize: 13.5 }}>AI Copilot</div>
            <p style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>{COPILOT_SUGGESTIONS[0].text}</p>
          </div>
          <button onClick={() => setShowCopilot(false)} style={{ color: C.muted }}><X size={16} /></button>
        </Card>
      )}

      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Predicted Revenue" value={1487000} prefix="₹" delta={18.2} icon={TrendingUp} />
        <KPICard label="Expected ROAS" value={3.9} decimals={1} suffix="x" delta={6.4} icon={GaugeIcon} />
        <KPICard label="Forecast Confidence" value={85} suffix="%" delta={2.1} icon={CheckCircle2} />
        <KPICard label="Marketing Health Score" value={78} suffix="/100" delta={4.3} icon={ShieldAlert} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <KPICard label="Active Campaigns" value={CAMPAIGNS.length} delta={12.5} />
        <KPICard label="Monthly Spend" value={114600} prefix="₹" delta={-3.2} />
        <KPICard label="ROI Change" value={22.4} suffix="%" delta={22.4} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-5 col-span-2">
          <SectionTitle icon={TrendingUp} title="Interactive Forecast Graph" subtitle="90-day revenue prediction with confidence band" />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.primary} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={C.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={C.border} vertical={false} />
              <XAxis dataKey="label" stroke={C.muted} fontSize={11} interval={14} />
              <YAxis stroke={C.muted} fontSize={11} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="upper" stroke="none" fill={C.secondary} fillOpacity={0.08} />
              <Area type="monotone" dataKey="lower" stroke="none" fill={C.bg} fillOpacity={1} />
              <Line type="monotone" dataKey="actual" stroke={C.text} strokeWidth={2} dot={false} name="Actual" />
              <Area type="monotone" dataKey="predicted" stroke={C.primary} strokeWidth={2.5} fill="url(#predGrad)" name="Predicted" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <SectionTitle title="Budget Allocation" />
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {pieData.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5" style={{ fontSize: 11, color: C.muted }}>
                <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />{d.name}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5">
          <SectionTitle title="Channel Performance (ROAS)" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={CHANNELS}>
              <CartesianGrid stroke={C.border} vertical={false} />
              <XAxis dataKey="name" stroke={C.muted} fontSize={10} angle={-20} textAnchor="end" height={50} />
              <YAxis stroke={C.muted} fontSize={11} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="roas" radius={[6, 6, 0, 0]}>
                {CHANNELS.map((c, i) => <Cell key={i} fill={c.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <SectionTitle title="Campaign Heatmap" subtitle="ROAS intensity by campaign" />
          <div className="grid grid-cols-4 gap-2 mt-1">
            {CAMPAIGNS.map((c, i) => {
              const t = Math.min(c.roas / 6, 1);
              const bg = `rgba(79,70,229,${0.15 + t * 0.6})`;
              return (
                <div key={i} className="rounded-lg p-2.5" style={{ background: bg, border: `1px solid ${C.border}` }}>
                  <div style={{ color: C.text, fontSize: 10.5, fontWeight: 600, lineHeight: 1.2 }}>{c.name}</div>
                  <div style={{ color: C.muted, fontSize: 10 }}>ROAS {c.roas}x</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <SectionTitle icon={UploadCloud} title="Upload Campaign Data" subtitle="Drag & drop a CSV to retrain the forecasting model" />
        <label
          className="flex flex-col items-center justify-center rounded-xl cursor-pointer"
          style={{ border: `1.5px dashed ${C.border}`, padding: "28px 16px", background: C.cardAlt }}
        >
          <UploadCloud size={26} color={C.secondary} />
          <span style={{ color: C.text, fontSize: 13, marginTop: 8 }}>Click or drop a .csv file here</span>
          <span style={{ color: C.muted, fontSize: 11.5, marginTop: 2 }}>spend, revenue, clicks, conversions, date columns supported</span>
          <input type="file" accept=".csv" className="hidden" onChange={handleFile} />
        </label>
        {uploadState?.status === "validating" && (
          <div className="mt-4 flex items-center gap-2" style={{ color: C.muted, fontSize: 13 }}>
            <div className="animate-pulse w-2 h-2 rounded-full" style={{ background: C.secondary }} />
            Validating {uploadState.name}…
          </div>
        )}
        {uploadState?.status === "done" && (
          <div className="mt-4 space-y-3">
            <div className="flex gap-3">
              <Pill color={C.success}>{uploadState.rows.toLocaleString()} rows parsed</Pill>
              <Pill color={C.warning}>{uploadState.missing} missing values</Pill>
              <Pill color={C.danger}>{uploadState.outliers} outliers flagged</Pill>
            </div>
            <div className="overflow-x-auto rounded-lg" style={{ border: `1px solid ${C.border}` }}>
              <table className="w-full" style={{ fontSize: 12 }}>
                <thead>
                  <tr style={{ background: C.cardAlt, color: C.muted }}>
                    <th className="text-left p-2">Campaign</th><th className="text-left p-2">Spend</th>
                    <th className="text-left p-2">Revenue</th><th className="text-left p-2">ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadState.preview.map((r, i) => (
                    <tr key={i} style={{ color: C.text, borderTop: `1px solid ${C.border}` }}>
                      <td className="p-2">{r.name}</td><td className="p-2">{fmtCurrency(r.spend)}</td>
                      <td className="p-2">{fmtCurrency(r.revenue)}</td><td className="p-2">{r.roas}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ============================== FORECAST PAGE ============================== */
function ForecastPage() {
  const [horizon, setHorizon] = useState(90);
  const [metric, setMetric] = useState("Revenue");
  const data = useMemo(() => generateForecast(horizon), [horizon]);
  const metrics = ["Revenue", "Conversions", "Clicks", "CPA", "CTR", "ROAS", "Profit"];

  return (
    <div className="p-6 space-y-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex gap-2">
            {[30, 60, 90, 180].map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium"
                style={{ background: horizon === h ? GRAD : C.cardAlt, color: horizon === h ? "#fff" : C.muted, border: `1px solid ${C.border}` }}
              >
                {h} Days
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {metrics.map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: metric === m ? `${C.secondary}33` : "transparent", color: metric === m ? C.text : C.muted, border: `1px solid ${metric === m ? C.secondary : C.border}` }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.primary} stopOpacity={0.4} />
                <stop offset="100%" stopColor={C.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={C.border} vertical={false} />
            <XAxis dataKey="label" stroke={C.muted} fontSize={11} interval={Math.floor(horizon / 8)} />
            <YAxis stroke={C.muted} fontSize={11} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="upper" stroke={C.secondary} strokeOpacity={0.3} fill={C.secondary} fillOpacity={0.06} name="Upper bound" />
            <Area type="monotone" dataKey="lower" stroke="none" fill={C.bg} fillOpacity={1} name="Lower bound" />
            <Line type="monotone" dataKey="actual" stroke={C.text} strokeWidth={2} dot={false} name="Actual" />
            <Area type="monotone" dataKey="predicted" stroke={C.primary} strokeWidth={2.5} fill="url(#fGrad)" name="Predicted" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
      <div className="grid grid-cols-3 gap-4">
        <KPICard label={`${metric} Prediction Interval`} value={85} suffix="%" />
        <KPICard label="Confidence" value={85} suffix="%" />
        <KPICard label={`Forecasted ${metric} (${horizon}d)`} value={1487000 * (horizon / 90)} prefix="₹" />
      </div>
      <Card className="p-5">
        <SectionTitle icon={Lightbulb} title="Forecast Explanation" />
        <p style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.7 }}>
          The model projects steady {metric.toLowerCase()} growth over the next {horizon} days, driven primarily by
          sustained performance on Google Search and Email retargeting. Confidence narrows slightly toward the end of
          the window as seasonal variance and market uncertainty compound — this is reflected in the widening
          prediction interval. Historical revenue trend and holiday seasonality remain the two strongest contributing
          factors identified by the model.
        </p>
      </Card>
    </div>
  );
}

/* ============================== SCENARIO SIMULATOR ============================== */
function ScenarioPage() {
  return (
    <div className="p-6 space-y-6">
      <Card className="p-5">
        <SectionTitle icon={GitBranch} title="Multi-Scenario Forecast" subtitle="Five AI-generated futures based on current market signals" />
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={SCENARIOS}>
            <CartesianGrid stroke={C.border} vertical={false} />
            <XAxis dataKey="name" stroke={C.muted} fontSize={11} />
            <YAxis stroke={C.muted} fontSize={11} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="revenue" radius={[6, 6, 0, 0]} name="Revenue">
              {SCENARIOS.map((s, i) => <Cell key={i} fill={s.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <div className="grid grid-cols-5 gap-4">
        {SCENARIOS.map((s, i) => (
          <Card key={i} className="p-4">
            <div className="w-2 h-2 rounded-full mb-3" style={{ background: s.color }} />
            <div style={{ color: C.text, fontWeight: 600, fontSize: 13.5, marginBottom: 10 }}>{s.name}</div>
            <div className="space-y-2" style={{ fontSize: 12 }}>
              <div className="flex justify-between"><span style={{ color: C.muted }}>Revenue</span><span style={{ color: C.text }}>{fmtCurrency(s.revenue)}</span></div>
              <div className="flex justify-between"><span style={{ color: C.muted }}>ROAS</span><span style={{ color: C.text }}>{s.roas}x</span></div>
              <div className="flex justify-between"><span style={{ color: C.muted }}>Profit</span><span style={{ color: C.text }}>{fmtCurrency(s.profit)}</span></div>
              <div className="flex justify-between"><span style={{ color: C.muted }}>Risk</span><span style={{ color: s.risk > 55 ? C.danger : s.risk > 35 ? C.warning : C.success }}>{s.risk}/100</span></div>
              <div className="flex justify-between"><span style={{ color: C.muted }}>Confidence</span><span style={{ color: C.text }}>{s.confidence}%</span></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ============================== BUDGET OPTIMIZER (+ WHAT-IF) ============================== */
function BudgetOptimizerPage() {
  const [total, setTotal] = useState(150000);
  const [tab, setTab] = useState("optimizer");
  const [sliders, setSliders] = useState(Object.fromEntries(CHANNELS.map((c) => [c.key, c.base])));

  const optimized = useMemo(() => {
    const weight = CHANNELS.map((c) => c.roas);
    const sum = weight.reduce((a, b) => a + b, 0);
    return CHANNELS.map((c, i) => ({ ...c, pct: Math.round((weight[i] / sum) * 100) }));
  }, []);

  const sliderSum = Object.values(sliders).reduce((a, b) => a + b, 0) || 1;
  const simRevenue = useMemo(() => {
    return CHANNELS.reduce((acc, c) => acc + (sliders[c.key] / sliderSum) * total * (c.roas / 4), 0);
  }, [sliders, total, sliderSum]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex gap-2">
        <button onClick={() => setTab("optimizer")} className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: tab === "optimizer" ? GRAD : C.cardAlt, color: tab === "optimizer" ? "#fff" : C.muted }}>
          AI Budget Optimizer
        </button>
        <button onClick={() => setTab("whatif")} className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: tab === "whatif" ? GRAD : C.cardAlt, color: tab === "whatif" ? "#fff" : C.muted }}>
          What-If Simulator
        </button>
      </div>

      {tab === "optimizer" ? (
        <>
          <Card className="p-5">
            <SectionTitle icon={Wallet} title="Total Marketing Budget" />
            <input
              type="range" min={20000} max={400000} step={5000} value={total}
              onChange={(e) => setTotal(Number(e.target.value))} className="w-full accent-indigo-500"
            />
            <div style={{ color: C.text, fontSize: 24, fontWeight: 700, marginTop: 8 }}>{fmtCurrency(total)}</div>
          </Card>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-5">
              <SectionTitle title="Recommended Allocation" />
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={optimized} dataKey="pct" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {optimized.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-5">
              <SectionTitle title="Allocation Breakdown" />
              <div className="space-y-2.5">
                {optimized.map((c, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1" style={{ fontSize: 12.5 }}>
                      <span style={{ color: C.text }}>{c.name}</span>
                      <span style={{ color: C.muted }}>{c.pct}% · {fmtCurrency(total * c.pct / 100)}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: C.cardAlt }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <KPICard label="Expected Revenue" value={total * 3.9} prefix="₹" />
            <KPICard label="Expected ROAS" value={3.9} decimals={1} suffix="x" />
            <KPICard label="Risk" value={32} suffix="/100" />
            <KPICard label="Budget Efficiency" value={91} suffix="%" />
          </div>
        </>
      ) : (
        <>
          <Card className="p-5">
            <SectionTitle icon={Sparkles} title="Adjust Channel Sliders" subtitle="Metrics update instantly as you drag" />
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {CHANNELS.map((c) => (
                <div key={c.key}>
                  <div className="flex justify-between mb-1" style={{ fontSize: 12.5 }}>
                    <span style={{ color: C.text }}>{c.name}</span>
                    <span style={{ color: C.muted }}>{sliders[c.key]}%</span>
                  </div>
                  <input
                    type="range" min={0} max={60} value={sliders[c.key]}
                    onChange={(e) => setSliders((s) => ({ ...s, [c.key]: Number(e.target.value) }))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              ))}
            </div>
          </Card>
          <div className="grid grid-cols-4 gap-4">
            <KPICard label="Simulated Revenue" value={simRevenue} prefix="₹" />
            <KPICard label="Simulated Profit" value={simRevenue * 0.31} prefix="₹" />
            <KPICard label="Conversions" value={simRevenue / 62} decimals={0} />
            <KPICard label="Confidence" value={Math.max(50, 90 - Math.abs(sliderSum - 100) * 0.5)} suffix="%" />
          </div>
        </>
      )}
    </div>
  );
}

/* ============================== CAMPAIGN ANALYSIS ============================== */
function CampaignsPage() {
  return (
    <div className="p-6 space-y-6">
      <Card className="p-5">
        <SectionTitle icon={BarChart3} title="Campaign Performance" subtitle={`${CAMPAIGNS.length} active campaigns`} />
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: 12.5 }}>
            <thead>
              <tr style={{ color: C.muted, textAlign: "left" }}>
                {["Campaign", "Channel", "Spend", "Revenue", "Clicks", "Conv.", "CTR", "CPA", "ROAS"].map((h) => (
                  <th key={h} className="p-2 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CAMPAIGNS.map((c, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${C.border}`, color: C.text }}>
                  <td className="p-2 font-medium">{c.name}</td>
                  <td className="p-2" style={{ color: C.muted }}>{c.channel}</td>
                  <td className="p-2">{fmtCurrency(c.spend)}</td>
                  <td className="p-2">{fmtCurrency(c.revenue)}</td>
                  <td className="p-2">{c.clicks.toLocaleString()}</td>
                  <td className="p-2">{c.conv}</td>
                  <td className="p-2">{c.ctr}%</td>
                  <td className="p-2">₹{c.cpa}</td>
                  <td className="p-2"><Pill color={c.roas > 4 ? C.success : c.roas > 2 ? C.warning : C.danger}>{c.roas}x</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ============================== RISK RADAR ============================== */
function RiskPage() {
  const healthScore = 78;
  const subs = [
    { name: "Campaign Quality", value: 82 }, { name: "Budget Efficiency", value: 91 },
    { name: "Forecast Stability", value: 74 }, { name: "Risk Level", value: 61 }, { name: "ROI Potential", value: 85 },
  ];
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-5 col-span-2">
          <SectionTitle icon={RadarIcon} title="Risk Radar" subtitle="Composite risk exposure across five dimensions" />
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={RISK_DATA}>
              <PolarGrid stroke={C.border} />
              <PolarAngleAxis dataKey="risk" stroke={C.muted} fontSize={11} />
              <PolarRadiusAxis stroke={C.border} tick={false} />
              <Radar dataKey="value" stroke={C.secondary} fill={C.secondary} fillOpacity={0.35} />
              <Tooltip content={<ChartTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5 flex flex-col items-center justify-center">
          <SectionTitle title="Marketing Health Score" />
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: healthScore, fill: C.primary }]} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={12} background={{ fill: C.cardAlt }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: -140, color: C.text, fontSize: 32, fontWeight: 700 }}>{healthScore}</div>
          <div style={{ color: C.muted, fontSize: 12, marginTop: 108 }}>out of 100</div>
        </Card>
      </div>
      <Card className="p-5">
        <SectionTitle title="Sub-Scores" />
        <div className="grid grid-cols-5 gap-4">
          {subs.map((s, i) => (
            <div key={i}>
              <div className="flex justify-between mb-1" style={{ fontSize: 12 }}>
                <span style={{ color: C.text }}>{s.name}</span><span style={{ color: C.muted }}>{s.value}</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: C.cardAlt }}>
                <div className="h-1.5 rounded-full" style={{ width: `${s.value}%`, background: GRAD }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ============================== ANOMALY DETECTION ============================== */
function AnomalyPage() {
  const data = useMemo(() => generateForecast(30).map((d) => ({
    ...d, anomaly: Math.abs(d.day) % 9 === 3 ? (d.actual || d.predicted) : null,
  })), []);
  return (
    <div className="p-6 space-y-6">
      <Card className="p-5">
        <SectionTitle icon={AlertTriangle} title="Anomaly Detection" subtitle="Automated spike & drop detection across key metrics" />
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid stroke={C.border} vertical={false} />
            <XAxis dataKey="label" stroke={C.muted} fontSize={11} interval={4} />
            <YAxis stroke={C.muted} fontSize={11} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="predicted" stroke={C.primary} strokeWidth={2} dot={false} />
            <Scatter dataKey="anomaly" fill={C.danger} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
      <div className="grid grid-cols-3 gap-4">
        {ANOMALIES.map((a, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Pill color={a.type === "spike" ? C.warning : C.danger}>{a.metric}</Pill>
              <span style={{ color: C.muted, fontSize: 11 }}>{a.day}</span>
            </div>
            <div style={{ color: a.type === "spike" ? C.warning : C.danger, fontSize: 20, fontWeight: 700 }}>{a.change}</div>
            <p style={{ color: C.muted, fontSize: 12.5, marginTop: 6, lineHeight: 1.5 }}>{a.note}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ============================== BENCHMARKING ============================== */
function BenchmarkPage() {
  return (
    <div className="p-6 space-y-6">
      <Card className="p-5">
        <SectionTitle icon={BarChart3} title="Competitor Benchmarking" subtitle="Your performance vs. industry averages" />
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={BENCHMARK}>
            <CartesianGrid stroke={C.border} vertical={false} />
            <XAxis dataKey="metric" stroke={C.muted} fontSize={11} />
            <YAxis stroke={C.muted} fontSize={11} />
            <Tooltip content={<ChartTooltip />} />
            <Legend />
            <Bar dataKey="you" name="You" fill={C.primary} radius={[6, 6, 0, 0]} />
            <Bar dataKey="industry" name="Industry Avg" fill={C.cardAlt} stroke={C.border} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <div className="grid grid-cols-4 gap-4">
        {BENCHMARK.map((b, i) => {
          const better = b.metric === "CPA ($)" ? b.you < b.industry : b.you > b.industry;
          return (
            <Card key={i} className="p-4">
              <div style={{ color: C.muted, fontSize: 12 }}>{b.metric}</div>
              <div style={{ color: C.text, fontSize: 22, fontWeight: 700, marginTop: 4 }}>{b.you}</div>
              <div className="flex items-center gap-1 mt-1" style={{ color: better ? C.success : C.danger, fontSize: 12 }}>
                {better ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                vs {b.industry} industry avg
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ============================== CARBON IMPACT ============================== */
function CarbonPage() {
  const impressions = 18400000;
  const co2PerThousand = 0.4;
  const totalCO2 = (impressions / 1000) * co2PerThousand;
  const treesEquivalent = Math.round(totalCO2 / 21);
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <KPICard label="Estimated Carbon Footprint" value={totalCO2} suffix=" kg CO₂e" decimals={0} icon={Leaf} />
        <KPICard label="Total Ad Impressions" value={impressions} icon={BarChart3} />
        <KPICard label="Trees Needed to Offset / yr" value={treesEquivalent} icon={Leaf} />
      </div>
      <Card className="p-5">
        <SectionTitle icon={Leaf} title="Carbon Impact by Channel" subtitle="Estimated emissions from digital ad delivery" />
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={CHANNELS.map((c) => ({ name: c.name, co2: Math.round(c.base * 62.4) }))}>
            <CartesianGrid stroke={C.border} vertical={false} />
            <XAxis dataKey="name" stroke={C.muted} fontSize={10} angle={-20} textAnchor="end" height={50} />
            <YAxis stroke={C.muted} fontSize={11} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="co2" name="kg CO₂e" radius={[6, 6, 0, 0]} fill={C.success} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card className="p-5">
        <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7 }}>
          Estimates are modeled from ad impression volume and average data-transfer energy intensity per channel.
          Display and video formats tend to carry a heavier footprint than text-based search or email due to
          creative file size. Shifting spend toward lighter-weight formats can reduce environmental impact alongside
          cost.
        </p>
      </Card>
    </div>
  );
}

/* ============================== EXPLAINABILITY ============================== */
function ExplainPage() {
  const sorted = [...SHAP_FEATURES].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  return (
    <div className="p-6 space-y-6">
      <Card className="p-5">
        <SectionTitle icon={Lightbulb} title="Explainable AI" subtitle="SHAP feature importance for the current revenue forecast" />
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sorted} layout="vertical" margin={{ left: 40 }}>
            <CartesianGrid stroke={C.border} horizontal={false} />
            <XAxis type="number" stroke={C.muted} fontSize={11} />
            <YAxis type="category" dataKey="name" stroke={C.muted} fontSize={11} width={190} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="impact" radius={[0, 6, 6, 0]}>
              {sorted.map((f, i) => <Cell key={i} fill={f.impact > 0 ? C.success : C.danger} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card className="p-5">
        <SectionTitle title="Top Factors" />
        <div className="space-y-3">
          {sorted.map((f, i) => (
            <div key={i} className="flex items-center justify-between">
              <span style={{ color: C.text, fontSize: 13 }}>{f.name}</span>
              <Pill color={f.impact > 0 ? C.success : C.danger}>{f.impact > 0 ? "+" : ""}{(f.impact * 100).toFixed(0)}% impact</Pill>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ============================== AI ASSISTANT ============================== */
function getAIResponse(q) {
  const s = q.toLowerCase();
  if (s.includes("revenue") && s.includes("decrease")) return "Revenue dipped mainly due to a ROAS drop on Google Search (competitor bidding surge) and early budget saturation on Meta Ads. Display spend also underperformed this period.";
  if (s.includes("meta")) return "Increasing Meta by 20% is projected to lift revenue by roughly 7%, but ROAS would soften from 3.1x to about 2.7x due to diminishing returns above ₹28,000/day.";
  if (s.includes("safest") || s.includes("safe")) return "The safest allocation keeps Google Search and Email as the largest shares (they carry the lowest risk and highest ROAS), with Display capped below 10% of total budget.";
  if (s.includes("strategy") || s.includes("recommend")) return "Recommended strategy: shift 8% of budget from Display to Google Search, scale Email retargeting by 15%, and hold Meta flat until saturation clears.";
  if (s.includes("explain") || s.includes("prediction")) return "The forecast weighs historical revenue trend (31%) and Google Search spend (24%) most heavily, with holiday seasonality adding a further 18% positive influence.";
  return "Based on current data, I'd focus on Google Search and Email for near-term efficiency, monitor Meta for saturation, and keep an eye on the rising channel-dependency risk on Google Ads.";
}

function AIAssistantPage() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi, I'm your ForecastIQ copilot. Ask me why revenue moved, what a budget shift would do, or what strategy I'd recommend." },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function send(text) {
    const q = text ?? input;
    if (!q.trim()) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setTimeout(() => {
      const reply = getAIResponse(q);
      setMessages((m) => [...m, { role: "ai", text: reply }]);
    }, 500);
  }

  function speak(text) {
    try {
      const utter = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utter);
    } catch (e) { setVoiceSupported(false); }
  }

  function toggleMic() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setVoiceSupported(false); return; }
    const rec = new SR();
    rec.lang = "en-US";
    rec.onresult = (e) => send(e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
  }

  const suggestions = ["Why did revenue decrease?", "What if I increase Meta by 20%?", "Show safest budget", "Recommend best strategy"];

  return (
    <div className="p-6 h-full flex flex-col" style={{ maxHeight: "calc(100vh - 90px)" }}>
      <Card className="p-5 flex-1 flex flex-col overflow-hidden">
        <SectionTitle icon={MessageSquare} title="AI Assistant" subtitle={!voiceSupported ? "Voice not supported in this browser" : "Ask questions with text or voice"} />
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
          {messages.map((m, i) => (
            <div key={i} className="flex" style={{ justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div className="rounded-2xl px-4 py-2.5 max-w-[75%]" style={{
                background: m.role === "user" ? GRAD : C.cardAlt, color: m.role === "user" ? "#fff" : C.text, fontSize: 13.5, lineHeight: 1.5,
              }}>
                {m.text}
                {m.role === "ai" && (
                  <button onClick={() => speak(m.text)} className="ml-2 align-middle" style={{ color: C.muted }}>
                    <Volume2 size={13} className="inline" />
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => send(s)} className="px-3 py-1.5 rounded-full text-xs"
              style={{ background: C.cardAlt, color: C.muted, border: `1px solid ${C.border}` }}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleMic} className="rounded-xl p-2.5" style={{ background: listening ? C.danger : C.cardAlt, border: `1px solid ${C.border}` }}>
            <Mic size={16} color={listening ? "#fff" : C.muted} />
          </button>
          <input
            value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask ForecastIQ anything…" className="flex-1 rounded-xl px-4 py-2.5"
            style={{ background: C.cardAlt, color: C.text, border: `1px solid ${C.border}`, outline: "none", fontSize: 13.5 }}
          />
          <button onClick={() => send()} className="rounded-xl p-2.5" style={{ background: GRAD }}>
            <Send size={16} color="#fff" />
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ============================== REPORTS / EXECUTIVE BRIEFING ============================== */
function ReportsPage() {
  const [generated, setGenerated] = useState(false);

  function download() {
    const content = `FORECASTIQ AI — EXECUTIVE BRIEFING
Generated: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY
Revenue is forecast to grow 18.2% over the next 90 days, driven by Google Search
and Email retargeting performance. Overall Marketing Health Score: 78/100.

FORECAST
90-day predicted revenue: ₹1,487,000
Expected ROAS: 3.9x
Forecast confidence: 85%

TOP RECOMMENDATIONS
- Increase Google Search budget allocation by 8%
- Reduce Display Ads spend; efficiency below industry benchmark
- Shift ₹50,000 toward Meta Lookalike Scale campaign
- Scale Email Retargeting by 15%

KEY RISKS
- Channel dependency risk rising (48% revenue reliance on Google Ads)
- Meta Ads approaching budget saturation
- Seasonality risk elevated heading into holiday period

FUTURE OUTLOOK
Holiday seasonality index trending upward, suggesting a 14% demand lift in the
coming weeks. Maintaining current diversification strategy is advised.
`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "ForecastIQ_Executive_Briefing.txt"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 space-y-6">
      <Card className="p-5 flex items-center justify-between">
        <div>
          <SectionTitle icon={FileText} title="Executive Briefing" subtitle="One-click C-level summary of forecast, risk, and recommendations" />
        </div>
        <button onClick={() => setGenerated(true)} className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2" style={{ background: GRAD, color: "#fff" }}>
          <Sparkles size={15} /> Generate Briefing
        </button>
      </Card>

      {generated && (
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div style={{ color: C.text, fontSize: 18, fontWeight: 700 }}>Executive Summary</div>
            <button onClick={download} className="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5" style={{ background: C.cardAlt, color: C.text, border: `1px solid ${C.border}` }}>
              <Download size={13} /> Download
            </button>
          </div>
          <p style={{ color: C.muted, fontSize: 13.5, lineHeight: 1.7 }}>
            Revenue is forecast to grow <b style={{ color: C.text }}>18.2%</b> over the next 90 days, led by Google
            Search and Email retargeting. Overall Marketing Health Score sits at <b style={{ color: C.text }}>78/100</b>.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div><div style={{ color: C.muted, fontSize: 12 }}>90-Day Revenue</div><div style={{ color: C.text, fontSize: 20, fontWeight: 700 }}>₹1,487,000</div></div>
            <div><div style={{ color: C.muted, fontSize: 12 }}>Expected ROAS</div><div style={{ color: C.text, fontSize: 20, fontWeight: 700 }}>3.9x</div></div>
            <div><div style={{ color: C.muted, fontSize: 12 }}>Confidence</div><div style={{ color: C.text, fontSize: 20, fontWeight: 700 }}>85%</div></div>
          </div>
          <div>
            <div style={{ color: C.text, fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Recommendations</div>
            <ul className="space-y-1.5" style={{ color: C.muted, fontSize: 13 }}>
              <li>• Increase Google Search budget allocation by 8%</li>
              <li>• Reduce Display Ads spend — below industry efficiency benchmark</li>
              <li>• Shift ₹50,000 toward Meta Lookalike Scale campaign</li>
              <li>• Scale Email Retargeting by 15%</li>
            </ul>
          </div>
          <div>
            <div style={{ color: C.text, fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Key Risks</div>
            <ul className="space-y-1.5" style={{ color: C.muted, fontSize: 13 }}>
              <li>• Channel dependency risk rising — 48% revenue reliance on Google Ads</li>
              <li>• Meta Ads approaching budget saturation</li>
              <li>• Seasonality risk elevated heading into holiday period</li>
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ============================== SETTINGS ============================== */
function SettingsPage({ lang, setLang }) {
  return (
    <div className="p-6 space-y-6">
      <Card className="p-5">
        <SectionTitle icon={Globe} title="Language" subtitle="Switch the interface language for global teams" />
        <div className="flex gap-2">
          {[{ id: "en", label: "English" }, { id: "es", label: "Español" }, { id: "fr", label: "Français" }].map((l) => (
            <button key={l.id} onClick={() => setLang(l.id)} className="px-4 py-2 rounded-lg text-sm"
              style={{ background: lang === l.id ? GRAD : C.cardAlt, color: lang === l.id ? "#fff" : C.muted }}>
              {l.label}
            </button>
          ))}
        </div>
      </Card>
      <Card className="p-5">
        <SectionTitle icon={SettingsIcon} title="Platform" />
        <p style={{ color: C.muted, fontSize: 13 }}>Dark mode enabled · Premium enterprise theme · Data source: mock hackathon dataset.</p>
      </Card>
    </div>
  );
}

/* ============================== COPILOT WIDGET ============================== */
function CopilotWidget() {
  const [idx, setIdx] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % COPILOT_SUGGESTIONS.length), 8000);
    return () => clearInterval(t);
  }, []);
  if (dismissed) return null;
  const s = COPILOT_SUGGESTIONS[idx];
  const Icon = s.icon;
  return (
    <div className="fixed bottom-5 right-5 w-80 rounded-2xl p-4 z-50" style={{
      background: "#17171bee", border: `1px solid ${C.border}`, boxShadow: "0 12px 32px rgba(0,0,0,0.5)", backdropFilter: "blur(10px)",
    }}>
      <div className="flex items-start gap-3">
        <div className="rounded-lg p-2 shrink-0" style={{ background: `${s.color}22` }}>
          <Icon size={15} color={s.color} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span style={{ color: C.text, fontSize: 12, fontWeight: 600 }}>Copilot suggestion</span>
          </div>
          <p style={{ color: C.muted, fontSize: 12.5, lineHeight: 1.5 }}>{s.text}</p>
        </div>
        <button onClick={() => setDismissed(true)} style={{ color: C.muted }}><X size={14} /></button>
      </div>
    </div>
  );
}

/* ============================== APP ROOT ============================== */
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [lang, setLang] = useState("en");
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const email = await getSession();
      if (email) {
        const existing = await dbGetUser(email);
        if (existing) setUser(existing);
        else await clearSession();
      }
      setAuthChecked(true);
    })();
  }, []);

  async function handleLogout() {
    await clearSession();
    setUser(null);
    setPage("dashboard");
  }

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: C.bg }}>
        <Loader2 size={22} color={C.secondary} className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage onAuthenticated={setUser} />;
  }

  const pages = {
    dashboard: <DashboardPage />,
    forecast: <ForecastPage />,
    scenario: <ScenarioPage />,
    budget: <BudgetOptimizerPage />,
    campaigns: <CampaignsPage />,
    risk: <RiskPage />,
    anomaly: <AnomalyPage />,
    benchmark: <BenchmarkPage />,
    carbon: <CarbonPage />,
    explain: <ExplainPage />,
    assistant: <AIAssistantPage />,
    reports: <ReportsPage />,
    settings: <SettingsPage lang={lang} setLang={setLang} />,
  };

  return (
    <div className="flex" style={{ background: C.bg, height: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Sidebar page={page} setPage={setPage} lang={lang} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar lang={lang} setLang={setLang} page={page} user={user} onLogout={handleLogout} />
        <div className="flex-1 overflow-y-auto">{pages[page]}</div>
      </div>
      <CopilotWidget />
    </div>
  );
}
