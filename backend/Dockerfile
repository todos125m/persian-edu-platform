# syntax=docker/dockerfile:1
FROM node:18-alpine AS base
# openssl + libc6-compat are required by Prisma's query engine on Alpine (musl)
RUN apk add --no-cache openssl libc6-compat

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
# build toolchain so native modules (bcrypt) compile on Alpine
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

USER nestjs

EXPOSE 4000

# Sync schema (idempotent; no-op when already in sync). Fail-open so the
# server still boots if the push can't run — the schema is already provisioned.
CMD ["sh", "-c", "npx prisma db push --skip-generate || true; node dist/main"]
