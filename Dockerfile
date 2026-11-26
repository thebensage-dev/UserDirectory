# syntax=docker/dockerfile:1
# Production image: the Next.js standalone server. It keeps no data: the People API (API_URL) does.
# Node 26 LTS: keep it in step with .nvmrc (Dependabot ignores Node majors; move with the next LTS).

# 1. Install all dependencies (dev deps are needed to build). Nothing is compiled.
FROM node:26-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# @thebensage-dev/ui and @thebensage-dev/api-client come from GitHub Packages. The token is a
# BuildKit secret, so it never lands in a layer. The temporary .npmrc only names the variable; npm
# reads its value from the secret.
RUN --mount=type=secret,id=NODE_AUTH_TOKEN,env=NODE_AUTH_TOKEN \
    printf '%s\n' '@thebensage-dev:registry=https://npm.pkg.github.com' \
      '//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}' > .npmrc \
    && npm ci \
    && rm .npmrc

# 2. Build the app, then trim the standalone output.
FROM node:26-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
# sharp is only used by next/image optimisation, which this app doesn't use.
# Remove this line if you add next/image.
RUN rm -rf .next/standalone/node_modules/sharp .next/standalone/node_modules/@img

# 3. Runtime: only the standalone server and static assets.
FROM node:26-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000

# Coolify uses this to tell when the app is up. It checks only this server (the icon needs no
# API), so an API outage doesn't make Coolify restart or roll back this app; Grafana watches
# the API on its own. busybox wget ships with Alpine.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -q --spider "http://127.0.0.1:${PORT}/icon.svg" || exit 1

CMD ["node", "server.js"]
