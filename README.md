# Mithilessh — Student Engineering Portfolio

A custom, responsive personal portfolio built with plain HTML, CSS, and JavaScript. The visual direction mixes a pitch-black robotics software lab, orange work lights, cyan telemetry, autonomous path motion, and tactile interaction.

## Assignment requirements

- HTML + custom CSS: complete
- JavaScript: stable custom cursor, internal project-page routing, a pinned horizontal project sequence driven by vertical scroll, autonomous path animation, continuous section parallax, staggered card motion, image depth, active navigation, and a live local clock
- Eight sections: About, Robo Racers 16481, Projects, Skills, Education, Certifications, Achievements, and Contact
- Responsive design: desktop, tablet, and mobile layouts
- Accessibility: semantic headings, keyboard navigation, skip link, reduced-motion support, and touch-friendly interaction fallbacks
- Public repository + frequent commits: follow the steps below
- Deployed website: use GitHub Pages after pushing the repository

## Important edits before publishing

Open `index.html` and replace any About copy you want to personalize further. Projects, certifications, software skills, the Robo Racers software role and logo, Pedro Pathing beta testing, the Stang Hacks AirPods win, education history, GitHub, email, and social links are populated. Each project opens an internal detail page that currently reads `Soon to come.`

## Run locally

You can double-click `index.html`, or start a simple local server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Suggested commit history

Do not upload everything in one commit. Make real checkpoints as you work:

```bash
git init
git add index.html
git commit -m "Build semantic portfolio structure"

git add styles.css
git commit -m "Create responsive technical visual system"

git add script.js README.md
git commit -m "Add navigation interactions and documentation"

git add .
git commit -m "Personalize projects and contact details"
```

Continue committing whenever you update a project, achievement, layout, or bug.

## Publish with GitHub Pages

1. Create a new **public** GitHub repository named `student-portfolio`.
2. Push this project to that repository.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Choose the `main` branch and `/ (root)`, then click **Save**.
6. GitHub will provide a public URL, usually:
   `https://YOUR-USERNAME.github.io/student-portfolio/`

## File structure

```text
student-portfolio/
├── assets/
│   ├── certifications/
│   ├── logos/
│   ├── projects/
│   └── profile.png
├── index.html
├── project.html
├── project.css
├── project-page.js
├── styles.css
├── script.js
├── scripts/
└── README.md
```

No framework or UI kit is used. The interface and interactions are written from scratch.
