# Nikita Makarenko — Portfolio

Bilingual static portfolio. No framework, no build step, no dependencies.

**Live:** [imakarenkonikita.vercel.app](https://imakarenkonikita.vercel.app) · [Русская версия](https://imakarenkonikita.vercel.app/ru/)

## Run locally

```bash
npx http-server -p 8899 -c-1
```

Then open <http://localhost:8899/> (English) or <http://localhost:8899/ru/> (Russian).

Any static server works, but it has to serve from the repo root — every asset path
is root-absolute (`/style.css`, `/assets/...`) so that both locales share one copy
of the CSS, JS and images. Opening `index.html` straight from the filesystem will
not load styles.

## Structure

| Path | Purpose |
|---|---|
| `index.html` | English page, served at `/` |
| `ru/index.html` | Russian page, served at `/ru/` |
| `style.css`, `main.js` | shared by both locales |
| `assets/` | images (WebP), favicons, vendored AOS, CV |
| `vercel.json` | redirects, cache and security headers |

## Editing

Markup lives in the two HTML files and is intentionally duplicated; assets are not.
A layout or nav change has to be made in both files.

See [CLAUDE.md](CLAUDE.md) for the image pipeline, the language-switch mechanics and
the SEO fields that must move together when the domain changes.

## Stack

Plain HTML, CSS and JavaScript. [AOS](https://michalsnik.github.io/aos/) for scroll
animations (self-hosted). Fira Code from Google Fonts. Images encoded to WebP with
ffmpeg. Deployed on Vercel.
