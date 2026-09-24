# Mithilessh Bhasker Portfolio — V20 Pedro Pathing Story

This pass makes the Pedro Pathing story feel like a major part of the portfolio instead of a small contribution list.

Highlights:
- homepage Pedro section now leads with the project’s official FTC positioning and visual proof
- adds a robot + autonomous path hero visual using the real Robo Racers robot and Pedro logo
- shows 12 merged PRs, 4 Quickstart merges, 8 Docs merges, and Sep 2026 GitHub community stats
- dedicated Pedro page now explains why the library matters in competition, not just what PRs were merged
- adds Visualizer / docs + white paper / open-source ecosystem links
- adds a featured Quickstart #100 contribution and keeps all 12 PR links
- preserves the V19 custom white dot + halo cursor with native cursor hidden
- preserves the smoother cached hero background and V18 robotics awards
- Vercel/static build and reduced-motion support remain intact

## Run locally

```bash
npm run build:vercel
python3 -m http.server 8080 -d public
```

## Unique visitor counter

The homepage counter uses an HttpOnly browser cookie and an Upstash Redis set, so refreshing or revisiting from the same browser does not increase the count. Connect an Upstash Redis integration to the Vercel project so these environment variables are available:

```text
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

The Vercel Marketplace integration may instead inject `KV_REST_API_URL` and `KV_REST_API_TOKEN`. Custom-prefixed variants created by this project's integration are also supported.

The counter stays hidden when storage is not configured. Use `vercel dev` instead of the static Python server to test the API locally.

## Validate

```bash
npm run build
npm run validate
npm run build:vercel
```

V22: Restores the original mithib.com left-to-right name decrypt effect, now triggered once on load and again on hover.


V23: OG cryptic decrypt now runs automatically on page load for both Mithilessh and Bhasker, with hover replay.
