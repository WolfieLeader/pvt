# Implementation Roadmap — Pvt.

## Implementation Phases

### Phase 1: Dependencies & Storage — Complete

1. Install production deps (drizzle-orm, expo-sqlite, zod, nanoid, zustand, @tanstack/react-query, @shopify/flash-list, lucide-react-native, react-native-svg, react-native-mmkv, expo-haptics, @gorhom/bottom-sheet)
2. Install dev deps (drizzle-kit, babel-plugin-inline-import)
3. Set up MMKV instance (`utils/mmkv.ts`)
4. Set up Drizzle client + connection (schema + migrations deferred to feature phases)
5. Update `docs/deps.md` — move installed deps from Planned to Installed

### Phase 2: State & Providers — Complete

1. Create Zustand stores with MMKV persistence (theme-store, settings-store, onboarding-store)
2. Create providers: ThemeProvider, QueryProvider (DatabaseProvider removed — migrations handled via `use-migrations` hook)
3. Create `use-theme` hook (reads theme-store + system preference)
4. Wire providers into root layout (`src/app/_layout.tsx`)

### Phase 3: Design System — Complete

1. Set up design tokens in `global.css` via @theme (primary palette 50-950, semantic colors, radius, shadows)
2. Add dark mode overrides via `@variant dark`
3. Load custom font via `expo-font` (Inter) with custom hook
4. Create constants: `typography.ts`, `spacing.ts`, `haptics.ts`

### Phase 3.5: Schema Definition — Complete

All Drizzle schemas, Zod validation types, and migrations defined upfront so forms/validators/services build on real types from day 1.

1. Define Drizzle schema — `src/db/schema.ts` (categories, expenses, tasks, attachments)
2. Create Zod validation schemas — `src/db/schemas.ts` (insert + extraction schemas)
3. Pass schema to Drizzle client + enable FK pragma — `src/db/client.ts`
4. Configure babel inline-import for `.sql` migrations
5. Generate migration via `drizzle-kit generate`
6. Create category seed — `src/db/seed.ts` (~80 rows, 12 parents)
7. Wire real migrations hook — `src/hooks/use-migrations.ts`
8. Create amount utilities — `src/utils/amount.ts`

### Phase 4: Navigation Shell — Complete

Tab navigation + FAB + chat modal route only. No UI components or forms yet.

1. Set up tab navigation (`(tabs)/_layout.tsx`) — Home, Expenses, Tasks, Settings
2. Add FAB + chat modal (`fullScreenModal` presentation at root stack level)
3. Add ScrollContext (reanimated shared value) for FAB scroll-hide behavior
4. Create placeholder tab screens

### Phase 5: Shared UI Components — Complete

Reusable primitives for all feature screens.

1. Build shared UI components: Button, Card, Text, Chip, IconButton, Skeleton, Screen, FAB

### Phase 6: Security — App Lock & Privacy — Complete

Opt-in privacy controls with comfort-first defaults.

1. Install `expo-secure-store`
2. Security Zustand store (lock enabled flag, privacy mode flag, lock state, failed attempt count)
3. Passcode set/change UI — hash PIN with SHA-256 via `expo-crypto` (`digestStringAsync`), store hash + salt in `expo-secure-store`
4. Attempt throttling — 5 failed attempts then lockout (10s), then 3-attempt rounds with lockouts 30s → 60s → 120s (cap)
5. Recovery questions setup — user picks 2 of 8 preset questions, answers hashed + stored in `expo-secure-store`. Also configurable later in Settings.
6. PIN recovery flow — answer both questions correctly → allow new PIN setup
7. Lock screen + AppState listener (lock on background → foreground only after grace window)
8. Privacy mode: `usePrivacy` hook + wire into expense cards/totals
9. Update `docs/deps.md` — add `expo-secure-store`, `expo-crypto`

**Deferred to later phases:**

- Privacy mode wiring into expense cards/totals → Phase 7
- Settings security UI (lock toggle, PIN change, recovery, privacy toggle) → Phase 14

### Phase 7: Core Data Vertical Slice + Forms

