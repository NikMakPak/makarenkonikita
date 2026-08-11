# CLAUDE.md

Personal portfolio of Nikita Makarenko. Static site, no build step, no dependencies.
Deployed on Vercel: <https://imakarenkonikita.vercel.app>

## Layout

```
index.html         English — served at /          (canonical entry point)
ru/index.html      Russian — served at /ru/
style.css          all styles, shared by both locales
main.js            all behaviour, shared by both locales
assets/
  img/             project previews + portrait   (WebP)
  img/stack/       technology logos              (WebP)
  favicon/         PNG icons, 32 / 180 / 192
  icons/           preloader.svg
  vendor/          aos.css + aos.js, self-hosted
  cursor.png       custom CSS cursor
  cv.pdf           not linked from the UI; reachable at /assets/cv.pdf
vercel.json        redirects, cache and security headers
sitemap.xml        two URLs with hreflang alternates
site.webmanifest   PWA metadata
```

## The one rule: every path is root-absolute

`/style.css`, `/main.js`, `/assets/img/...` — never `src/...` or `./...`.

This is what lets the same CSS and JS serve both `/` and `/ru/` without a copy.
A relative path in `ru/index.html` resolves against `/ru/` and 404s. Historically
that is exactly what broke when the Russian page was moved into a subdirectory.

CSS `url()` is also root-absolute, so `style.css` can move without breaking.

## Adding or editing content

The two HTML files are independent — markup is duplicated by design (assets are not).
A change to a project card, the hero, or the nav must be applied to **both**
`index.html` and `ru/index.html`, or the locales drift.

They are already out of sync on purpose: the English page carries four projects the
Russian one does not (TripAI, AI Content Factory, TrueWallet, StratoMind AI Platform),
and the Russian hero still reads "4 года опыта" against the English "5 years".
Do not "fix" that silently.

## Adding a project

1. Optimise the screenshot before committing (see below), write it to
   `assets/img/projects/<slug>.webp`.
2. Copy an existing `.project-box-wrapper` block. Keep on the `<img>`:
   `width`, `height`, `loading="lazy"`, `decoding="async"`, and a descriptive `alt`.
3. The card title is `<h3 class="ProjectHeading">`. Not `<article>` — the page
   heading order is h1 (hero, visually hidden) → h2 (sections) → h3 (projects).

### How the card is built

`.project-box` is a two-column grid with `padding`, not a fixed-height flex row.
Three things hold it together and all three matter:

- **No fixed height.** `min-height` only sets a floor; a long description makes
  the card taller instead of being clipped by `overflow: hidden`.
- **`minmax(0, 1fr)` columns.** Grid items default to `min-width: auto`, so a long
  unbroken stack line would otherwise push a column past its share and overflow
  the page.
- **`.image-div` is a fixed 3:2 frame with the `<img>` absolutely positioned
  inside.** 3:2 is the median ratio of the screenshots, so every card crops the
  same way. Absolute positioning keeps the image's intrinsic height out of row
  sizing — otherwise each card's height would follow its own screenshot's ratio
  and the grid would look ragged.

Below 998px the grid collapses to one column and the preview moves above the text
via `order: -1`.

### Image dimension attributes

Every `<img>` carries `width`/`height`. These map to CSS **presentational hints**,
so any rule that sets only one dimension leaves the other pinned to the attribute
and squashes the image. The base `img { width: auto; height: auto }` rule near the
top of `style.css` releases both — it loses to every class rule but outranks a
presentational hint. Do not delete it, and do not add a rule that sets only one
axis without the other being `auto`.

## Image pipeline (ffmpeg, installed globally)

Project screenshots — capped at 960px wide, lossy WebP:

```bash
ffmpeg -y -i in.png -vf "scale='min(960,iw)':-2:flags=lanczos" \
  -c:v libwebp -pix_fmt yuva420p -quality 80 -compression_level 6 -preset picture \
  assets/img/projects/name.webp
```

Logos with transparency — 256px, try lossless too and keep the smaller file:

```bash
ffmpeg -y -i logo.png -vf "scale='min(256,iw)':-2:flags=lanczos" \
  -c:v libwebp -lossless 1 -compression_level 6 assets/img/stack/name.webp
```

The social preview stays JPEG (`assets/img/og-preview.jpg`, 1200px wide) — WebP
renders unreliably in Telegram and some OG card readers.

## Language switching

- Desktop: an `<li class="lang-switch">` inside `.navbar-tabs-ul`, so it inherits
  the existing flex gap. Hidden on mobile with the rest of that list.
- Mobile: a `.mobile-lang-switch` entry in the burger menu.
- First visit to `/` from a browser reporting `ru*` redirects once to `/ru/`.
  That script is **inline and blocking in `<head>` of `index.html`** — it has to run
  before first paint, otherwise the English page flashes.
