import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ─────────────────────────────────────────────
// GET YOUR FREE KEY AT: https://finnhub.io/register
// Paste it below — takes 30 seconds, no credit card
// ─────────────────────────────────────────────
const FINNHUB_KEY = ""; // <-- paste your key here

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #f5f5f7;
    --white: #ffffff;
    --border: rgba(0,0,0,0.08);
    --border-strong: rgba(0,0,0,0.13);
    --text: #1d1d1f;
    --secondary: #6e6e73;
    --tertiary: #aeaeb2;
    --accent: #0071e3;
    --accent-light: rgba(0,113,227,0.08);
    --green: #34c759;
    --green-bg: rgba(52,199,89,0.10);
    --red: #ff3b30;
    --red-bg: rgba(255,59,48,0.10);
    --amber: #ff9500;
    --radius: 18px;
    --radius-sm: 10px;
    --font: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    --shadow: 0 2px 16px rgba(0,0,0,0.06);
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font); min-height: 100vh; -webkit-font-smoothing: antialiased; }
  .app { max-width: 980px; margin: 0 auto; padding: 0 20px 80px; }

  .nav { display: flex; align-items: center; justify-content: space-between; padding: 22px 0 20px; }
  .logo { font-size: 17px; font-weight: 600; letter-spacing: -0.3px; color: var(--text); }
  .logo-accent { color: var(--accent); }
  .nav-date { font-size: 13px; color: var(--tertiary); }

  .search-card { background: var(--white); border-radius: var(--radius); padding: 18px 22px; box-shadow: var(--shadow); margin-bottom: 14px; display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
  .search-row { display: flex; gap: 8px; align-items: center; }
  .search-input { width: 148px; background: var(--bg); border: 1.5px solid transparent; border-radius: var(--radius-sm); color: var(--text); font-family: var(--font); font-size: 15px; font-weight: 500; padding: 9px 14px; letter-spacing: 1.5px; text-transform: uppercase; outline: none; transition: border-color 0.18s, background 0.18s; }
  .search-input:focus { border-color: var(--accent); background: #fff; }
  .search-input::placeholder { color: var(--tertiary); font-size: 13px; letter-spacing: 0; text-transform: none; font-weight: 400; }
  .search-btn { background: var(--accent); color: #fff; font-family: var(--font); font-size: 14px; font-weight: 500; padding: 9px 18px; border: none; border-radius: var(--radius-sm); cursor: pointer; transition: opacity 0.15s, transform 0.1s; }
  .search-btn:hover { opacity: 0.87; }
  .search-btn:active { transform: scale(0.97); }
  .search-btn:disabled { opacity: 0.38; cursor: not-allowed; }
  .quick-row { display: flex; gap: 6px; flex-wrap: wrap; }
  .q-pill { font-size: 12px; font-weight: 500; color: var(--secondary); background: var(--bg); border-radius: 20px; padding: 5px 13px; cursor: pointer; transition: all 0.14s; border: 1px solid transparent; }
  .q-pill:hover { background: var(--accent-light); color: var(--accent); border-color: rgba(0,113,227,0.2); }

  .api-banner { background: #fff8e6; border: 1px solid #ffd60a30; border-radius: var(--radius-sm); padding: 14px 18px; margin-bottom: 14px; font-size: 13px; color: #6e4a00; line-height: 1.6; }
  .api-banner strong { color: #3a2800; }
  .api-banner a { color: var(--accent); text-decoration: none; font-weight: 500; }

  .hero { background: var(--white); border-radius: var(--radius); padding: 30px 28px 24px; box-shadow: var(--shadow); margin-bottom: 14px; }
  .hero-top { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 22px; }
  .hero-ticker { font-size: 11px; font-weight: 500; color: var(--tertiary); letter-spacing: 1px; margin-bottom: 5px; text-transform: uppercase; }
  .hero-name { font-size: 24px; font-weight: 600; letter-spacing: -0.4px; color: var(--text); margin-bottom: 3px; }
  .hero-sub { font-size: 12px; color: var(--tertiary); }
  .hero-right { text-align: right; }
  .hero-price { font-size: 42px; font-weight: 300; letter-spacing: -2px; color: var(--text); line-height: 1; }
  .badge { display: inline-flex; align-items: center; gap: 5px; margin-top: 8px; font-size: 13px; font-weight: 500; padding: 4px 12px; border-radius: 20px; }
  .badge-up { background: var(--green-bg); color: var(--green); }
  .badge-down { background: var(--red-bg); color: var(--red); }

  .chart-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 14px; }
  .range-group { display: flex; gap: 3px; background: var(--bg); border-radius: 8px; padding: 3px; }
  .range-btn { font-size: 12px; font-weight: 500; color: var(--secondary); padding: 5px 11px; border-radius: 6px; cursor: pointer; border: none; background: transparent; font-family: var(--font); transition: all 0.14s; }
  .range-btn.active { background: var(--white); color: var(--text); box-shadow: 0 1px 4px rgba(0,0,0,0.09); }
  .ma-group { display: flex; gap: 6px; }
  .ma-btn { font-size: 12px; font-weight: 500; color: var(--secondary); padding: 5px 12px; border-radius: 6px; border: 1.5px solid var(--border-strong); background: transparent; font-family: var(--font); cursor: pointer; transition: all 0.14s; }
  .ma-btn.amber { background: rgba(255,149,0,0.10); color: var(--amber); border-color: var(--amber); }
  .ma-btn.blue { background: var(--accent-light); color: var(--accent); border-color: var(--accent); }

  .ct { background: rgba(29,29,31,0.85); backdrop-filter: blur(10px); border-radius: 10px; padding: 10px 14px; font-family: var(--font); font-size: 12px; color: #fff; }
  .ct-date { color: rgba(255,255,255,0.45); font-size: 11px; margin-bottom: 3px; }
  .ct-val { font-weight: 500; }

  .section { margin-bottom: 14px; }
  .section-title { font-size: 19px; font-weight: 600; letter-spacing: -0.3px; color: var(--text); margin-bottom: 10px; padding-left: 2px; }

  .mgrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5px; background: var(--border); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); }
  @media (max-width: 720px) { .mgrid { grid-template-columns: repeat(2, 1fr); } }

  .mcell { background: var(--white); padding: 18px 20px; transition: background 0.12s; }
  .mcell:hover { background: #fafafa; }
  .mlbl { font-size: 10px; font-weight: 500; color: var(--tertiary); letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 8px; }
  .mval { font-size: 20px; font-weight: 400; letter-spacing: -0.5px; color: var(--text); margin-bottom: 3px; }
  .mval.pos { color: var(--green); }
  .mval.neg { color: var(--red); }
  .mval.cau { color: var(--amber); }
  .mhint { font-size: 11px; color: var(--tertiary); }

  .empty-card { background: var(--white); border-radius: var(--radius); padding: 80px 40px; text-align: center; box-shadow: var(--shadow); }
  .empty-icon { font-size: 36px; opacity: 0.25; margin-bottom: 14px; }
  .empty-t { font-size: 17px; font-weight: 500; color: var(--secondary); margin-bottom: 5px; }
  .empty-s { font-size: 13px; color: var(--tertiary); }

  .spin-wrap { display: flex; justify-content: center; padding: 80px 0; }
  .spinner { width: 26px; height: 26px; border: 2px solid var(--border-strong); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .err-bar { background: var(--red-bg); color: var(--red); border-radius: var(--radius-sm); padding: 12px 18px; font-size: 13px; font-weight: 500; margin-bottom: 12px; }

  .fade { animation: fadeUp 0.32s cubic-bezier(0.25,0.46,0.45,0.94) both; }
  .d1 { animation-delay: 0.04s; } .d2 { animation-delay: 0.09s; }
  .d3 { animation-delay: 0.14s; } .d4 { animation-delay: 0.19s; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
`;

const fmt = (n, d = 2) => (n == null || isNaN(n)) ? "—" : Number(n).toFixed(d);
const fmtB = (n) => {
  if (n == null || isNaN(n)) return "—";
  const a = Math.abs(n);
  if (a >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (a >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (a >= 1e6) return (n / 1e6).toFixed(2) + "M";
  return Number(n).toFixed(2);
};
const fmtP = (n) => (n == null || isNaN(n)) ? "—" : (n * 100).toFixed(2) + "%";
const sgn = (n) => n > 0 ? "+" : "";

function calcRSI(closes, period = 14) {
  if (closes.length < period + 1) return null;
  let g = 0, l = 0;
  for (let i = 1; i <= period; i++) { const d = closes[i] - closes[i-1]; if (d > 0) g += d; else l -= d; }
  let ag = g / period, al = l / period;
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i-1];
    ag = (ag * (period - 1) + (d > 0 ? d : 0)) / period;
    al = (al * (period - 1) + (d < 0 ? -d : 0)) / period;
  }
  if (al === 0) return 100;
  return 100 - 100 / (1 + ag / al);
}
function calcMA(closes, p) {
  if (closes.length < p) return null;
  return closes.slice(-p).reduce((a, b) => a + b, 0) / p;
}

const BASE = "https://finnhub.io/api/v1";
const QUICK = ["AAPL", "TSLA", "NVDA", "MSFT", "AMZN", "GOOGL", "META", "JPM"];
const RANGES = [
  { label: "1M", days: 30 }, { label: "3M", days: 90 }, { label: "6M", days: 180 },
  { label: "1Y", days: 365 }, { label: "2Y", days: 730 }, { label: "5Y", days: 1825 },
];

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="ct">
      <div className="ct-date">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="ct-val" style={{ color: p.color }}>{p.name}: ${Number(p.value).toFixed(2)}</div>
      ))}
    </div>
  );
};

export default function StockAnalyzer() {
  const [apiKey, setApiKey] = useState(FINNHUB_KEY);
  const [keyInput, setKeyInput] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quote, setQuote] = useState(null);      // { q, profile, metrics }
  const [chartData, setChartData] = useState([]);
  const [rangeIdx, setRangeIdx] = useState(1);   // default 3M
  const [showMA50, setShowMA50] = useState(false);
  const [showMA200, setShowMA200] = useState(false);
  const [now, setNow] = useState("");

  useEffect(() => {
    const d = new Date();
    setNow(d.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, month: "short", day: "numeric", year: "numeric" }));
  }, []);

  const key = apiKey.trim();

  async function fh(path) {
    const sep = path.includes("?") ? "&" : "?";
    const res = await fetch(`${BASE}${path}${sep}token=${key}`);
    if (!res.ok) throw new Error("API error " + res.status);
    return res.json();
  }

  async function fetchStock(sym) {
    if (!key) { setError("Please enter your Finnhub API key above."); return; }
    setLoading(true); setError(""); setQuote(null); setChartData([]);
    try {
      const [q, profile, metrics] = await Promise.all([
        fh(`/quote?symbol=${sym}`),
        fh(`/stock/profile2?symbol=${sym}`),
        fh(`/stock/metric?symbol=${sym}&metric=all`),
      ]);
      if (!q || q.c === 0) throw new Error("No data");
      setQuote({ q, profile, metrics: metrics?.metric || {} });
      await fetchChart(sym, rangeIdx);
    } catch (e) {
      setError(`Could not load "${sym}". Check the ticker or your API key.`);
    }
    setLoading(false);
  }

  async function fetchChart(sym, rIdx) {
    try {
      const days = RANGES[rIdx].days;
      const to = Math.floor(Date.now() / 1000);
      const from = to - days * 86400;
      const resolution = days <= 90 ? "D" : days <= 365 ? "W" : "M";
      const data = await fh(`/stock/candle?symbol=${sym}&resolution=${resolution}&from=${from}&to=${to}`);
      if (!data || data.s !== "ok") return;
      const pts = data.t.map((t, i) => ({
        date: new Date(t * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: days > 365 ? "2-digit" : undefined }),
        close: +data.c[i].toFixed(2),
      }));
      const ca = pts.map(p => p.close);
      setChartData(pts.map((p, i) => {
        const s = ca.slice(0, i + 1);
        return {
          ...p,
          ma50: s.length >= 50 ? +(s.slice(-50).reduce((a, b) => a + b, 0) / 50).toFixed(2) : null,
          ma200: s.length >= 200 ? +(s.slice(-200).reduce((a, b) => a + b, 0) / 200).toFixed(2) : null,
        };
      }));
    } catch { /* silent */ }
  }

  function go(sym) {
    const s = sym.trim().toUpperCase();
    if (!s) return;
    setTicker(s);
    fetchStock(s);
  }

  const q = quote?.q || {};
  const prof = quote?.profile || {};
  const m = quote?.metrics || {};

  const price = q.c;
  const chg = q.d;
  const chgPct = q.dp;
  const isUp = chg >= 0;

  const closes = chartData.map(d => d.close);
  const rsi = closes.length > 15 ? calcRSI(closes) : null;
  const ma50v = calcMA(closes, 50);
  const ma200v = calcMA(closes, 200);
  const priceMin = closes.length ? Math.min(...closes) * 0.985 : "auto";
  const priceMax = closes.length ? Math.max(...closes) * 1.015 : "auto";

  const sections = [
    {
      title: "Fundamentals", delay: "d1",
      metrics: [
        { lbl: "P/E Ratio", val: fmt(m.peBasicExclExtraTTM), hint: "Trailing 12 months" },
        { lbl: "Forward P/E", val: fmt(m.peNormalizedAnnual), hint: "Normalized annual" },
        { lbl: "EPS (TTM)", val: m.epsBasicExclExtraItemsTTM != null ? "$" + fmt(m.epsBasicExclExtraItemsTTM) : "—", hint: "Earnings per share" },
        { lbl: "Revenue (TTM)", val: m.revenueTTM != null ? "$" + fmtB(m.revenueTTM) : "—", hint: "Trailing 12 months" },
        { lbl: "Profit Margin", val: m.netProfitMarginTTM != null ? fmt(m.netProfitMarginTTM, 1) + "%" : "—", hint: "Net margin", c: m.netProfitMarginTTM > 15 ? "pos" : m.netProfitMarginTTM < 0 ? "neg" : "" },
        { lbl: "Rev Growth 3Y", val: m["revenueGrowth3Y"] != null ? fmt(m["revenueGrowth3Y"], 1) + "%" : "—", hint: "3-year CAGR", c: m["revenueGrowth3Y"] > 0 ? "pos" : "neg" },
        { lbl: "Gross Margin", val: m.grossMarginTTM != null ? fmt(m.grossMarginTTM, 1) + "%" : "—", hint: "Gross profit %" },
        { lbl: "EBITDA / Sh", val: m.ebitdaInterimCagr5Y != null ? fmt(m.ebitdaInterimCagr5Y, 1) + "%" : "—", hint: "5Y EBITDA CAGR" },
      ]
    },
    {
      title: "Valuation", delay: "d2",
      metrics: [
        { lbl: "Market Cap", val: prof.marketCapitalization != null ? "$" + fmtB(prof.marketCapitalization * 1e6) : "—", hint: "Total market value" },
        { lbl: "P/B Ratio", val: fmt(m.pbAnnual), hint: "Price to book value" },
        { lbl: "EV / EBITDA", val: fmt(m.evEbitdaTTM), hint: "Enterprise multiple" },
        { lbl: "EV / Revenue", val: fmt(m.evRevenueTTM), hint: "Sales multiple" },
        { lbl: "P/S Ratio", val: fmt(m.psTTM), hint: "Price to sales TTM" },
        { lbl: "P/CF Ratio", val: fmt(m.pcfShareTTM), hint: "Price / cash flow" },
        { lbl: "Book Value/Sh", val: m.bookValueShareAnnual != null ? "$" + fmt(m.bookValueShareAnnual) : "—", hint: "Per share" },
        { lbl: "Tangible BV/Sh", val: m.tangibleBookValueShareAnnual != null ? "$" + fmt(m.tangibleBookValueShareAnnual) : "—", hint: "Tangible book value" },
      ]
    },
    {
      title: "Momentum & Risk", delay: "d3",
      metrics: [
        { lbl: "52W High", val: m["52WeekHigh"] != null ? "$" + fmt(m["52WeekHigh"]) : "—", hint: "52-week high" },
        { lbl: "52W Low", val: m["52WeekLow"] != null ? "$" + fmt(m["52WeekLow"]) : "—", hint: "52-week low" },
        { lbl: "From 52W High", val: m["52WeekHigh"] && price ? ((price / m["52WeekHigh"] - 1) * 100).toFixed(1) + "%" : "—", hint: "Distance from peak", c: m["52WeekHigh"] && price ? (price / m["52WeekHigh"] > 0.92 ? "pos" : "cau") : "" },
        { lbl: "Beta", val: fmt(m.beta), hint: "Volatility vs S&P 500" },
        { lbl: "Return 1W", val: m["1WeekPriceReturnDaily"] != null ? fmt(m["1WeekPriceReturnDaily"], 1) + "%" : "—", hint: "1-week return", c: m["1WeekPriceReturnDaily"] > 0 ? "pos" : "neg" },
        { lbl: "Return 1M", val: m["1MonthPriceReturnDaily"] != null ? fmt(m["1MonthPriceReturnDaily"], 1) + "%" : "—", hint: "1-month return", c: m["1MonthPriceReturnDaily"] > 0 ? "pos" : "neg" },
        { lbl: "Return YTD", val: m.ytdPriceReturnDaily != null ? fmt(m.ytdPriceReturnDaily, 1) + "%" : "—", hint: "Year-to-date return", c: m.ytdPriceReturnDaily > 0 ? "pos" : "neg" },
        { lbl: "Return 1Y", val: m["52WeekPriceReturnDaily"] != null ? fmt(m["52WeekPriceReturnDaily"], 1) + "%" : "—", hint: "52-week return", c: m["52WeekPriceReturnDaily"] > 0 ? "pos" : "neg" },
      ]
    },
    {
      title: "Technical", delay: "d4",
      metrics: [
        { lbl: "RSI (14)", val: rsi != null ? fmt(rsi, 1) : "—", hint: rsi > 70 ? "Overbought" : rsi < 30 ? "Oversold" : rsi != null ? "Neutral" : "Insufficient data", c: rsi > 70 ? "neg" : rsi < 30 ? "pos" : "" },
        { lbl: "50-Day MA", val: ma50v != null ? "$" + fmt(ma50v) : "—", hint: price && ma50v ? (price > ma50v ? "Price above MA" : "Price below MA") : "Insufficient data", c: price && ma50v ? (price > ma50v ? "pos" : "neg") : "" },
        { lbl: "200-Day MA", val: ma200v != null ? "$" + fmt(ma200v) : "—", hint: price && ma200v ? (price > ma200v ? "Price above MA" : "Price below MA") : "Select 1Y+ for data", c: price && ma200v ? (price > ma200v ? "pos" : "neg") : "" },
        { lbl: "MA Signal", val: ma50v && ma200v ? (ma50v > ma200v ? "Golden Cross" : "Death Cross") : "—", hint: ma50v && ma200v ? (ma50v > ma200v ? "Bullish crossover" : "Bearish crossover") : "Need more data", c: ma50v && ma200v ? (ma50v > ma200v ? "pos" : "neg") : "" },
        { lbl: "Dividend Yield", val: m.dividendYieldIndicatedAnnual != null ? fmt(m.dividendYieldIndicatedAnnual, 2) + "%" : "—", hint: "Annual yield" },
        { lbl: "Payout Ratio", val: m.payoutRatioTTM != null ? fmt(m.payoutRatioTTM, 1) + "%" : "—", hint: "Dividends / Earnings" },
        { lbl: "Debt / Equity", val: fmt(m.totalDebt_totalEquityAnnual), hint: "Leverage ratio", c: m.totalDebt_totalEquityAnnual > 2 ? "neg" : m.totalDebt_totalEquityAnnual < 0.5 ? "pos" : "" },
        { lbl: "Current Ratio", val: fmt(m.currentRatioAnnual), hint: "Short-term liquidity", c: m.currentRatioAnnual > 1.5 ? "pos" : m.currentRatioAnnual < 1 ? "neg" : "" },
      ]
    }
  ];

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="nav">
          <div className="logo">Apex<span className="logo-accent">Markets</span></div>
          <div className="nav-date">{now}</div>
        </div>

        {/* API Key Banner */}
        {!key && (
          <div className="api-banner">
            <strong>Setup required:</strong> This app uses <a href="https://finnhub.io/register" target="_blank">Finnhub</a> for live data.
            Get a <strong>free API key</strong> at <a href="https://finnhub.io/register" target="_blank">finnhub.io/register</a> — no credit card needed.
            <br /><br />
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input
                style={{ flex: 1, minWidth: 240, background: "#fff", border: "1px solid #e0c97a", borderRadius: 8, padding: "8px 12px", fontFamily: "DM Sans, sans-serif", fontSize: 13, outline: "none" }}
                placeholder="Paste your Finnhub API key here"
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && setApiKey(keyInput)}
              />
              <button
                onClick={() => setApiKey(keyInput)}
                style={{ background: "#0071e3", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
              >
                Save Key
              </button>
            </div>
          </div>
        )}

        {key && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <span
              style={{ fontSize: 12, color: "var(--tertiary)", cursor: "pointer", textDecoration: "underline" }}
              onClick={() => { setApiKey(""); setKeyInput(""); }}
            >
              Change API key
            </span>
          </div>
        )}

        {/* Search */}
        <div className="search-card">
          <div className="search-row">
            <input className="search-input" value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === "Enter" && go(inputVal)} placeholder="Ticker symbol" maxLength={6} />
            <button className="search-btn" onClick={() => go(inputVal)} disabled={loading}>{loading ? "Loading…" : "Analyze"}</button>
          </div>
          <div className="quick-row">
            {QUICK.map(t => <div key={t} className="q-pill" onClick={() => { setInputVal(t); go(t); }}>{t}</div>)}
          </div>
        </div>

        {error && <div className="err-bar">⚠ {error}</div>}
        {loading && <div className="spin-wrap"><div className="spinner" /></div>}

        {!loading && !quote && !error && (
          <div className="empty-card">
            <div className="empty-icon">📈</div>
            <div className="empty-t">{key ? "Search for a stock to get started" : "Enter your API key above to begin"}</div>
            <div className="empty-s">{key ? "Enter any US-listed ticker symbol above" : "Free at finnhub.io — takes 30 seconds"}</div>
          </div>
        )}

        {!loading && quote && (
          <>
            <div className="hero fade">
              <div className="hero-top">
                <div>
                  <div className="hero-ticker">{ticker}</div>
                  <div className="hero-name">{prof.name || ticker}</div>
                  <div className="hero-sub">{prof.exchange} · {prof.finnhubIndustry}</div>
                </div>
                <div className="hero-right">
                  <div className="hero-price">${fmt(price)}</div>
                  <div className={`badge ${isUp ? "badge-up" : "badge-down"}`}>
                    {isUp ? "▲" : "▼"} {sgn(chg)}{fmt(chg)} ({sgn(chgPct)}{fmt(chgPct, 2)}%)
                  </div>
                </div>
              </div>

              <div className="chart-header">
                <div className="range-group">
                  {RANGES.map((r, i) => (
                    <button key={r.label} className={`range-btn ${rangeIdx === i ? "active" : ""}`} onClick={() => { setRangeIdx(i); fetchChart(ticker, i); }}>{r.label}</button>
                  ))}
                </div>
                <div className="ma-group">
                  <button className={`ma-btn ${showMA50 ? "amber" : ""}`} onClick={() => setShowMA50(!showMA50)}>MA 50</button>
                  <button className={`ma-btn ${showMA200 ? "blue" : ""}`} onClick={() => setShowMA200(!showMA200)}>MA 200</button>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: "#aeaeb2", fontSize: 10, fontFamily: "DM Sans" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis domain={[priceMin, priceMax]} tick={{ fill: "#aeaeb2", fontSize: 10, fontFamily: "DM Sans" }} tickLine={false} axisLine={false} tickFormatter={v => "$" + v.toFixed(0)} width={52} />
                  <Tooltip content={<ChartTip />} />
                  <Line type="monotone" dataKey="close" stroke={isUp ? "#34c759" : "#ff3b30"} strokeWidth={2} dot={false} name="Price" />
                  {showMA50 && <Line type="monotone" dataKey="ma50" stroke="#ff9500" strokeWidth={1.5} dot={false} strokeDasharray="4 3" name="MA 50" />}
                  {showMA200 && <Line type="monotone" dataKey="ma200" stroke="#0071e3" strokeWidth={1.5} dot={false} strokeDasharray="4 3" name="MA 200" />}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {sections.map(sec => (
              <div key={sec.title} className={`section fade ${sec.delay}`}>
                <div className="section-title">{sec.title}</div>
                <div className="mgrid">
                  {sec.metrics.map(met => (
                    <div key={met.lbl} className="mcell">
                      <div className="mlbl">{met.lbl}</div>
                      <div className={`mval ${met.c || ""}`}>{met.val}</div>
                      <div className="mhint">{met.hint}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}