1. Install `@tanstack/react-form` (Zod via Standard Schema — no adapter)
2. Expense/task services: full CRUD
3. React Query hooks + cache invalidation
4. Add-expense form, add-task form (TanStack Form + Zod validators)
5. Manual edit/delete flows (card → edit bottom sheet, swipe/long-press → delete)
6. Delete safety contract (same as chat): confirmation + 5s in-memory undo hold (commit on background/kill) + idempotent mutation
7. Home, Expenses, Tasks real screens (FlashList)
8. Privacy masking wired to all money/hour surfaces
9. Search + filter baseline
10. Keyboard avoidance

- **Instrumentation**: CRUD event logging (create/update/delete counts, undo usage)
- **Exit**: manual add/edit/delete works; delete contract verified; `just verify` passes
- **Rollback**: if TanStack Form blocks progress, fall back to controlled inputs + Zod safeParse

### Phase 8: LLM Runtime Feasibility Spike

1. Install `llama.rn`, `expo-file-system`
2. Model lifecycle store (`model-store.ts`): `none → downloading → paused → ready → failed → canceled → swapping → ready`
3. Download/install/resume/pause/cancel/remove prototype via `createDownloadResumable`
4. Persist `resumeData` to MMKV for process-death recovery
5. Device matrix on real mid-range Android + iOS
6. **Mandatory instrumentation**: model load time, inference latency (p50/p95), peak RSS, thermal state — logged per run before any gate evaluation

**Hard gates (tiered):**

| Metric                  | Light (~1B)                    | Standard (~2-3B)               | Full (~4B)                     |
| ----------------------- | ------------------------------ | ------------------------------ | ------------------------------ |
| Model load              | ≤5s                            | ≤8s                            | ≤12s                           |
| Classify p95            | ≤2s                            | ≤3s                            | ≤5s                            |
| Extract p95             | ≤5s                            | ≤8s                            | ≤12s                           |
| Peak RSS above baseline | ≤800MB                         | ≤1.2GB                         | ≤1.8GB                         |
| Thermal                 | No throttle after 5 inferences | No throttle after 5 inferences | No throttle after 3 inferences |

- **Exit**: at least one selected model passes all gates for its tier and runs chat reliably. Lifecycle deterministic and recoverable.
- **Rollback**: if no model passes any tier, evaluate smaller quant levels (Q3) or defer LLM to cloud-hybrid in V2
- **Spec**: `docs/llm-spike.md`

### Phase 9: Onboarding + First-run Gating

1. Welcome → model selection (tier cards) → currency → hourly rate (optional) → app lock (optional) → done
2. Download starts in onboarding, app remains usable during download
3. Resume/retry states + home progress banner
4. Root gating: `onboardingStore.completed` redirect in `_layout.tsx`

- **Exit**: fresh install → onboarding → home. Interrupted download resumes.
- **Rollback**: if model download UX blocks onboarding, allow "skip model" → download later from Settings

### Phase 10: Prompt Engineering + Eval Harness

1. Standalone `eval/` workspace (own package.json, Bun, node-llama-cpp)
2. Array-output extraction: single prompt → typed array of `{type: "expense"|"task", ...fields}` with discriminated union grammar
3. Operation variants: create (full fields) + update (partial + ID) + delete (ID + type) within same array grammar
4. Entity resolution prompt: inject recent records into context for update/delete
5. New Zod schemas in eval: `zUpdateExpense` (partial + ID), `zDeleteExpense` (ID), same for tasks
6. GBNF grammar: one array grammar with discriminated union items (not 6 separate grammars)
7. 80+ eval fixtures (create + update + delete + mixed-intent scenarios, English only)
8. Runner + scoring report + failure taxonomy
9. Schema sync guard: script that diffs eval schemas against `src/db/schemas.ts`
10. Token budgets: extract ≤200, freeform ~500
11. Per-model override testing (base vs override per model family)
12. **Instrumentation**: accuracy, latency, ambiguity rate per model per fixture

- **Exit**: eval report reproducible. Standard-tier accuracy ≥80%.
- **Rollback**: if array grammar fails reliability gate, fall back to sequential classify → extract pipeline with cap of 3
- **Spec**: `docs/eval-harness.md`

