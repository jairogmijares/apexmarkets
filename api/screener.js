const TICKERS = [
  "AAPL","MSFT","NVDA","GOOGL","AMZN","META","TSLA","BRK.B","JPM","V",
  "UNH","XOM","LLY","JNJ","MA","AVGO","HD","CVX","MRK","ABBV",
  "COST","PEP","KO","ADBE","WMT","BAC","CRM","TMO","ACN","MCD",
  "CSCO","ABT","NFLX","DHR","TXN","NKE","WFC","MS","AMD","INTC",
  "NEE","PM","RTX","ORCL","QCOM","HON","T","AMGN","LOW","CAT",
  "GS","BLK","SBUX","INTU","MDT","AXP","LMT","DE","GILD","ISRG",
  "SPGI","ADI","BKNG","REGN","PLD","TJX","SYK","MMC","ZTS","MO",
  "NOW","MDLZ","CI","BMY","AON","DUK","SO","ITW","TGT","EMR",
  "GM","F","RIVN","LCID","PLTR","SOFI","HOOD","COIN","RBLX","SNAP",
  "UBER","LYFT","ABNB","DASH","PINS","TWLO","DDOG","SNOW","NET","ZM",
  "CELH","ENPH","FSLR","SEDG","PLUG","BE","BLNK","CHPT","ARRY","RUN",
  "SQ","PYPL","AFRM","UPST","LC","OPFI","MQ","ATAT","FICO","FIS",
  "MRNA","BNTX","NVAX","CRSP","EDIT","NTLA","BEAM","PACB","ILMN","VEEV",
  "SHOP","SE","MELI","PDD","BABA","JD","NIO","LI","XPEV","GRAB"
];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { key, filters } = req.method === "POST"
    ? req.body
    : { key: req.query.key, filters: {} };

  if (!key) return res.status(400).json({ error: "Missing API key" });

  let f = {};
  try { f = typeof filters === "string" ? JSON.parse(filters) : filters; } catch {}

  // Fetch metrics for all tickers in parallel batches of 10
  const results = [];
  const batchSize = 10;

  for (let i = 0; i < TICKERS.length; i += batchSize) {
    const batch = TICKERS.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(async (sym) => {
        const [quote, profile, metrics] = await Promise.all([
          fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${key}`).then(r => r.json()),
          fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${sym}&token=${key}`).then(r => r.json()),
          fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${sym}&metric=all&token=${key}`).then(r => r.json()),
        ]);

        if (!quote || quote.c === 0) return null;
        const m = metrics?.metric || {};
        const q = quote;

        return {
          symbol: sym,
          name: profile?.name || sym,
          exchange: profile?.exchange || "",
          industry: profile?.finnhubIndustry || "",
          price: q.c,
          change: q.d,
          changePct: q.dp,
          marketCap: profile?.marketCapitalization ? profile.marketCapitalization * 1e6 : null,
          peRatio: m.peBasicExclExtraTTM,
          eps: m.epsBasicExclExtraItemsTTM,
          revenueGrowth: m.revenueGrowth3Y,
          profitMargin: m.netProfitMarginTTM,
          grossMargin: m.grossMarginTTM,
          pbRatio: m.pbAnnual,
          evEbitda: m.evEbitdaTTM,
          psRatio: m.psTTM,
          beta: m.beta,
          week52High: m["52WeekHigh"],
          week52Low: m["52WeekLow"],
          return1M: m["1MonthPriceReturnDaily"],
          returnYTD: m.ytdPriceReturnDaily,
          return1Y: m["52WeekPriceReturnDaily"],
          debtToEquity: m.totalDebt_totalEquityAnnual,
          currentRatio: m.currentRatioAnnual,
          dividendYield: m.dividendYieldIndicatedAnnual,
        };
      })
    );
    batchResults.forEach(r => { if (r.status === "fulfilled" && r.value) results.push(r.value); });
    // Small delay between batches to respect rate limits
    if (i + batchSize < TICKERS.length) await new Promise(r => setTimeout(r, 300));
  }

  // Apply filters
  const filtered = results.filter(s => {
    if (!s) return false;
    const check = (val, min, max) => {
      if (val == null) return false;
      if (min != null && val < min) return false;
      if (max != null && val > max) return false;
      return true;
    };
    if (f.peMin != null || f.peMax != null) { if (!check(s.peRatio, f.peMin, f.peMax)) return false; }
    if (f.epsMin != null) { if (s.eps == null || s.eps < f.epsMin) return false; }
    if (f.revGrowthMin != null) { if (s.revenueGrowth == null || s.revenueGrowth < f.revGrowthMin) return false; }
    if (f.profitMarginMin != null) { if (s.profitMargin == null || s.profitMargin < f.profitMarginMin) return false; }
    if (f.marketCapMin != null || f.marketCapMax != null) { if (!check(s.marketCap, f.marketCapMin, f.marketCapMax)) return false; }
    if (f.betaMax != null) { if (s.beta == null || s.beta > f.betaMax) return false; }
    if (f.return1MMin != null) { if (s.return1M == null || s.return1M < f.return1MMin) return false; }
    if (f.return1YMin != null) { if (s.return1Y == null || s.return1Y < f.return1YMin) return false; }
    if (f.dividendYieldMin != null) { if (s.dividendYield == null || s.dividendYield < f.dividendYieldMin) return false; }
    if (f.fromHighMax != null && s.week52High && s.price) {
      const fromHigh = ((s.price / s.week52High) - 1) * 100;
      if (fromHigh < f.fromHighMax) return false;
    }
    return true;
  });

  // Sort by selected field
  const sortBy = f.sortBy || "marketCap";
  const sortDir = f.sortDir || "desc";
  filtered.sort((a, b) => {
    const av = a[sortBy] ?? -Infinity;
    const bv = b[sortBy] ?? -Infinity;
    return sortDir === "desc" ? bv - av : av - bv;
  });

  res.status(200).json({ results: filtered, total: filtered.length, scanned: results.length });
}
