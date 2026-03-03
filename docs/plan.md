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

### Phase 4: Navigation Shell

Tab navigation + FAB + chat modal route only. No UI components or forms yet.

1. Set up tab navigation (`(tabs)/_layout.tsx`) — Home, Expenses, Tasks, Settings
2. Add FAB + chat modal (`fullScreenModal` presentation at root stack level)
3. Add ScrollContext (reanimated shared value) for FAB scroll-hide behavior
4. Create placeholder tab screens

### Phase 5: Shared UI Components

Reusable primitives for all feature screens.

1. Build shared UI components: Button, Card, Text, Chip, IconButton, Skeleton, Screen, FAB

### Phase 6: Security — App Lock & Privacy

Pre-chat for finance trust. Users handle money data — lock screen must exist before any data entry.

1. Install `expo-secure-store`
2. Security Zustand store (lock enabled flag, privacy mode flag, lock state, failed attempt count)
3. Passcode set/change UI — hash PIN with SHA-256 via `expo-crypto` (`digestStringAsync`), store hash + salt in `expo-secure-store`
4. Attempt throttling — lock out after 5 failed attempts, 30s cooldown, escalating (doubles each lockout)
5. Recovery questions setup — user picks 2 of 4 preset questions (mother's birthplace, first pet's name, childhood street, favorite teacher), answers hashed + stored in `expo-secure-store`. Also configurable later in Settings.
6. PIN recovery flow — answer both questions correctly → allow new PIN setup
7. Lock screen + AppState listener (lock on background → foreground)
8. Privacy mode: `usePrivacy` hook + wire into expense cards/totals
9. Update `docs/deps.md` — add `expo-secure-store`, `expo-crypto`

### Phase 7: Onboarding

Model download runs in background — only gates chat/AI, not app entry.

**Flow:**

1. Welcome screen — app name, tagline, "Get Started" CTA
2. Model selection — tier cards from `docs/models.md`, user picks a model, download starts immediately in background
3. Currency picker — list of common currencies, search, writes to `settingsStore.currency`
4. Hourly rate (optional, skip-able) — numeric input, writes to `settingsStore.hourlyRate`
5. App lock setup (optional, skip-able) — offer passcode + recovery questions (leverages Phase 6 security store)
6. Done — sets `onboardingStore.completed = true`, navigates to Home

**Download behavior:**

- Sticky banner at top of Home screen with progress bar + percentage until download completes
- Manual add forms (Phase 9) work immediately — no model needed
- Chat modal shows "Model downloading..." state with progress %, input disabled until ready
- If download fails/interrupted: resume on next app open, user can retry from Settings

**Dep note:** Requires `expo-file-system` for model download. Install in this phase (moved from Phase 11).

### Phase 8: Data Services & List Screens

CRUD services + React Query hooks + feature screens. Tests services before LLM wiring.

