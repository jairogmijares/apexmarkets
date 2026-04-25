import { useState, useEffect, useRef } from "react";

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
  .chart-container { position: relative; width: 100%; height: 340px; border-radius: 10px; overflow: hidden; }
  .chart-type-group { display: flex; gap: 4px; }
  .chart-type-btn { font-size: 11px; font-weight: 600; color: var(--secondary); padding: 4px 10px; border-radius: 6px; border: 1.5px solid var(--border-strong); background: transparent; font-family: var(--font); cursor: pointer; transition: all 0.14s; letter-spacing: 0.5px; }
  .chart-type-btn.active { background: var(--accent-light); color: var(--accent); border-color: var(--accent); }
  .chart-zoom-hint { font-size: 11px; color: var(--tertiary); text-align: right; margin-top: 6px; }
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
  .chart-mode-btn { font-size: 12px; font-weight: 500; color: var(--secondary); padding: 5px 12px; border-radius: 6px; border: 1.5px solid var(--border-strong); background: transparent; font-family: var(--font); cursor: pointer; transition: all 0.14s; }
  .chart-mode-btn.active { background: var(--accent-light); color: var(--accent); border-color: var(--accent); }
  .chart-wrap { position: relative; user-select: none; touch-action: pan-y; }
  .zoom-controls { display: flex; gap: 6px; align-items: center; }
  .zoom-btn { font-size: 14px; font-weight: 600; color: var(--secondary); padding: 3px 10px; border-radius: 6px; border: 1.5px solid var(--border-strong); background: transparent; cursor: pointer; transition: all 0.14s; line-height: 1; }
  .zoom-btn:hover { border-color: var(--accent); color: var(--accent); }
  .candle-svg { overflow: visible; }
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

  // Fetch chart data via serverless proxy (handles MA warmup server-side)
  let priceHistory = [];
  try {
    const res = await fetch(`/api/chart?symbol=${sym}&interval=1d&range=3mo`);
    if (res.ok) {
      const data = await res.json();
      if (data.apexData) priceHistory = data.apexData;
    }
  } catch(e) { console.warn("Chart:", e.message); }

  return { quote, profile, metrics: metrics?.metric || {}, priceHistory };
}

async function fetchCandles(sym, key, rangeObj) {
  const intervalMap = { "1M":"1d","3M":"1d","6M":"1d","1Y":"1d","2Y":"1wk","5Y":"1mo" };
  const rangeMap = { "1M":"1mo","3M":"3mo","6M":"6mo","1Y":"1y","2Y":"2y","5Y":"5y" };
  const interval = intervalMap[rangeObj.label] || "1d";
  const range = rangeMap[rangeObj.label] || "3mo";
  const res = await fetch(`/api/chart?symbol=${sym}&interval=${interval}&range=${range}`);
  if (!res.ok) throw new Error("Chart error " + res.status);
  const data = await res.json();
  // Server returns pre-computed apexData with MAs already calculated
  if (data.apexData) return data.apexData;
  return [];
}

