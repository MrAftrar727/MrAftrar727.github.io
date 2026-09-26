# Sultan Almansour · Portfolio

Personal portfolio site: about, skills, projects, experience, an on-page CV, and contact links.

Plain HTML, CSS and JavaScript. No build step, no dependencies, fonts self-hosted.

## Structure

```
index.html                  page content
css/style.css               styles and animations
js/main.js                  interactions (network background, typing, terminal, pipeline, CV toggle)
fonts/                      Bricolage Grotesque, IBM Plex Sans/Mono, Reem Kufi (SIL Open Font License)
assets/sultan.webp|png      portrait
assets/Sultan_Almansour_CV.pdf   CV used by the download buttons (no phone number)
assets/og-image.jpg         preview image for link sharing (LinkedIn, WhatsApp, X)
assets/favicon.svg          browser tab icon
.nojekyll                   tells GitHub Pages to serve files as-is
```

## Deploy on GitHub Pages

1. Create a public repository named exactly `MrAftrar727.github.io`.
2. Upload everything in this folder to the root of that repository (including the hidden `.nojekyll` file).
3. Go to Settings → Pages → Build and deployment → Source: "Deploy from a branch", Branch: `main`, folder `/ (root)`, then Save.
4. After a minute or two the site is live at https://mraftrar727.github.io/

If you use a different repository name, the site will be at `https://mraftrar727.github.io/<repo-name>/`. In that case update the two `og:` URLs near the top of `index.html` so the link preview image works.

## Updating content

- Text lives in `index.html`. The CV shown on the page is the `<article class="paper">` block; keep it in sync with the PDF.
- To replace the CV PDF, overwrite `assets/Sultan_Almansour_CV.pdf` with the same file name.
- Skill "where it's used" text is the `data-used` attribute on each skill button.
- Rotating phrases in the hero are the `phrases` list at the top of the typing section in `js/main.js`.

## Preview locally

```
python -m http.server 8000
```
Then open http://localhost:8000
