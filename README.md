# Inventory Control Tower — Generic Manufacturing Demo

A Vercel-ready React/Vite demo for manufacturing and supply-chain leaders.

## Access
- Enter any viewer name
- Password: `konvergeai`

## Data logic
All screens derive from the same embedded sample network dataset:
- sites
- products/SKUs
- batch inventory
- 60-day demand signals
- quality / transfer eligibility
- lane-level transfer cost and lead-time rules

The recommendation engine:
1. Calculates local requirement inside a 120-day risk horizon plus safety stock.
2. Identifies excess units and value at risk.
3. Excludes quality-blocked or non-transferable positions.
4. Matches same-SKU destination demand.
5. Allocates source excess and destination demand only once to avoid double counting.
6. Deducts modeled logistics to calculate net value protected.

All financial values are shown in USD.

## Run locally
```bash
npm install
npm run dev
```

## Deploy to Vercel
Import this folder into Vercel. Framework: Vite. Build command: `npm run build`. Output directory: `dist`.
