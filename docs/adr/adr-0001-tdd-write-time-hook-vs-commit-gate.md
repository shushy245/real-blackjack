# ADR 0001: TDD Enforcement — Write-Time Hook Over Commit-Time Gate

## Status
Accepted — 2026-06-23

## TL;DR
TDD compliance in the React/React Native frontend is enforced by a PostToolUse Write|Edit hook that fires the moment a stateful `.tsx` file is created, not by a commit-time gate. The hook fires at the only window when spec-first thinking is psychologically available — before implementation decisions are made — and must check that the test or driver file is non-trivial (contains a `describe` block) to avoid the empty-file loophole.

## Context
An existing component (`BetControls`) shipped with `useState` and zero tests, proving the current gate stack (Stop hook, pre-commit, commit-gate.sh, PostToolUse eslint-fix) has a gap: none of the existing gates check test file existence. The project's TDD convention is driver-first → test-second → implementation-third, using the pattern `BetControls.driver.tsx` → `BetControls.test.tsx` → `BetControls.tsx`. A prior lesson from the global deliberations ledger already established: "Anchor test triggers to structure, not judgment — a mechanical trigger beats a subjective one." The question is where in the authoring flow to place the structural gate.

Two constraints shape the decision:
- In-file sub-components are required by project convention to be stateless. The moment a sub-component needs local state, it is extracted to its own file. This makes "this `.tsx` file contains `useState`" a reliable signal for a standalone component, not an ambiguous heuristic.
- This codebase is agent-assisted. The timing of the gate matters differently for an agent than for a human: an agent mid-edit is literally redirected before the implementation pattern is locked in; a commit-time gate fires after the agent has completed the task.

## Options Considered

### Option A — Write-time hook
PostToolUse Write|Edit hook fires when a `.tsx` file containing `useState` or `useEffect` is written or edited and no `.test.tsx` or `.driver.tsx` exists alongside it (or the file exists but is trivially empty). Blocks continuation with a self-diagnosing message.

- **For:** Fires at the moment spec-first thinking is available — before any implementation decisions are made. For agent-driven workflows this is a genuine forcing function: the task is literally interrupted and redirected before the implementation pattern is set. The sub-component false positive concern is neutralized by the existing stateless sub-component rule. Error message can be made as self-diagnosing as any commit-time gate message.
- **Against:** Heuristics (PascalCase file, `useState` at module level, no corresponding test) require that conventions hold. Hook's maintenance surface scales with the codebase's file and hook conventions. Can produce spurious interruptions during exploratory mid-edit states if the hook doesn't account for partial writes.

### Option B — Commit-time gate
commit-gate.sh extended to check that every staged `.tsx` file containing `useState`/`useEffect` has a corresponding `.test.tsx`. One structural invariant, no heuristics about file type.

- **For:** Single structural check (file exists?) with zero inference. Error message is naturally self-documenting. Zero maintenance tail — the check doesn't evolve with codebase conventions. Fires at a known checkpoint, not mid-edit. Safer under pressure for a junior engineer who doesn't know the hook's logic.
- **Against:** Fires after the implementation is already written. Test written at commit time is almost certain to be implementation-informed rather than spec-first. Allows the precise anti-pattern TDD is meant to prevent: write the impl, add the test as an afterthought before committing. Does not exploit the spec-first window.

## Deliberation

**Round 1 — Marcus's challenge:** Marcus raised three objections to Option A. First, the authoring-order claim is overstated: creating an empty `.test.tsx` satisfies the hook, so both options enforce test-file existence, not TDD order in any meaningful sense. Second, Option B's failure mode is self-diagnosing at 2am ("BetControls.tsx contains useState but no BetControls.test.tsx found"), while Option A's heuristic requires understanding what the hook is checking. Third, the false positive risk on in-file sub-components with local state — a toggle, a focus state, a locally controlled dropdown — could make the hook fire constantly on legitimate patterns.

Marcus also proposed a middle path: commit gate as the enforcer, plus a write-time advisory (warning, not error) that builds the habit without blocking workflow.

**Round 2 — Working agent's response and concessions:** The working agent conceded the authoring-order claim fully: an empty test file satisfies Option A, so both options enforce the same structural invariant at different times. The middle path (warning plus commit gate) was rejected because a non-blocking warning relies on judgment — the engineer can ignore it, which defeats the purpose of structural enforcement. On the sub-component false positive: the agent pointed to the existing project rule that in-file sub-components must be stateless, making "this `.tsx` file contains `useState`" a reliable standalone-component signal in this codebase. On the 2am error message: Option A can be made equally self-diagnosing by writing a clear message naming exactly what file is missing.

**Marcus's concession and refinement:** Marcus moved to Option A after the sub-component concern was addressed by a structural rule already in place (not a new judgment call). He added a key refinement: the hook should check that the driver or test file is non-trivial — contains at least a `describe` block, not just zero bytes. Without that check, Option A is a speedbump (easily cleared by touching an empty file); with it, the engineer must at minimum set up the test structure before any implementation proceeds, which is closer to spec-first than pure existence.

**What held, what moved:**
- The false positive objection was the debate's central argument. It was resolved by pointing to an existing structural rule, not by weakening the hook's logic.
- The authoring-order claim was the working agent's weakest point and was walked back. The residual argument for Option A rests on timing (spec-first window is only open mid-edit) and the agent-workflow forcing function.
- The non-empty file check was the debate's net positive output — neither side had it going in.

## Decision

Option A — write-time hook — with a non-empty test file check. The hook fires when a `.tsx` file containing `useState` or `useEffect` is written or edited and no `.test.tsx` or `.driver.tsx` exists alongside it **with at least a `describe` block**. Blocks with a self-diagnosing error naming the missing file.

The decisive reason: a commit-time gate fires after the implementation is complete, when the test will be written looking backward at existing code. A write-time hook fires before the implementation is written, at the only moment when the test can be written looking forward at intended behavior. For an agent-driven codebase this is a forcing function, not just a safety net.

## Consequences / Tradeoffs

**What becomes easier:**
- TDD compliance is structural, not disciplinary. New components cannot reach the implementation phase without a test structure in place.
- The driver-first pattern is reinforced: creating a `.driver.tsx` before writing the component satisfies the hook and preserves the outside-in design intent.

**What becomes harder:**
- The hook must track the codebase's file conventions. If the sub-component stateless rule is ever relaxed, the hook's false positive rate rises. This coupling is knowingly accepted.
- Exploratory or scaffolding edits to existing stateful components will trigger the hook if no test file exists. This is intentional — untested stateful components should be surfaced — but may feel aggressive during refactoring passes.

**What is knowingly accepted:**
- An empty `describe` block satisfies the hook. Full TDD discipline (driver with meaningful assertions written before implementation) is a convention the hook supports but cannot fully enforce. The hook eliminates the "no test file at all" failure mode; meaningful test content remains a human/agent judgment.
- The hook's heuristic (PascalCase `.tsx` + `useState`/`useEffect` = standalone component) is correct only while the sub-component stateless rule holds.

**Reversibility:** Low cost. The hook is a shell script checked into the project's Claude Code settings. Removing or loosening it is a one-line config change.

## Related
- Global deliberations lesson: "Anchor test triggers to structure, not judgment" (applied here to timing: write-time is structurally earlier than commit-time)
- Project CLAUDE.md: "Any component with meaningful logic requires a Vitest component test — written before the component, not after." (the rule this ADR mechanically enforces)
