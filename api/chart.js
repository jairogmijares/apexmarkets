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
    const extraDays = 280; // warmup for MA200
    const totalDays = visibleDays + extraDays;

    const to = Math.floor(Date.now() / 1000);
    const from = to - totalDays * 86400;

    // Always fetch daily data first for accurate MA calculation
    const dailyUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&period1=${from}&period2=${to}`;
    const dailyRes = await fetch(dailyUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "application/json",
      }
    });
    const dailyData = await dailyRes.json();
    const result = dailyData?.chart?.result?.[0];

    if (!result) {
      return res.status(200).json(dailyData);
    }

    const ts = result.timestamp || [];
    const closes = result.indicators?.quote?.[0]?.close || [];
    const volumes = result.indicators?.quote?.[0]?.volume || [];

    // Build daily points with MA computed across full history
    const allPts = ts.map((t, i) => ({
      ts: t,
      date: t,
      close: closes[i] ? +closes[i].toFixed(2) : null,
      volume: volumes[i] || 0,
    })).filter(p => p.close !== null);

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
    const visible = withMA.filter(p => p.ts >= cutoff);

    // Resample if needed for 2Y/5Y display
    let displayPts = visible;
    if (interval === "1wk") {
      // Sample every 5 trading days
      displayPts = visible.filter((_, i) => i % 5 === 0 || i === visible.length - 1);
    } else if (interval === "1mo") {
      // Sample every 21 trading days
      displayPts = visible.filter((_, i) => i % 21 === 0 || i === visible.length - 1);
    }

    // Format dates
    const useYear = visibleDays > 365;
    const formatted = displayPts.map(p => ({
      ts: p.ts,
      date: new Date(p.ts * 1000).toLocaleDateString("en-US", {
        month: "short", day: "numeric",
        year: useYear ? "2-digit" : undefined
      }),
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
