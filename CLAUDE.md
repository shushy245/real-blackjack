# Real Blackjack — Project Instructions

## HARD RULES — read before every response that involves code
**Never begin implementing a story unless explicitly asked in this session.**
**At the start of every story: create a lightweight git tag `story/<name>` (e.g. `story/BF1`) before writing any code.**
**After completing any story: run `/code-review high story/<name>` (e.g. `/code-review high story/BF2`). This produces one review over all commits since the tag. If the review comes back empty, re-run passing the resolved SHA instead.**
**Commit directly to main after every green state — no branches.**
**Read `docs/plan.md` in full before touching any code — it is the authoritative plan.**
**Before ending any session: update "What's done" and "What's next" in this file, and mark completed tasks in `docs/plan.md`.**

## Recipes
<!-- Add recipes as patterns emerge — never upfront. Format: numbered steps + real code block. -->

## Project overview
Single-player Blackjack — player vs dealer — iOS + Android from one codebase.

- `packages/common` — pure TypeScript game engine + shared types (no RN deps; Vitest-tested)
- `packages/app` — Expo SDK 54 React Native app (Expo Router, Reanimated 4, Zustand, MMKV)

`packages/backend` and `packages/frontend` (web scaffold) are **deleted** in Task A1.

## Architecture
- **Engine** lives entirely in `packages/common/src/engine/` — pure functions, zero framework deps, fully unit-tested with Vitest. Single source of truth for all game logic.
- **Solver seam:** `getState(game)` + `getLegalMoves(game)` exported from engine `index.ts`. Future LLM advisor plugs in here without touching engine internals.
- **App** (`packages/app`) wraps the engine via a Zustand `GameStore`. UI reads store state; user actions call `store.action(move)` which calls `engine.applyAction()`.
- **State:** Zustand with `react-native-mmkv` persist adapter. Two stores: `GameStore` (game state + session peak) and `LeaderboardStore` (session history, top 20). Expo Go uses `MemoryStorageAdapter` (detected via `ExecutionEnvironment.StoreClient`); MMKV is used in all other builds.
- **Navigation:** Expo Router (file-based). Two screens: `app/index.tsx` (table) + `app/leaderboard.tsx`.
- **Layout:** `Box`, `Row`, `Column`, `FullBox`, `FullRow`, `FullColumn` RN primitives (`View` + `StyleSheet`) — no raw Views with layout styles, no inline styles.
- **Animations:** React Native Reanimated 4 + Moti — runs on native thread.
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
- Epic 4 code review (2026-06-16) found 6 bugs; all fixed in BF4 (2026-06-16), commit 5c6b704
- BF4 code review (2026-06-16) found 5 follow-up items; all fixed in story/BF4-review (2026-06-16), commit 92df8e6
  - FLIP_DURATION_MS extracted to `animations/constants.ts` (direct animations→components import triggered eslint-plugin-import/no-cycle null-traversal crash; neutral constants file avoids it)
- SD1 complete (2026-06-17): downgraded from SDK 56 to SDK 54 (RN 0.81.5, React 19.1, Reanimated 4.1, expo-router 6.0, TS 5.9)
- SD2 complete (2026-06-17): in-memory `MemoryStorageAdapter` for Expo Go (`ExecutionEnvironment.StoreClient`)
- BF5 complete (2026-06-18): MMKV wiring, async race fix, const-only action, session ID, dead code removal
- BF5-review complete (2026-06-18): Expo Go crash fix, $0 balance guard, factory validation, port bypass; 118 tests green: 103 engine (Vitest) + 15 app (Jest)
- Epic 5 complete (2026-06-18): A5.1 SoundsProvider context (expo-av, 5 assets), A5.2 sound events wired (deal/flip/chip/win/bust), A5.3 haptics wired (deal/win/bust); 128 tests green: 103 engine + 25 app
- A5-review complete (2026-06-18): null→undefined (5 useRef calls), 4 as-casts removed (typed mock helpers added), eslint-disable rule name corrected

## What's next
- **All planned epics complete.** Plan new features (EAS Build / distribution, Game Over screen, advisor, etc.) before writing code.
