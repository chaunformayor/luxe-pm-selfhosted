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

### Address format (US)

`shared/src/address.ts` is the single source for how addresses print:

```ts
formatCityStateZip({ city: 'St. Louis', state: 'MO', zipCode: '63101' })  // 'St. Louis, MO 63101'
formatAddressLines(address)  // ['555 Washington Ave', 'Suite 200', 'St. Louis, MO 63101', 'USA']
```

Missing parts are dropped cleanly ("St. Louis, MO", "MO 63101", …). The country line only shows if
one was entered, so leave Country blank for domestic addresses.

| Where | Uses |
|---|---|
| Web apps (address form read-only view, tenant property popover, tenant portal contact card) | `formatAddressLines` / `formatCityStateZip` from `@microrealestate/shared` |
| Emails (`services/emailer`) | Handlebars helper `{{formatCityStateZip obj}}`, which calls the shared function |
| PDFs (`services/pdfgenerator`) | EJS helper `_.formatCityStateZip(obj)`, a 3-line copy of the shared function (pdfgenerator doesn't depend on `shared`, and adding it would change its Docker build) |

---

## Change log

### 2026-10-30: Upstream prompts removed, portal labels (branch `luxe/branding`)

Goal: remove MicroRealEstate's donation, sponsor, commercial-licensing and "more than 5
properties" prompts **completely**, rather than hiding them behind a flag. Luxe holds a commercial
license, so none of them apply. Also rename the sign-in labels.

**Prompts removed**
- Deleted these files:
  - `webapps/landlord/src/components/DonateDialog.tsx`: the "Chip in" dialog on the dashboard.
  - `webapps/landlord/src/components/SponsorLink.tsx`: "Buy me a coffee" in the user menu.
  - `webapps/landlord/src/components/PropertyThresholdNotice.tsx`: the "Managing more than 5
    properties? Contact me" notice.
  - `webapps/landlord/src/hooks/useDonatePrompt.ts`: dialog timing. It stored its state in browser
    localStorage under `mre-donate-prompt`; that leftover key is harmless.
- `webapps/landlord/src/components/shell/LandlordShell.js`: no donate dialog, no sponsor footer in
  the user menu.
- `webapps/landlord/src/components/metrics/PropertyCountCard.js`: the dashboard card shows a plain
  property count (no warning icon or notice above 5).
- `webapps/landlord/src/app/[locale]/(protected)/(organization)/properties/page.js`: the "Add a
  property" button no longer has the "N of 5 properties" caption, and the over-5 notice is gone.
- `webapps/landlord/src/components/ResourceList/List.js`: removed the `renderNotice` slot. Only the
  5-property notice used it.
- `shared/src/utils.ts`: removed `SPONSOR_URL` and `COMMERCIAL_CONTACT_URL`.
  `shared/src/entities/property.ts`: removed `PROPERTY_COUNT_WARN_THRESHOLD`.
  `shared/src/branding.ts`: removed the `SHOW_UPSTREAM_PROMPTS` flag from the earlier pass.
- `webapps/landlord/locales/*/common.json`: removed the 13 strings only those prompts used, in all
  5 languages.
- `install.sh` and `mre.sh`: removed the "Enjoying MicroRealEstate? Buy me a coffee" banner that
  printed after install, update and every ops command.
- `.github/FUNDING.yml` (deleted): GitHub's "Sponsor" button on our repo pointed at the upstream
  author.
- `.github/ISSUE_TEMPLATE/config.yml`: removed the "Commercial licensing" contact link.
- **Kept on purpose**: `LICENSE.md` (legally required). Also the upstream `README.md`, which still
  has Ko-fi/Sponsor badges and a Donate link. It's documentation, not app code; replacing it with a
  Luxe README is an open item below.

**Sign-in labels**
- The staff sign-in page says **Manager Portal** (was "Landlord"). The tenant side says **Tenant
  Portal** (was "Tenant"). Browser titles are `Luxe Property Solutions - Manager Portal` and
  `… - Tenant Portal`.
- Files: `webapps/landlord/src/app/[locale]/(public)/layout.tsx`,
  `webapps/tenant/src/app/[locale]/(public)/(signin)/layout.tsx`, both `[locale]/layout.tsx` files,
  and new keys in `webapps/{landlord,tenant}/locales/*/common.json`:

  | | en | fr-FR | de-DE | es-CO | pt-BR |
  |---|---|---|---|---|---|
  | Manager Portal | Manager Portal | Portail gestionnaire | Verwalterportal | Portal del administrador | Portal do gestor |
  | Tenant Portal | Tenant Portal | Portail locataire | Mieterportal | Portal del inquilino | Portal do inquilino |

- `webapps/commonui/src/components/PublicLayout.tsx` fixes the phone layout. The logo used to be
  absolutely positioned 120px from the top (upstream's approach) and overlapped "Sign in to your
  account" on short screens. It now sits in normal flow above the form, with the portal label under
  it, and the page scrolls if needed.

**Verification**
- A repo-wide search for donate/sponsor/Ko-fi/commercial-contact/threshold code finds only
  `README.md` and this file.
- `yarn tsc` passes in `shared`, `commonui`, `landlord`, `tenant`, `emailer`, `api` and `tenantapi`.
  `biome check` is clean. `bash -n` passes on `install.sh` and `mre.sh`.
- A **production `next build` of the landlord app succeeds**, so every page still compiles without
  the deleted components.
- Checked in the browser: sign-in shows "Manager Portal" in the browser title and on the page. The
  phone layout no longer overlaps on a short screen, and desktop is unchanged.

### 2026-10-30: US address format (branch `luxe/branding`)

Goal: print and enter addresses the US way. Upstream used the European order ("63101 St. Louis",
with the state on its own line).

**Shared formatter**
- `shared/src/address.ts` (new): `formatCityStateZip()` and `formatAddressLines()` (see
  [Address format](#address-format-us)). `shared/src/index.ts` re-exports it.

**Web apps**
- `webapps/commonui/src/components/formfields/AddressField.tsx`:
  - Entry order is now Street 1, Street 2, then **City | State | ZIP** on one row (desktop), then
    Country. Upstream had City | Postal code, then State | Country.
  - The read-only view uses `formatAddressLines`.
  - This form is used for property, tenant and organization addresses.
- `webapps/landlord/locales/en/common.json`: the "Postal code" label now reads **ZIP code** in
  English. The key is unchanged.
- `webapps/landlord/src/components/tenants/TenantPropertyList.js`: the property address popover
  uses `formatAddressLines`. Upstream printed "City Zip" with "State Country" on the next line.
- `webapps/tenant/src/components/contact-card.tsx`: the tenant portal contact card shows
  "City, ST ZIP" on one line.

**Emails**
- `services/emailer/src/utils/templatefunctions.ts`: new `formatCityStateZip` helper.
- `services/emailer/src/emails/__partials/html/landlordcontact.hbs`: HTML email footer.
- `services/emailer/src/emails/__partials/text/header.hbs`: plain-text header, for both the landlord
  and tenant blocks. The tenant block now includes the state, which upstream left out.

**PDFs**
- `services/pdfgenerator/src/utils/templatefunctions.js`: new `_.formatCityStateZip` helper.
- `services/pdfgenerator/templates/partials/header.ejs`: letterhead (organization address).
- `services/pdfgenerator/templates/partials/customeraddress.ejs`: tenant address block on receipts
  and notices.

**Not changed**
- Lease and document templates built in the app's editor use individual field markers
  (`{{tenant.address.city}}`, `{{tenant.address.state}}`, …), so whoever writes the template
  chooses the order. Write Luxe's templates in US order.
- `AddressMap.tsx` (map lookups): geocoding doesn't depend on display order.
- The stored data shape (`street1`, `street2`, `city`, `state`, `zipCode`, `country`) is unchanged,
  so no migration is needed.

**Verification**
- Edge cases for both formatters (all parts, missing city/state/ZIP, empty, null): the shared and
  PDF versions return identical results.
- Rendered the real email text header, HTML footer, PDF letterhead and PDF tenant block with sample
  data. Output was "St. Louis, MO 63101" and "Belleville, IL 62220".
- Checked the address form in the browser: fields stack on phones, and City | State | ZIP sit on
  one row on desktop. The read-only view is correct.
- `yarn tsc` passes in `shared`, `commonui`, `landlord`, `tenant` and `emailer`. `biome check` is
  clean.

### 2026-10-30: Branding pass (branch `luxe/branding`)

Goal: make the app look and read as Luxe Property Solutions everywhere a user sees it,
while keeping the diff small so upstream updates still merge cleanly.

**Brand foundation**
- `shared/src/branding.ts` (new): `BRAND` constants (it briefly also held a `SHOW_UPSTREAM_PROMPTS` flag, since removed).
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

**Upstream prompts hidden (commercial license)** *(superseded: deleted entirely, see the entry above)*
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
| Donate, sponsor or commercial-contact code | We deleted it. If a merge brings back `DonateDialog`, `SponsorLink`, `PropertyThresholdNotice`, `useDonatePrompt`, `print_donation`, `.github/FUNDING.yml` or similar, delete it again. Run the prompt check below. |
| `webapps/commonui/src/components/formfields/AddressField.tsx` | Keep the City / State / ZIP order and `formatAddressLines`. |
| Email partials (`text/header.hbs`, `html/landlordcontact.hbs`) and PDF partials (`header.ejs`, `customeraddress.ejs`) | Anywhere upstream prints `zipCode` then `city`, swap it for the `formatCityStateZip` helper. |
| `services/*/src/utils/templatefunctions.*` | Keep the `formatCityStateZip` helper when taking upstream's version. |

After merging, run the checks in [Local development notes](#local-development-notes). Then
search for anything new that shows the old brand. Both commands should print nothing:

```bash
# Code and templates (ignores package imports and {{t '…'}} lookup keys)
grep -rIn "MicroRealEstate" webapps/*/src services/*/src services/pdfgenerator/templates \
  --exclude-dir=locales | grep -v "@microrealestate/" | grep -v "{{t '"

# Translation values (keys may keep the old name; values must not)
grep -rIoE '": "[^"]*MicroRealEstate[^"]*"' services/*/src/locales \
  services/pdfgenerator/templates/locales webapps/*/locales

# Upstream prompts (should list only README.md and LUXE.md)
grep -rIl -i "donate\|sponsor\|ko-fi\|buy me a coffee\|commercial%20use\|WARN_THRESHOLD" \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude=yarn.lock .
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
- [x] **Sign-in subtitles**: done 2026-10-30. They now read "Manager Portal" and "Tenant Portal".
- [ ] **Luxe README**: replace the upstream `README.md` (MicroRealEstate text, donate badges, installer
      URLs that point at upstream) with a README for this repo.
- [ ] **Installer source**: `install.sh` downloads from upstream
      (`MRE_SRC_URL_DEFAULT=…/microrealestate/microrealestate/main`) and pulls upstream Docker
      images. A Luxe deployment has to build and use **our** images, or the branding won't be there.
- [x] **US address format**: done 2026-10-30 (see the change log). Addresses now print as
      `St. Louis, MO 63101` in the app, emails and PDFs.
- [ ] **Logo image in emails**: emails use a styled text wordmark today. A hosted PNG logo would
      need a public URL (luxestl.com or the app's own domain).
- [ ] Optionally rebrand the Docker image labels and the CLI banner if anyone sees them.

Fitting the app to Luxe's business (beyond branding):
- [ ] Missouri and Illinois lease templates, plus the Illinois property management agreement.
- [ ] Late-fee and grace-period rules that match Luxe's policies.
- [ ] Owner-facing reporting (Luxe manages properties for owners).
- [ ] Deployment: pick a server, domain and HTTPS. `install.sh` handles Docker, secrets and Caddy.
