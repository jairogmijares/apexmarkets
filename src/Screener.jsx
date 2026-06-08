import { useState } from "react";

const css = `
  .screener { max-width: 980px; margin: 0 auto; padding: 0 20px 80px; }

  .screener-header { margin-bottom: 24px; }
  .screener-title { font-size: 28px; font-weight: 600; letter-spacing: -0.5px; color: var(--text); margin-bottom: 6px; }
  .screener-sub { font-size: 13px; color: var(--tertiary); }

  .filter-card { background: var(--white); border-radius: var(--radius); padding: 24px 28px; box-shadow: var(--shadow); margin-bottom: 16px; }
  .filter-section-title { font-size: 11px; font-weight: 600; color: var(--tertiary); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; }
  .filter-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
  @media(max-width:720px) { .filter-grid { grid-template-columns: repeat(2,1fr); } }
  .filter-item { display: flex; flex-direction: column; gap: 6px; }
  .filter-label { font-size: 11px; font-weight: 600; color: var(--secondary); letter-spacing: 0.3px; }
  .filter-input { background: #1e1e26; border: 1.5px solid var(--border-strong); border-radius: var(--radius-sm); color: var(--text); font-family: var(--font); font-size: 13px; padding: 8px 12px; outline: none; transition: border-color 0.15s; width: 100%; }
  .filter-input:focus { border-color: var(--accent); }
  .filter-input::placeholder { color: var(--tertiary); font-size: 12px; }
  .filter-select { background: #1e1e26; border: 1.5px solid var(--border-strong); border-radius: var(--radius-sm); color: var(--text); font-family: var(--font); font-size: 13px; padding: 8px 12px; outline: none; cursor: pointer; width: 100%; }

  .filter-actions { display: flex; gap: 10px; align-items: center; margin-top: 20px; flex-wrap: wrap; }
  .screen-btn { background: var(--accent); color: #fff; font-family: var(--font); font-size: 14px; font-weight: 600; padding: 11px 28px; border: none; border-radius: var(--radius-sm); cursor: pointer; transition: opacity 0.15s; }
  .screen-btn:hover { opacity: 0.87; }
  .screen-btn:disabled { opacity: 0.38; cursor: not-allowed; }
  .reset-btn { background: transparent; color: var(--secondary); font-family: var(--font); font-size: 13px; font-weight: 500; padding: 11px 18px; border: 1.5px solid var(--border-strong); border-radius: var(--radius-sm); cursor: pointer; transition: all 0.14s; }
  .reset-btn:hover { border-color: var(--accent); color: var(--accent); }
  .scan-info { font-size: 12px; color: var(--tertiary); }

  .results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 10px; }
  .results-count { font-size: 14px; font-weight: 600; color: var(--text); }
  .results-count span { color: var(--accent); }
  .view-toggle { display: flex; gap: 4px; }
  .view-btn { background: rgba(255,255,255,0.05); border: 1.5px solid var(--border-strong); color: var(--secondary); font-family: var(--font); font-size: 12px; font-weight: 500; padding: 5px 12px; border-radius: 6px; cursor: pointer; transition: all 0.14s; }
  .view-btn.active { background: var(--accent-light); color: var(--accent); border-color: var(--accent); }

  /* Table view */
  .results-table-wrap { background: var(--white); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
  .results-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .results-table th { background: rgba(255,255,255,0.03); padding: 12px 16px; text-align: left; font-size: 10px; font-weight: 600; color: var(--tertiary); letter-spacing: 0.8px; text-transform: uppercase; border-bottom: 1px solid var(--border); cursor: pointer; white-space: nowrap; user-select: none; transition: color 0.14s; }
  .results-table th:hover { color: var(--accent); }
  .results-table th.sorted { color: var(--accent); }
  .sort-arrow { margin-left: 4px; opacity: 0.6; }
  .results-table td { padding: 13px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; }
  .results-table tr:last-child td { border-bottom: none; }
  .results-table tr:hover td { background: rgba(255,255,255,0.02); cursor: pointer; }
  .ticker-cell { font-weight: 700; color: var(--accent); font-size: 14px; }
  .name-cell { color: var(--secondary); font-size: 12px; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .price-cell { font-weight: 600; color: var(--text); }
  .chg-pos { color: var(--green); font-weight: 500; }
  .chg-neg { color: var(--red); font-weight: 500; }
  .num-cell { color: var(--text); }
  .na-cell { color: var(--tertiary); }

  /* Card view */
  .results-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  @media(max-width:720px) { .results-cards { grid-template-columns: repeat(2,1fr); } }
  @media(max-width:480px) { .results-cards { grid-template-columns: 1fr; } }
  .result-card { background: var(--white); border-radius: var(--radius); padding: 18px 20px; box-shadow: var(--shadow); cursor: pointer; transition: all 0.15s; border: 1.5px solid transparent; }
  .result-card:hover { border-color: var(--accent); transform: translateY(-2px); }
  .rc-ticker { font-size: 15px; font-weight: 700; color: var(--accent); margin-bottom: 2px; }
  .rc-name { font-size: 11px; color: var(--tertiary); margin-bottom: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .rc-price { font-size: 22px; font-weight: 300; letter-spacing: -0.5px; color: var(--text); margin-bottom: 4px; }
  .rc-chg { font-size: 12px; font-weight: 600; margin-bottom: 14px; }
  .rc-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .rc-metric { display: flex; flex-direction: column; gap: 2px; }
  .rc-ml { font-size: 9px; font-weight: 600; color: var(--tertiary); letter-spacing: 0.5px; text-transform: uppercase; }
  .rc-mv { font-size: 13px; font-weight: 500; color: var(--text); }

  .empty-results { background: var(--white); border-radius: var(--radius); padding: 60px 40px; text-align: center; box-shadow: var(--shadow); }
  .empty-results-icon { font-size: 36px; opacity: 0.2; margin-bottom: 14px; }
  .empty-results-t { font-size: 17px; font-weight: 600; color: var(--secondary); margin-bottom: 6px; }
  .empty-results-s { font-size: 13px; color: var(--tertiary); }

  .screener-loading { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 60px 0; }
  .screener-progress { width: 100%; max-width: 300px; height: 3px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .screener-progress-bar { height: 100%; background: var(--accent); border-radius: 2px; animation: progress 8s ease-in-out forwards; }
  @keyframes progress { 0%{width:0%} 80%{width:85%} 100%{width:90%} }
  .screener-loading-label { font-size: 14px; font-weight: 500; color: var(--secondary); }
  .screener-loading-sub { font-size: 12px; color: var(--tertiary); }

  .preset-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
  .preset-btn { font-size: 12px; font-weight: 500; color: var(--secondary); background: rgba(255,255,255,0.05); border: 1.5px solid var(--border-strong); border-radius: 20px; padding: 5px 14px; cursor: pointer; transition: all 0.14s; }
  .preset-btn:hover { background: var(--accent-light); color: var(--accent); border-color: var(--accent); }
`;

