# No Optional Chaining — Cleanup Tracking

**Rule:** `no-restricted-syntax` / `ChainExpression` — never use `?.`.  
**Resolution:** narrow the type (so `undefined` is impossible at the source) OR write an explicit guard clause that handles the absent case and removes optionality below it.

---

## Done — properly fixed

| Site | Fix |
|---|---|
| `dealerCards` in `RoundState` | `readonly Card[]` → `readonly [Card, ...Card[]]`; `dealerCards[0]` is now `Card` |
| `SoundsProvider.tsx` `ref.current` | guard clause (`if (ref.current === undefined) return`) before calling `.replayAsync`/`.unloadAsync` |
| `round-state.ts` builder | `overrides?: Partial<RoundState>` → `overrides: Partial<RoundState> = {}` — removes optionality internally |

---

## Done — acceptable as-is (external boundary or test pragmatics)

| Site | Why it's acceptable |
|---|---|
| `react-native-mmkv.ts` `config?.id` | Mock of third-party library; `config?: { id?: string }` is forced by the external interface. Reverted to `?.` + `eslint-disable`. |
| Test files — array index access | `throw` guard on `sessions[0]`, `handResults[0]` etc. is correct for test code. TypeScript can't know the array is non-empty after a `toHaveLength` assertion; the throw guard is the pragmatic solution. |
| `game.test.ts` loop guards | `round !== undefined && round.phase === ...` in while/if is idiomatic for test iteration; no cleaner form exists without restructuring the game engine types. |

---

## Done — proper fix applied

| Site | Fix |
|---|---|
| `useResultFeedback.ts` | `useEffect` restructured: guard on `round === undefined` at top; `phase = round.phase` non-optional below; `prevPhaseRef` typed `RoundState['phase'] \| undefined` initialised to `undefined` |
| `game-store.ts` | `const round = afterMove.round` extracted; ternary reads `round.phase` not `afterMove.round.phase` |

---

## Pending — deferred (requires broader type change)

### `payouts.test.ts` — throw guards on `handResults[0]`
Current state: `const result0 = handResults[0]; if (result0 === undefined) throw new Error(...)`.  
This works, but the root cause is that `settleRound` types its return as `HandResult[]` when it always produces at least one result (you can't have a round with zero player hands).

**Real fix:** narrow `playerHands` in `RoundState` to `readonly [readonly Card[], ...(readonly Card[])[]]`, then narrow `settleRound`'s return type to match:

```ts
{ netDelta: number; handResults: readonly [HandResult, ...HandResult[]] }
```

This cascades through `createRound`, `applySplit`, and the builder — a larger, coordinated change. Deferred until a dedicated story.
