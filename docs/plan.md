# Real Blackjack — Phase 2 Plan

> Self-contained reference for resuming from a fresh session.
> Read this + CLAUDE.md before writing a single line of code.

---

## All Resolved Decisions

### Game Rules
- **Decks:** 6-deck shoe; reshuffle when ≥234 of 312 cards dealt (75% penetration)
- **Dealer:** hits soft 17, stands hard 17+
- **Blackjack payout:** 3:2
- **Dealer peek:** peeks on Ace and 10-value; if dealer BJ, round ends immediately
- **Player actions:** Hit · Stand · Double Down · Split · Insurance
- **Split:** up to 4 hands total; re-split Aces allowed; no restrictions on hitting after split
- **Double After Split (DAS):** allowed
- **No surrender**
- **Insurance:** offered when dealer shows Ace; pays 2:1; no "even money" shortcut
- **BJ vs BJ:** push
- **Out of chips:** Game Over screen → quick transition to new game; no rebuys

### Chips & Economy
- **Starting bankroll:** $1,000
- **Chip denominations:** $5 · $25 · $100 · $500 · $1,000
- **Minimum bet:** $10 · **Maximum bet:** $1,000
- **Bet UX:** tap-to-add chips (visual stack builds up); repeat-bet button for fast replay
- **Session end:** Cash Out button (voluntary) or bust ($0 balance)

### Leaderboard
- **Scope:** local, session-scoped, anonymous — no name entry, no backend, no accounts
- **Metrics per session:** peak balance reached + balance at session end
- **Storage:** MMKV on-device; top 20 sessions retained

### UX & Feel
- **Visual direction:** green felt classic — skeuomorphic, classy; no corners cut
- **Card art:** nicubunu ornamental SVG deck (CC0 public domain — verify license before asset task)
- **Portrait only:** yes
- **Sound:** in MVP — deal, flip, chip clink, win chime, bust buzz (small files committed to repo)
- **Haptics:** in MVP — expo-haptics on deal, win, bust
- **One-handed:** tap-to-add chip UX is thumb-friendly by design

