# FMCSA Data Analyzer — clickable prototype

Static HTML/CSS/JS mockup with working navigation, sorting and search.
All data is fictional demo data (see `js/data.js`) — no real company or FMCSA records.

## Run it locally

No build step needed. Either:

- Double-click `index.html` to open it in a browser, or
- Serve it locally (recommended, avoids browser file:// restrictions):
  ```
  python3 -m http.server 8000
  ```
  then open http://localhost:8000/

## Publish it on GitHub Pages

1. Create a new repository on GitHub (public or private — Pages works on both, private repos need GitHub Pro/Team/Enterprise for Pages).
2. Push the contents of this folder to the repository root:
   ```
   git init
   git add .
   git commit -m "FMCSA Data Analyzer prototype"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
3. In the repository on GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, pick branch `main` and folder `/ (root)`, then **Save**.
4. GitHub gives you a link like `https://<your-username>.github.io/<your-repo>/` within a minute or two — that's the page to send to leadership.

## Pages

- `index.html` — Dashboard: provider rankings (by Safety Score and by tampering count),
  a state-by-state tampering breakdown, and the full carrier table (sort headers, search box,
  provider filter).
- `companies.html` — Companies: filterable/sortable list of every carrier on file.
- `company.html` — Company detail: header, census info, and the Inspections / Violations /
  Crashes / Insurance / SMS BASIC / Uploads / Safety Score tabs. Trackensure's own roadside
  tickets are merged directly into the Inspections tab rows (no separate Tickets tab).
- `providers.html` / `provider.html` — ELD provider list and detail, including the company
  score-distribution histogram.
- `state.html` — Tamperings-by-state breakdown for one state, last 24 months.
- `inspections.html` — Inspection volume over time, with a state filter, a Day/Week/Month/Year
  granularity toggle, a period navigator, and a two-series (inspections + tampering) bar chart.

## What's clickable

- Dashboard: provider rankings, the state breakdown (Day/Week/30 days toggle), and the carrier
  table (sort headers, search box, provider filter) all work; every row links onward.
- Provider page: company list and score distribution are computed live from the demo data.
- Inspections page: state filter, granularity toggle, and the period navigator (‹ › + Today)
  all recompute the chart, tiles, and carrier table; clicking a bar zooms into that period.
- Company → Inspection → Violation: full drill-down chain with real links, plus a date-range
  filter above the date-bearing tabs.
- Safety Score tab: gauge and factor bars are generated per company from `js/data.js`.
- A carrier with `hasDetail: false` (no FMCSA enrichment yet) always shows a neutral
  "No data" score pill, everywhere a score appears — never a fabricated "0 · Critical".

## Editing the data

Everything shown on the pages comes from `js/data.js` (companies, providers, states, uploads,
inspections, violations, crashes, insurance, SMS BASIC). Field names are camelCase and mirror
the real production API, so wiring this prototype's pages to the real backend later is meant to
be a drop-in swap. Edit the arrays there and refresh — no other file needs to change for most
content updates.
