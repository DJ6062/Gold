export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=59');

  const AV_KEY = process.env.ALPHA_VANTAGE_API_KEY;
  const API_KEY = process.env.TWELVE_DATA_API_KEY;

  if (!AV_KEY && !TD_KEY) {
    return res.status(200).json({
      debug: {
        hasAV: !!process.env.ALPHA_VANTAGE_API_KEY,
        hasTD: !!process.env.TWELVE_DATA_API_KEY,
        allKeys: Object.keys(process.env).filter(k => k.includes('API'))
      },

  const parseQuote = (q) => {
    if (!q || q.code === 400 || q.status === 'error') return null;
    const price     = parseFloat(q.close ?? q.price ?? 0);
    const prev      = parseFloat(q.previous_close ?? price);
    const change    = parseFloat((price - prev).toFixed(4));
    const changePct = prev !== 0 ? parseFloat(((change / prev) * 100).toFixed(4)) : 0;
    return { price, change, changePct };
  };

  try {
    const base = 'https://api.twelvedata.com/quote';
    const key  = `apikey=${API_KEY}`;

    const [gcRes, dxyRes, tyrRes] = await Promise.all([
      fetch(`${base}?symbol=XAUUSD&exchange=FOREX&${key}`),
      fetch(`${base}?symbol=DX-Y.NYB&${key}`),
      fetch(`${base}?symbol=TNX&${key}`)
    ]);

    const [gcData, dxyData, tyrData] = await Promise.all([
      gcRes.json(),
      dxyRes.json(),
      tyrRes.json()
    ]);

    return res.status(200).json({
      gc:  parseQuote(gcData),
      dxy: parseQuote(dxyData),
      tyr: parseQuote(tyrData),
      source: 'twelve-data',
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    return res.status(200).json({
      gc:     { price: 4560.00, change: 0, changePct: 0 },
      dxy:    { price: 104.30,  change: 0, changePct: 0 },
      tyr:    { price: 4.310,   change: 0, changePct: 0 },
      source: `fallback — ${err.message}`,
      timestamp: new Date().toISOString()
    });
  }
}
