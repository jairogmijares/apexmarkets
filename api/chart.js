export default async function handler(req, res) {
  const { symbol, interval = "1d", range = "3mo" } = req.query;
  if (!symbol) return res.status(400).json({ error: "Missing symbol" });

  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const rangeDays = {
      "1mo": 30, "3mo": 90, "6mo": 180,
      "1y": 365, "2y": 730, "5y": 1825
    };
    const visibleDays = rangeDays[range] || 90;
    const extraDays = 280;
    const totalDays = visibleDays + extraDays;

    const to = Math.floor(Date.now() / 1000);
    const from = to - totalDays * 86400;

    // Always fetch daily for MA accuracy
    const dailyUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&period1=${from}&period2=${to}`;
    const dailyRes = await fetch(dailyUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "application/json",
      }
    });
    const dailyData = await dailyRes.json();
    const result = dailyData?.chart?.result?.[0];
    if (!result) return res.status(200).json({ apexData: [] });

    const ts = result.timestamp || [];
    const q = result.indicators?.quote?.[0] || {};
    const opens = q.open || [];
    const highs = q.high || [];
    const lows = q.low || [];
    const closes = q.close || [];
    const volumes = q.volume || [];

    // Build full daily points with OHLC
    const allPts = ts.map((t, i) => ({
      ts: t,
      open: opens[i] ? +opens[i].toFixed(2) : null,
      high: highs[i] ? +highs[i].toFixed(2) : null,
      low: lows[i] ? +lows[i].toFixed(2) : null,
      close: closes[i] ? +closes[i].toFixed(2) : null,
      volume: volumes[i] || 0,
    })).filter(p => p.close !== null);

    // Compute MAs on all points including warmup
    const allCloses = allPts.map(p => p.close);
    const withMA = allPts.map((p, i) => {
      const sl = allCloses.slice(0, i + 1);
      return {
        ...p,
        ma50: sl.length >= 50 ? +(sl.slice(-50).reduce((a,b)=>a+b,0)/50).toFixed(2) : null,
        ma200: sl.length >= 200 ? +(sl.slice(-200).reduce((a,b)=>a+b,0)/200).toFixed(2) : null,
      };
    });

    // Filter to visible range
    const cutoff = to - visibleDays * 86400;
    let visible = withMA.filter(p => p.ts >= cutoff);

    // Resample for 2Y/5Y
    if (interval === "1wk") {
      visible = visible.filter((_, i) => i % 5 === 0 || i === visible.length - 1);
    } else if (interval === "1mo") {
      visible = visible.filter((_, i) => i % 21 === 0 || i === visible.length - 1);
    }

    // Format dates
    const useYear = visibleDays > 365;
    const formatted = visible.map(p => ({
      ts: p.ts,
      time: p.ts, // for Lightweight Charts
      date: new Date(p.ts * 1000).toLocaleDateString("en-US", {
        month: "short", day: "numeric",
        year: useYear ? "2-digit" : undefined
      }),
      open: p.open,
      high: p.high,
      low: p.low,
      close: p.close,
      volume: p.volume,
      ma50: p.ma50,
      ma200: p.ma200,
    }));

    res.status(200).json({ apexData: formatted });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
