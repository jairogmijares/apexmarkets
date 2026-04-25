export default async function handler(req, res) {
  const { symbol, interval = "1d", range = "3mo" } = req.query;
  if (!symbol) return res.status(400).json({ error: "Missing symbol" });

  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    // Always fetch extra data before the range start for MA warmup
    // MA200 needs 200 extra daily bars, so we fetch with timestamps
    const extraDays = 280; // enough to warm up MA200

    const rangeDays = {
      "1mo": 30, "3mo": 90, "6mo": 180,
      "1y": 365, "2y": 730, "5y": 1825
    };
    const totalDays = (rangeDays[range] || 90) + extraDays;

    const to = Math.floor(Date.now() / 1000);
    const from = to - totalDays * 86400;

    // Use timestamp-based endpoint to get exact date range
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&period1=${from}&period2=${to}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "application/json",
      }
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
