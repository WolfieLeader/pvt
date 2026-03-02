# Implementation Roadmap — pvt-assistant

## Implementation Phases

### Phase 1: Dependencies & Storage - Complete

1. Install production deps (drizzle-orm, expo-sqlite, zod, nanoid, zustand, @tanstack/react-query, @shopify/flash-list, lucide-react-native, react-native-svg, react-native-mmkv, expo-haptics, @gorhom/bottom-sheet)
2. Install dev deps (drizzle-kit, babel-plugin-inline-import)
3. Set up MMKV instance (`utils/mmkv.ts`)
4. Set up Drizzle client + connection (schema + migrations deferred to feature phases)
5. Update `docs/dependencies.md` — move installed deps from Planned to Installed

### Phase 2: State & Providers - Complete

1. Create Zustand stores with MMKV persistence (theme-store, settings-store, onboarding-store)
2. Create providers: ThemeProvider, QueryProvider (DatabaseProvider removed — migrations handled via `use-migrations` hook)
3. Create `use-theme` hook (reads theme-store + system preference)
4. Wire providers into root layout (`app/_layout.tsx`)

### Phase 3: Design System - Complete

1. Set up design tokens in `global.css` via @theme (primary palette 50-950, semantic colors, radius, shadows)
2. Add dark mode overrides via `@variant dark`
3. Load custom font via `expo-font` (Inter) with custom hook
4. Create constants: `typography.ts`, `spacing.ts`, `haptics.ts`

### Phase 4: Navigation & UI Components

1. Set up tab navigation (`(tabs)/_layout.tsx`) — Home, Expenses, Tasks, Settings
2. Add FAB + chat modal (`fullScreenModal` presentation at root stack level)
3. Add ScrollContext (reanimated shared value) for FAB scroll-hide behavior
4. Build shared UI components: Button, Card, Text, Chip, IconButton, Skeleton, Screen, FAB
5. Build manual add forms in chat modal (quick-action cards, add-expense-form, add-task-form)
6. Create placeholder tab screens

**Schema/migration ownership by feature phase:**

- Phase 5 (Onboarding): `user_settings` table
- Phase 7 (Expenses): `expenses` + `attachments` tables
- Phase 8 (Tasks): `tasks` table

Each phase defines its schema + runs migrations when it first needs the tables.

### Phase 5: Onboarding

1. Build welcome screen with CTA
2. Model selection screen (skip-able placeholder — "Set up later" until Phase 6)
3. Currency picker screen
4. Optional hourly rate input screen
5. Define `user_settings` Drizzle schema + migration
6. Persist settings in user_settings table
7. Gate: redirect to onboarding if `!onboardingStore.completed`

### Phase 6: Chat Core

1. Install llama.rn
2. Build LLM context manager (`llm/context.ts`)
3. Create LlmProvider
4. Build regex pre-processor (`llm/pre-processor.ts`)
5. Build chat UI (chat-list, chat-bubble, chat-input)
6. Implement chat-service pipeline (without extraction yet — echo mode)
7. Chat messages are ephemeral (useState in chat modal, NOT stored in DB or Zustand)

### Phase 7: Expense Extraction

1. Write intent-classifier prompt + GBNF
2. Write expense-extraction prompt + GBNF grammar + zExpenseExtraction
3. Define `expenses` + `attachments` Drizzle schema + migration
4. Implement expense-service (create, read, update, delete)
5. Build expense list screen + expense-card (with work-hours context)
6. Wire chat → pre-process → classify → extract → store → confirm flow
7. Add search bar + category/date filters on expense list

### Phase 8: Task Extraction

1. Write task-extraction prompt + GBNF grammar + zTaskExtraction
2. Define `tasks` Drizzle schema + migration
3. Implement task-service
4. Set up expo-notifications for reminders
5. Build task list screen + task-card
6. Wire task extraction into chat pipeline
7. Add search + priority/status filters on task list

### Phase 9: Settings & Model Management

1. Build model-manager service (download, delete, swap)
2. Build settings screen (model picker, currency, hourly rate, categories, security)
3. Category management UI (add/edit/remove custom categories)
4. App lock: passcode set/change UI + lock screen + AppState listener
5. Privacy mode: security-store + usePrivacy hook + wire into expense cards/totals

### Phase 10: Polish

1. Attachments (camera, photo library, document picker → expense)
2. Subscription keyword detection in pre-processor + LLM extraction
3. Expense stats/summaries (daily/weekly/monthly)
4. Error handling, loading states, empty states
5. Platform-specific haptic feedback tuning

### Deferred (not in V1)

- Export (CSV/PDF)

---

## Verification

- `just typecheck` — all new files must pass strict TS
- `just verify` — fmt + lint + typecheck
- Manual test: run on iOS simulator, type "bought coffee $4", verify it appears in both chat and expenses tab
- Manual test: "remind me to buy groceries tomorrow at 10am", verify task + notification scheduled
- Verify model download flow in settings on real device (simulator doesn't support Metal GPU)
- Manual test: enable app lock, background app, re-open → lock screen appears
- Manual test: tap total on expenses tab → all amounts mask to $xx.xx, tap again → reveal
