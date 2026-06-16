# Real Blackjack — Project Instructions

## HARD RULES — read before every response that involves code
**Never begin implementing a story unless explicitly asked in this session.**
**After completing any story, run `/code-review medium` before declaring it done.**
**Commit directly to main after every green state — no branches.**
**Read `docs/plan.md` in full before touching any code — it is the authoritative plan.**

## Recipes
<!-- Add recipes as patterns emerge — never upfront. Format: numbered steps + real code block. -->

## Project overview
Single-player Blackjack — player vs dealer — iOS + Android from one codebase.

- `packages/common` — pure TypeScript game engine + shared types (no RN deps; Vitest-tested)
- `packages/app` — Expo SDK 52 React Native app (Expo Router, Reanimated 3, Zustand, MMKV)

`packages/backend` and `packages/frontend` (web scaffold) are **deleted** in Task A1.

## Architecture
- **Engine** lives entirely in `packages/common/src/engine/` — pure functions, zero framework deps, fully unit-tested with Vitest. Single source of truth for all game logic.
- **Solver seam:** `getState(game)` + `getLegalMoves(game)` exported from engine `index.ts`. Future LLM advisor plugs in here without touching engine internals.
- **App** (`packages/app`) wraps the engine via a Zustand `GameStore`. UI reads store state; user actions call `store.action(move)` which calls `engine.applyAction()`.
- **State:** Zustand with `react-native-mmkv` persist adapter. Two stores: `GameStore` (game state + session peak) and `LeaderboardStore` (session history, top 20).
- **Navigation:** Expo Router (file-based). Two screens: `app/index.tsx` (table) + `app/leaderboard.tsx`.
- **Layout:** `Box`, `Row`, `Column`, `FullBox`, `FullRow`, `FullColumn` RN primitives (`View` + `StyleSheet`) — no raw Views with layout styles, no inline styles.
- **Animations:** React Native Reanimated 3 + Moti — runs on native thread.
- **Testing:** Vitest for engine (common); jest-expo + RNTL for components (app). This is the one intentional divergence from global CLAUDE.md's Vitest preference — Metro + Jest is the standard RN toolchain.

## Key conventions (project-specific)
- Engine functions are always immutable — return new state, never mutate
- Seedable RNG (`createRng(seed?)`) everywhere in the engine — tests always pass a fixed seed
- `frontend-design` skill must be invoked at the start of every Epic 3 (Table UI) story
- Card rendering is fully encapsulated in `CardView` — art is swappable without touching engine or store

## What's done
- Epics 1–3 complete: full engine (E1–E10), app shell (A1–A4), table UI (A3.1–A3.9)
- Epic 3 code review (2026-06-16) found 10 bugs documented in `docs/plan.md` under "Bug Fixes — Post-Epic-3"

## What's next
- **TASK BF1** — Insurance subsystem (4 interrelated bugs; fix first, highest priority)
- **TASK BF2** — Persistence + split-hand rendering (2 bugs)
- **TASK BF3** — Housekeeping (4 low-priority items)
- Then **Epic 4** — Animations (A4.1–A4.5)
- See `docs/plan.md` → "Bug Fixes — Post-Epic-3" for full details on each bug and the fix strategy
