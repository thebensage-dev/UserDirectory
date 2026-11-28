# User Directory

A searchable directory of users at `users.<domain>`: Next.js 16 (React 19, Tailwind v4, react-hook-form and zod, Vitest) on the [API](https://github.com/thebensage-dev/Api), which holds the data. Every page and word comes from the [CMS](https://github.com/thebensage-dev/Cms); components and colours from [`@thebensage-dev/ui`](https://github.com/thebensage-dev/SharedUI).

How the repos fit together, and the local stack that runs them all, are in [Infrastructure's README](https://github.com/thebensage-dev/Infrastructure).

It's a demo of a full-stack Next.js app done properly:

- Server Components read from the API; Server Actions write through it with the signed-in person's authentik token.
- Search, filters, sort and paging run in SQL in the API, driven by this app's URL, so every view is shareable.
- One validation schema for the form and the server; the API checks the same rules again.
- Visitors can try every form and see every check; only editors can save.

## Features

- Card and table views (remembered per browser), stats, and paging (12, 24 or 48 per page).
- Multi-word, accent-insensitive search ("martinez" finds Martínez) ranked by best match, with highlights.
- Filters by country, age range and interests, as removable chips.
- Add, edit and delete with a validated form, server errors beside the field, and toasts.
- Profiles with contact details, location, job, bio and interests.
- Light, dark or system theme with no flash; `/` to search, `N` to add.

## Content

Pages are CMS pages made of blocks; the directory and the profile are blocks too (`userDirectory`, `userProfile`), so the CMS decides where they go. `src/app/[[...slug]]/page.tsx` finds the page for the address (`/users/[id]` matches every profile) and draws its blocks through `src/blocks/registry.ts`. The form, dialogs, notices and refusals are worded in the site's settings (the Directory tab). Only the users and the validation rules come from the API.

`src/server/cms.ts` reads the CMS (cached a minute, the last good copy while it's down, then [`src/content/cms-snapshot.json`](src/content/cms-snapshot.json), refreshed with `npm run content:snapshot`).

## Running it

Needs Node 26 (`.nvmrc`) and a `.npmrc` with a GitHub token that has `read:packages` (copy `.npmrc.example`).

```bash
npm ci
npm run dev      # http://localhost:3000
npm run check    # format check, lint, typecheck, tests
npm run build
```

The pages need the API (`API_URL`, default `http://localhost:3002`) and the CMS (`CMS_URL`, default `http://localhost:3003`); the easiest way to have both is the local stack, `../Infrastructure/local/compose.yaml` (this app at http://users.localhost:8080). The other settings are in `.env.example`: `MAIN_SITE_URL` (the footer's privacy and terms links), `PREVIEW_SECRET`, `CMS_PUBLIC_URL` and the sign-in variables. The tests stub the API.

## Sign-in

Anyone can browse. Adding, editing and deleting need an authentik account in `user-directory-editors` (or an authentik admin). Sign-in is single sign-on with the other sites (a silent check on page load signs you in if you're already signed in elsewhere), and signing out signs out of every app. Anyone signed in without edit access gets a **Request access** link: authentik's shared request page with this app ticked; you approve by adding them to the group.

Without the OIDC variables the directory is read-only.

## Deploying

The same pipeline as every repo (Infrastructure's README, "Deploying"): checks, an image on `ghcr.io/thebensage-dev/user-directory`, then an approved deploy that writes the settings into Coolify, derived from `DOMAIN` and `PLATFORM_SECRET`.

Coolify app: **Docker Image** named `user-directory`, image `ghcr.io/thebensage-dev/user-directory`, port `3000`, domain `https://users.<domain>`, no storage (the data is in the API), auto deploy off.

## Licence

MIT, see [`LICENSE`](LICENSE). Copyright (c) 2026 TheBensage.
