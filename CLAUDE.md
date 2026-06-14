# Real Blackjack — Project Instructions

## HARD RULES — read before every response that involves code
**Never begin implementing a story unless explicitly asked in this session.**
**After completing any story, run `/code-review medium` before declaring it done.**
**Commit directly to main after every green state — no branches.**

## Recipes
<!-- Add recipes as patterns emerge — never upfront. Format: numbered steps + real code block. -->

## Project overview
- `packages/common` — shared types, domain models, and utils consumed by both backend and frontend
- `packages/backend` — Express HTTP server, game logic, PostgreSQL via Drizzle ORM
- `packages/frontend` — React SPA, Vite, layout primitives, axios via http-client wrapper

## Architecture
- Ports & Adapters: backend dependencies injected at composition root (`src/main.ts`)
- Frontend model layer: `src/models/<entity>/` with `model.ts`, `translator.ts`, `selectors.ts`
- HTTP client wrapped at `packages/frontend/src/api/http-client.ts` — never import axios directly
- Layout via `Box`, `Row`, `Column`, `FullRow`, `FullColumn`, `FullBox` primitives — no raw divs with layout styles
- List endpoints: pagination + server-side sort + filter from day one (YAGNI exception)

## Key conventions (project-specific)
<!-- Only deltas from the global file -->
- Shared types live in `packages/common/src/` and are imported by both packages

## What's done
- Project scaffolded: monorepo, ESLint, TypeScript, Vite, Vitest, layout primitives, http-client, Stop hook

## What's next
- Define the game domain model (deck, hand, card) in `packages/common/src/models/`
- Implement first game API endpoint (start game) with TDD