const fmt = (n, d=2) => (n==null||isNaN(n)) ? "—" : Number(n).toFixed(d);
const fmtB = (n) => {
  if (n==null||isNaN(n)) return "—";
  const a = Math.abs(n);
  if (a>=1e12) return "$"+(n/1e12).toFixed(2)+"T";
  if (a>=1e9) return "$"+(n/1e9).toFixed(2)+"B";
  if (a>=1e6) return "$"+(n/1e6).toFixed(2)+"M";
  return "$"+Number(n).toFixed(2);
};
const sgn = (n) => n > 0 ? "+" : "";

const PRESETS = {
  "📈 Long-Term": {
    peMin: 5, peMax: 50,
    profitMarginMin: 5,
    aboveMa200: true,
    goldenCrossOnly: true,
    sortBy: "return1Y", sortDir: "desc"
  },
  "⚡ Swing Trade": {
    aboveMa50: true,
    rsiMin: 50, rsiMax: 70,
    return1MMin: 2,
    betaMax: 3,
    sortBy: "return1M", sortDir: "desc"
  },
};

const COLUMNS = [
  { key: "symbol", label: "Ticker" },
  { key: "name", label: "Company" },
  { key: "price", label: "Price" },
  { key: "changePct", label: "Chg %" },
  { key: "marketCap", label: "Mkt Cap" },
  { key: "peRatio", label: "P/E" },
  { key: "profitMargin", label: "Margin" },
  { key: "rsi", label: "RSI" },
  { key: "aboveMa50", label: "MA50" },
  { key: "aboveMa200", label: "MA200" },
  { key: "return1M", label: "Ret 1M" },
  { key: "return1Y", label: "Ret 1Y" },
  { key: "beta", label: "Beta" },
];