- The choice is stored in `localStorage` under `preferred-lang` and always wins over
  the sniffer. `main.js` writes it on any click of a `[data-lang]` link.
- Crawlers report `en-*`, so they never get redirected and `hreflang` stays authoritative.

## SEO invariants

Both pages carry `canonical`, three `hreflang` links (en / ru / x-default),
Open Graph + Twitter cards, and a JSON-LD `ProfilePage` → `Person`.

When the domain changes, these absolute URLs must all be updated together:
`canonical`, all `hreflang`, `og:url`, `og:image`, `twitter:image`, both JSON-LD
blocks, `sitemap.xml`, `robots.txt`.

The `Person.sameAs` array is what ties the site to the LinkedIn and GitHub profiles
so search engines resolve them as one entity — the brand query currently loses to
LinkedIn, and that array is the lever.

There is no `<meta name="keywords">` and there should not be: Google has ignored it
since 2009.

## Deploy

Push to `main`. Vercel builds from the repo root with no build command.

`vercel.json` sets `cleanUrls` + `trailingSlash`, permanently redirects the old
`/eng` path to `/`, and caches `/assets/*` for one day with a week of
stale-while-revalidate. Asset filenames are not content-hashed, so a replaced image
can take up to a day to propagate — bump the filename if it must be instant.

### `trailingSlash` + `redirects` gotcha

With `trailingSlash: true`, Vercel normalizes every extensionless path to end in
`/` **before** matching it against `redirects.source`. A rule written as
`/eng/:path*` looks like it should cover the bare `/eng/` case (`:path*` = zero or
more segments), but path-to-regexp's zero-match for a `*` segment does not include
the separating slash — so `/eng/:path*` matches `/eng` and `/eng/foo`, but *not*
`/eng/`. The request 404s.

Any redirect for a bare directory path needs an **exact rule for the
trailing-slash form**, plus `:path+` (one or more) for nested paths:

```json
{ "source": "/old-path", "destination": "/", "permanent": true },
{ "source": "/old-path/", "destination": "/", "permanent": true },
{ "source": "/old-path/:path+", "destination": "/", "permanent": true }
```

Verify with `curl -sD - -o /dev/null <url>` against the deployed site, not just
by reading the config — this bug produces valid JSON and looks correct on paper.

## Horizontal overflow

`.blob` (the purple hero glow) sits at `right: -15%`. Its parent
`.landing-page-container` must keep `position: relative` and `overflow-x: clip`,
otherwise the blob anchors to the page instead of the hero and makes the document
~230px wider than the viewport. Nothing looks wrong until something scrolls the
page sideways — an `#anchor` jump, a focus ring — and then the entire layout
appears shifted left. `html/body/.main` use `overflow-x: clip` rather than
`hidden` for the same reason: `hidden` still permits programmatic scrolling.

If a new absolutely-positioned decoration is added, check
`document.documentElement.scrollWidth === clientWidth` at several widths.

## Hero CTA (English page only)

The English CTA opens `mailto:imakarenkonp@gmail.com`; the Russian one still links
to Telegram. Beside it, `.iconBtn` is a 40px square LinkedIn link styled like the
`.tag` pills (transparent, hairline border) that eases into the CTA's grey
(`rgba(230,230,230,0.466)`) on hover, flipping the logo fill to black for contrast.
`.contact-btn-div` wraps, because the CTA is a fixed 281px and would otherwise
overflow narrow screens.

## Video modal

`.modal-loader` covers the iframe while the Google Drive embed boots — without it
the modal shows a bare black rectangle for a second or two. `main.js` shows it on
open, hides it on the iframe's `load` event, and force-hides after 15s so a
blocked embed never spins forever. The label is locale-aware via `t()`.

## Gotchas

- `hamburgerMenu`, `hidemenubyli`, `showVideoModal`, `closeVideoModal` are called from
  inline `onclick` attributes and must stay top-level function declarations in
  `main.js` (globals). Do not convert `main.js` to a module.
- `main.js` is `defer`red and reads `document.documentElement.lang` to pick UI strings.
  A new locale needs that attribute set correctly, nothing else.
- The theme toggle, sound player and preloader audio were removed from the markup
  long ago; their CSS and JS have now been deleted too. `--color-light-mode` and the
  `.light-mode` block are gone — restoring a theme switch means rewriting them.
- The footer eye-tracking markup is commented out; the JS that drove it is deleted.
- `assets/vendor/aos.*` is vendored, not from a CDN. Re-download from
  `https://unpkg.com/aos@next/dist/` to update.
- Only Fira Code is loaded from Google Fonts. Three other families used to be
  requested and none were referenced in CSS.
