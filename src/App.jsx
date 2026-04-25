import { useState, useEffect, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const css = `
  @import url('https://fonts.cdnfonts.com/css/satoshi');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0a0f; --white: #141418; --border: rgba(255,255,255,0.07);
    --border-strong: rgba(255,255,255,0.12); --text: #f0f0f5; --secondary: #a0a0b0;
    --tertiary: #5a5a70; --accent: #3b8eea; --accent-light: rgba(59,142,234,0.12);
    --green: #2db84d; --green-bg: rgba(45,184,77,0.12);
    --red: #e8352a; --red-bg: rgba(232,53,42,0.12);
    --amber: #f0a030; --amber-bg: rgba(240,160,48,0.12);
    --radius: 18px; --radius-sm: 10px;
    --font: 'Satoshi', -apple-system, BlinkMacSystemFont, sans-serif;
    --shadow: 0 2px 24px rgba(0,0,0,0.4);
  }
  body { background: var(--bg); color: var(--text); font-family: var(--font); min-height: 100vh; -webkit-font-smoothing: antialiased; }
  .app { max-width: 980px; margin: 0 auto; padding: 0 20px 80px; }
  .nav { display: flex; align-items: center; justify-content: space-between; padding: 22px 0 18px; }
  .logo { font-family: 'Satoshi', sans-serif; font-size: 22px; letter-spacing: 0.3px; }
  .logo-apex { color: #e8352a; font-weight: 700; }
  .logo-markets { color: #2db84d; font-weight: 400; }
  .nav-right { display: flex; align-items: center; gap: 14px; }
  .nav-date { font-size: 13px; color: var(--tertiary); }
  .market-status { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; letter-spacing: 0.5px; }
  .market-open { background: var(--green-bg); color: var(--green); }
  .market-closed { background: var(--red-bg); color: var(--red); }
  .market-pre { background: var(--amber-bg); color: var(--amber); }
  .api-setup { background: var(--amber-bg); border: 1px solid rgba(240,160,48,0.3); border-radius: var(--radius); padding: 24px 28px; margin-bottom: 14px; }
  .api-setup h3 { font-size: 16px; font-weight: 600; color: var(--amber); margin-bottom: 10px; }
  .api-setup p { font-size: 13px; color: var(--secondary); line-height: 1.7; margin-bottom: 12px; }
  .api-setup a { color: var(--accent); text-decoration: none; font-weight: 500; }
  .api-input-row { display: flex; gap: 8px; }
  .api-input { flex: 1; background: #1e1e26; border: 1.5px solid var(--border-strong); border-radius: var(--radius-sm); color: var(--text); font-family: var(--font); font-size: 13px; padding: 9px 14px; outline: none; transition: border-color 0.18s; }
  .api-input:focus { border-color: var(--accent); }
  .api-btn { background: var(--amber); color: #000; font-family: var(--font); font-size: 13px; font-weight: 600; padding: 9px 18px; border: none; border-radius: var(--radius-sm); cursor: pointer; }
  .search-card { background: var(--white); border-radius: var(--radius); padding: 16px 20px; box-shadow: var(--shadow); margin-bottom: 12px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .search-row { display: flex; gap: 8px; align-items: center; }
  .search-input { width: 148px; background: #1e1e26; border: 1.5px solid var(--border-strong); border-radius: var(--radius-sm); color: var(--text); font-family: var(--font); font-size: 15px; font-weight: 500; padding: 9px 14px; letter-spacing: 1.5px; text-transform: uppercase; outline: none; transition: border-color 0.18s; }
  .search-input:focus { border-color: var(--accent); }
  .search-input::placeholder { color: var(--tertiary); font-size: 13px; letter-spacing: 0; text-transform: none; font-weight: 400; }
  .search-btn { background: var(--accent); color: #fff; font-family: var(--font); font-size: 14px; font-weight: 500; padding: 9px 18px; border: none; border-radius: var(--radius-sm); cursor: pointer; transition: opacity 0.15s; }
  .search-btn:hover { opacity: 0.87; }
  .search-btn:disabled { opacity: 0.38; cursor: not-allowed; }
  .quick-row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
  .quick-label { font-size: 11px; color: var(--tertiary); font-weight: 500; }
  .q-pill { font-size: 12px; font-weight: 500; color: var(--secondary); background: rgba(255,255,255,0.05); border-radius: 20px; padding: 5px 13px; cursor: pointer; transition: all 0.14s; border: 1px solid transparent; }
  .q-pill:hover { background: var(--accent-light); color: var(--accent); border-color: rgba(59,142,234,0.3); }
  .q-pill.recent { border-color: var(--border-strong); }
  .skeleton { background: linear-gradient(90deg, #1a1a22 25%, #222230 50%, #1a1a22 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 6px; }
  @keyframes shimmer { 0%{background-position:200% 0}100%{background-position:-200% 0} }
  .sk-hero { background: var(--white); border-radius: var(--radius); padding: 30px 28px 24px; box-shadow: var(--shadow); margin-bottom: 12px; }
  .sk-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1.5px; background: var(--border); border-radius: var(--radius); overflow: hidden; margin-bottom: 12px; }
  @media(max-width:720px){.sk-grid{grid-template-columns:repeat(2,1fr)}}
  .sk-cell { background: var(--white); padding: 18px 20px; }
  .hero { background: var(--white); border-radius: var(--radius); padding: 30px 28px 24px; box-shadow: var(--shadow); margin-bottom: 12px; }
  .hero-top { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
  .hero-ticker { font-size: 11px; font-weight: 600; color: var(--tertiary); letter-spacing: 1.5px; margin-bottom: 5px; text-transform: uppercase; }
  .hero-name { font-size: 24px; font-weight: 600; letter-spacing: -0.4px; color: var(--text); margin-bottom: 4px; }
  .hero-sub { font-size: 12px; color: var(--tertiary); }
  .hero-right { text-align: right; }
  .hero-price { font-size: 42px; font-weight: 300; letter-spacing: -2px; color: var(--text); line-height: 1; }
  .badge { display: inline-flex; align-items: center; gap: 5px; margin-top: 8px; font-size: 13px; font-weight: 600; padding: 4px 12px; border-radius: 20px; }
  .badge-up { background: var(--green-bg); color: var(--green); }
  .badge-down { background: var(--red-bg); color: var(--red); }
  .ohlc-bar { display: flex; gap: 20px; flex-wrap: wrap; padding: 14px 0 20px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); margin-bottom: 20px; }
  .ohlc-item { display: flex; flex-direction: column; gap: 3px; }
  .ohlc-lbl { font-size: 10px; font-weight: 600; color: var(--tertiary); letter-spacing: 1px; text-transform: uppercase; }
  .ohlc-val { font-size: 14px; font-weight: 500; color: var(--text); }
  .chart-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; }
  .range-group { display: flex; gap: 3px; background: rgba(255,255,255,0.05); border-radius: 8px; padding: 3px; }
  .range-btn { font-size: 12px; font-weight: 500; color: var(--secondary); padding: 5px 11px; border-radius: 6px; cursor: pointer; border: none; background: transparent; font-family: var(--font); transition: all 0.14s; }
  .range-btn.active { background: rgba(255,255,255,0.1); color: var(--text); }
  .ma-group { display: flex; gap: 6px; }
  .ma-btn { font-size: 12px; font-weight: 500; color: var(--secondary); padding: 5px 12px; border-radius: 6px; border: 1.5px solid var(--border-strong); background: transparent; font-family: var(--font); cursor: pointer; transition: all 0.14s; }
  .ma-btn.amber { background: var(--amber-bg); color: var(--amber); border-color: var(--amber); }
  .ma-btn.blue { background: var(--accent-light); color: var(--accent); border-color: var(--accent); }
  .ct { background: rgba(20,20,24,0.95); backdrop-filter: blur(12px); border-radius: 10px; padding: 10px 14px; font-family: var(--font); font-size: 12px; color: #fff; border: 1px solid var(--border-strong); }
  .ct-date { color: var(--tertiary); font-size: 11px; margin-bottom: 4px; }
  .ct-val { font-weight: 500; margin-bottom: 2px; }
  .vol-wrap { margin-top: 10px; }
  .vol-label { font-size: 10px; font-weight: 600; color: var(--tertiary); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
  .vol-bars { display: flex; align-items: flex-end; gap: 1px; height: 40px; }
  .vol-bar { flex: 1; border-radius: 2px 2px 0 0; min-width: 2px; opacity: 0.5; transition: opacity 0.15s; }
  .vol-bar:hover { opacity: 1; }
  .section { margin-bottom: 12px; }
  .section-title { font-size: 19px; font-weight: 600; letter-spacing: -0.3px; color: var(--text); margin-bottom: 10px; padding-left: 2px; }
  .mgrid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1.5px; background: var(--border); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); }
  @media(max-width:720px){.mgrid{grid-template-columns:repeat(2,1fr)}}
  .mcell { background: var(--white); padding: 18px 20px; transition: background 0.12s; }
  .mcell:hover { background: #1a1a22; }
  .mlbl { font-size: 10px; font-weight: 600; color: var(--tertiary); letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 8px; }
  .mval { font-size: 20px; font-weight: 400; letter-spacing: -0.5px; color: var(--text); margin-bottom: 3px; }
  .mval.pos{color:var(--green)} .mval.neg{color:var(--red)} .mval.cau{color:var(--amber)}
  .mhint { font-size: 11px; color: var(--tertiary); }
  .empty-card { background: var(--white); border-radius: var(--radius); padding: 60px 40px; text-align: center; box-shadow: var(--shadow); }
  .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.2; }
  .empty-t { font-size: 18px; font-weight: 600; color: var(--secondary); margin-bottom: 8px; }
  .empty-s { font-size: 13px; color: var(--tertiary); margin-bottom: 20px; }
  .empty-tickers { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
  .empty-tick { font-size: 12px; font-weight: 500; color: var(--accent); background: var(--accent-light); border-radius: 20px; padding: 5px 14px; cursor: pointer; }
  .spin-wrap { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 80px 0; }
  .spinner { width: 28px; height: 28px; border: 2px solid var(--border-strong); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; }
  .spin-label { font-size: 13px; color: var(--tertiary); font-weight: 500; }
  @keyframes spin{to{transform:rotate(360deg)}}
  .err-bar { background: var(--red-bg); color: var(--red); border-radius: var(--radius-sm); padding: 12px 18px; font-size: 13px; font-weight: 500; margin-bottom: 12px; }
  .fade { animation: fadeUp 0.35s cubic-bezier(0.25,0.46,0.45,0.94) both; }
  .d0{animation-delay:0s} .d1{animation-delay:.06s} .d2{animation-delay:.12s} .d3{animation-delay:.18s} .d4{animation-delay:.24s}
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
`;

const fmt = (n, d=2) => (n==null||isNaN(n)) ? "—" : Number(n).toFixed(d);
const fmtB = (n) => {
  if (n==null||isNaN(n)) return "—";
  const a = Math.abs(n);
  if (a>=1e12) return (n/1e12).toFixed(2)+"T";
  if (a>=1e9) return (n/1e9).toFixed(2)+"B";
  if (a>=1e6) return (n/1e6).toFixed(2)+"M";
  return Number(n).toFixed(2);
};
const sgn = (n) => n > 0 ? "+" : "";

function calcRSI(closes, period=14) {
  if (closes.length < period+1) return null;
  let g=0,l=0;
  for (let i=1;i<=period;i++){const d=closes[i]-closes[i-1];if(d>0)g+=d;else l-=d;}
  let ag=g/period,al=l/period;
  for (let i=period+1;i<closes.length;i++){
    const d=closes[i]-closes[i-1];
    ag=(ag*(period-1)+(d>0?d:0))/period;
    al=(al*(period-1)+(d<0?-d:0))/period;
  }
  if (al===0) return 100;
  return 100-100/(1+ag/al);
}
function calcMA(closes,p){
  if(closes.length<p) return null;
  return closes.slice(-p).reduce((a,b)=>a+b,0)/p;
}

function getMarketStatus() {
  const now = new Date();
  const et = new Date(now.toLocaleString("en-US",{timeZone:"America/New_York"}));
  const day = et.getDay();
  const mins = et.getHours()*60+et.getMinutes();
  if(day===0||day===6) return {label:"CLOSED",cls:"market-closed"};
  if(mins>=570&&mins<930) return {label:"OPEN",cls:"market-open"};
  if(mins>=240&&mins<570) return {label:"PRE-MARKET",cls:"market-pre"};
  if(mins>=930&&mins<1200) return {label:"AFTER-HOURS",cls:"market-pre"};
  return {label:"CLOSED",cls:"market-closed"};
}

const QUICK = ["AAPL","TSLA","NVDA","MSFT","AMZN","GOOGL","META","JPM"];
const RANGES = [
  {label:"1M",days:30,res:"D"},
  {label:"3M",days:90,res:"D"},
  {label:"6M",days:180,res:"W"},
  {label:"1Y",days:365,res:"W"},
  {label:"2Y",days:730,res:"W"},
  {label:"5Y",days:1825,res:"M"},
];

const BASE = "https://finnhub.io/api/v1";

async function finnhub(path, key) {
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${BASE}${path}${sep}token=${key}`);
  if (!res.ok) throw new Error("Finnhub error " + res.status);
  return res.json();
}

async function fetchStock(sym, key) {
  const [quote, profile, metrics] = await Promise.all([
    finnhub(`/quote?symbol=${sym}`, key),
    finnhub(`/stock/profile2?symbol=${sym}`, key),
    finnhub(`/stock/metric?symbol=${sym}&metric=all`, key),
  ]);

  if (!quote || quote.c === 0) throw new Error("Ticker not found");

  await new Promise(r => setTimeout(r, 500));

  const to = Math.floor(Date.now()/1000);
  const from = to - 180*86400;
  let priceHistory = [];
  try {
    const candles = await finnhub(`/stock/candle?symbol=${sym}&resolution=D&from=${from}&to=${to}`, key);
    if (candles?.s === "ok" && candles.t?.length > 0) {
      priceHistory = candles.t.map((t,i) => ({
        date: new Date(t*1000).toLocaleDateString("en-US",{month:"short",day:"numeric"}),
        close: +candles.c[i].toFixed(2),
        volume: candles.v?.[i] || 0,
      }));
    }
  } catch(e) { console.warn("Candles:", e.message); }

  return { quote, profile, metrics: metrics?.metric || {}, priceHistory };
}

async function fetchCandles(sym, key, rangeObj) {
  const to = Math.floor(Date.now()/1000);
  const from = to - rangeObj.days*86400;
  const data = await finnhub(`/stock/candle?symbol=${sym}&resolution=${rangeObj.res}&from=${from}&to=${to}`, key);
  if (!data || data.s !== "ok") return [];
  return data.t.map((t,i) => ({
    date: new Date(t*1000).toLocaleDateString("en-US",{
      month:"short", day:"numeric",
      year: rangeObj.days > 365 ? "2-digit" : undefined
    }),
    close: +data.c[i].toFixed(2),
    volume: data.v?.[i] || 0,
  }));
}

const ChartTip = ({active,payload,label}) => {
  if (!active||!payload?.length) return null;
  return (
    <div className="ct">
      <div className="ct-date">{label}</div>
      {payload.filter(p=>["close","ma50","ma200"].includes(p.dataKey)).map((p,i)=>(
        <div key={i} className="ct-val" style={{color:p.color}}>{p.name}: ${Number(p.value).toFixed(2)}</div>
      ))}
    </div>
  );
};

function SkeletonLoader() {
  return (
    <>
      <div className="sk-hero">
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <div className="skeleton" style={{height:14,width:80,borderRadius:6,marginBottom:10}}/>
            <div className="skeleton" style={{height:28,width:220,borderRadius:6,marginBottom:8}}/>
            <div className="skeleton" style={{height:12,width:140,borderRadius:6}}/>
          </div>
          <div>
            <div className="skeleton" style={{height:44,width:160,borderRadius:6,marginBottom:8}}/>
            <div className="skeleton" style={{height:28,width:120,borderRadius:6,marginLeft:"auto"}}/>
          </div>
        </div>
        <div className="skeleton" style={{height:260,borderRadius:6}}/>
      </div>
      {[0,1,2,3].map(i=>(
        <div key={i} className="sk-grid" style={{marginBottom:12}}>
          {[0,1,2,3,4,5,6,7].map(j=>(
            <div key={j} className="sk-cell">
              <div className="skeleton" style={{height:10,width:"60%",borderRadius:4,marginBottom:12}}/>
              <div className="skeleton" style={{height:22,width:"80%",borderRadius:4,marginBottom:8}}/>
              <div className="skeleton" style={{height:10,width:"50%",borderRadius:4}}/>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("apex_finnhub_key") || "");
  const [keyInput, setKeyInput] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Fetching data…");
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState("");
  const [error, setError] = useState("");
  const [stockData, setStockData] = useState(null);
  const [chartHistory, setChartHistory] = useState([]);
  const [rangeIdx, setRangeIdx] = useState(1);
  const [showMA50, setShowMA50] = useState(false);
  const [showMA200, setShowMA200] = useState(false);
  const [now, setNow] = useState("");
  const [marketStatus, setMarketStatus] = useState({label:"CLOSED",cls:"market-closed"});
  const [recentTickers, setRecentTickers] = useState(() => {
    try { return JSON.parse(localStorage.getItem("apex_recent") || "[]"); } catch { return []; }
  });
  const inputRef = useRef(null);

  useEffect(() => {
    const d = new Date();
    setNow(d.toLocaleString("en-US",{hour:"2-digit",minute:"2-digit",hour12:true,month:"short",day:"numeric"}));
    setMarketStatus(getMarketStatus());
    const clock = setInterval(()=>setMarketStatus(getMarketStatus()),60000);
    const handler = (e) => {
      if (e.key==="/"&&document.activeElement!==inputRef.current){e.preventDefault();inputRef.current?.focus();}
    };
    window.addEventListener("keydown",handler);
    return ()=>{window.removeEventListener("keydown",handler);clearInterval(clock);};
  },[]);

  function saveKey() {
    const k = keyInput.trim();
    if (!k) return;
    localStorage.setItem("apex_finnhub_key",k);
    setApiKey(k);
    setKeyInput("");
  }

  async function go(sym) {
    const s = sym.trim().toUpperCase();
    if (!s||!apiKey) return;
    setTicker(s); setInputVal(s); setLoading(true); setError(""); setStockData(null); setChartHistory([]);
    const msgs = ["Searching market data…","Pulling financials…","Calculating metrics…","Almost ready…"];
    let mi=0; setLoadingMsg(msgs[0]);
    const iv = setInterval(()=>{mi=(mi+1)%msgs.length;setLoadingMsg(msgs[mi]);},2500);
    try {
      const data = await fetchStock(s, apiKey);
      setStockData(data);
      setChartHistory(data.priceHistory);
      if (data.priceHistory.length === 0) {
        setChartError("No chart data available — try clicking a range button to reload.");
      } else {
        setChartError("");
      }
      const updated = [s,...recentTickers.filter(t=>t!==s)].slice(0,5);
      setRecentTickers(updated);
      localStorage.setItem("apex_recent",JSON.stringify(updated));
    } catch(e) {
      setError(e.message||"Failed to load. Check ticker and API key.");
    }
    clearInterval(iv); setLoading(false);
  }

  async function changeRange(idx) {
    setRangeIdx(idx);
    if (!ticker||!apiKey) return;
    setChartLoading(true);
    try {
      const pts = await fetchCandles(ticker, apiKey, RANGES[idx]);
      if (pts.length > 0) {
        setChartHistory(pts);
        setChartError("");
      } else {
        setChartError("No data for this range. Try another.");
      }
    } catch(e) {
      setChartError("Chart load failed. Try again.");
    }
    setChartLoading(false);
  }

  const q = stockData?.quote || {};
  const prof = stockData?.profile || {};
  const m = stockData?.metrics || {};

  const price = q.c;
  const change = q.d;
  const changePct = q.dp;
  const isUp = (change||0) >= 0;
  const lineColor = isUp ? "#2db84d" : "#e8352a";

  const chartData = (() => {
    const ca = chartHistory.map(p=>p.close);
    return chartHistory.map((p,i)=>{
      const sl = ca.slice(0,i+1);
      return {
        ...p,
        ma50: sl.length>=50 ? +(sl.slice(-50).reduce((a,b)=>a+b,0)/50).toFixed(2) : null,
        ma200: sl.length>=200 ? +(sl.slice(-200).reduce((a,b)=>a+b,0)/200).toFixed(2) : null,
      };
    });
  })();

  const closes = chartData.map(d=>d.close);
  const volumes = chartData.map(d=>d.volume||0);
  const maxVol = Math.max(...volumes,1);
  const rsi = closes.length>15 ? calcRSI(closes) : null;
  const ma50v = calcMA(closes,50);
  const ma200v = calcMA(closes,200);
  const priceMin = closes.length ? Math.min(...closes)*0.983 : "auto";
  const priceMax = closes.length ? Math.max(...closes)*1.017 : "auto";
  const fmtN = (n,d=2) => (n==null||isNaN(n)) ? "—" : Number(n).toFixed(d);

  const sections = [
    {title:"Fundamentals",delay:"d1",metrics:[
      {lbl:"P/E Ratio",val:fmtN(m.peBasicExclExtraTTM),hint:"Trailing 12 months"},
      {lbl:"Forward P/E",val:fmtN(m.peNormalizedAnnual),hint:"Normalized annual"},
      {lbl:"EPS (TTM)",val:m.epsBasicExclExtraItemsTTM!=null?"$"+fmtN(m.epsBasicExclExtraItemsTTM):fmtN(q.c&&q.c>0?null:null),hint:"Earnings per share"},
      {lbl:"Revenue (TTM)",val:m.revenueTTM!=null?"$"+fmtB(m.revenueTTM):"—",hint:"Trailing 12 months"},
      {lbl:"Profit Margin",val:m.netProfitMarginTTM!=null?fmtN(m.netProfitMarginTTM,1)+"%":"—",hint:"Net margin",c:m.netProfitMarginTTM>15?"pos":m.netProfitMarginTTM<0?"neg":""},
      {lbl:"Rev Growth 3Y",val:m.revenueGrowth3Y!=null?fmtN(m.revenueGrowth3Y,1)+"%":"—",hint:"3-year CAGR",c:m.revenueGrowth3Y>0?"pos":"neg"},
      {lbl:"Gross Margin",val:m.grossMarginTTM!=null?fmtN(m.grossMarginTTM,1)+"%":"—",hint:"Gross profit %"},
      {lbl:"EBITDA Margin",val:m.ebitdaMarginTTM!=null?fmtN(m.ebitdaMarginTTM,1)+"%":"—",hint:"EBITDA margin"},
    ]},
    {title:"Valuation",delay:"d2",metrics:[
      {lbl:"Market Cap",val:prof.marketCapitalization!=null?"$"+fmtB(prof.marketCapitalization*1e6):"—",hint:"Total market value"},
      {lbl:"P/B Ratio",val:fmtN(m.pbAnnual),hint:"Price to book value"},
      {lbl:"EV / EBITDA",val:fmtN(m.evEbitdaTTM),hint:"Enterprise multiple"},
      {lbl:"EV / Revenue",val:fmtN(m.evRevenueTTM),hint:"Sales multiple"},
      {lbl:"P/S Ratio",val:fmtN(m.psTTM),hint:"Price to sales TTM"},
      {lbl:"P/CF Ratio",val:fmtN(m.pcfShareTTM),hint:"Price / cash flow"},
      {lbl:"Book Value/Sh",val:m.bookValueShareAnnual!=null?"$"+fmtN(m.bookValueShareAnnual):"—",hint:"Per share"},
      {lbl:"Enterprise Val",val:m.enterpriseValue!=null?"$"+fmtB(m.enterpriseValue):"—",hint:"Total EV"},
    ]},
    {title:"Momentum & Risk",delay:"d3",metrics:[
      {lbl:"52W High",val:m["52WeekHigh"]!=null?"$"+fmtN(m["52WeekHigh"]):"—",hint:"52-week high"},
      {lbl:"52W Low",val:m["52WeekLow"]!=null?"$"+fmtN(m["52WeekLow"]):"—",hint:"52-week low"},
      {lbl:"From 52W High",val:m["52WeekHigh"]&&price?((price/m["52WeekHigh"]-1)*100).toFixed(1)+"%":"—",hint:"Distance from peak",c:m["52WeekHigh"]&&price?(price/m["52WeekHigh"]>0.92?"pos":"cau"):""},
      {lbl:"Beta",val:fmtN(m.beta),hint:"Volatility vs S&P 500"},
      {lbl:"Return 1W",val:m["1WeekPriceReturnDaily"]!=null?fmtN(m["1WeekPriceReturnDaily"],1)+"%":"—",hint:"1-week return",c:m["1WeekPriceReturnDaily"]>0?"pos":"neg"},
      {lbl:"Return 1M",val:m["1MonthPriceReturnDaily"]!=null?fmtN(m["1MonthPriceReturnDaily"],1)+"%":"—",hint:"1-month return",c:m["1MonthPriceReturnDaily"]>0?"pos":"neg"},
      {lbl:"Return YTD",val:m.ytdPriceReturnDaily!=null?fmtN(m.ytdPriceReturnDaily,1)+"%":"—",hint:"Year-to-date",c:m.ytdPriceReturnDaily>0?"pos":"neg"},
      {lbl:"Return 1Y",val:m["52WeekPriceReturnDaily"]!=null?fmtN(m["52WeekPriceReturnDaily"],1)+"%":"—",hint:"52-week return",c:m["52WeekPriceReturnDaily"]>0?"pos":"neg"},
    ]},
    {title:"Technical",delay:"d4",metrics:[
      {lbl:"RSI (14)",val:rsi!=null?fmtN(rsi,1):"—",hint:rsi>70?"Overbought":rsi<30?"Oversold":rsi!=null?"Neutral":"Insufficient data",c:rsi>70?"neg":rsi<30?"pos":""},
      {lbl:"50-Day MA",val:ma50v!=null?"$"+fmtN(ma50v):"—",hint:price&&ma50v?(price>ma50v?"Price above MA":"Price below MA"):"Insufficient data",c:price&&ma50v?(price>ma50v?"pos":"neg"):""},
      {lbl:"200-Day MA",val:ma200v!=null?"$"+fmtN(ma200v):"—",hint:price&&ma200v?(price>ma200v?"Price above MA":"Price below MA"):"Select 1Y+ for data",c:price&&ma200v?(price>ma200v?"pos":"neg"):""},
      {lbl:"MA Signal",val:ma50v&&ma200v?(ma50v>ma200v?"Golden Cross":"Death Cross"):"—",hint:ma50v&&ma200v?(ma50v>ma200v?"Bullish":"Bearish"):"Need more data",c:ma50v&&ma200v?(ma50v>ma200v?"pos":"neg"):""},
      {lbl:"Dividend Yield",val:m.dividendYieldIndicatedAnnual!=null?fmtN(m.dividendYieldIndicatedAnnual,2)+"%":"—",hint:"Annual yield"},
      {lbl:"Payout Ratio",val:m.payoutRatioTTM!=null?fmtN(m.payoutRatioTTM,1)+"%":"—",hint:"Dividends / Earnings"},
      {lbl:"Debt / Equity",val:fmtN(m.totalDebt_totalEquityAnnual),hint:"Leverage ratio",c:m.totalDebt_totalEquityAnnual>2?"neg":m.totalDebt_totalEquityAnnual<0.5?"pos":""},
      {lbl:"Current Ratio",val:fmtN(m.currentRatioAnnual),hint:"Short-term liquidity",c:m.currentRatioAnnual>1.5?"pos":m.currentRatioAnnual<1?"neg":""},
    ]},
  ];

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="nav">
          <div className="logo"><span className="logo-apex">Apex</span><span className="logo-markets">Markets</span></div>
          <div className="nav-right">
            <span className={`market-status ${marketStatus.cls}`}>{marketStatus.label}</span>
            <span className="nav-date">{now}</span>
          </div>
        </div>

        {!apiKey && (
          <div className="api-setup">
            <h3>🔑 Connect Finnhub API</h3>
            <p>Get your free API key at <a href="https://finnhub.io/register" target="_blank">finnhub.io/register</a> — no credit card needed. Paste it below to start analyzing stocks.</p>
            <div className="api-input-row">
              <input className="api-input" placeholder="Paste your Finnhub API key…" value={keyInput} onChange={e=>setKeyInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveKey()}/>
              <button className="api-btn" onClick={saveKey}>Connect</button>
            </div>
          </div>
        )}

        {apiKey && (
          <div className="search-card">
            <div className="search-row">
              <input ref={inputRef} className="search-input" value={inputVal} onChange={e=>setInputVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go(inputVal)} placeholder="Ticker…" maxLength={6}/>
              <button className="search-btn" onClick={()=>go(inputVal)} disabled={loading}>{loading?"Loading…":"Analyze"}</button>
            </div>
            <div className="quick-row">
              {recentTickers.length>0&&<>
                <span className="quick-label">Recent:</span>
                {recentTickers.map(t=><div key={t} className="q-pill recent" onClick={()=>go(t)}>{t}</div>)}
                <span className="quick-label" style={{marginLeft:4}}>|</span>
              </>}
              {QUICK.map(t=><div key={t} className="q-pill" onClick={()=>go(t)}>{t}</div>)}
            </div>
          </div>
        )}

        {error&&<div className="err-bar">⚠ {error}</div>}
        {loading&&<><div className="spin-wrap"><div className="spinner"/><div className="spin-label">{loadingMsg}</div></div><SkeletonLoader/></>}

        {!loading&&!stockData&&!error&&apiKey&&(
          <div className="empty-card">
            <div className="empty-icon">📊</div>
            <div className="empty-t">Search any stock to begin</div>
            <div className="empty-s">Enter a US-listed ticker above or tap a quick pick</div>
            <div className="empty-tickers">{QUICK.map(t=><div key={t} className="empty-tick" onClick={()=>go(t)}>{t}</div>)}</div>
          </div>
        )}

        {!loading&&stockData&&(<>
          <div className="hero fade d0">
            <div className="hero-top">
              <div>
                <div className="hero-ticker">{ticker}</div>
                <div className="hero-name">{prof.name||ticker}</div>
                <div className="hero-sub">{prof.exchange} · {prof.finnhubIndustry}</div>
              </div>
              <div className="hero-right">
                <div className="hero-price">${fmtN(price)}</div>
                <div className={`badge ${isUp?"badge-up":"badge-down"}`}>
                  {isUp?"▲":"▼"} {sgn(change)}{fmtN(change)} ({sgn(changePct)}{fmtN(changePct,2)}%)
                </div>
              </div>
            </div>

            <div className="ohlc-bar">
              {[
                {lbl:"Open",val:q.o!=null?"$"+fmtN(q.o):"—"},
                {lbl:"High",val:q.h!=null?"$"+fmtN(q.h):"—"},
                {lbl:"Low",val:q.l!=null?"$"+fmtN(q.l):"—"},
                {lbl:"Prev Close",val:q.pc!=null?"$"+fmtN(q.pc):"—"},
                {lbl:"52W High",val:m["52WeekHigh"]!=null?"$"+fmtN(m["52WeekHigh"]):"—"},
                {lbl:"52W Low",val:m["52WeekLow"]!=null?"$"+fmtN(m["52WeekLow"]):"—"},
              ].map(item=>(
                <div key={item.lbl} className="ohlc-item">
                  <span className="ohlc-lbl">{item.lbl}</span>
                  <span className="ohlc-val">{item.val}</span>
                </div>
              ))}
            </div>

            <div className="chart-header">
              <div className="range-group">
                {RANGES.map((r,i)=>(
                  <button key={r.label} className={`range-btn ${rangeIdx===i?"active":""}`} onClick={()=>changeRange(i)}>{r.label}</button>
                ))}
              </div>
              <div className="ma-group">
                <button className={`ma-btn ${showMA50?"amber":""}`} onClick={()=>setShowMA50(!showMA50)}>MA 50</button>
                <button className={`ma-btn ${showMA200?"blue":""}`} onClick={()=>setShowMA200(!showMA200)}>MA 200</button>
              </div>
            </div>

            {chartError && (
              <div style={{textAlign:"center",padding:"20px 0",fontSize:13,color:"var(--amber)"}}>
                ⚠ {chartError}
                <button onClick={()=>changeRange(rangeIdx)} style={{marginLeft:10,background:"var(--amber-bg)",color:"var(--amber)",border:"1px solid var(--amber)",borderRadius:6,padding:"3px 10px",fontSize:12,cursor:"pointer",fontFamily:"var(--font)"}}>Retry</button>
              </div>
            )}
            {chartLoading ? (
              <div style={{height:240,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div className="spinner"/>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData} margin={{top:4,right:4,left:0,bottom:0}}>
                  <defs>
                    <linearGradient id="gUp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2db84d" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#2db84d" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gDown" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e8352a" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#e8352a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)"/>
                  <XAxis dataKey="date" tick={{fill:"#5a5a70",fontSize:10,fontFamily:"Satoshi"}} tickLine={false} axisLine={false} interval="preserveStartEnd"/>
                  <YAxis domain={[priceMin,priceMax]} tick={{fill:"#5a5a70",fontSize:10,fontFamily:"Satoshi"}} tickLine={false} axisLine={false} tickFormatter={v=>"$"+v.toFixed(0)} width={52}/>
                  <Tooltip content={<ChartTip/>} cursor={{stroke:"rgba(255,255,255,0.1)",strokeWidth:1,strokeDasharray:"4 2"}}/>
                  <Area type="monotone" dataKey="close" stroke={lineColor} strokeWidth={2} fill={isUp?"url(#gUp)":"url(#gDown)"} dot={false} name="Price"/>
                  {showMA50&&<Area type="monotone" dataKey="ma50" stroke="#f0a030" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 3" name="MA 50"/>}
                  {showMA200&&<Area type="monotone" dataKey="ma200" stroke="#3b8eea" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 3" name="MA 200"/>}
                </AreaChart>
              </ResponsiveContainer>
            )}

            {volumes.some(v=>v>0)&&(
              <div className="vol-wrap">
                <div className="vol-label">Volume</div>
                <div className="vol-bars">
                  {chartData.map((d,i)=>(
                    <div key={i} className="vol-bar" style={{
                      height:`${Math.max(4,((d.volume||0)/maxVol)*100)}%`,
                      background:d.close>=(chartData[i-1]?.close||d.close)?"#2db84d":"#e8352a"
                    }}/>
                  ))}
                </div>
              </div>
            )}
          </div>

          {sections.map(sec=>(
            <div key={sec.title} className={`section fade ${sec.delay}`}>
              <div className="section-title">{sec.title}</div>
              <div className="mgrid">
                {sec.metrics.map(met=>(
                  <div key={met.lbl} className="mcell">
                    <div className="mlbl">{met.lbl}</div>
                    <div className={`mval ${met.c||""}`}>{met.val}</div>
                    <div className="mhint">{met.hint}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>)}
      </div>
    </>
  );
}
