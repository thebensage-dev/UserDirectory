# User Directory

A small but complete user directory built with **Next.js 16** (App Router), **React 19**, **the People API** (the Api repo: ASP.NET Core, Entity Framework Core and PostgreSQL), **Tailwind CSS v4**, **react-hook-form + zod**, and **Vitest**. The generic UI (components, hooks, tokens and component classes) comes from **`@thebensage-dev/ui`** ([SharedUI](https://github.com/thebensage-dev/SharedUI)).

It's a demo of how to structure a full-stack Next.js app:

- Server Components read the data from the People API on the server.
- Server Actions handle changes, sending the signed-in person's authentik token to the API.
- Search, filtering and paging happen in SQL in the API, driven by this app's URL.
- One validation schema is shared by the browser and the server.

## How it fits with the other repos

| Repo                     | Role                                                                                                                                                                 |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UserDirectory** (this) | The app, at `users.<domain>`.                                                                                                                                        |
| Api                      | The People API at `api.<domain>` (ASP.NET Core, EF Core, PostgreSQL), which holds the data. This app reads and writes only through it (`API_URL`).                   |
| SharedUI                 | `@thebensage-dev/ui`, installed from GitHub Packages: the shared components and styles used here. Its Storybook is at `ui.<domain>`.                                 |
| Portfolio                | Landing site that links here through its `USER_DIRECTORY_URL` env var.                                                                                               |
| Infrastructure           | authentik (sign-in) and Prometheus/Grafana on the same Coolify VPS. It checks `/` here and the API's `/health`. Its `local/compose.yaml` runs all the sites locally. |

All five are sibling folders under `Documents\GitHub`.

## Features

- **Landing page** at `/` with an animated preview of the search, then the app itself at `/users`.
- **Directory:**
  - Card and table views, with the choice remembered per browser (in a cookie, so there's no flash).
  - Stats tiles, and pagination with 12/24/48 per page.
- **Search:**
  - Multi-word and accent-insensitive ("martinez" finds Martínez).
  - Covers name, email, job, city, country, interests and bio.
  - Ranks by best match and highlights matches.
- **Filters:** country, age range and interests (all must match), shown as removable chips.
- **Shareable URLs:** search, filters, sort and page all live in the query string.
- **Add / edit / delete:**
  - A validated form that checks fields as you leave them, with server errors (e.g. a duplicate email) shown next to the field.
  - Delete asks for confirmation.
  - Toasts confirm each change.
- **Profile pages:** contact details, location (all 249 ISO countries), job, bio, interests and timestamps.
- **Light / dark / system theme** with no flash on load. Keyboard shortcuts: `/` to search, `N` to add.

## Prerequisites

- **Node 26** (`.nvmrc`, so `nvm use 26`).
- **A GitHub Packages token**: `@thebensage-dev/ui` and `@thebensage-dev/api-client` are on GitHub Packages, which needs a token to install even a public package. Create a classic personal access token with only the `read:packages` scope, copy `.npmrc.example` to `.npmrc` and replace the placeholder with it. `.npmrc` is gitignored, and npm reads it itself, so plain `npm install` and `npm ci` just work.

## Getting started

```bash
npm ci               # token from .npmrc
npm run dev          # http://localhost:3000, reading the API at API_URL
```

For `npm run dev`, copy `.env.example` to `.env.local` (gitignored). Everything in it is optional: `API_URL`, `MAIN_SITE_URL` (footer links to the Portfolio's privacy and terms pages) and the sign-in variables (see [Sign-in](#sign-in)). The token never goes there; it lives in `.npmrc`.

The pages need the People API. `API_URL` defaults to `http://localhost:3002`, where `dotnet run` in the Api repo serves it (see its README; it needs a PostgreSQL). Simplest is the local Docker stack, `docker compose up -d api` in `Infrastructure/local`, then `API_URL=http://api.localhost:8080` in `.env.local`. The tests don't need the API: they stub its answers.

To try an unreleased `@thebensage-dev/ui` change here, see SharedUI's README ("Trying an unreleased change inside an app").

## Scripts

| Script                        | What it does                                                |
| ----------------------------- | ----------------------------------------------------------- |
| `dev` / `build` / `start`     | Next.js dev server, production build, production server     |
| `check`                       | Format check, lint, types, tests (CI runs `build` as well)  |
| `lint` / `typecheck` / `test` | ESLint (warnings fail), `tsc --noEmit`, Vitest (single run) |
| `format` / `format:check`     | Prettier, including Tailwind class ordering                 |
| `test:watch`                  | Vitest in watch mode                                        |
| `docker:build`                | Build the Docker image, with the token from `.npmrc`        |

## Project structure

```
src/
  app/                    Routes (Server Components unless marked "use client")
    page.tsx              Animated landing page
    auth/                 Sign-in, callback and sign-out routes (authentik)
    icon.svg/             Favicon, drawn by logoSvg() from @thebensage-dev/ui
    fonts.ts              IBM Plex Sans and JetBrains Mono (next/font)
    users/page.tsx        Reads the URL query, queries the DB, renders <UserDirectory>
    users/[id]/page.tsx   Profile page; Edit/Delete are a small client island
    not-found.tsx, error.tsx, layout.tsx
    globals.css           Stylesheet entry: Tailwind, @thebensage-dev/ui/styles.css, then app styles
  components/
    users/                User-specific UI (UserDirectory, UserCards, UserTable, FilterMenu, …)
    layout/               SiteFooter (privacy and terms links from MAIN_SITE_URL)
    landing/              Landing page pieces (SearchPreview)
  styles/landing.css      App-only styles (the search preview's rows)
  lib/                    Code safe for both browser and server
    listQuery.ts          URL query parsers (nuqs): search, filters, sort, page
    userSchema.ts         zod schema, used by the form and the Server Actions
    preferences.ts        Card/table view cookie (the theme cookie comes from @thebensage-dev/ui)
    countries.ts, userOptions.ts, format.ts
  server/                 Server-only code
    users.ts              The People API client: queryUsers, getUser, summary and writes
    userActions.ts        Server Actions: create, update, delete
    auth.ts               authentik sign-in (OIDC + PKCE), encrypted session cookie with the tokens
__tests__/                Vitest: components, validation, and the API client with fetch stubbed
scripts/                  docker-build.mjs
```

These generic pieces come from `@thebensage-dev/ui`:

- Components: `SiteHeader`, `SectionHeading`, `FeatureGrid`, `StepTimeline`, `Modal`, `ConfirmDialog`, `Pagination`, `SearchBox`, `SegmentedControl`, `ThemeToggle`, `Avatar`, `Highlight`, `EmptyState`, `Reveal`, `Footer` and `CookieNotice`.
- `logoSvg()`, for the favicon.
- `PathLink` (the header's link, marking the current page), from `@thebensage-dev/ui/next`.
- The `useShortcut` hook, plus the text and theme helpers.
- All tokens and component classes.

## How it fits together

- **Reads:**
  - The list page reads its `searchParams` with [nuqs](https://nuqs.dev)' `loadListQuery`.
  - `queryUsers` then searches, filters, sorts and pages **in SQL**. Accent-insensitive matching and sorting by country name use two small SQL functions registered in `src/db`.
  - Pages arrive fully rendered, with no loading spinners and no fetching on mount.
- **URL state:**
  - Client components change the URL with nuqs `useQueryStates` (`shallow: false`), so the server re-renders with new results inside a transition. Typing in search is debounced.
  - Refreshing, sharing a link and the Back button all keep the view.
- **Writes:**
  - The form and delete dialog call **Server Actions** (`src/server/userActions.ts`). These re-validate with the same `userSchema` the form uses, write through the data layer, and call `revalidatePath`, so the page updates without a manual refresh.
  - Errors come back as `{ ok: false, error, fieldErrors }` and are shown next to the matching inputs.
- **Server-only code** in `src/server` and `src/db` imports `server-only`, so importing it from the browser is a build error.
- **Styling:**
  - The colours have role names (`surface`, `foreground`, `primary`, `danger`…), use CSS `light-dark()` and follow the theme cookie or the OS. They are defined once in SharedUI's `brand/palette.json` and come from `@thebensage-dev/ui/styles.css`, together with the component classes (`btn`, `card`, `input`, …).
  - Class names are composed with `clsx`, icons are [lucide-react](https://lucide.dev), and toasts are [sonner](https://sonner.emilkowal.ski).

## CI

One workflow, `.github/workflows/ci.yml` ("CI"), with the same shape as the other three repos:

| Job                        | Runs on                    | What it does                                                                                                                                                              |
| -------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Check**                  | every PR and push          | `npm ci` (installs the `@thebensage-dev` packages with the workflow's own `GITHUB_TOKEN`), then formatting, lint, type-check, tests and `npm run build`.                  |
| **Build image**            | push to `main`, manual run | Builds the Dockerfile and pushes `ghcr.io/thebensage-dev/user-directory:sha-<commit>` (and `:main`), and keeps the 10 newest.                                             |
| **Check Coolify is ready** | push to `main`, manual run | Runs next to **Build image**, the same in every repo: is `DOMAIN` set and does `https://coolify.<DOMAIN>/api/health` answer? If not, the deploy is skipped with a notice. |
| **Deploy to Coolify**      | after your approval        | Only when Coolify is ready: sends the image tag and the app's settings to Coolify through Infrastructure's shared deploy step, and waits for the result.                  |

Before go-live (no `DOMAIN`, or Coolify not answering) the deploy is skipped with a notice, so runs stay green and never ask for an approval.

One-time GitHub setup: give this repo read access to both packages, so `GITHUB_TOKEN` can install them. On GitHub, open thebensage-dev > Packages > ui > Package settings > Manage Actions access, and add this repository with **Read**; then the same for **api-client** (published by the Api repo, so publish Api first). Without it, **Check** fails at "Install dependencies" with a 403. `.github/dependabot.yml` opens weekly PRs for npm, the Dockerfile's base image and actions; it needs no secret, because the same grant lets Dependabot read the package.

## Docker

The `Dockerfile` builds a standalone Next.js server on Node 26. `npm ci` reads `NODE_AUTH_TOKEN` as a **BuildKit secret**, so the token never ends up in an image layer. The container keeps no data, so it needs no volume; it reads everything from `API_URL`.

To run it together with the other sites and the API, use `docker compose up --build -d` in `Infrastructure/local`, which serves this app at http://users.localhost:8080. To run it on its own against an API you already have:

```bash
npm run docker:build   # passes the token from .npmrc as a build secret
docker run --rm -p 3000:3000 -e API_URL=http://host.docker.internal:3002 user-directory
```

## Sign-in

Anyone can browse and search. Adding, editing and deleting need someone signed in through authentik (OpenID Connect with PKCE, `src/server/auth.ts`) who is in the `user-directory-editors` group (or an authentik admin), read from the token's `groups` claim. Any authentik account may sign in (single sign-on across the sites), so someone signed in without that group sees "You're signed in, but can't edit yet" with a **Request edit access** link. Visitors and non-editors can still open the add and edit forms and the delete dialog, so they see every validation check; the server validates their input the same way and then refuses the save ("Please sign in to make changes." or "Your account can't make changes yet."), and the People API refuses non-editors too (403). **Request access** is authentik's shared `request-access` page with this app ticked (`?app=user-directory`, linked from the banner and the refused-save message; the URL comes from `OIDC_ISSUER_URL`'s origin): a new account first, then the apps to ask for. authentik emails them and you, and you approve by adding them to `user-directory-editors`. authentik then sends them back through `/auth/login` to `/users?access=requested`, signed in, which shows a "Request sent" dialog. The groups are read at sign-in and on every token refresh (within the hour); "Refresh your sign-in" in the banner picks up an approval straight away. For temporary access you can also send a guest an authentik invite link. Signed in, the name in the header links to authentik's "Your account" page (flow `account`, `accountUrl()` in `src/server/auth.ts`) for changing name, email or password. The session is an encrypted cookie (8 hours); there's no session table. It also holds authentik's access and refresh tokens: every write sends the access token to the People API, which checks it again (the API accepts the `user-directory` client's tokens). The access token lasts 60 minutes; `accessToken()` refreshes it (scope `offline_access`) shortly before it runs out, and a failed refresh signs the person out here.

Single sign-on is automatic: someone already signed in to authentik (in Grafana or another app) is signed in here without clicking. On a signed-out visitor's page load, `src/proxy.ts` sends the browser through a silent check (`/auth/login?silent=1`, OIDC `prompt=none`). authentik answers straight away, with a code when it has a session and with `login_required` when it has not, and either way the visitor lands back on the same page with no error. The check only runs for real browser page loads (the `Sec-Fetch-*` headers), so uptime checks, crawlers, prefetches and Server Actions never see a redirect. After a check that found no session it pauses for 10 minutes (`ud_sso_checked` cookie).

**Sign out** signs out of every app (single logout): `/auth/logout` drops this app's session and sends the browser to authentik's `sign-out` page, which ends the authentik session, loads each app's front-channel logout page (`/auth/frontchannel-logout`, here and on Portfolio) in a hidden frame so they drop their sessions too, and comes back to `/users`. That route checks the issuer and authentik's session id (`sid`, kept in the session cookie), and is the only page that may be framed, by authentik only. Grafana can't take a front-channel logout, so it stays signed in until you sign out there.

Without the OIDC variables (see `.env.example`) the directory is read-only and the sign-in button is hidden.

## Deploying (Coolify)

Deploys go through this repo's pipeline (`.github/workflows/ci.yml`), never through Coolify's own auto-deploy. On every push to `main` (or Actions > CI > **Run workflow**):

1. **check** runs the checks and the build.
2. **image** builds the production image from that commit and pushes it to GitHub's container registry as `ghcr.io/thebensage-dev/user-directory:sha-<commit>` (and `:main`). The build gets the `@thebensage-dev` packages with the job's own `GITHUB_TOKEN`.
3. **deploy** waits for your approval, then Infrastructure's shared deploy action (`thebensage-dev/Infrastructure/.github/actions/coolify-deploy`) writes the app's runtime settings into Coolify from this repo's GitHub secrets and variables, points the app at the new image tag, starts the deployment and waits until Coolify reports it finished.

Coolify only runs images; it builds nothing and holds no tokens of its own. The **image** job keeps the 10 newest images on ghcr.io (about 10 deploys to roll back to) and deletes older ones, and Coolify's own Docker cleanup (Servers > the server > Docker Cleanup) removes images the server no longer uses.

**One-time setup on GitHub** (the repo is public, which is what makes environments, environment secrets and required reviewers available on GitHub Free): Settings > Environments > New environment `production`: tick **Required reviewers** and add yourself (later, your team), and under **Deployment branches and tags** allow only `main`. **Secrets** are environment secrets there, so only an approved deploy from `main` can read them; a pull request or another branch never sees them. **Variables** aren't secret and are set once for every repo as organization variables (thebensage-dev > Settings > Secrets and variables > Actions > Variables). The script in Infrastructure's README ("Every value for all four repos at once") sets all of it. Until `DOMAIN` exists, the deploy job is skipped.

| Name              | Kind               | Value                                                                                                                                                                                                                                                                                         |
| ----------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DOMAIN`          | org variable       | `example.com`. The pipeline derives `APP_URL` (`https://users.example.com`), `API_URL` (`https://api.example.com`), `OIDC_ISSUER_URL` (`https://id.example.com/application/o/user-directory/`) and `MAIN_SITE_URL` from it.                                                                   |
| `COOLIFY_TOKEN`   | environment secret | Coolify API token with **write** and **deploy** (Keys & Tokens > API tokens; enable API Access under Settings > Advanced first)                                                                                                                                                               |
| `PLATFORM_SECRET` | environment secret | The same value as in Infrastructure: 64 random characters. The pipeline derives `OIDC_CLIENT_SECRET` (label `user-directory-oidc`, the same as authentik's) and `AUTH_SECRET` from it, so nothing else needs copying. Changing it signs everyone out and needs Infrastructure redeployed too. |

Optional overrides: `COOLIFY_URL` (variable) if Coolify isn't at `https://coolify.<DOMAIN>`, and `COOLIFY_APP_UUID` (variable) if the Coolify app isn't named `user-directory`.

**One-time setup in Coolify:** New resource > **Docker Image**, named `user-directory`, image `ghcr.io/thebensage-dev/user-directory`, tag `main` (the pipeline sets the exact tag on every deploy). If the image on ghcr.io is private, the server needs a one-time `docker login ghcr.io` (Infrastructure README, "Coolify can pull the app images"). Then:

| Setting                | Value                                         |
| ---------------------- | --------------------------------------------- |
| Port (Ports Exposes)   | `3000`                                        |
| Domain                 | `https://users.example.com`                   |
| Persistent storage     | None. The data lives in the API's PostgreSQL. |
| Auto deploy / webhooks | Off. The pipeline deploys.                    |

The app holds no state of its own, so it could run as several instances. The demo people are added by the API (its `SEED_DEMO_DATA`), not here.

## Licence

MIT, see [`LICENSE`](LICENSE). Copyright (c) 2026 TheBensage.
