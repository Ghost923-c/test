# AI Readiness Audit Toolkit

A lightweight browser app for law-firm technology and communications teams to run AI readiness audits for businesses.

## What it does

- Captures business and audit contact details.
- Scores six AI readiness categories (1-5).
- Calculates maturity level (`Emerging`, `Developing`, `Advanced`).
- Generates practical recommendations.
- Exports audit results as JSON.
- Includes a placeholder function (`generateAiSummary`) where you can later connect to CRM.

## Run locally

Because this is a static app, open `index.html` directly or run a simple server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Where to add OpenAI API

Open `app.js` and edit:

- `generateAiSummary(payload, result)`

A common setup is to call your backend endpoint (e.g. `/api/summary`) from that function, and keep your OpenAI key in backend environment variables.