// Lightweight Charts component using TradingView library via CDN
function LWChart({ data, showMA50, showMA200, chartType, isUp }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const [lwReady, setLwReady] = useState(!!window.LightweightCharts);
  const [lwError, setLwError] = useState(null);

  // Wait for LW Charts script to load
  useEffect(() => {
    if (window.LightweightCharts) { setLwReady(true); return; }
    const check = setInterval(() => {
      if (window.LightweightCharts) { setLwReady(true); clearInterval(check); }
    }, 200);
    const timeout = setTimeout(() => {
      clearInterval(check);
      setLwError("Chart library failed to load");
    }, 10000);
    return () => { clearInterval(check); clearTimeout(timeout); };
  }, []);

  useEffect(() => {
    if (!lwReady || !containerRef.current || !data?.length) return;

    try {
      // Cleanup previous chart
      if (chartRef.current) {
        try { chartRef.current.remove(); } catch(e) {}
        chartRef.current = null;
      }

      const LWC = window.LightweightCharts;
      const chart = LWC.createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height: 320,
        layout: { background: { color: "transparent" }, textColor: "#5a5a70" },
        grid: { vertLines: { color: "rgba(255,255,255,0.04)" }, horzLines: { color: "rgba(255,255,255,0.04)" } },
        crosshair: { mode: LWC.CrosshairMode ? LWC.CrosshairMode.Normal : 1 },
        rightPriceScale: { borderColor: "rgba(255,255,255,0.07)" },
        timeScale: { borderColor: "rgba(255,255,255,0.07)", timeVisible: false, secondsVisible: false },
        handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true },
        handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
      });
      chartRef.current = chart;

      const upColor = "#2db84d";
      const downColor = "#e8352a";

      // Sort data by timestamp
      const sorted = [...data].sort((a, b) => a.ts - b.ts);

      if (chartType === "candle") {
        const series = chart.addCandlestickSeries({
          upColor, downColor,
          borderUpColor: upColor, borderDownColor: downColor,
          wickUpColor: upColor, wickDownColor: downColor,
        });
        const candles = sorted
          .filter(d => d.open != null && d.high != null && d.low != null && d.close != null)
          .map(d => ({ time: d.ts, open: d.open, high: d.high, low: d.low, close: d.close }));
        if (candles.length) series.setData(candles);
      } else {
        const series = chart.addAreaSeries({
          lineColor: isUp ? upColor : downColor,
          topColor: isUp ? "rgba(45,184,77,0.12)" : "rgba(232,53,42,0.12)",
          bottomColor: "rgba(0,0,0,0)",
          lineWidth: 2,
        });
        const pts = sorted.filter(d => d.close != null).map(d => ({ time: d.ts, value: d.close }));
        if (pts.length) series.setData(pts);
      }

      if (showMA50) {
        const s = chart.addLineSeries({ color: "#f0a030", lineWidth: 1.5, lineStyle: 2 });
        const pts = sorted.filter(d => d.ma50 != null).map(d => ({ time: d.ts, value: d.ma50 }));
        if (pts.length) s.setData(pts);
      }

      if (showMA200) {
        const s = chart.addLineSeries({ color: "#3b8eea", lineWidth: 1.5, lineStyle: 2 });
        const pts = sorted.filter(d => d.ma200 != null).map(d => ({ time: d.ts, value: d.ma200 }));
        if (pts.length) s.setData(pts);
      }

      chart.timeScale().fitContent();

      const handleResize = () => {
        if (containerRef.current && chartRef.current) {
          try { chartRef.current.applyOptions({ width: containerRef.current.clientWidth }); } catch(e) {}
        }
      };
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        if (chartRef.current) {
          try { chartRef.current.remove(); } catch(e) {}
          chartRef.current = null;
        }
      };
    } catch(e) {
      console.error("Chart error:", e);
      setLwError("Chart render failed: " + e.message);
    }
  }, [lwReady, data, showMA50, showMA200, chartType, isUp]);

  if (lwError) return (
    <div style={{height:320,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--amber)",fontSize:13}}>
      ⚠ {lwError}
    </div>
  );

  if (!lwReady) return (
    <div style={{height:320,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div className="spinner"/>
    </div>
  );

  return <div ref={containerRef} className="chart-container" style={{height:320}} />;
}


function CandleChart({ data, mode, isUp, showMA50, showMA200, priceMin, priceMax }) {
  const [tooltip, setTooltip] = useState(null);
  const svgRef = useRef(null);

  if (!data || data.length === 0) return <div style={{height:240,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--tertiary)",fontSize:13}}>No data</div>;

  const W = 900, H = 240, PAD_L = 52, PAD_R = 8, PAD_T = 8, PAD_B = 24;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const allVals = data.flatMap(d => [d.high||d.close, d.low||d.close, d.ma50, d.ma200].filter(Boolean));
  const minVal = Math.min(...allVals) * 0.997;
  const maxVal = Math.max(...allVals) * 1.003;
  const range = maxVal - minVal || 1;

  const toY = v => PAD_T + chartH - ((v - minVal) / range) * chartH;
  const toX = i => PAD_L + (i / (data.length - 1 || 1)) * chartW;

  const candleW = Math.max(2, Math.min(12, chartW / data.length - 2));

  // Price line path
  const linePath = data.map((d,i) => `${i===0?"M":"L"}${toX(i).toFixed(1)},${toY(d.close).toFixed(1)}`).join(" ");
  const areaPath = linePath + ` L${toX(data.length-1).toFixed(1)},${(PAD_T+chartH).toFixed(1)} L${PAD_L},${(PAD_T+chartH).toFixed(1)} Z`;

  // MA paths
  const maPath = (key) => data.map((d,i) => d[key] ? `${(!data.slice(0,i).find(p=>p[key])?"M":"L")}${toX(i).toFixed(1)},${toY(d[key]).toFixed(1)}` : "").filter(Boolean).join(" ");

  // Y axis ticks
  const yTicks = 5;
  const yTickVals = Array.from({length:yTicks}, (_,i) => minVal + (range * i / (yTicks-1)));

  // X axis ticks — show ~6 evenly spaced
  const xTickCount = Math.min(6, data.length);
  const xTickIdxs = Array.from({length:xTickCount}, (_,i) => Math.floor(i * (data.length-1) / (xTickCount-1)));

  const lineColor = isUp ? "#2db84d" : "#e8352a";

  return (
    <div style={{position:"relative"}} onMouseLeave={()=>setTooltip(null)}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{width:"100%",height:240,overflow:"visible"}}
        onMouseMove={e => {
          const rect = svgRef.current?.getBoundingClientRect();
          if (!rect) return;
          const mx = (e.clientX - rect.left) / rect.width * W;
          const idx = Math.round((mx - PAD_L) / chartW * (data.length - 1));
          if (idx >= 0 && idx < data.length) setTooltip({idx, x: mx, d: data[idx]});
        }}
      >
        {/* Grid */}
        {yTickVals.map((v,i) => (
          <g key={i}>
            <line x1={PAD_L} y1={toY(v).toFixed(1)} x2={W-PAD_R} y2={toY(v).toFixed(1)} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
            <text x={PAD_L-6} y={toY(v)+4} textAnchor="end" fill="#5a5a70" fontSize="10" fontFamily="Satoshi">${v.toFixed(0)}</text>
          </g>
        ))}

        {/* X axis labels */}
        {xTickIdxs.map(i => (
          <text key={i} x={toX(i)} y={H-4} textAnchor="middle" fill="#5a5a70" fontSize="10" fontFamily="Satoshi">{data[i]?.date}</text>
        ))}

        {/* Gradient def */}
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.15"/>
            <stop offset="100%" stopColor={lineColor} stopOpacity="0"/>
          </linearGradient>
        </defs>

        {mode === "area" ? (
          <>
            <path d={areaPath} fill="url(#cg)" />
            <path d={linePath} fill="none" stroke={lineColor} strokeWidth="2" strokeLinejoin="round"/>
          </>
        ) : (
          /* Candlesticks */
          data.map((d, i) => {
            const x = toX(i);
            const isGreen = d.close >= (d.open || d.close);
            const color = isGreen ? "#2db84d" : "#e8352a";
            const bodyTop = toY(Math.max(d.open||d.close, d.close));
            const bodyBot = toY(Math.min(d.open||d.close, d.close));
            const bodyH = Math.max(1, bodyBot - bodyTop);
            return (
              <g key={i}>
                {/* Wick */}
                <line x1={x} y1={toY(d.high||d.close)} x2={x} y2={toY(d.low||d.close)} stroke={color} strokeWidth="1"/>
                {/* Body */}
                <rect x={x - candleW/2} y={bodyTop} width={candleW} height={bodyH} fill={color} rx="1"/>
              </g>
            );
          })
        )}

        {/* MA lines */}
        {showMA50 && <path d={maPath("ma50")} fill="none" stroke="#f0a030" strokeWidth="1.5" strokeDasharray="4 3"/>}
        {showMA200 && <path d={maPath("ma200")} fill="none" stroke="#3b8eea" strokeWidth="1.5" strokeDasharray="4 3"/>}

        {/* Crosshair */}
        {tooltip && (
          <g>
            <line x1={tooltip.x} y1={PAD_T} x2={tooltip.x} y2={PAD_T+chartH} stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4 2"/>
          </g>
        )}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position:"absolute", top:8,
          left: tooltip.x / W * 100 > 60 ? undefined : tooltip.x / W * 100 + "%",
          right: tooltip.x / W * 100 > 60 ? (100 - tooltip.x / W * 100) + "%" : undefined,
          background:"rgba(20,20,24,0.95)", border:"1px solid rgba(255,255,255,0.12)",
          borderRadius:10, padding:"10px 14px", fontSize:12, fontFamily:"Satoshi", color:"#fff",
          pointerEvents:"none", minWidth:140, backdropFilter:"blur(12px)"
        }}>
          <div style={{color:"#5a5a70",fontSize:11,marginBottom:4}}>{tooltip.d.date}</div>
          <div style={{fontWeight:500,marginBottom:2}}>Close: <span style={{color:tooltip.d.close>=(tooltip.d.open||tooltip.d.close)?"#2db84d":"#e8352a"}}>${tooltip.d.close?.toFixed(2)}</span></div>
          {tooltip.d.open && <div style={{color:"#a0a0b0",fontSize:11}}>O: ${tooltip.d.open?.toFixed(2)} H: ${tooltip.d.high?.toFixed(2)} L: ${tooltip.d.low?.toFixed(2)}</div>}
          {tooltip.d.ma50 && showMA50 && <div style={{color:"#f0a030",fontSize:11}}>MA50: ${tooltip.d.ma50?.toFixed(2)}</div>}
          {tooltip.d.ma200 && showMA200 && <div style={{color:"#3b8eea",fontSize:11}}>MA200: ${tooltip.d.ma200?.toFixed(2)}</div>}
        </div>
      )}
    </div>
  );
}

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
  const [chartMode, setChartMode] = useState("area"); // "area" or "candle"
  const [zoomRange, setZoomRange] = useState(null); // {start, end} indices
  const [isPinching, setIsPinching] = useState(false);
  const pinchRef = useRef(null);
  const chartRef = useRef(null);
  const [error, setError] = useState("");
  const [stockData, setStockData] = useState(null);
  const [chartHistory, setChartHistory] = useState([]);
  const [rangeIdx, setRangeIdx] = useState(1);
  const [showMA50, setShowMA50] = useState(false);
  const [chartType, setChartType] = useState("area"); // "area" or "candle"
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

  const chartData = chartHistory; // MAs pre-computed in fetch

  const closes = chartData.map(d=>d.close);
  const volumes = chartData.map(d=>d.volume||0);
  const maxVol = Math.max(...volumes,1);
  const rsi = closes.length>15 ? calcRSI(closes) : null;
  const ma50v = calcMA(closes,50);
  const ma200v = calcMA(closes,200);
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
                  <button key={r.label} className={`range-btn ${rangeIdx===i?"active":""}`} onClick={()=>{changeRange(i);setZoomRange(null);}}>{r.label}</button>
                ))}
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                <div className="zoom-controls">
                  <button className="zoom-btn" onClick={()=>{
                    const len=chartData.length;
                    const cur=zoomRange||{start:0,end:len};
                    const mid=Math.floor((cur.start+cur.end)/2);
                    const quarter=Math.floor((cur.end-cur.start)/4);
                    setZoomRange({start:Math.max(0,mid-quarter),end:Math.min(len,mid+quarter)});
                  }}>+</button>
                  <button className="zoom-btn" onClick={()=>{
                    if(!zoomRange){return;}
                    const len=chartData.length;
                    const mid=Math.floor((zoomRange.start+zoomRange.end)/2);
                    const half=(zoomRange.end-zoomRange.start);
                    const ns=Math.max(0,mid-half);
                    const ne=Math.min(len,mid+half);
                    if(ne-ns>=len) setZoomRange(null);
                    else setZoomRange({start:ns,end:ne});
                  }}>−</button>
                  {zoomRange&&<button className="zoom-btn" onClick={()=>setZoomRange(null)} style={{fontSize:11}}>Reset</button>}
                </div>
                <button className={`chart-mode-btn ${chartMode==="area"?"active":""}`} onClick={()=>setChartMode("area")}>Line</button>
                <button className={`chart-mode-btn ${chartMode==="candle"?"active":""}`} onClick={()=>setChartMode("candle")}>Candles</button>
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
              <div className="chart-wrap" ref={chartRef}>
                <CandleChart
                  data={zoomRange ? chartData.slice(zoomRange.start, zoomRange.end) : chartData}
                  mode={chartMode}
                  isUp={isUp}
                  showMA50={showMA50}
                  showMA200={showMA200}
                  priceMin={priceMin}
                  priceMax={priceMax}
                />
              </div>
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
