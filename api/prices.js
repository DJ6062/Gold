export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=59');

  const AV_KEY = process.env.ALPHA_VANTAGE_API_KEY;
  const TD_KEY = process.env.TWELVE_DATA_API_KEY;

  if (!AV_KEY && !TD_KEY) {
    return res.status(200).json({
      gc:     { price: 4560.00, change: -18.50, changePct: -0.40 },
      dxy:    { price: 104.32,  change:  0.42,  changePct:  0.40 },
      tyr:    { price: 4.312,   change:  0.018, changePct:  0.42 },
      source: 'mock — add ALPHA_VANTAGE_API_KEY to Vercel env vars',
      timestamp: new Date().toISOString()
    });
  }

  const parseTV = (q) => {
    if (!q || q.code === 400 || q.status === 'error') return null;
    const price     = parseFloat(q.close ?? q.price ?? 0);
    const prev      = parseFloat(q.previous_close ?? price);
    const change    = parseFloat((price - prev).toFixed(4));
    const changePct = prev !== 0 ? parseFloat(((change / prev) * 100).toFixed(4)) : 0;
    return { price, change, changePct };
  };

  try {
    const results = {};

    // --- GOLD via Alpha Vantage (free tier, reliable) ---
    if (AV_KEY) {
      const avUrl = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD&apikey=${AV_KEY}`;
      const avRes  = await fetch(avUrl);
      const avData = await avRes.json();
      const rate   = avData['Realtime Currency Exchange Rate'];
      if (rate) {
        const price = parseFloat(rate['5. Exchange Rate']);
        const prev  = parseFloat(rate['8. Bid Price'] ?? price);
        const change = parseFloat((price - prev).toFixed(2));
        const changePct = prev ? parseFloat(((change / prev) * 100).toFixed(4)) : 0;
        results.gc = { price, change, changePct };
      }
    }

    // --- DXY + 10yr via Twelve Data (free tier works for these) ---
    if (TD_KEY) {
      const base = 'https://api.twelvedata.com/quote';
      const key  = `apikey=${TD_KEY}`;
      const [dxyRes, tyrRes] = await Promise.all([
        fetch(`${base}?symbol=DX-Y.NYB&${key}`),
        fetch(`${base}?symbol=TNX&${key}`)
      ]);
      const [dxyData, tyrData] = await Promise.all([
        dxyRes.json(),
        tyrRes.json()
      ]);
      results.dxy = parseTV(dxyData);
      results.tyr = parseTV(tyrData);
    }

    // fallback values for anything that didn't load
    if (!results.gc)  results.gc  = { price: 4560.00, change: 0, changePct: 0 };
    if (!results.dxy) results.dxy = { price: 104.30,  change: 0, changePct: 0 };
    if (!results.tyr) results.tyr = { price: 4.310,   change: 0, changePct: 0 };

    return res.status(200).json({
      ...results,
      source: 'alpha-vantage + twelve-data',
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