### Tech Stack
- **Framework:** Expo SDK 52 · Expo Router (file-based navigation)
- **Build & distribution:** EAS Build (cloud); Dev Client for dev workflow (Expo Go won't work — MMKV requires custom native)
- **Distribution:** Android APK sideload (EAS Build free tier, share .apk link); iOS when Apple Developer account acquired
- **Animation:** React Native Reanimated 3 + Moti
- **State:** Zustand with MMKV persist adapter (`react-native-mmkv`)
- **Engine tests:** Vitest (pure TypeScript, no DOM/RN deps)
- **Component tests:** jest-expo preset + React Native Testing Library (RNTL)
- **E2E:** Maestro — post-MVP

---

## Architecture

### Package Structure

```
Before (delete):          After (target):
packages/backend/    →    (removed)
packages/frontend/   →    (removed)
packages/common/     →    packages/common/   ← engine + shared types
                          packages/app/      ← Expo / React Native app
```

### Engine — packages/common/src/engine/

Pure TypeScript. Zero React Native deps. Fully testable with Vitest. All functions immutable.

```
engine/
  types.ts         — Rank, Suit, Card, Move, HandValue, RoundState, GameState, SolverState
  rng.ts           — createRng(seed?): Rng; shuffle(arr, rng): T[]  (mulberry32 + Fisher-Yates)
  shoe.ts          — createShoe, dealCard, needsReshuffle, reshuffleShoe
  hand.ts          — calculateHand, isBust, isBlackjack, isSoft
  dealer.ts        — shouldDealerHit(hand: HandValue): boolean
  legal-moves.ts   — getLegalMoves(state: RoundState): Move[]
  round.ts         — createRound, applyRoundAction(state, action): RoundState
  payouts.ts       — settleRound(state): { netDelta: number; handResults: HandResult[] }
  game.ts          — createGame, applyAction(game, action): GameState
  index.ts         — public API: createGame, applyAction, getState, getLegalMoves
```

**Solver seam:** `getState(game): SolverState` and `getLegalMoves(game): Move[]` exported from `index.ts`. The future LLM advisor calls only these — no internal engine knowledge required.

**Seedable RNG:** `createRng(seed?: number)` returns `() => number` in [0, 1). Default seed is `Date.now()`. Tests always pass a fixed seed for deterministic shuffles.

**Immutability:** every engine function returns a new state object. No mutation. Engine state is always serializable (no functions, no circular refs).

### App — packages/app/

```
app/                       ← Expo Router screens (file-based)
  _layout.tsx              ← root layout + providers (Zustand, safe area)
  index.tsx                ← TableScreen (main game)
  leaderboard.tsx          ← LeaderboardScreen
src/
  store/
    game-store.ts          ← Zustand: wraps engine; action/newGame/cashOut
    leaderboard-store.ts   ← Zustand: session history, MMKV-persisted
  components/
    table/                 ← TableView, DealerArea, PlayerArea
    cards/                 ← CardView (SVG face-up/down), DealingCard (animated)
    chips/                 ← ChipStack, ChipTray, BetDisplay
    controls/              ← ActionBar, BetControls
    leaderboard/           ← LeaderboardScreen, SessionRow
    ui/                    ← Box, Row, Column, FullBox, FullRow, FullColumn (RN layout primitives)
  animations/              ← useCardDeal, useCardFlip, useChipStack, useWinFeedback
  sounds/                  ← useSounds hook (expo-av)
  assets/
    cards/                 ← nicubunu ornamental SVG files (52 cards + back)
    sounds/                ← deal.mp3, flip.mp3, chip.mp3, win.mp3, bust.mp3
app.json                   ← Expo config (bundle ID: com.shalevshushy.realblackjack)
eas.json                   ← EAS Build profiles (development, preview, production)
```

### State Stores

```ts
// GameStore — Zustand, partially MMKV-persisted (balance only)
type GameStore = {
  gameState: GameState;
  sessionPeak: number;
  action: (move: Move) => void;      // applyAction → update store
  newGame: () => void;
  cashOut: () => void;               // writes to LeaderboardStore, then newGame
};

// LeaderboardStore — Zustand, fully MMKV-persisted
type LeaderboardStore = {
  sessions: Session[];               // [{ id, date, peak, endBalance }] top 20
  addSession: (s: Omit<Session, 'id' | 'date'>) => void;
};
```

### Testing Strategy

| Layer | Runner | Notes |
|---|---|---|
| Engine (common) | Vitest | Pure functions, seedable RNG. Bulk of tests. |
| RN Components (app) | jest-expo + RNTL | Driver pattern per global CLAUDE.md; RNTL queries match testing-library API |
| Stores | jest-expo | Tested with a fake engine (pure function replacement) |
| E2E | Maestro | Post-MVP; YAML flows against Dev Client build |

**Important:** `packages/app` uses Jest (jest-expo preset), not Vitest. Metro + Jest is the standard RN toolchain. This is the one deliberate divergence from the global CLAUDE.md Vitest preference, which applies to web projects.

---

## Story Map

### MVP

**Epic 1 — Pure Game Engine** (`packages/common`) — Vitest TDD, no UI
1. Card types + deck creation
2. Seedable RNG + Fisher-Yates shuffle
3. Shoe (6 decks, penetration tracking)
4. Hand value calculation (hard/soft, bust, blackjack detection)
5. Dealer policy
6. Legal moves resolution
7. Round state machine — deal phase
8. Round state machine — player action phase
9. Dealer turn + settlement + payouts
10. Full game loop + solver seam surface

**Epic 2 — App Shell** (`packages/app`)
1. Expo project init + workspace cleanup (delete backend/frontend)
2. RN layout primitives (Box, Row, Column, FullBox, FullRow, FullColumn)
3. Zustand + MMKV stores (GameStore + LeaderboardStore)
4. Expo Router navigation shell (screens + layout)

**Epic 3 — Table UI (static, no animations)**
— invoke `frontend-design` skill at the start of each story —
1. nicubunu ornamental SVG asset integration
2. CardView component (face-up + face-down states)
3. Table layout (felt background, dealer area, player area, score display)
4. PlayerHand + DealerHand rendering
5. BetControls: chip tray + tap-to-add + repeat-bet button
6. ActionBar: Hit/Stand/Double/Split/Insurance with conditional render
7. Game Over screen + transition to new game
8. Cash Out flow
9. Leaderboard screen

**Bug Fixes — Post-Epic-3 code review surfaced 10 bugs; fix all before Epic 4** ✅ DONE 2026-06-16
1. Insurance subsystem (4 blocking bugs — fix together) ✅
2. Bust persistence + split-hand rendering (2 high-priority bugs) ✅
3. Housekeeping (4 low-priority — unused param, test leakage, sort tiebreaker, domain logic in UI) ✅

**Epic 4 — Animations** (Reanimated 3 + Moti) ✅ DONE 2026-06-16
1. Card deal: slide from shoe position to hand ✅
2. Hole card flip: rotateY reveal (face swap at 90°) ✅
3. Win/bust visual feedback (flash + chip movement) ✅
4. Chip tap animation (stack builds visually) ✅
5. Split animation (cards separate to two positions) ✅

**Epic 5 — Sound & Haptics**
1. expo-av setup + sound loading hook
2. Sound events: deal · flip · chip clink · win chime · bust buzz
3. expo-haptics: deal · win · bust

### Post-MVP
- Online shared leaderboard (requires backend + auth — separate planning session)
- LLM strategy advisor UI (plugs into `getState` / `getLegalMoves` seam — no engine changes)

### Future
- Side bets (Perfect Pairs, 21+3)
- Custom card art
- Strategy breakdown / stats screen
- Tournament mode

---

## Task Breakdown — Epic 1 (full detail)

All tasks in `packages/common/src/engine/`. Run tests with `pnpm test` from `packages/common/`.
Format: write the test list first as failing tests, then minimum code to green, then refactor.

---

### TASK E1 — Card types + deck creation

```
Files: types.ts, deck.ts

Test list (write these failing first):
  - Rank enum has exactly 13 values (Two through Ace)
  - Suit enum has exactly 4 values (Hearts, Diamonds, Clubs, Spades)
  - createDeck() returns exactly 52 cards
  - createDeck() contains no duplicate cards (every Rank × Suit exactly once)
  - Card type has rank: Rank and suit: Suit

Implementation note:
  types.ts: Rank enum, Suit enum, Card type — nothing else yet
  deck.ts: createDeck(): Card[] — flat-map all ranks × suits

Definition of done: all tests green; refactor clean; committed
```

---

### TASK E2 — Seedable RNG + shuffle

```
Files: rng.ts

Test list:
  - createRng(seed) returns a function producing numbers in [0, 1)
  - Two createRng(42) instances produce identical sequences
  - createRng(42) and createRng(99) produce different first values
  - shuffle(cards, rng) returns array with same 52 cards (no additions or removals)
  - shuffle with same seed + same deck produces identical output
  - shuffle does not mutate the input array

Implementation note:
  mulberry32 PRNG (seed → state → () => number in [0,1))
  Fisher-Yates: iterate from end; swap current with rng-chosen index ≤ current
  Rng type alias: type Rng = () => number

Definition of done: all tests green; refactor clean; committed
```

---

### TASK E3 — Shoe

```
Files: shoe.ts

Test list:
  - createShoe(rng) returns shoe with 312 cards (6 × 52)
  - dealCard(shoe) returns [card, newShoe] — original shoe unchanged
  - Two consecutive dealCard calls return different cards
  - dealCard on empty shoe throws with descriptive message
  - needsReshuffle(shoe) false when dealtCount < 234
  - needsReshuffle(shoe) true when dealtCount >= 234
  - reshuffleShoe(shoe, rng) resets to 312 cards with dealtCount 0
  - Same rng seed → same deal sequence from fresh shoe

Implementation note:
  Shoe: { cards: readonly Card[]; dealtCount: number }
  dealCard: slice head card, return [card, { cards: rest, dealtCount: n+1 }]
  RESHUFFLE_THRESHOLD = 234 constant

Definition of done: all tests green; refactor clean; committed
```

---

### TASK E4 — Hand value calculation

```
Files: hand.ts

Test list:
  - calculateHand([]) → { value: 0, isSoft: false }
  - Two through Ten count at face value
  - Jack, Queen, King count as 10
  - Ace + 6 → { value: 17, isSoft: true }
  - Ace + King → { value: 21, isSoft: true }
  - Ace + King + Five → { value: 16, isSoft: false }  (Ace demoted to 1)
  - Ace + Ace → { value: 12, isSoft: true }
  - Ace + Ace + Nine → { value: 21, isSoft: false }
  - isBust: true when value > 21
  - isBlackjack: true only for exactly 2 cards totalling 21 with one Ace
  - isBlackjack: false for 3-card 21
  - isBlackjack: false for 2-card 20

Implementation note:
  calculateHand(cards: Card[]): HandValue
  HandValue: { value: number; isSoft: boolean }
  Algorithm: count all Aces as 11 first; while value > 21 and softAces > 0: value -= 10, softAces--
  isSoft: softAces > 0 after loop

Definition of done: all tests green; refactor clean; committed
```

---

### TASK E5 — Dealer policy

```
Files: dealer.ts

Test list:
  - shouldDealerHit({ value: 16, isSoft: false }) → true
  - shouldDealerHit({ value: 17, isSoft: true }) → true   (soft 17 — must hit)
  - shouldDealerHit({ value: 17, isSoft: false }) → false  (hard 17 — stand)
  - shouldDealerHit({ value: 18, isSoft: true }) → false
  - shouldDealerHit({ value: 21, isSoft: false }) → false
  - shouldDealerHit({ value: 22, isSoft: false }) → false  (bust — no further hits)

Implementation note:
  shouldDealerHit(hand: HandValue): boolean
  return hand.value < 17 || (hand.isSoft && hand.value === 17)

Definition of done: all tests green; refactor clean; committed
```

---

### TASK E6 — Legal moves

```
Files: legal-moves.ts (+ Move enum in types.ts)

Test list:
  - Fresh 2-card hand always returns Hit and Stand
  - Double Down in list: 2 cards, balance >= bet
  - Double Down absent: 3+ cards on hand
  - Double Down absent: balance < bet
  - Split in list: 2 cards of same rank, fewer than 4 active hands
  - Split absent: cards differ in rank
  - Split absent: already 4 active hands
  - Insurance in list: dealer shows Ace, first action of round, not yet taken
  - Insurance absent: dealer shows non-Ace
  - Insurance absent: not first action (3+ cards on hand)
  - Insurance absent: already taken this round
  - After split Aces (unrestricted): Hit, Stand, Double, re-Split all present if eligible
  - Empty Move[] when phase is not 'player-action'

Implementation note:
  Move enum: Hit | Stand | Double | Split | Insurance
  getLegalMoves(state: RoundState): Move[]
  RoundState must carry: activeHandIndex, playerHands, balance, originalBet,
    dealerUpCard, insuranceTaken, actionsOnActiveHand (to detect first action), phase

Definition of done: all tests green; refactor clean; committed
```

---

### TASK E7 — Round state machine: deal phase

```
Files: round.ts (createRound + deal transition only)

Test list:
  - createRound(bet, shoe, rng) returns RoundState in 'dealing' phase; transitions to next phase
  - After deal: player has 2 cards, dealer has 2 (second is face-down)
  - After deal with no BJ: phase is 'player-action'
  - After deal: player BJ + dealer non-Ace up → phase is 'settling' (peek found no BJ)
  - After deal: player BJ + dealer Ace up → phase is 'insurance-pending'
  - After deal: dealer BJ + dealer non-Ace up → peek triggers → phase is 'settling' (all player hands lose unless BJ)
  - Shoe has 4 fewer cards after deal

Implementation note:
  RoundState: { phase, shoe, playerHands, dealerCards, holeCardRevealed,
    activeHandIndex, originalBet, activeBet, balance, insuranceBet, insuranceTaken }
  Phase: 'player-action' | 'insurance-pending' | 'dealer-turn' | 'settling'
  dealerCards[1] is dealt but holeCardRevealed = false until dealer turn

Definition of done: all tests green; refactor clean; committed
```

---

### TASK E8 — Round state machine: player action phase

```
Files: round.ts (extend applyRoundAction for player moves)

Test list:
  - Hit: card added to active hand; hand value recalculated
  - Hit to bust (last hand): phase → 'dealer-turn'
  - Hit to bust (more hands follow): activeHandIndex advances
  - Hit to exactly 21 (non-BJ): auto-stand; advance or → 'dealer-turn'
  - Stand: if more hands → advance activeHandIndex; else → 'dealer-turn'
  - Double: activeBet doubled (deducted from balance); one card dealt; auto-stand
  - Split: two hands created; one card dealt to each; activeHandIndex = 0; handCount++
  - Re-split: works up to 4 hands total; errors on 5th split attempt
  - Insurance accepted: insuranceBet = originalBet / 2 deducted from balance; insuranceTaken = true; phase → 'player-action'
  - Insurance declined: insuranceTaken = true (no bet); phase → 'player-action'
  - Illegal move for current phase throws with descriptive error

Implementation note:
  applyRoundAction(state: RoundState, action: PlayerAction): RoundState
  PlayerAction: { type: Move } | { type: 'PlaceBet'; amount: number }
  All returns are new state objects — no mutation

Definition of done: all tests green; refactor clean; committed
```

---

### TASK E9 — Dealer turn + settlement

```
Files: round.ts (runDealerTurn) + payouts.ts (settleRound)

Test list — dealer turn:
  - Hole card revealed at start of dealer turn
  - Dealer draws cards until shouldDealerHit returns false
  - Dealer stops on hard 17
  - Dealer stops on soft 18+
  - Dealer does not draw after bust

Test list — settlement:
  - Player bust → lose regardless of dealer result
  - Dealer bust, player not bust → player wins 1:1
  - Player higher total → win 1:1
  - Equal totals (non-BJ) → push
  - Player BJ, dealer not BJ → win 3:2
  - Player BJ, dealer BJ → push
  - Insurance + dealer BJ → insurance pays 2:1; original BJ bet pushes
  - Insurance + dealer no BJ → insurance lost; original bet settles normally
  - DAS: doubled bet on split hand settles at full doubled amount independently
  - Multi-hand: each hand settles independently against dealer final total
  - netDelta applied to balance in game.ts (not in payouts.ts)

Implementation note:
  runDealerTurn(state: RoundState): RoundState  (draws cards; phase → 'settling')
  settleRound(state: RoundState): { netDelta: number; handResults: HandResult[] }
  HandResult: { handIndex: number; outcome: 'win' | 'lose' | 'push' | 'blackjack'; payout: number }

Definition of done: all tests green; refactor clean; committed
```

---

### TASK E10 — Full game loop + solver seam

```
Files: game.ts + index.ts

Test list:
  - createGame(config) returns GameState with correct balance and fresh shoe
  - applyAction(game, PlaceBet(50)) returns game in round 'player-action' phase
  - applyAction(game, Hit) returns updated game with card added
  - Balance correctly updated after round settles
  - Shoe reshuffled automatically when needsReshuffle at round start
  - applyAction with impossible action for current phase throws
  - getState(game) returns a plain serializable object (no functions)
  - getLegalMoves(game) returns Move[] matching current round state
  - GameState contains no functions or circular references (JSON.stringify succeeds)

Implementation note:
  GameConfig: { startingBalance: number; minBet: number; maxBet: number; seed?: number }
  GameState: { balance: number; sessionPeak: number; shoe: Shoe; round: RoundState | undefined }
  createGame(config): GameState
  applyAction(game, action): GameState  — immutable; shoe reshuffled at round creation if needed
  getState / getLegalMoves re-exported from index.ts as the solver seam surface

Definition of done: all tests green; refactor clean; committed
```

---

## Task Breakdown — Epics 2–5 (story stubs)

Detail is written at build time (mimic adjacent files, read existing code first).
Each story follows the same format: test list first, minimum green, refactor, commit.

### Epic 2 — App Shell

**TASK A1 — Expo project init + workspace cleanup**
- Delete `packages/frontend` and `packages/backend`
- `npx create-expo-app@latest packages/app --template blank-typescript`
- Update `pnpm-workspace.yaml` to include `packages/app`
- Add `"@real-blackjack/common": "workspace:*"` to app deps
- Install: `react-native-mmkv zustand expo-router react-native-reanimated moti expo-haptics expo-av`
- Configure `app.json` (name: "Real Blackjack"; bundle ID: `com.shalevshushy.realblackjack`)
- Configure `eas.json` (development / preview / production profiles)
- Verify: `import { createGame } from '@real-blackjack/common'` compiles and runs in app

**TASK A2 — RN layout primitives**
- `Box`, `Row`, `Column`, `FullBox`, `FullRow`, `FullColumn`
- `View` + `StyleSheet` based; no inline styles
- Same mental model as web primitives; replace `div` → `View`, CSS → `StyleSheet`

**TASK A3 — Zustand + MMKV stores**
- MMKV Expo config plugin in `app.json` plugins array
- `GameStore`: wraps engine; `action / newGame / cashOut`; balance MMKV-persisted
- `LeaderboardStore`: session array MMKV-persisted; top 20 by peak
- Tests: fake engine (pure function replacement); verify store transitions

**TASK A4 — Expo Router navigation shell**
- `app/_layout.tsx`: SafeAreaProvider + store providers
- `app/index.tsx`: `<TableScreen />` placeholder
- `app/leaderboard.tsx`: `<LeaderboardScreen />` placeholder
- Navigation: swipe or button from table → leaderboard

### Epic 3 — Table UI

Invoke `frontend-design` skill at the start of EACH story in this epic.
Target: felt and cards look like a real casino, not a tutorial project.

- **A3.1** — nicubunu ornamental SVG asset integration; `CardView` renders correct SVG by rank+suit
- **A3.2** — `CardView` face-up / face-down states; face-down renders card back SVG
- **A3.3** — Table layout: felt background, dealer area (top), player area (bottom), bet zone (center)
- **A3.4** — `PlayerHand` + `DealerHand`: cards in a fan/row; score badge; BJ badge
- **A3.5** — `BetControls`: chip tray (5 chips); tap-to-add; tap-in-stack to remove; repeat-bet button
- **A3.6** — `ActionBar`: renders only legal moves from store; disabled states for unavailable moves
- **A3.7** — Game Over screen: balance $0; session stats (peak reached); "New Game" CTA
- **A3.8** — Cash Out flow: confirmation prompt; writes session to LeaderboardStore; → new game
- **A3.9** — Leaderboard screen: ranked session list; peak + end balance per entry; date

### Bug Fixes — Post-Epic-3

All 10 bugs were found by a code-review over Epics 1–3 (2026-06-16). Fix all before starting Epic 4.

---

**TASK BF1 — Insurance subsystem (4 interrelated blocking bugs)** ✅ DONE 2026-06-16

All 4 touch the same feature; fix in one pass with TDD.

Files: `packages/common/src/engine/legal-moves.ts`, `round.ts`, `payouts.ts`

Bug list:
1. `getLegalMoves` returns `[]` during `insurance-pending` (legal-moves.ts:5) — ActionBar renders empty, player is stuck
2. Dealer Ace up-card + BJ hole → jumps to `settling` without offering insurance (round.ts:40)
3. Declining insurance (`Move.Stand`) sets `insuranceTaken: true` (round.ts:173) — payout treats decline same as take
4. Insurance taken + dealer BJ → main hand settles as `push payout:0`; combined with `originalBet` restoration in `applyCollectResult` → player nets +$100 instead of $0 (payouts.ts:24)

Fixes:
- `legal-moves.ts`: add `if (state.phase === 'insurance-pending') return [Move.Insurance, Move.Stand];` before the `player-action` guard
- `round.ts:40`: when dealer shows Ace and hole is BJ, still enter `insurance-pending`; after the player decision, check dealer BJ and resolve to `settling`
- `round.ts:173`: Move.Stand decline — do NOT set `insuranceTaken: true`; use a separate `insurancePhaseResolved` flag, or change payout guard to key on `insuranceBet !== undefined` instead of `insuranceTaken`
- `payouts.ts:24`: when `dealerBJ && insuranceTaken && !playerBJ`, return `{ outcome: 'lose', payout: -bet }` (not `push`). The insurance profit in `insuranceDelta` covers the loss — net is 0 as expected.

Test list (add to round.test.ts + payouts.test.ts, or new insurance.test.ts):
- `getLegalMoves` during `insurance-pending` returns `[Move.Insurance, Move.Stand]`
- Dealer Ace + BJ hole: phase is `insurance-pending`, not `settling`
- After player declines (Move.Stand in insurance-pending): `insuranceTaken` is false, `insuranceBet` is undefined, phase is `player-action`
- After player takes (Move.Insurance): `insuranceTaken` is true, `insuranceBet = floor(bet/2)`, phase is `player-action`
- Decline + dealer BJ: player loses main bet (no free push)
- Take + dealer BJ: `netDelta = 0` (insurance pays 2:1, main bet lost, net even)
- Take + no dealer BJ: insurance lost, main bet settles normally

---

**TASK BF2 — Persistence + split-hand rendering (2 high-priority bugs)** ✅ DONE 2026-06-16

Files: `packages/app/src/store/game-store.ts`, `packages/app/src/screens/table/TableLayout.tsx`

Bug 5 — `readPersistedBalance` rejects balance 0 as invalid (game-store.ts:19):
- `parsed > 0` guard treats a legitimate bust ($0) as corrupt data and resets to $1000
- Fix: change to `parsed >= 0`
- Test: persisted `"0"` → `readPersistedBalance()` returns 0 (not startingBalance)

Bug 6 — Only active split hand rendered; other hands invisible (TableLayout.tsx:239):
- `PlayerZonePanel` passes only `round.playerHands[round.activeHandIndex]` to `PlayerHand`
- When player has 2+ hands from a split, inactive hands disappear
- Fix: render all `round.playerHands`; highlight the active one; inactive hands shown smaller or dimmed
- Note: the animation spec (Epic 4 A4.5) will drive final layout — implement a static version now that correctly renders all hands

---

**TASK BF3 — Housekeeping (4 low-priority bugs)** ✅ DONE 2026-06-16

Files: `round.ts`, `__mocks__/react-native-mmkv.ts`, `leaderboard-store.ts`, `TableLayout.tsx`

- `round.ts:55`: remove unused `_rng` parameter from `createRound` and its call site in `game.ts:57`
- `__mocks__/react-native-mmkv.ts`: call `clearAllMMKVStores()` in `beforeEach` in both `game-store.test.ts` and `leaderboard-store.test.ts`
- `leaderboard-store.ts:45`: add date tiebreaker to sort: `.sort((a, b) => b.peak - a.peak || b.date.localeCompare(a.date))`
- `TableLayout.tsx:186`: `settleRound` called in UI to drive display labels — flag for future cleanup when Epic 4 adds animation hooks that will need the result data; do not refactor now (scope gate: only move it if Epic 4 work demands it)

---

### Epic 4 — Animations ✅ DONE 2026-06-16

- **A4.1** ✅ — Card deal: cards slide from shoe position (top-right) to hand positions with spring easing
- **A4.2** ✅ — Hole card flip: rotateY 0° → 180°; face-back image swapped at 90° mid-flip
- **A4.3** ✅ — Win feedback: green pulse on player area + chips animate toward player; Bust: red flash
- **A4.4** ✅ — Chip tap: chip bounces into stack with spring; stack height animates up
- **A4.5** ✅ — Split: two cards spread horizontally to new hand positions with position animation

---

**TASK BF4 — Bug Fixes — Post-Epic-4 code review surfaced 6 bugs; fix all before Epic 5**

All 6 bugs found by `/code-review high 2ee2f5d` on 2026-06-16. Fix all before starting Epic 5.

**BF4-1 (HIGH) — Flash fires before hole card is revealed** (`useResultFeedback.ts:22`)

The Zustand store collapses `dealer-turn` synchronously in one dispatch (`game-store.ts:37-39`), so `holeCardRevealed=true` and `phase='settling'` land in a single React commit. Both the 450ms `FlippableCard` flip and the 1000ms flash `withSequence` start at t=0. The flash peaks at t=200ms; the card face becomes geometrically visible only at t=225ms (when `rotateY` crosses 90°). For those 200ms a green or red overlay telegraphs the outcome while the hole card still shows its back.

Fix: delay the flash by at least 450ms (duration of the hole-card flip). Change `useResultFeedback` to accept an `initialDelayMs` param (default 0, pass 450 from `PlayerZonePanel`), or use `withDelay` in the `withSequence`:
```ts
winFlash.value = withDelay(450, withSequence(
    withTiming(FLASH_OPACITY, { duration: FLASH_IN_MS }),
    withTiming(0, { duration: FLASH_OUT_MS }),
));
```

---

**BF4-2 (HIGH) — React key collision in DealerHand with 6-deck shoe** (`DealerHand.tsx:41`)

`key={\`${card.rank}-${card.suit}\`}` is not unique in a 6-deck shoe (`DECK_COUNT=6`). The upcard (index 0) and hole card (index 1) share the same rank+suit on ~1.6% of hands. React reconciles the `FlippableCard` subtree against the wrong fiber, emits a duplicate-key warning in dev, and the flip animation either fires on the wrong card or fails to mount cleanly.

Fix: use the card's array index as the key (`key={i}`). The dealer card list is append-only and never reordered, so index is a safe key. Apply the same check to `PlayerHand` if it uses the same rank+suit keying strategy.

---

**BF4-3 (HIGH) — `backfaceVisibility:'hidden'` unreliable on Android** (`FlippableCard.tsx:47`)

On Android, Skia/OpenGL does not consistently honor `backfaceVisibility:'hidden'` for Reanimated worklet-driven transforms. At rest with `flipped=false`, `frontFace` is rotated -180° but may remain visually present as a mirrored face-up card on top of the back, revealing the hole card's rank/suit before reveal.

Fix: remove `backfaceVisibility` and drive visibility via `opacity` in the animated styles:
```ts
const backStyle = useAnimatedStyle(() => ({
    opacity: progress.value < 0.5 ? 1 : 0,
    transform: [{ perspective: 1200 }, { rotateY: `${interpolate(progress.value, [0, 1], [0, Math.PI])}rad` }],
}));
const frontStyle = useAnimatedStyle(() => ({
    opacity: progress.value >= 0.5 ? 1 : 0,
    transform: [{ perspective: 1200 }, { rotateY: `${interpolate(progress.value, [0, 1], [-Math.PI, 0])}rad` }],
}));
```
This works correctly on all platforms and eliminates the platform-specific dependency.

---

**BF4-4 (MEDIUM) — Ghost flash bleeds into next round** (`TableLayout.tsx:240`)

`winFlash`/`bustFlash` are `useSharedValue`s that animate on the Reanimated native thread independently of whether their `Animated.View` consumers are mounted. If the user taps COLLECT within ~500ms of settling (while the 1000ms flash is still active, value ~0.25), the flash `Animated.View`s unmount. When a new bet is placed and they remount, the still-non-zero shared value produces a ghost green or red flash at the start of an unrelated new round.

Fix: in `useResultFeedback`, reset the shared values when leaving the settling phase. In the same `useEffect`, add a path that fires when `prevPhase === 'settling'` and new phase is not:
```ts
if (prevPhase === 'settling' && phase !== 'settling') {
    cancelAnimation(winFlash);
    cancelAnimation(bustFlash);
    winFlash.value = 0;
    bustFlash.value = 0;
}
```

---

**BF4-5 (LOW) — `round` missing from `useResultFeedback` effect dep array** (`useResultFeedback.ts:44`)

The dep array is `[round?.phase]` but the effect body calls `settleRound(round)` (line 31) and guards on `round === undefined` (line 27). Under React concurrent features, an interrupted render can cause the effect to fire with a stale `round` snapshot. `settleRound` would then receive stale hand data and could compute the wrong `netDelta`, showing the wrong flash color.

Fix: add `round` to the dep array. The guard on lines 27-29 (`phase !== 'settling' || prevPhase === 'settling' || round === undefined`) already prevents the inner block from running unless settling is newly entered — adding `round` does not change the firing semantics.

---

**BF4-6 (LOW) — Rapid chip taps restart spring mid-flight, causing uneven bounce** (`BetControls.tsx:121`)

Assigning `scale.value = withSequence(...)` while a prior sequence is in-flight cancels the animation from its current intermediate scale. A second tap at `scale ≈ 1.1` starts `withSpring(1.2)` from 1.1 rather than 1, producing a shorter arc, different velocity, and a visible shudder. Most pronounced for low-denomination chips where `disabled` stays `false` across many consecutive taps.

Fix: gate the animation with a flag:
```ts
const animating = useRef(false);
const handlePress = (): void => {
    if (!animating.current) {
        animating.current = true;
        scale.value = withSequence(
            withSpring(1.2, { damping: 8, stiffness: 300 }),
            withSpring(1, {}, () => { animating.current = false; }),
        );
    }
    onChip(denom);
};
```

---

### Epic 5 — Sound & Haptics

- **A5.1** — `expo-av` sound setup; `useSounds` hook loads all 5 assets once at mount
- **A5.2** — Sound events: deal (per card), flip, chip clink (per chip tap), win chime, bust buzz
- **A5.3** — `expo-haptics`: `ImpactFeedbackStyle.Light` on deal; `NotificationFeedbackType.Success` on win; `NotificationFeedbackType.Error` on bust

---

## How to Resume From a Fresh Session

1. Read `CLAUDE.md` (project state, hard rules) and this file (full plan) — both, in full
2. Run `pnpm test` from repo root to see where green currently ends
3. Find the first incomplete task in order (E1 → E2 → … → A1 → A2 → …)
4. Write the test list for that task as failing tests first — no production code yet
5. Run `/code-review medium` after each story completes before moving on
6. Commit after every green state + after every refactor (standing authorization in global CLAUDE.md)

**Engine first. No RN code, no Expo init, no UI work until Epic 1 is fully green.**
