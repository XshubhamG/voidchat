# VoidChat

Real-time chat application built with Next.js, Convex, and Better Auth.

## Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Convex (real-time reactive database + server functions)
- **Auth**: Better Auth (username + password)
- **AI**: AI SDK + OpenRouter (multi-model support)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.0+)
- [Convex account](https://convex.dev) (free tier)

### Setup

1. **Install dependencies**
  ```bash
   bun install
  ```
2. **Start development servers** (runs Next.js + Convex in parallel)
  ```bash
   bun run dev
  ```
   On first run, Convex CLI will prompt you to create a project.
3. **Set environment variables**
  The Convex CLI will create `.env.local` with your deployment URL. Add these:
   Set the Better Auth secret on your Convex deployment:
   For AI chat, add your OpenRouter API key:
4. **Open** [http://localhost:3000](http://localhost:3000)

### Production deployment (Vercel + Convex)

This repo includes `vercel.json`: install with **Bun**, build with **`bun run deploy`** (Convex push + Next.js build). The deploy command wires **`NEXT_PUBLIC_CONVEX_URL`** into the build via Convex CLI (`--cmd-url-env-var-name`), and `next.config.ts` derives **`NEXT_PUBLIC_CONVEX_SITE_URL`** from the `.convex.cloud` URL so it always matches the same deployment.

#### 1. Vercel → Project → Settings → Environment Variables

| Name | Environments | Notes |
|------|----------------|------|
| `CONVEX_DEPLOY_KEY` | **Production** only (use the [production deploy key](https://dashboard.convex.dev) from your Convex project’s production deployment) | Required for `bun run deploy` on Vercel. For [preview deployments](https://docs.convex.dev/production/hosting/vercel#preview-deployments), add a **second** variable with a **Preview** deploy key and the same name, scoped to **Preview** only. |

You do **not** need to set `NEXT_PUBLIC_CONVEX_URL` or `NEXT_PUBLIC_CONVEX_SITE_URL` on Vercel if you use `bun run deploy` as the build command: Convex sets the URL for the build step, and the site URL is derived. Set them manually only if you use a custom Convex domain or a nonstandard setup.

#### 2. Convex Dashboard → your **production** deployment → Settings → Environment Variables

| Name | Value |
|------|--------|
| `SITE_URL` | Exact public URL of your app, e.g. `https://your-project.vercel.app` or your custom domain. Must match what users type in the address bar. Used by Better Auth (`convex/auth.ts`). |
| `OPENROUTER_API_KEY` | Your OpenRouter key (for AI actions). |

If `SITE_URL` still points at `localhost` or the wrong domain, cookies and auth callbacks will not match Vercel.

#### 3. Vercel → Settings → General

Confirm **Build Command** is `bun run deploy` and **Install Command** is `bun install` (defaults from `vercel.json`), or override to match.

#### Other commands

- **Convex + Next.js build** (local or CI): `CONVEX_DEPLOY_KEY` set → `bun run deploy`.
- **Convex backend only**: `bun run deploy:convex`.

## Features

- Username + password authentication (no email required)
- Real-time 1:1 messaging with Convex subscriptions
- AI chat gateway (OpenRouter, multi-model)
- Dark theme with pastel accents
- Message grouping and pagination
- Mobile responsive layout
- Deterministic pastel avatars

## Project Structure

```
app/            Next.js pages and layouts
components/     React components (auth, chat, layout, ui)
convex/         Convex backend (schema, queries, mutations, actions)
lib/            Shared utilities (auth clients, helpers)
```

