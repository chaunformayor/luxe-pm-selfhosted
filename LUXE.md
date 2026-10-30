# Luxe PM (self-hosted): customization log

This repository is **Luxe Property Solutions' build of
[MicroRealEstate](https://github.com/microrealestate/microrealestate)**, a self-hosted
property management app (leases, rents, receipts, tenant portal). This file records
every change made on top of upstream: what changed, where, and why. It also covers how
to pull upstream updates without losing that work.

Keep this file current. Every Luxe change should add an entry to the
[Change log](#change-log) and update any section it affects.

---

## Quick facts

| | |
|---|---|
| Our repo | https://github.com/chaunformayor/luxe-pm-selfhosted |
| Upstream | https://github.com/microrealestate/microrealestate (git remote `upstream`) |
| Based on | MicroRealEstate **v1.1.0** (`d0d6904`, 2026-10-25) |
| License | Upstream is under the Sustainable Use License v2. Luxe holds a **commercial license** from the author (Camel Aissani). |
| Business | Luxe Property Solutions, St. Louis, MO. Website: https://luxestl.com |
| Stack | Node/TypeScript microservices + MongoDB + Redis in Docker. Next.js 15 + Tailwind v4 web apps. Yarn 4 workspaces. |

### Repository map (what lives where)

| Path | What it is |
|---|---|
| `webapps/landlord` | Staff/manager app (Next.js, served at `/landlord`) |
| `webapps/tenant` | Tenant portal (Next.js, served at `/tenant`) |
| `webapps/commonui` | Shared React components, shell (sidebar/menus) and **theme CSS** |
| `shared` | Shared TS types and constants, including **`branding.ts`** |
| `services/api` | Main REST API |
| `services/authenticator` | Sign-in, sessions, password reset |
| `services/emailer` | Transactional emails (Handlebars templates + locale JSON) |
| `services/pdfgenerator` | Receipts and rent notices as PDF (EJS + headless Chrome) |
| `services/gateway` | Reverse proxy in front of all services |
| `services/tenantapi` | API for the tenant portal |
| `services/resetservice` | Dev/test DB reset service |
| `docker/` | Compose files and Dockerfile templates |
| `install.sh`, `mre.sh` | Production installer and day-to-day ops script |

---

## Brand reference

All values come from the live site, luxestl.com.

### Colors

| Token | Hex | Use |
|---|---|---|
| `luxe-navy` | `#0A1628` | Primary (light mode), sidebar, sign-in panel, email bar, PDF heading |
| `luxe-navy-light` | `#122A45` | Hover/selected surfaces on navy, secondary text |
| `luxe-gold` | `#C9A84C` | Accent: logo, focus ring, selected menu item, primary (dark mode) |
| `luxe-gold-dark` | `#8A6D1F` | Gold **text** on white (passes WCAG AA, about 4.9:1) and email links |
| `luxe-gold-light` | `#E8C97A` | Subtle gold on navy (sign-in subtitle, email rule) |
| `luxe-cream` | `#F8F6EF` | Reserved for cream surfaces |

The colors are defined once as CSS variables (`--luxe-*`) at the top of
`webapps/commonui/src/styles/globals.css`. They are then mapped to Tailwind utilities
(`bg-luxe-navy`, `text-luxe-gold`, `fill-luxe-gold/70`, …) in the `@theme` block. Emails and
PDFs can't read CSS variables, so they repeat the hex values inline. If a brand color
ever changes, search for the hex.

### Fonts

- **Playfair Display** (serif): wordmark, organization name, sign-in subtitle. Loaded with
  `next/font/google` as `--font-luxe-serif` and exposed as Tailwind's `font-serif`.
- **Inter** (sans): everything else. This was already the upstream app font.
- Emails and PDFs use **Georgia** for headings. It's the closest web-safe serif, since
  email clients and the PDF renderer don't load Google Fonts.

### Logo

- `webapps/commonui/src/components/LuxeLogo.tsx`:
  - `<LuxeLogo tone="onDark|onLight" showLocation />` renders the Gateway Arch and skyline,
    the **LUXE** wordmark, "PROPERTY SOLUTIONS" and "ST. LOUIS, MISSOURI". The artwork is
    copied from the luxestl.com header logo.
  - `<LuxeMark />` renders the arch and skyline only, for tight spaces.
  - `tone="onLight"` switches its text colors automatically in dark mode.
- `webapps/{landlord,tenant}/public/favicon.svg`: gold arch on a navy rounded square
  (same file as luxestl.com's favicon).
- `services/pdfgenerator/templates/img/logo.svg`: the same badge at 44px for the PDF
  letterhead.

### Names and links

`shared/src/branding.ts` exports `BRAND`:

```ts
BRAND.name        // 'Luxe Property Solutions'  (browser titles, menus, logo label)
BRAND.shortName   // 'Luxe'
BRAND.location    // 'St. Louis, Missouri'      (logo tagline)
BRAND.websiteUrl  // 'https://luxestl.com'
```

It also exports `SHOW_UPSTREAM_PROMPTS = false` (see below).

---

## Change log

### 2026-10-30: Branding pass (branch `luxe/branding`)

Goal: make the app look and read as Luxe Property Solutions everywhere a user sees it,
while keeping the diff small so upstream updates still merge cleanly.

**Brand foundation**
- `shared/src/branding.ts` (new): `BRAND` constants and the `SHOW_UPSTREAM_PROMPTS` flag.
- `shared/src/index.ts`: re-exports `branding`.
- `webapps/commonui/src/components/LuxeLogo.tsx` (new): `LuxeLogo` and `LuxeMark` SVG components.

**Theme (all screens, light and dark)** in `webapps/commonui/src/styles/globals.css`
- Added the `--luxe-*` palette in `:root` and the `--color-luxe-*` Tailwind tokens in `@theme`.
- Light mode: navy primary buttons, warm off-white background (`#F8F7F4`), cream secondary/muted
  surfaces, gold-tint accent, gold focus ring, navy sidebar with gold selection, gold/navy chart ramp.
- Dark mode: deep navy background (`#070F1A`), navy cards (`#0D1B2A`), **gold primary** with navy
  text, near-black navy sidebar.
- Replaced the leftover blue values in the `@layer base .dark` block with gold. The unlayered block
  overrides them anyway, but now nothing looks blue if someone reads the file.
- `--font-serif` now points at Playfair Display (with a Georgia fallback).

**App shell (sidebar and menus)** in `webapps/commonui/src/components/shell/`
- `LeftBar.tsx`: the desktop sidebar is now navy and full height (`top-0`), with the Luxe logo at
  the top and the organization name below it in Playfair. Upstream used a `-mt-10` trick to put the
  org name inside the white top bar; that's gone.
- `SideMenuButton.tsx`: new `tone="sidebar"` option (gold selected item, navy-light hover). The
  default tone is unchanged, so the right-hand user menu still looks like upstream.
- `AppMenu.tsx`: passes `tone="sidebar"`. AppMenu is only used in the sidebar and mobile menu.
- `HamburgerMenu.tsx`: the mobile menu sheet is navy with the logo and org name, matching desktop.

**Sign-in pages (landlord and tenant)**
- `webapps/commonui/src/components/PublicLayout.tsx`: navy left panel with a gold right border, the
  full logo, and the subtitle ("Landlord"/"Tenant") in Playfair caps. On phones the logo sits above
  the form.

**Page titles, fonts, favicons**
- `webapps/landlord/src/app/[locale]/layout.tsx`: the title is `Luxe Property Solutions - Landlord`.
  Loads Playfair. `theme-color` is now navy; upstream's value was broken (`hsl(var(--primary))`
  with an oklch variable).
- `webapps/tenant/src/app/[locale]/layout.tsx`: the title is `Luxe Property Solutions - Tenant`.
  New meta description. Loads Playfair.
- `webapps/landlord/public/favicon.svg`, `webapps/tenant/public/favicon.svg`: Luxe arch favicon.
- `webapps/landlord/public/undraw_*.svg`, `webapps/tenant/public/welcome.svg`: illustration accent
  color changed from undraw purple/pink (`#6C63FF`, `#FF6884`) to Luxe gold.

**Upstream prompts hidden (commercial license)**
- These all check `SHOW_UPSTREAM_PROMPTS` and stay hidden while it's `false`:
  - `webapps/landlord/src/components/shell/LandlordShell.js`: the "chip in" donate dialog on the
    dashboard and the "Buy me a coffee" link in the user menu.
  - `webapps/landlord/src/components/metrics/PropertyCountCard.js`: the warning icon and
    "Managing more than 5 properties? Contact me" note on the dashboard card.
  - `webapps/landlord/src/app/[locale]/(protected)/(organization)/properties/page.js`: the
    "N of 5 properties" caption and the over-5 notice on the Properties page.
- The components themselves (`DonateDialog`, `SponsorLink`, `PropertyThresholdNotice`) are left in
  place, unused, to keep merges simple.

**Emails** in `services/emailer/src/`
- `emails/__partials/html/htmlhead.hbs`: navy top bar with a gold underline, Georgia navy header
  with a light-gold rule, navy buttons, gold-dark links.
- `emails/reset_password/body_html.hbs`: the header reads "Luxe Property Solutions".
- `locales/{en,fr-FR,de-DE,es-CO,pt-BR}.json`: brand strings now say Luxe Property Solutions.
  Subjects read "Luxe Property Solutions - Reset your password" and "… - Sign in to the tenant
  portal". The signature is "The Luxe Property Solutions team".
  **Only the values changed. The translation keys still contain `MicroRealEstate`**, because the
  templates look strings up by key. Don't "fix" the keys unless you also change every
  `{{t '…'}}` call that uses them.
- Receipt, rent-notice and OTP emails already show the organization's own name (`landlord.name`),
  so they pick up "Luxe Property Solutions" once that's the organization name in Settings.

**PDF documents (receipts, rent notices)** in `services/pdfgenerator/`
- `templates/img/logo.svg` (new) replaces `templates/img/logo.png` (deleted; it was a generic
  building icon).
- `data/receipt/index.js` and `data/rentnotice/index.js` point `logoUrl` at `logo.svg`.
- `templates/css/print.css`: the letterhead heading is navy Georgia, vertically aligned with the
  badge. The rule under the address is gold instead of grey.

**Verification**
- `yarn tsc` passes in `shared`, `webapps/commonui`, `webapps/landlord` and `webapps/tenant`.
- `biome check` passes on all changed files.
- Checked in the browser (landlord dev server): the sign-in page in light, dark and phone layouts,
  and the branded shell (desktop sidebar in light and dark, mobile menu). I also rendered the
  reset-password email and PDF letterhead from the real templates with sample data.
- **Not yet tested end to end**: real sign-in, emails actually sent, or PDFs produced by the
  pdfgenerator service. All of that needs the full Docker stack, which isn't installed on the dev
  machine yet.

**Deliberately left as upstream** (not user-visible, or changing them would make merges harder)
- Package names and imports (`@microrealestate/*`), service names, the `MRE_*` env vars and the
  `mre.sh` script name.
- Docker image labels (`org.opencontainers.image.title="MicroRealEstate"`), the CLI banner
  (`cli/src/commands.ts`), package `description` fields and the GitHub issue templates.
- `README.md`, `documentation/`, `changelog/`, `LICENSE.md`, `CLA.md`.
- The donate/sponsor component files and the `PROPERTY_COUNT_WARN_THRESHOLD` constant.

---

## Pulling upstream updates

```bash
git fetch upstream
git checkout main
git merge upstream/main          # or: git rebase upstream/main on a feature branch
```

Where conflicts are most likely, and how to resolve them:

| File | Resolution |
|---|---|
| `webapps/commonui/src/styles/globals.css` | Take upstream's structure, then re-apply the `--luxe-*` palette, the `:root`/`.dark` variable values listed above, and the `@theme` `--color-luxe-*` lines. |
| `webapps/commonui/src/components/shell/*.tsx` | Keep upstream's logic. Re-apply the logo header, the navy classes and `tone="sidebar"`. |
| `webapps/commonui/src/components/PublicLayout.tsx` | Keep `LuxeLogo` and the navy panel. |
| `services/emailer/src/locales/*.json` | Take upstream's file, then search for `MicroRealEstate` in **values** and replace with `Luxe Property Solutions`. Leave the keys alone. |
| `services/emailer/src/emails/__partials/html/htmlhead.hbs` | Re-apply the color changes. |
| Files using `SHOW_UPSTREAM_PROMPTS` | Keep the flag check around anything upstream adds that asks for donations or a commercial contact. |

After merging, run the checks in [Local development notes](#local-development-notes). Then
search for anything new that shows the old brand. Both commands should print nothing:

```bash
# Code and templates (ignores package imports, {{t '…'}} lookup keys and the hidden donate dialog)
grep -rIn "MicroRealEstate" webapps/*/src services/*/src services/pdfgenerator/templates \
  --exclude-dir=locales | grep -v "@microrealestate/" | grep -v "{{t '" | grep -v "DonateDialog"

# Translation values (keys may keep the old name; values must not)
grep -rIoE '": "[^"]*MicroRealEstate[^"]*"' services/*/src/locales \
  services/pdfgenerator/templates/locales webapps/*/locales \
  | grep -v "Chip in\|grandir\|crescer\|wachsen\|crecer"
```

---

## Local development notes

The dev machine (Ubuntu) has Node 22 but **no Docker and no global Yarn**. Yarn 4 runs through
corepack:

```bash
corepack yarn install                       # PUPPETEER_SKIP_DOWNLOAD=1 skips the Chrome download
(cd webapps/commonui && corepack yarn tsc)  # type-check one workspace
corepack yarn biome check <files>           # lint/format check (add --write to fix)
```

UI-only preview without the backend (sign-in pages render; anything that needs an API call fails
with "fetch failed" from the missing gateway, which is expected):

```bash
corepack yarn workspace @microrealestate/landlord run next dev --turbopack -p 3100
#   → http://localhost:3100/landlord/en/signin
corepack yarn workspace @microrealestate/tenant run next dev --turbopack -p 3200
#   → http://localhost:3200/tenant/en/signin
```

`.claude/launch.json` holds the same two commands for Claude's browser preview.

To run the full app (sign-in, data, emails, PDFs) you need Docker. See `documentation/DEVELOPER.md`
(`yarn dev` starts the full stack with docker compose).

---

## Open questions and next steps

Branding follow-ups:
- [ ] **Sign-in subtitles**: they still say "Landlord" and "Tenant". Should the staff side say
      something like "Manager Portal" or "Owner Portal"?
- [ ] **US address format on PDFs**: the letterhead prints `63101 St. Louis` (upstream's European
      order). It should read `St. Louis, MO 63101`. The same fix is likely needed in the customer
      address block and the emails.
- [ ] **Logo image in emails**: emails use a styled text wordmark today. A hosted PNG logo would
      need a public URL (luxestl.com or the app's own domain).
- [ ] Optionally rebrand the Docker image labels and the CLI banner if anyone sees them.

Fitting the app to Luxe's business (beyond branding):
- [ ] Missouri and Illinois lease templates, plus the Illinois property management agreement.
- [ ] Late-fee and grace-period rules that match Luxe's policies.
- [ ] Owner-facing reporting (Luxe manages properties for owners).
- [ ] Deployment: pick a server, domain and HTTPS. `install.sh` handles Docker, secrets and Caddy.
