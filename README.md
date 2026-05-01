# GC // Gold Futures War Room

A live trading dashboard for day trading gold futures (GC).  
Built for the London/NY overlap session with a $1,500/day profit target.

---

## What it does

- **Tab 1 — Morning Reports**: Clickable links to every report in reading order with checkboxes
- **Tab 2 — Pre-Market Checklist**: 10-point green light system before you're authorized to trade
- **Tab 3 — Market Status**: Live GC price, DXY, 10yr yield, bias buttons, correlation context
- **Tab 4 — Key Levels**: Input PDH/PDL/Globex high-low/London high-low — saved to localStorage
- **Tab 5 — COT / Positioning**: Adjustable sliders for weekly COT data with signal output
- **Tab 6 — Entry Model**: 3 setup playbooks + confluence scoring + position size calculator

---

## Deploy in 10 minutes

### Step 1 — Get a free Twelve Data API key
1. Go to [twelvedata.com](https://twelvedata.com) and create a free account
2. Copy your API key from the dashboard
3. Free tier = 800 requests/day — plenty for 60-second polling during trading hours

### Step 2 — Push to GitHub
```bash
# If you don't have git installed: brew install git
git init
git add .
git commit -m "initial deploy"
# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/gold-dashboard.git
git push -u origin main
```

### Step 3 — Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project**
3. Import your `gold-dashboard` repository
4. Click **Deploy** — Vercel auto-detects the config

### Step 4 — Add your API key (keeps it secret)
1. In Vercel dashboard → your project → **Settings** → **Environment Variables**
2. Add: `TWELVE_DATA_API_KEY` = `your_key_here`
3. Click **Save**, then **Redeploy** (Deployments tab → ... → Redeploy)

Your live URL will be: `https://gold-dashboard-YOUR_USERNAME.vercel.app`

---

## Embed in Notion

1. Copy your Vercel URL
2. In Notion, type `/embed` and paste the URL
3. Resize the embed block to fill your page

This gives you the live dashboard embedded inside your Notion trading ops page.

---

## Local development

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally (proxies API functions too)
vercel dev
```

---

## File structure

```
gold-dashboard/
├── index.html          # Full dashboard — all 6 tabs
├── vercel.json         # Routing config
├── api/
│   └── prices.js       # Serverless proxy — hides your API key
└── README.md
```

---

## Customization

**Change daily target**: Search `1,500` in index.html and update the metric cards + position calculator default  
**Add more levels**: Duplicate an `inp-*` input block in Tab 4 and add a `saveLevel()` call  
**Add a new setup**: Copy a `.setup-card` block in Tab 6  
**Change price source**: Edit `api/prices.js` — any REST API works (Alpha Vantage, Tradier, etc.)

---

## Notes

- Levels are saved to `localStorage` — they persist between refreshes on the same browser
- The checklist and confluence score reset on page reload by design (fresh slate each day)
- Price data refreshes every 60 seconds automatically
- The API proxy (`/api/prices.js`) runs as a Vercel Edge Function — your API key is never exposed to the browser