### Phase 11: Chat Core (Echo-first)

Owns all chat UX.

1. LLM context manager + LlmProvider
2. Chat UI: chat-list, chat-bubble, chat-input
3. Quick-action cards (Add Expense, Add Task) → TanStack Form inline forms
4. Model-state-aware input: quick-action cards always available; chat input disabled "Model not installed" until model ready
5. Pre-processor baseline (regex hints: likelyExpense, likelyTask, keywords)
6. Echo/freeform mode only (no mutations yet)
7. Stateless sessions: `useState` only, cleared on modal dismiss

- **Instrumentation**: session duration, messages per session, model load-to-first-response
- **Exit**: chat works on device reliably. Session clears on close. Quick-action cards work without model.
- **Rollback**: if LLM integration unstable on-device, keep chat as manual-forms-only until stabilized

### Phase 12: Expense Chat Ops (create + update + delete)

1. Wire pre-processor → array extraction pipeline (single LLM call → typed array)
2. **Deterministic execution**: dedupe duplicate actions on same entity → execute creates first → updates → deletes last
3. Create: Zod parse → expense-service mutation → confirmation message
4. Update: entity resolution (inject recent expenses) → partial parse → update mutation
5. Delete: entity resolution → identifier → confirmation bottom sheet → in-memory hold (5s undo, commit on background/kill) → hard delete
6. Idempotent: delete is no-op if entity already deleted
7. Accept valid items from array, follow-up only on failed ones
8. Haptics: `success` on create/update, `delete` (heavy) on destructive confirmation
9. Follow-up within session for partial/ambiguous data

- **Instrumentation**: extraction success/fail rate, undo usage, ambiguity follow-up rate, entity resolution accuracy
- **Exit**: expense create/update/delete safe and deterministic. Undo works within window.
- **Rollback**: if entity resolution unreliable (>20% wrong-entity rate), defer update/delete to V2; keep create-only
- **Spec**: `docs/chat-intents.md` (entity resolution rules, destructive action contract, array grammar design)

### Phase 13: Task Chat Ops + Notifications

1. Task create/update/delete using same pipeline + safety contract as Phase 12
2. Install `expo-notifications`, configure permissions
3. Schedule local notifications for `reminderAt`
4. Fallback for denied permissions

- **Instrumentation**: task extraction accuracy, reminder scheduling success rate
- **Exit**: task ops + delete contract + reminders verified.
- **Rollback**: if notification permissions block UX, ship without reminders; add in-app reminder banner as fallback

### Phase 14: Settings + Model Management + Security Surface

1. Settings sections: model picker, currency, hourly rate, categories
2. Model swap: keep-both + replace-after-download (default UI). "Replace immediately" hidden under advanced.
3. Category management CRUD
4. Security: lock toggle, PIN change, recovery questions, privacy toggle

- **Exit**: all settings persist + survive restart. Model swap flows verified.
- **Rollback**: if model swap has data-loss risk, ship keep-both only; defer replace strategies

### Phase 15: Attachments + Hardening + Release

1. Install `expo-image-picker`, `expo-document-picker`, `expo-camera`
2. Attachment picker on expense forms, local storage via `expo-file-system`, thumbnails
3. Error boundaries (per-screen + global)
4. Empty state illustrations
5. Haptic tuning pass
6. CSV export via share sheet
7. PDF export: stretch — move to V2 if risk threatens release
8. Accessibility labels on shared components
9. Final QA + regression sweep

- **Exit**: attachments reliable. CSV works. `just verify` clean. Release checklist complete.
- **Rollback**: if camera/document pickers are unstable on specific devices, ship photo-library-only

---

## Key Decisions

