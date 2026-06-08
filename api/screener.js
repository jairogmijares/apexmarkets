const TICKERS = [
  "AAPL","MSFT","NVDA","GOOGL","AMZN","META","TSLA","JPM","V","UNH",
  "XOM","LLY","MA","AVGO","HD","CVX","ABBV","COST","PEP","KO",
  "WMT","BAC","MCD","NFLX","TXN","NKE","AMD","ORCL","QCOM","GS",
  "NOW","PLTR","COIN","DDOG","CELH","SQ","PYPL","UBER","SNOW","NET"
];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch {} }
  const { key, filters } = body || {};
  if (!key) return res.status(400).json({ error: "Missing API key" });
  let f = {};
  try { f = typeof filters === "string" ? JSON.parse(filters) : (filters || {}); } catch {}

  // Fetch all tickers in parallel — faster, stays under 10s Vercel limit
  const allResults = await Promise.allSettled(
    TICKERS.map(async (sym) => {
      try {
        const [qRes, pRes, mRes, candleRes] = await Promise.all([
          fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${key}`),
          fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${sym}&token=${key}`),
          fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${sym}&metric=all&token=${key}`),
          // Fetch 200 days of candles for MA calculation
          fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${sym}&resolution=D&from=${Math.floor(Date.now()/1000)-220*86400}&to=${Math.floor(Date.now()/1000)}&token=${key}`),
        ]);
        const [quote, profile, metrics, candles] = await Promise.all([
          qRes.json(), pRes.json(), mRes.json(), candleRes.json()
        ]);

        if (!quote || !quote.c || quote.c === 0) return null;
        const m = metrics?.metric || {};
        const price = quote.c;

        // Calculate MAs from candle data
        let ma50 = null, ma200 = null, aboveMa50 = null, aboveMa200 = null;
        let rsi = null;
        if (candles?.s === "ok" && candles.c?.length) {
          const closes = candles.c;
          if (closes.length >= 50) {
            ma50 = closes.slice(-50).reduce((a,b)=>a+b,0)/50;
            aboveMa50 = price > ma50;
          }
          if (closes.length >= 200) {
            ma200 = closes.slice(-200).reduce((a,b)=>a+b,0)/200;
            aboveMa200 = price > ma200;
          }
          // RSI 14
          if (closes.length >= 15) {
            let g=0, l=0;
            for (let i=1;i<=14;i++){const d=closes[i]-closes[i-1];if(d>0)g+=d;else l-=d;}
            let ag=g/14, al=l/14;
            for (let i=15;i<closes.length;i++){
              const d=closes[i]-closes[i-1];
              ag=(ag*13+(d>0?d:0))/14;
              al=(al*13+(d<0?-d:0))/14;
            }
            rsi = al===0 ? 100 : 100-100/(1+ag/al);
          }
          // MA signal
        }

        const ma50v2 = closes?.length >= 50 ? candles.c.slice(-50).reduce((a,b)=>a+b,0)/50 : null;
        const ma200v2 = closes?.length >= 200 ? candles.c.slice(-200).reduce((a,b)=>a+b,0)/200 : null;
        const goldenCross = ma50v2 && ma200v2 ? ma50v2 > ma200v2 : null;

        return {
          symbol: sym,
          name: profile?.name || sym,
          exchange: profile?.exchange || "",
          industry: profile?.finnhubIndustry || "",
          price,
          change: quote.d,
          changePct: quote.dp,
          marketCap: profile?.marketCapitalization ? profile.marketCapitalization * 1e6 : null,
          peRatio: m.peBasicExclExtraTTM || null,
          eps: m.epsBasicExclExtraItemsTTM || null,
          revenueGrowth: m.revenueGrowth3Y || null,
          profitMargin: m.netProfitMarginTTM || null,
          pbRatio: m.pbAnnual || null,
          psRatio: m.psTTM || null,
          beta: m.beta || null,
          week52High: m["52WeekHigh"] || null,
          week52Low: m["52WeekLow"] || null,
          return1M: m["1MonthPriceReturnDaily"] || null,
          returnYTD: m.ytdPriceReturnDaily || null,
          return1Y: m["52WeekPriceReturnDaily"] || null,
          dividendYield: m.dividendYieldIndicatedAnnual || null,
          // Technical
          ma50, ma200, aboveMa50, aboveMa200, rsi, goldenCross,
        };
      } catch { return null; }
    })
  );

  const results = allResults
    .filter(r => r.status === "fulfilled" && r.value)
    .map(r => r.value);

  const filtered = results.filter(s => {
    if (!s) return false;
    const chk = (val, min, max) => {
      if (val == null) return true;
      if (min != null && val < min) return false;
      if (max != null && val > max) return false;
      return true;
    };
    if (!chk(s.peRatio, f.peMin, f.peMax)) return false;
    if (f.epsMin != null && s.eps != null && s.eps < f.epsMin) return false;
    if (f.profitMarginMin != null && s.profitMargin != null && s.profitMargin < f.profitMarginMin) return false;
    if (!chk(s.marketCap, f.marketCapMin, f.marketCapMax)) return false;
    if (f.betaMax != null && s.beta != null && s.beta > f.betaMax) return false;
    if (f.return1MMin != null && s.return1M != null && s.return1M < f.return1MMin) return false;
    if (f.return1YMin != null && s.return1Y != null && s.return1Y < f.return1YMin) return false;
    if (f.dividendYieldMin != null && s.dividendYield != null && s.dividendYield < f.dividendYieldMin) return false;
    // Technical filters
    if (f.aboveMa50 === true && s.aboveMa50 === false) return false;
    if (f.aboveMa200 === true && s.aboveMa200 === false) return false;
    if (f.goldenCrossOnly === true && s.goldenCross !== true) return false;
    if (f.rsiMin != null && s.rsi != null && s.rsi < f.rsiMin) return false;
    if (f.rsiMax != null && s.rsi != null && s.rsi > f.rsiMax) return false;
    return true;
  });

  const sortBy = f.sortBy || "marketCap";
  const sortDir = f.sortDir || "desc";
  filtered.sort((a, b) => {
    const av = a[sortBy] ?? (sortDir === "desc" ? -Infinity : Infinity);
    const bv = b[sortBy] ?? (sortDir === "desc" ? -Infinity : Infinity);
    return sortDir === "desc" ? bv - av : av - bv;
  });

  res.status(200).json({ 
    results: filtered, 
    total: filtered.length, 
    scanned: results.length,
    debug: {
      firstTicker: results[0] ? { sym: results[0].symbol, pe: results[0].peRatio, margin: results[0].profitMargin, ret1m: results[0].return1M, beta: results[0].beta } : null,
      filters: f,
      rawCount: results.length
    }
  });
}
