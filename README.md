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

## Validate

```bash
npm run build
npm run validate
npm run build:vercel
```

V22: Restores the original mithib.com left-to-right name decrypt effect, now triggered once on load and again on hover.


V23: OG cryptic decrypt now runs automatically on page load for both Mithilessh and Bhasker, with hover replay.