| Decision                                           | Rationale                                                                                                                                                                                                                                                                                                                                               |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **@tanstack/react-form + Zod via Standard Schema** | User experience with lib; no adapter package needed; consistent typed forms                                                                                                                                                                                                                                                                             |
| **CRUD before onboarding**                         | Tab screens are stubs; CRUD gives testable pipeline + real screens before building wizard that lands on them                                                                                                                                                                                                                                            |
| **LLM spike before prompt eng**                    | Highest technical risk (OOM, latency, thermal); de-risk before investing in prompts/chat                                                                                                                                                                                                                                                                |
| **Full onboarding at Phase 9 only**                | Dev-skip via USD defaults during Phases 7-8; no guard until Phase 9                                                                                                                                                                                                                                                                                     |
| **Array-output grammar from V1**                   | Single LLM call → typed array. 1 item = array of 1. Eliminates classifier step, sequential reprocessing, and multi-intent cap. Token budget is natural constraint. Execution order: dedupe duplicate actions on same entity, then creates/updates first, deletes last. Validated in eval; if models struggle, fall back to sequential in implementation |
| **In-memory hold for undo (no soft-delete)**       | Hold deleted row in state for 5s. Real DELETE after timer. Undo = cancel timer. No schema migration. On background/kill during undo window: commit the delete immediately (user confirmed intent; undo is a convenience, not a guarantee)                                                                                                               |
| **Unified delete contract (UI + chat)**            | Same safety pattern everywhere: confirmation → 5s undo → idempotent. Consistent UX, single implementation                                                                                                                                                                                                                                               |
| **Tiered performance budgets**                     | Light/standard/full tiers have different acceptable thresholds. One-size-fits-all gate would reject viable light models                                                                                                                                                                                                                                 |
| **"Replace immediately" hidden in advanced**       | Default model swap shows keep-both + replace-after-download only                                                                                                                                                                                                                                                                                        |
| **CSV in MVP, PDF stretch**                        | Strong utility-to-effort ratio; protects timeline                                                                                                                                                                                                                                                                                                       |
| **Opt-in comfort-first app lock (Phase 6)**        | Data sensitivity is lower than banking apps; lock stays optional with low-friction resume UX                                                                                                                                                                                                                                                            |
| **Stateless chat sessions**                        | No memory between sessions, follow-up within session for partial data                                                                                                                                                                                                                                                                                   |
| **Ephemeral chat (useState, no DB)**               | Messages don't persist — only extracted entities written to DB                                                                                                                                                                                                                                                                                          |
| **expo-crypto + expo-secure-store for PIN**        | expo-crypto for reliable cross-platform SHA-256, expo-secure-store for keychain/keystore storage                                                                                                                                                                                                                                                        |
| **English only for V1**                            | Scope control; multi-language deferred to V2                                                                                                                                                                                                                                                                                                            |

## V2 (post-MVP)

- PDF export (if not completed in Phase 15)
- Biometrics (Face ID / fingerprint)
- Multi-language
- Chat history persistence
- Backup/restore
- Activity log + undo expansion
- Advanced subscription intelligence
- Sequential → array grammar fallback removal (if array works in V1)
- Budget goals & threshold alerts

## Targeted Specs (created during their phases)

- `docs/llm-spike.md` — device matrix, measurements, tiered budget thresholds, pass/fail (Phase 8)
- `docs/eval-harness.md` — fixture format, scoring, model matrix, schema sync guard (Phase 10)
- `docs/chat-intents.md` — entity resolution, array grammar design, destructive action contract (Phase 12)

## Dependency Plan

| Phase | Dependency                                                 | Purpose                     |
| ----- | ---------------------------------------------------------- | --------------------------- |
| 7     | `@tanstack/react-form`                                     | Form state + validation     |
| 8     | `expo-file-system`                                         | Model file lifecycle        |
| 8     | `llama.rn`                                                 | On-device inference runtime |
| 13    | `expo-notifications`                                       | Task reminders              |
| 15    | `expo-image-picker`, `expo-document-picker`, `expo-camera` | Attachments                 |

## Verification Gates

- Every phase: `just typecheck` + `just verify`
- Phase 7: manual CRUD + delete safety contract in UI (confirmation + undo + idempotent)
- Phase 8: tiered budget gates pass, instrumentation logged, documented in `docs/llm-spike.md`
- Phase 10: eval ≥80% standard-tier, reproducible report, array grammar validated
- Phase 12-13: destructive ops confirmed + undo + idempotent. Instrumentation active. Spec in `docs/chat-intents.md`
- Phase 15: attachments + CSV + release checklist complete

## Unresolved Questions

None — all resolved.