const DEFAULT_FILTERS = {
  peMin: "", peMax: "", epsMin: "",
  profitMarginMin: "", marketCapMin: "", marketCapMax: "",
  betaMax: "", return1MMin: "", return1YMin: "",
  dividendYieldMin: "", fromHighMax: "",
  aboveMa50: false, aboveMa200: false, goldenCrossOnly: false,
  rsiMin: "", rsiMax: "",
  sortBy: "marketCap", sortDir: "desc",
};

export default function Screener({ apiKey, onSelectTicker }) {
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [scanned, setScanned] = useState(0);
  const [view, setView] = useState("table");
  const [sortKey, setSortKey] = useState("marketCap");
  const [sortDir, setSortDir] = useState("desc");
  const [error, setError] = useState("");

  function setFilter(k, v) { setFilters(f => ({ ...f, [k]: v })); }

  function applyPreset(preset) {
    setFilters({ ...DEFAULT_FILTERS, ...PRESETS[preset] });
  }

  function reset() {
    setFilters({ ...DEFAULT_FILTERS });
    setResults(null);
    setError("");
  }

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(d => d === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const numFilter = (v) => v === "" ? null : parseFloat(v);

  async function runScreen() {
    if (!apiKey) { setError("API key required"); return; }
    setLoading(true); setError(""); setResults(null);
    try {
      const f = {
        peMin: numFilter(filters.peMin),
        peMax: numFilter(filters.peMax),
        epsMin: numFilter(filters.epsMin),
        profitMarginMin: numFilter(filters.profitMarginMin),
        marketCapMin: filters.marketCapMin ? parseFloat(filters.marketCapMin) * 1e9 : null,
        marketCapMax: filters.marketCapMax ? parseFloat(filters.marketCapMax) * 1e9 : null,
        betaMax: numFilter(filters.betaMax),
        return1MMin: numFilter(filters.return1MMin),
        return1YMin: numFilter(filters.return1YMin),
        dividendYieldMin: numFilter(filters.dividendYieldMin),
        fromHighMax: numFilter(filters.fromHighMax),
        rsiMin: numFilter(filters.rsiMin),
        rsiMax: numFilter(filters.rsiMax),
        aboveMa50: filters.aboveMa50 || false,
        aboveMa200: filters.aboveMa200 || false,
        goldenCrossOnly: filters.goldenCrossOnly || false,
        sortBy: sortKey,
        sortDir,
      };
      const res = await fetch("/api/screener", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: apiKey, filters: f }),
      });
      if (!res.ok) throw new Error("Screener error " + res.status);
      const data = await res.json();
      setResults(data.results || []);
      setScanned(data.scanned || 0);
      if (data.debug) console.log('Screener debug:', JSON.stringify(data.debug));
    } catch(e) {
      setError(e.message || "Screener failed. Try again.");
    }
    setLoading(false);
  }

  // Sort results client-side
  const sorted = results ? [...results].sort((a, b) => {
    const av = a[sortKey] ?? -Infinity;
    const bv = b[sortKey] ?? -Infinity;
    return sortDir === "desc" ? bv - av : av - bv;
  }) : [];

  const cellVal = (s, key) => {
    const v = s[key];
    if (v == null) return <span className="na-cell">—</span>;
    if (key === "symbol") return <span className="ticker-cell">{v}</span>;
    if (key === "name") return <span className="name-cell" title={v}>{v}</span>;
    if (key === "price") return <span className="price-cell">${fmt(v)}</span>;
    if (key === "changePct") return <span className={v >= 0 ? "chg-pos" : "chg-neg"}>{sgn(v)}{fmt(v, 2)}%</span>;
    if (key === "marketCap") return <span className="num-cell">{fmtB(v)}</span>;
    if (key === "profitMargin" || key === "return1M" || key === "return1Y") {
      return <span className={v >= 0 ? "chg-pos" : "chg-neg"}>{sgn(v)}{fmt(v, 1)}%</span>;
    }
    if (key === "aboveMa50" || key === "aboveMa200") {
      return <span style={{color: v ? "var(--green)" : "var(--red)", fontWeight:600}}>{v ? "✓" : "✗"}</span>;
    }
    if (key === "rsi") {
      const color = v > 70 ? "var(--red)" : v < 30 ? "var(--green)" : "var(--text)";
      return <span style={{color, fontWeight:500}}>{fmt(v,1)}</span>;
    }
    return <span className="num-cell">{fmt(v)}</span>;
  };

  return (
    <>
      <style>{css}</style>
      <div className="screener">
        <div className="screener-header">
          <div className="screener-title">Stock Screener</div>
          <div className="screener-sub">Screen ~150 stocks across fundamentals, technicals and momentum</div>
        </div>

        <div className="filter-card">
          {/* Presets */}
          <div className="filter-section-title">Quick Presets</div>
          <div className="preset-row">
            {Object.keys(PRESETS).map(p => (
              <button key={p} className="preset-btn" onClick={() => applyPreset(p)}>{p}</button>
            ))}
          </div>

          {/* Fundamentals */}
          <div className="filter-section-title" style={{marginTop:20}}>Fundamentals</div>
          <div className="filter-grid">
            <div className="filter-item">
              <label className="filter-label">P/E Min</label>
              <input className="filter-input" type="number" placeholder="e.g. 5" value={filters.peMin} onChange={e=>setFilter("peMin",e.target.value)}/>
            </div>
            <div className="filter-item">
              <label className="filter-label">P/E Max</label>
              <input className="filter-input" type="number" placeholder="e.g. 30" value={filters.peMax} onChange={e=>setFilter("peMax",e.target.value)}/>
            </div>
            <div className="filter-item">
              <label className="filter-label">EPS Min ($)</label>
              <input className="filter-input" type="number" placeholder="e.g. 1" value={filters.epsMin} onChange={e=>setFilter("epsMin",e.target.value)}/>
            </div>
            <div className="filter-item">
              <label className="filter-label">Rev Growth 3Y Min (%)</label>
              <input className="filter-input" type="number" placeholder="e.g. 10" value={filters.revGrowthMin} onChange={e=>setFilter("revGrowthMin",e.target.value)}/>
            </div>
            <div className="filter-item">
              <label className="filter-label">Profit Margin Min (%)</label>
              <input className="filter-input" type="number" placeholder="e.g. 15" value={filters.profitMarginMin} onChange={e=>setFilter("profitMarginMin",e.target.value)}/>
            </div>
            <div className="filter-item">
              <label className="filter-label">Market Cap Min ($B)</label>
              <input className="filter-input" type="number" placeholder="e.g. 1" value={filters.marketCapMin} onChange={e=>setFilter("marketCapMin",e.target.value)}/>
            </div>
            <div className="filter-item">
              <label className="filter-label">Market Cap Max ($B)</label>
              <input className="filter-input" type="number" placeholder="e.g. 100" value={filters.marketCapMax} onChange={e=>setFilter("marketCapMax",e.target.value)}/>
            </div>
            <div className="filter-item">
              <label className="filter-label">Dividend Yield Min (%)</label>
              <input className="filter-input" type="number" placeholder="e.g. 2" value={filters.dividendYieldMin} onChange={e=>setFilter("dividendYieldMin",e.target.value)}/>
            </div>
          </div>

          {/* Momentum & Risk */}
          <div className="filter-section-title" style={{marginTop:24}}>Momentum & Risk</div>
          <div className="filter-grid">
            <div className="filter-item">
              <label className="filter-label">Return 1M Min (%)</label>
              <input className="filter-input" type="number" placeholder="e.g. 5" value={filters.return1MMin} onChange={e=>setFilter("return1MMin",e.target.value)}/>
            </div>
            <div className="filter-item">
              <label className="filter-label">Return 1Y Min (%)</label>
              <input className="filter-input" type="number" placeholder="e.g. 20" value={filters.return1YMin} onChange={e=>setFilter("return1YMin",e.target.value)}/>
            </div>
            <div className="filter-item">
              <label className="filter-label">Beta Max</label>
              <input className="filter-input" type="number" placeholder="e.g. 1.5" value={filters.betaMax} onChange={e=>setFilter("betaMax",e.target.value)}/>
            </div>
            <div className="filter-item">
              <label className="filter-label">From 52W High Max (%)</label>
              <input className="filter-input" type="number" placeholder="e.g. -5" value={filters.fromHighMax} onChange={e=>setFilter("fromHighMax",e.target.value)}/>
            </div>
          </div>

          {/* Technical */}
          <div className="filter-section-title" style={{marginTop:24}}>Technical</div>
          <div className="filter-grid">
            <div className="filter-item">
              <label className="filter-label">RSI Min</label>
              <input className="filter-input" type="number" placeholder="e.g. 40" value={filters.rsiMin} onChange={e=>setFilter("rsiMin",e.target.value)}/>
            </div>
            <div className="filter-item">
              <label className="filter-label">RSI Max</label>
              <input className="filter-input" type="number" placeholder="e.g. 70" value={filters.rsiMax} onChange={e=>setFilter("rsiMax",e.target.value)}/>
            </div>
            <div className="filter-item" style={{justifyContent:"flex-end",paddingTop:20}}>
              <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:"var(--secondary)"}}>
                <input type="checkbox" checked={filters.aboveMa50} onChange={e=>setFilter("aboveMa50",e.target.checked)} style={{width:15,height:15,accentColor:"var(--amber)"}}/>
                Price Above MA 50
              </label>
            </div>
            <div className="filter-item" style={{justifyContent:"flex-end",paddingTop:20}}>
              <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:"var(--secondary)"}}>
                <input type="checkbox" checked={filters.aboveMa200} onChange={e=>setFilter("aboveMa200",e.target.checked)} style={{width:15,height:15,accentColor:"var(--accent)"}}/>
                Price Above MA 200
              </label>
            </div>
            <div className="filter-item" style={{justifyContent:"flex-end",paddingTop:4}}>
              <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:"var(--secondary)"}}>
                <input type="checkbox" checked={filters.goldenCrossOnly} onChange={e=>setFilter("goldenCrossOnly",e.target.checked)} style={{width:15,height:15,accentColor:"var(--green)"}}/>
                Golden Cross Only
              </label>
            </div>
          </div>

          {/* Sort */}
          <div className="filter-section-title" style={{marginTop:24}}>Sort Results By</div>
          <div className="filter-grid">
            <div className="filter-item">
              <label className="filter-label">Sort Field</label>
              <select className="filter-select" value={sortKey} onChange={e=>setSortKey(e.target.value)}>
                <option value="marketCap">Market Cap</option>
                <option value="peRatio">P/E Ratio</option>
                <option value="eps">EPS</option>
                <option value="revenueGrowth">Revenue Growth</option>
                <option value="profitMargin">Profit Margin</option>
                <option value="return1M">Return 1M</option>
                <option value="return1Y">Return 1Y</option>
                <option value="changePct">Today's Change</option>
                <option value="beta">Beta</option>
                <option value="dividendYield">Dividend Yield</option>
              </select>
            </div>
            <div className="filter-item">
              <label className="filter-label">Direction</label>
              <select className="filter-select" value={sortDir} onChange={e=>setSortDir(e.target.value)}>
                <option value="desc">Highest First</option>
                <option value="asc">Lowest First</option>
              </select>
            </div>
          </div>

          <div className="filter-actions">
            <button className="screen-btn" onClick={runScreen} disabled={loading}>
              {loading ? "Scanning…" : "Run Screen"}
            </button>
            <button className="reset-btn" onClick={reset}>Reset</button>
            {scanned > 0 && <span className="scan-info">Scanned {scanned} stocks</span>}
          </div>
        </div>

        {error && <div style={{background:"var(--red-bg)",color:"var(--red)",borderRadius:"var(--radius-sm)",padding:"12px 18px",fontSize:13,fontWeight:500,marginBottom:12}}>⚠ {error}</div>}
        {results && results.length === 0 && scanned > 0 && <div style={{background:"var(--amber-bg)",color:"var(--amber)",borderRadius:"var(--radius-sm)",padding:"12px 18px",fontSize:12,marginBottom:12}}>Scanned {scanned} stocks, 0 matched. Try loosening filters or using no filters to test.</div>}

        {loading && (
          <div className="screener-loading">
            <div className="screener-loading-label">Scanning the market…</div>
            <div className="screener-progress"><div className="screener-progress-bar"/></div>
            <div className="screener-loading-sub">Fetching data for 40 stocks including live technical indicators.</div>
          </div>
        )}

        {!loading && results && (
          <>
            <div className="results-header">
              <div className="results-count"><span>{sorted.length}</span> results found</div>
              <div className="view-toggle">
                <button className={`view-btn ${view==="table"?"active":""}`} onClick={()=>setView("table")}>Table</button>
                <button className={`view-btn ${view==="cards"?"active":""}`} onClick={()=>setView("cards")}>Cards</button>
              </div>
            </div>

            {sorted.length === 0 ? (
              <div className="empty-results">
                <div className="empty-results-icon">🔍</div>
                <div className="empty-results-t">No stocks match your filters</div>
                <div className="empty-results-s">Try loosening your criteria or using a preset</div>
              </div>
            ) : view === "table" ? (
              <div className="results-table-wrap">
                <table className="results-table">
                  <thead>
                    <tr>
                      {COLUMNS.map(col => (
                        <th key={col.key} className={sortKey===col.key?"sorted":""} onClick={()=>handleSort(col.key)}>
                          {col.label}
                          {sortKey===col.key && <span className="sort-arrow">{sortDir==="desc"?"↓":"↑"}</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map(s => (
                      <tr key={s.symbol} onClick={() => onSelectTicker(s.symbol)}>
                        {COLUMNS.map(col => <td key={col.key}>{cellVal(s, col.key)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="results-cards">
                {sorted.map(s => (
                  <div key={s.symbol} className="result-card" onClick={() => onSelectTicker(s.symbol)}>
                    <div className="rc-ticker">{s.symbol}</div>
                    <div className="rc-name">{s.name}</div>
                    <div className="rc-price">${fmt(s.price)}</div>
                    <div className={`rc-chg ${s.changePct>=0?"chg-pos":"chg-neg"}`}>
                      {sgn(s.changePct)}{fmt(s.changePct,2)}% today
                    </div>
                    <div className="rc-metrics">
                      <div className="rc-metric"><span className="rc-ml">P/E</span><span className="rc-mv">{fmt(s.peRatio)}</span></div>
                      <div className="rc-metric"><span className="rc-ml">Mkt Cap</span><span className="rc-mv">{fmtB(s.marketCap)}</span></div>
                      <div className="rc-metric"><span className="rc-ml">Rev Gr</span><span className="rc-mv">{s.revenueGrowth!=null?fmt(s.revenueGrowth,1)+"%":"—"}</span></div>
                      <div className="rc-metric"><span className="rc-ml">Ret 1Y</span><span className={`rc-mv ${s.return1Y>=0?"chg-pos":"chg-neg"}`}>{s.return1Y!=null?sgn(s.return1Y)+fmt(s.return1Y,1)+"%":"—"}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
