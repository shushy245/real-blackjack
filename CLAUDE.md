# Real Blackjack — Project Instructions

## HARD RULES — read before every response that involves code
**Never begin implementing a story unless explicitly asked in this session.**
**At the start of every story: create a lightweight git tag `story/<name>` (e.g. `story/BF1`) before writing any code.**
**After completing any story: run `/code-review high story/<name>` (e.g. `/code-review high story/BF2`). This produces one review over all commits since the tag. If the review comes back empty, re-run passing the resolved SHA instead.**
**Commit directly to main after every green state — no branches.**
**Read `docs/plan.md` in full before touching any code — it is the authoritative plan.**
**Before ending any session: update "What's done" and "What's next" in this file, and mark completed tasks in `docs/plan.md`.**

## Planning Process — new ideas and features
When a new idea, feature, or epic is presented:
1. **Interview first** — ask the specific questions whose answers change the design (scope, constraints, rules, edge cases, UX decisions). Do not propose an implementation plan until those answers are in hand. Push back where warranted.
2. **Align on the plan** — once the interview is complete, write up the proposed epic/story/task breakdown (in `docs/plan.md` format) and present it for approval. No code until approved.
3. **Update the plan files** — after approval, add the new work to `docs/plan.md` (following the existing epic → story → task structure) and update "What's next" in this file to point to it.
4. **Then implement** — only when explicitly asked to start in this session.

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
- Epic 3 code review (2026-06-16) found 10 bugs; all fixed in BF1–BF3 (2026-06-16)
- BF1 insurance fix note: `insuranceTaken: true` is set on BOTH take and decline paths (prevents re-offer in `getLegalMoves`); payout discrimination uses `insuranceBet !== undefined` (only set on take). The plan's original BF1 test expectation that decline leaves `insuranceTaken: false` was the bug — code-review caught and corrected this.
- Epic 4 complete (2026-06-16): A4.1 deal slide (DealingCard/Moti), A4.2 hole-card flip (FlippableCard/Reanimated rotateY), A4.3 win/bust flash (useResultFeedback hook), A4.4 chip bounce (AnimatedChip withSequence spring), A4.5 split layout (LinearTransition + FadeIn)
- 117 tests green: 103 engine (Vitest) + 14 app (Jest)

## What's next
- **Epic 5** — Sound & Haptics (A5.1–A5.3): expo-av setup, deal/flip/chip/win/bust sounds, expo-haptics on deal/win/bust
- See `docs/plan.md` → "Epic 5 — Sound & Haptics" for story details