1. Implement expense-service (create, read, update, delete)
2. Implement task-service (create, read, update, delete)
3. Create React Query hooks wrapping services (queries + mutations + cache invalidation)
4. Build Home screen (today's summary, recent expenses, upcoming tasks)
5. Build expense list screen + expense-card (with work-hours context)
6. Build task list screen + task-card
7. Add search bar + filters on expense list (category, date range)
8. Add search + filters on task list (priority, status)

### Phase 9: Manual Add Forms

Forms in chat modal as fallback — tests DB services before LLM wiring.

1. Quick-action cards at top of chat modal (Add Expense, Add Task)
2. Add-expense form (inline in chat modal) — amount, title, category picker, date
3. Add-task form (inline in chat modal) — title, priority, due date, reminder
4. Zod validation (safeParse) on submit → DB write via React Query mutation
5. Chat input hides while form visible, reappears on dismiss

### Phase 10: Prompt Engineering & Eval

Design and validate prompts before wiring into the app. Standalone `eval/` folder with own `package.json` — fully isolated from Expo app, no cross-imports from `../src/`.

**In-app prompt structure (`src/llm/`):**

```
src/llm/
  prompts/
    system.ts          — base system prompt builder (injects currency, category list, today's date)
    classifier.ts      — intent classification prompt template
    expense.ts         — expense extraction prompt template
    task.ts            — task extraction prompt template
    types.ts           — PromptConfig type, ModelOverride type
    overrides/         — per-model content/style adjustments
      qwen.ts
      llama.ts
      gemma.ts
      phi.ts
      default.ts       — fallback for unknown models
  grammars/
    classifier.gbnf    — constrains output to "expense" | "task" | "question" | "unknown"
    expense.gbnf       — constrains to ExtractExpense JSON shape
    task.gbnf          — constrains to ExtractTask JSON shape
```

**Eval harness (standalone, TypeScript + Bun):**

```
eval/
  package.json         — standalone deps: node-llama-cpp, zod
  bun.lock
  schemas.ts           — extraction Zod schemas duplicated from src/db/schemas.ts (self-contained, no ~/utils/zod or nanoid)
  prompts/
    system.ts          — system prompt (developed here first, copied to src/llm/ in Phase 11)
    classifier.ts      — intent classification prompt
    expense.ts         — expense extraction prompt
    task.ts            — task extraction prompt
  fixtures.json        — 30+ test inputs w/ expected outputs (English only, V1)
  runner.ts            — loads GGUF via node-llama-cpp, runs fixtures through prompt → grammar → Zod validation
  report.ts            — accuracy per model, per prompt variant, failure analysis
  models/              — GGUF files (gitignored)
```

**Gitignore:** add `eval/models/` and `eval/node_modules/`.

**Sync strategy (Phase 11):** when integrating into the app, copy finalized prompts from `eval/prompts/` → `src/llm/prompts/`. Extraction schemas in `src/db/schemas.ts` remain the app's source of truth — `eval/schemas.ts` is a dev-time duplicate for fast iteration.

**Deliverables:**

1. Design base system prompt — app context, user preferences (currency, categories), extraction instructions
2. Write intent-classifier prompt template with hint injection slots (from pre-processor)
3. Write expense-extraction prompt template conforming to `zExtractExpense` shape
4. Write task-extraction prompt template conforming to `zExtractTask` shape
5. Write GBNF grammars for each (classifier, expense, task)
6. Create model override system — detect model family from GGUF metadata, apply content/tone adjustments (formatting handled by llama.cpp chat templates)
7. Build eval fixtures — 30+ English user inputs with expected structured outputs
8. Build eval runner — loads GGUF models via node-llama-cpp, iterates fixtures, validates output against Zod schemas directly
9. Build comparison report — which models handle which cases, where overrides needed

**Models to test against (from `docs/models.md`):**

- Light: Qwen3.5-0.8B, Llama-3.2-1B, Gemma-3-1B
- Standard: Qwen3.5-2B, SmolLM3-3B, Llama-3.2-3B
- Full: Qwen3.5-4B, Phi-4-mini

### Phase 11: Chat Core & LLM

llama.rn + echo mode — wires pre-validated prompts. Stateless sessions.

1. Install `llama.rn`
2. Build LLM context manager (`src/llm/context.ts`)
3. Create LlmProvider
4. Build regex pre-processor (`src/llm/pre-processor.ts`)
5. Build chat UI (chat-list, chat-bubble, chat-input)
6. Implement chat-service pipeline (without extraction — echo mode first)
7. Chat messages are ephemeral (`useState` in chat modal, NOT stored in DB or Zustand)
8. Each modal open → fresh session. On dismiss → messages cleared, only extracted entities persist
9. Update `docs/deps.md` — add `llama.rn`

### Phase 12: Expense Extraction

Wire extraction pipeline into chat. Pre-processor + intent classifier + extraction.

1. Wire pre-processor hints into intent-classifier prompt
2. Wire intent-classifier → expense-extraction prompt + GBNF grammar
3. Parse JSON → Zod validation (`safeParse` against `zExtractExpense`)
4. On success → write to DB via expense-service → confirmation message in chat
5. On failure → clarification message asking for missing data (follow-up within session)
6. Partial data (e.g. "bought coffee" with no amount) → LLM asks follow-up in same session

### Phase 13: Task Extraction & Notifications

Task pipeline + expo-notifications for reminders.

1. Wire task-extraction prompt + GBNF grammar into chat pipeline
2. Parse JSON → Zod validation (`safeParse` against `zExtractTask`)
3. On success → write to DB via task-service → confirmation message
4. Install `expo-notifications`, configure permissions
5. Schedule local notifications for tasks with `reminderAt`
6. Update `docs/deps.md` — add `expo-notifications`

### Phase 14: Settings & Model Management

Model swap (3 strategies), category management, full settings UI.

**Model swap strategies (when user changes model in Settings):**

1. **Keep both** — install new alongside current, user picks active
2. **Replace after download** — download new first, swap active, then delete old. Non-blocking (app usable during download)
3. **Replace immediately** — uninstall current, download new. Blocks app until download completes (loading screen)

Uses `expo-file-system` `createDownloadResumable` for download with progress + resume on interrupt.

1. Build model-manager service (download, delete, swap with 3 strategies)
2. Build settings screen (model picker, currency, hourly rate, categories, security)
3. Category management UI (add/edit/remove custom categories)

### Phase 15: Attachments

Camera/photo/document picker for expense receipts.

1. Install `expo-image-picker`, `expo-document-picker`, `expo-camera`
2. Add attachment picker to expense forms (camera, photo library, document)
3. Store files via `expo-file-system`, reference in `attachments` table
4. Display attachment thumbnails on expense-card
5. Update `docs/deps.md` — add `expo-image-picker`, `expo-document-picker`, `expo-camera`

### Phase 16: Polish

Error boundaries, empty states, subscriptions, search, export.

1. Error boundaries (per-screen + global)
2. Empty state illustrations for lists
3. Subscription keyword detection in pre-processor + LLM extraction
4. Expense stats/summaries (daily/weekly/monthly)
5. Platform-specific haptic feedback tuning
6. Export (CSV/PDF)

---

## Key Decisions

| Decision                                            | Rationale                                                                                                                                                             |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Security before chat (Phase 6)**                  | Finance app — trust requires lock screen before any data entry                                                                                                        |
| **Prompt engineering before chat (Phase 10)**       | Validate prompts work before wiring into UI, faster iteration with Bun eval harness                                                                                   |
| **Standalone eval harness**                         | Own `package.json` in `eval/`, no cross-imports from `src/`. Extraction schemas (~25 lines) duplicated with just `zod` — avoids `~/utils/zod` → `nanoid` import chain |
| **Prompts developed in eval first**                 | Faster iteration: edit → run eval → check accuracy. Copy finalized prompts to `src/llm/` in Phase 11                                                                  |
| **Per-model overrides for content, not formatting** | llama.cpp handles format via chat templates; overrides adjust instruction style per model family                                                                      |
| **Stateless chat sessions**                         | No memory between sessions, follow-up within session for partial data                                                                                                 |
| **Ephemeral chat (useState, no DB)**                | Messages don't persist — only extracted entities written to DB                                                                                                        |
| **Non-blocking model download**                     | Download starts in onboarding, runs in background, only gates chat/AI. Manual forms work immediately                                                                  |
| **3 model swap strategies**                         | Keep both / replace after download / replace immediately — covers all user preferences                                                                                |
| **AI-first, manual forms as fallback**              | Chat is primary input; forms exist in chat modal for when user knows exact data                                                                                       |
| **Echo mode before extraction**                     | De-risk LLM integration — verify chat UI + pipeline works before extraction logic                                                                                     |
| **GBNF grammars**                                   | Constrain structured LLM output on small models — prevents malformed JSON                                                                                             |
| **expo-crypto + expo-secure-store for PIN**         | expo-crypto for reliable cross-platform SHA-256, expo-secure-store for keychain/keystore storage                                                                      |
| **Attempt throttling**                              | 5 attempts → 30s lockout, doubling escalation                                                                                                                         |
| **Recovery questions**                              | 2 of 4 preset questions, hashed answers in secure store, allows PIN reset                                                                                             |
| **English only for V1**                             | Scope control; multi-language deferred to V2                                                                                                                          |
| **Budget goals deferred to V2**                     | Overall daily/weekly/monthly spend limits are V2 scope                                                                                                                |

## V2 Features (post-MVP)

- Budget goals & threshold alerts (daily/weekly/monthly overall spend limits, 80%/100% notifications)
- Multi-language support
- Biometrics (Face ID / fingerprint) for app lock
- Chat history persistence (optional)
- Backup/restore (encrypted export + import)
- Activity log + undo (snapshot-based rollback for AI mutations)

## New Dependencies by Phase

| Phase | Dependency             | Role                                                        |
| ----- | ---------------------- | ----------------------------------------------------------- |
| 6     | `expo-secure-store`    | Encrypted storage for PIN hash, salt, recovery answers      |
| 6     | `expo-crypto`          | SHA-256 hashing via `digestStringAsync`                     |
| 10    | `node-llama-cpp`       | GGUF model loading + grammar-constrained inference for eval |
| 7     | `expo-file-system`     | Model download with progress + resume                       |
| 11    | `llama.rn`             | On-device LLM inference                                     |
| 13    | `expo-notifications`   | Task reminder notifications                                 |
| 15    | `expo-image-picker`    | Photo library access                                        |
| 15    | `expo-document-picker` | Document file selection                                     |
| 15    | `expo-camera`          | Camera capture for receipts                                 |

## Verification

- `just typecheck` / `just verify` after every phase
- **Phase 4**: tabs render, FAB visible, chat modal opens/closes
- **Phase 7**: fresh install → onboarding → home screen with download banner. Kill app → download resumes, banner reappears
- **Phase 8**: CRUD operations work for expenses and tasks via services
- **Phase 9**: manual add forms → Zod validation → DB write → appears in list screens
- **Phase 10**: eval report shows ≥80% extraction accuracy on standard tier models
- **Phase 11**: type message in chat, get freeform LLM response on real device
- **Phase 12**: type "bought coffee $4" → expense created with correct amount/category
- **Phase 13**: "remind me to buy groceries tomorrow at 10am" → task + notification scheduled
- **Phase 14**: swap model via all 3 strategies, verify each works correctly
- **Phase 15**: attach photo to expense, verify file stored + thumbnail displays
- **Phase 6**: enable app lock, background app, re-open → lock screen appears
- **Phase 6**: tap total on expenses tab → amounts mask, tap again → reveal

## Unresolved Questions

None — all resolved.
