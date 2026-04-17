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

