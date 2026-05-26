const TICKERS = [
  "AAPL","MSFT","NVDA","GOOGL","AMZN","META","TSLA","JPM","V","UNH",
  "XOM","LLY","JNJ","MA","AVGO","HD","CVX","MRK","ABBV","COST",
  "PEP","KO","ADBE","WMT","BAC","CRM","MCD","CSCO","NFLX","TXN",
  "NKE","WFC","AMD","INTC","ORCL","QCOM","GS","SBUX","INTU","GILD",
  "NOW","PLTR","COIN","DDOG","SNOW","NET","CELH","SQ","PYPL","UBER"
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

  const results = [];

  // Process 3 at a time with 1.2s delay to stay under 60 req/min
  for (let i = 0; i < TICKERS.length; i += 3) {
    const batch = TICKERS.slice(i, i + 3);
    const batchResults = await Promise.allSettled(
      batch.map(async (sym) => {
        try {
          const [qRes, pRes, mRes] = await Promise.all([
            fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${key}`),
            fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${sym}&token=${key}`),
            fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${sym}&metric=all&token=${key}`),
          ]);
          const [quote, profile, metrics] = await Promise.all([qRes.json(), pRes.json(), mRes.json()]);
          if (!quote || !quote.c || quote.c === 0) return null;
          const m = metrics?.metric || {};
          return {
            symbol: sym,
            name: profile?.name || sym,
            exchange: profile?.exchange || "",
            industry: profile?.finnhubIndustry || "",
            price: quote.c,
            change: quote.d,
            changePct: quote.dp,
            marketCap: profile?.marketCapitalization ? profile.marketCapitalization * 1e6 : null,
            peRatio: m.peBasicExclExtraTTM || null,
            eps: m.epsBasicExclExtraItemsTTM || null,
            revenueGrowth: m.revenueGrowth3Y || null,
            profitMargin: m.netProfitMarginTTM || null,
            grossMargin: m.grossMarginTTM || null,
            pbRatio: m.pbAnnual || null,
            evEbitda: m.evEbitdaTTM || null,
            psRatio: m.psTTM || null,
            beta: m.beta || null,
            week52High: m["52WeekHigh"] || null,
            week52Low: m["52WeekLow"] || null,
            return1M: m["1MonthPriceReturnDaily"] || null,
            returnYTD: m.ytdPriceReturnDaily || null,
            return1Y: m["52WeekPriceReturnDaily"] || null,
            debtToEquity: m.totalDebt_totalEquityAnnual || null,
            currentRatio: m.currentRatioAnnual || null,
            dividendYield: m.dividendYieldIndicatedAnnual || null,
          };
        } catch { return null; }
      })
    );
    batchResults.forEach(r => { if (r.status === "fulfilled" && r.value) results.push(r.value); });
    if (i + 3 < TICKERS.length) await new Promise(r => setTimeout(r, 1200));
  }

  // Apply filters
  const filtered = results.filter(s => {
    if (!s) return false;
    const n = (v, min, max) => {
      if (min != null && (v == null || v < min)) return false;
      if (max != null && (v == null || v > max)) return false;
      return true;
    };
    if (!n(s.peRatio, f.peMin, f.peMax)) return false;
    if (f.epsMin != null && (s.eps == null || s.eps < f.epsMin)) return false;
    if (f.revGrowthMin != null && (s.revenueGrowth == null || s.revenueGrowth < f.revGrowthMin)) return false;
    if (f.profitMarginMin != null && (s.profitMargin == null || s.profitMargin < f.profitMarginMin)) return false;
    if (!n(s.marketCap, f.marketCapMin, f.marketCapMax)) return false;
    if (f.betaMax != null && (s.beta == null || s.beta > f.betaMax)) return false;
    if (f.return1MMin != null && (s.return1M == null || s.return1M < f.return1MMin)) return false;
    if (f.return1YMin != null && (s.return1Y == null || s.return1Y < f.return1YMin)) return false;
    if (f.dividendYieldMin != null && (s.dividendYield == null || s.dividendYield < f.dividendYieldMin)) return false;
    if (f.fromHighMax != null && s.week52High && s.price) {
      const fromHigh = ((s.price / s.week52High) - 1) * 100;
      if (fromHigh < f.fromHighMax) return false;
    }
    return true;
  });

  const sortBy = f.sortBy || "marketCap";
  const sortDir = f.sortDir || "desc";
  filtered.sort((a, b) => {
    const av = a[sortBy] ?? (sortDir === "desc" ? -Infinity : Infinity);
    const bv = b[sortBy] ?? (sortDir === "desc" ? -Infinity : Infinity);
    return sortDir === "desc" ? bv - av : av - bv;
  });

  res.status(200).json({ results: filtered, total: filtered.length, scanned: results.length });
}
