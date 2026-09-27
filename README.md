# Quantitative Finance Portfolio — Koessi Kevin Zokpodo

A static portfolio site: hand-written HTML, CSS and vanilla JavaScript.
**No framework, no bundler, no backend, no build step.** Opening `index.html`
in a browser is enough to see the finished site.

---

## Contents

- [Project structure](#project-structure)
- [Running it locally](#running-it-locally)
- [Before you publish: the placeholder checklist](#before-you-publish-the-placeholder-checklist)
- [Deploying to Cloudflare Pages](#deploying-to-cloudflare-pages)
- [Adding a new project](#adding-a-new-project)
- [Adding PDFs and a CV](#adding-pdfs-and-a-cv)
- [Adding photos and certificates](#adding-photos-and-certificates)
- [Charts](#charts)
- [Design system](#design-system)
- [Regenerating the social preview image](#regenerating-the-social-preview-image)

---

## Project structure

```
.
├── index.html                     Home: hero, stats, about, projects,
│                                  recognition, credentials, contact
├── projects/
│   ├── _template.html             Copy this to create a new project page
│   ├── macro-intelligence-agent-xauusd.html
│   ├── merton-portfolio-jourdain-sbai.html
│   ├── masi-20-futures-feasibility.html
│   ├── bihar-integrated-mobility-initiative.html
│   ├── em-sovereign-risk-premium.html
│   └── systemic-stress-testing-framework.html
├── assets/
│   ├── css/style.css              The entire design system, one file
│   ├── js/
│   │   ├── theme.js               Light/dark toggle (runs before first paint)
│   │   ├── main.js                Nav, footer year, scroll spy, reveal, lightbox
│   │   └── charts.js              Plotly wrapper + synthetic data helpers
│   ├── img/
│   │   ├── favicon.svg
│   │   ├── og-image.png           1200×630 LinkedIn/Slack link preview
│   │   ├── geneva/                UNITAR / Palais des Nations photographs
│   │   └── certs/                 FTMO and FundedNext certificates
│   └── docs/                      PDF write-ups and CV
├── tools/
│   ├── make-og-image.py           Optional: regenerates og-image.png
│   └── prepare-media.py           Optional: resizes raw photos into assets/img
├── README.md
└── .gitignore
```

All internal links are **relative**, which is why the site works both when
opened from the file system and when served from a domain.

---

## Running it locally

**Option 1 — just open the file.** Double-click `index.html`, or:

```bash
start index.html
```

Everything works this way, including the theme toggle and the Plotly charts
(Plotly loads from a CDN, so you need an internet connection for the charts —
without one they degrade to a short explanatory message).

**Option 2 — serve it over HTTP.** Closer to the production environment, and
required if you later add anything that browsers block on `file://`:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

---

## Before you publish: the placeholder checklist

The site is fully wired: **https://quantstuffs.com**, the GitHub account
**kevinkarlee**, the contact address **zokpodokevin.123@gmail.com** and the
LinkedIn profile **/in/koessi-kevin-zokpodo**. There are no placeholders left
to replace.

The items below are optional polish, each marked with a `TODO:` comment in
the HTML:

- [ ] **PFE window.** The hero badge and the "Looking for" fact say
      *final-year Master's internship (PFE)* without dates. Add the exact months
      once you know them (`index.html`, hero section).
- [ ] **CV button.** Drop your CV at `assets/docs/cv-koessi-kevin-zokpodo.pdf`,
      then remove the `btn--pending` class from the button in the hero so it
      becomes clickable.
- [ ] **PDF and repository buttons** on each project page (same
      `btn--pending` mechanism — see below).
- [ ] **Project copy.** The project pages were written from your short briefs.
      Read them against your actual write-ups and correct anything that
      overstates or misstates the work, especially in the *Key findings*
      sections.
- [ ] **Chart data.** Every chart uses synthetic placeholder data and says so
      under the chart &mdash; *except* the two on the Bihar page, which use the
      real figures from your write-up. Replace the rest before sending the link
      to anyone who matters.
- [ ] **Team credit.** The Bihar page says "a team of four" without naming your
      team-mates. Add their names if you want them credited.

> `btn--pending` greys a button out and disables clicks. Removing the class is
> the single step that "activates" a link once the target file exists.

---

## Deploying to Cloudflare Pages

The site needs **no build**, so the configuration is deliberately empty.

1. Push this folder to a GitHub (or GitLab) repository.

   ```bash
   git init
   git add .
   git commit -m "Initial portfolio site"
   git branch -M main
   git remote add origin https://github.com/kevinkarlee/portfolio.git
   git push -u origin main
   ```

2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to
   Git**, then authorise and pick the repository.

3. Set the build configuration to:

   | Field | Value |
   | --- | --- |
   | Framework preset | **None** |
   | Build command | *(leave empty)* |
   | Build output directory | `/` |
   | Root directory | *(leave empty)* |

4. **Save and Deploy.** The site goes live at
   `https://<project-name>.pages.dev` within about a minute.

5. Attach the custom domain (below). The meta tags already point at
   `https://quantstuffs.com`, and the Open Graph image needs that absolute URL
   to render on LinkedIn.

Every push to `main` redeploys automatically. Pull requests get their own
preview URL.

**Custom domain (optional):** *Pages project → Custom domains → Set up a
domain*. If the domain is already on Cloudflare, DNS is configured for you.

### Checking the LinkedIn preview

LinkedIn caches link previews aggressively. After deploying, paste the URL into
the [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) to see
what it will render and to force a refresh of the cache.

---

## Adding a new project

Two steps, both copy-paste. The layout is built so that a new project cannot
break the existing pages.

**1. Create the page.** Copy the template and fill in the `{{PLACEHOLDERS}}`:

```bash
cp projects/_template.html projects/your-project-slug.html
```

The template contains all the sections a project page uses: executive summary,
methodology, chart slot, findings, "at a glance" panel, technical stack, and
the PDF/repository buttons.

**2. Add a card to the home page.** In `index.html`, find the
`<!-- Projects -->` section and duplicate one `<article class="card">` block.
Edit the index number, the status badge, the title, the link, the description
and the tags:

```html
<article class="card" data-index="07">
  <div class="card__top">
    <span class="card__index">P-07</span>
    <span class="badge badge--wip"><span class="badge__dot" aria-hidden="true"></span>In progress</span>
  </div>
  <h3 class="card__title">
    <a class="card__link" href="projects/your-project-slug.html">Your project title</a>
  </h3>
  <p class="card__desc">Two sentences on what it is and why it matters.</p>
  <div class="card__foot">
    <ul class="card__tags">
      <li class="card__tag">Python</li>
    </ul>
    <span class="card__cue" aria-hidden="true">Read &rarr;</span>
  </div>
</article>
```

Use `badge--done` / `Completed` for finished work and `badge--wip` /
`In progress` for ongoing work.

The grid is `auto-fill`, so it lays out correctly with any number of cards.

**3. Optionally** update the previous/next links in the `.pager` of the
neighbouring project pages.

---

## Adding PDFs and a CV

Put the files in `assets/docs/` using the same slug as the page:

```
assets/docs/macro-intelligence-agent-xauusd.pdf
assets/docs/cv-koessi-kevin-zokpodo.pdf
```

Then remove the `btn--pending` class from the corresponding button. Nothing
else to change — the `href` already points at the right path.

---

## Adding photos and certificates

Raw phone photos are far too large to serve directly, so they go through one
script. Drop the originals in the repository root and run:

```bash
python tools/prepare-media.py
```

It fixes the EXIF rotation, resizes, and writes optimised JPEGs into
`assets/img/geneva/` and `assets/img/certs/`. Edit the `JOBS` dictionary at the
top of the script to add a new file. The originals are listed in `.gitignore`,
so only the processed versions are ever published.

To put a new image in the gallery, copy one `<li class="gallery__item">` block
in `index.html`. The `data-lightbox` attribute holds the caption shown when the
image is opened full size:

```html
<li class="gallery__item" data-lightbox="Caption shown in the viewer"
    tabindex="0" role="button" aria-label="Open photo: short description">
  <img src="assets/img/geneva/your-photo.jpg" alt="Describe the photo"
       width="1500" height="1000" loading="lazy" decoding="async">
  <p class="gallery__caption">Short caption under the thumbnail</p>
</li>
```

The same `data-lightbox` attribute works anywhere: put it on any element
wrapping an `<img>` and that image becomes clickable to full size. That is how
the certificate thumbnails in the Credentials section open.

---

## Charts

Charts use [Plotly.js](https://plotly.com/javascript/) from a CDN — the
`plotly-cartesian` bundle, which is roughly a third of the full build and
covers line, bar, heatmap and box traces.

Each project page ends with a small `<script>` block holding its data. To swap
in real numbers, replace the arrays there:

```js
QuantChart.render("chart-id", [
  { x: [...], y: [...], type: "scatter", mode: "lines", name: "Series" }
], {
  xaxis: { title: "X" },
  yaxis: { title: "Y" }
});
```

`assets/js/charts.js` handles styling, responsiveness, and redrawing the chart
when the visitor switches theme — you never set colours yourself. It also ships
deterministic placeholder generators (`QuantChart.synth.gbm`,
`.dates`, `.drawdown`, `.nelsonSiegel`) used by the current pages.

If a trace carries its own colours that must follow the theme (a heatmap
colorscale, for instance), pass a **function** returning the traces instead of
an array — see `systemic-stress-testing-framework.html` for an example.

If the CDN is unreachable, the chart slot shows a short message instead of an
empty box. Nothing else on the page depends on JavaScript.

---

## Design system

Everything lives in `assets/css/style.css`, in a numbered table of contents at
the top of the file. To re-skin the site, change the custom properties in the
`:root` block (light theme) and the `html[data-theme="dark"]` block:

```css
--c-accent: #1d4e89;   /* links, buttons, chart series 1 */
--c-text:   #0f1d33;   /* headings */
```

**Palette.** Navy, slate and white, with two accents: a steel blue
(`--c-accent`) for links and interactive states, and a muted gold
(`--c-gold`) used sparingly for section numerals, figures and hairlines. Navy
and gold is the institutional pairing — it warms the page without turning it
into a product landing page.

**The dark masthead.** The header, hero, stat band and footer are dark in
*both* themes. They use a separate set of tokens (`--c-ink*`) that are
deliberately **not** redefined in the dark-theme block, so the page always
opens and closes on the same deep navy. To make them follow the theme instead,
move those tokens into `html[data-theme="dark"]`.

**Fonts.** Three families, all from Google Fonts with `display=swap`, so the
page renders immediately in the system fallback and never blocks on the
network:

| Family | Used for | Token |
| --- | --- | --- |
| Source Serif 4 | all headings, stat figures, brand | `--font-display` |
| Inter | body copy, buttons, navigation | `--font-sans` |
| JetBrains Mono | labels, dates, tags, chart ticks | `--font-mono` |

If you would rather have zero external requests, delete the three `<link>` tags
in each page's `<head>` — the fallback stacks take over and nothing breaks.

The theme follows the operating system by default and remembers an explicit
choice in `localStorage`.

**Motion.** Sections fade up as they scroll into view (`[data-reveal]` in the
HTML, handled in `main.js`). Because those elements start at `opacity: 0`, the
script carries a four-second backstop that reveals anything still pending — a
decorative effect must never be able to leave content invisible. The whole
effect is disabled under `prefers-reduced-motion`.

---

## Regenerating the social preview image

`assets/img/og-image.png` is committed, so you only need this if you change the
name or title on the card:

```bash
pip install Pillow
python tools/make-og-image.py
```

This is a convenience script only — the site itself never runs Python.
