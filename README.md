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

## What's clickable

- Dashboard: provider rankings, states, and the company table (sort headers, search box, provider filter) all work; every row links onward.
- Provider page: company list and score distribution are computed live from the demo data.
- State breakdown: the "Last 30 days / Month / Year" switch actually rescales the numbers.
- Company → Inspection → Violation: full drill-down chain with real links.
- Risk Score page: gauge and factor bars are generated per company from `js/data.js`.

## Editing the data

Everything shown on the pages comes from `js/data.js` (companies, providers, states, tickets,
uploads, inspections, violations). Edit the arrays there and refresh — no other file needs to change
for most content updates.
