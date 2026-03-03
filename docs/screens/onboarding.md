# Onboarding Screen

## Flow

```
1. Welcome screen — app name, tagline, CTA "Get Started"
2. Model selection — tier cards from docs/models.md, download starts immediately in background
3. Currency picker — user's default currency
4. Hourly rate (optional, skip-able) — "How much do you make per hour?" for work-hours context
5. App lock setup (optional, skip-able) — comfort-first privacy lock with passcode + recovery questions (Phase 6 security store)
6. Done → Home screen
```

## Data Flow

- **Writes**: currency + hourly rate to `settingsStore` (Zustand/MMKV)
- **Triggers**: model download via `expo-file-system` (background)
- **Sets**: `onboardingStore.completed = true` (Zustand/MMKV)

## Gating

Root layout redirects to onboarding if `!onboardingStore.completed`.

## Download Behavior

- Sticky banner at top of Home screen with progress bar + percentage until download completes
- Manual add forms (Phase 9) work immediately — no model needed
- Chat modal shows "Model downloading..." state with progress %, input disabled until ready
- If download fails/interrupted: resume on next app open, user can retry from Settings
