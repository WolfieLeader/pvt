# Settings Screen

## Layout

Grouped sections: Model, Currency, Hourly Rate, Categories, Security.

## App Lock (optional passcode)

- User sets a 6-digit passcode in Settings → Security
- Feature is opt-in privacy for comfort; app remains usable without it
- On return from background after 5+ minutes, show lock screen if enabled
- Quick app switches under 5 minutes do not prompt again
- Passcode stored as SHA-256 hash + salt in expo-secure-store
- No biometric in V1 — just passcode
- Root layout gates all routes behind lock check
- Cold start still requires passcode when lock is enabled
- 5 failed attempts → lockout 10s; then 3 attempts per round with lockouts 30s → 60s → 120s (cap)
- Recovery flow uses the same rate limiting
- "Forgot Passcode?" hidden during active lockout

## Amount Masking (privacy mode)

- Tap any summary amount → all monetary values across the app toggle to masked
- `$42.32` → `$xx.xx`, `≈ 0.5 hrs` → `≈ x.x hrs`
- State lives in `security-store.ts` (`amountsHidden: boolean`), persisted via MMKV
- `usePrivacy()` hook exposes `formatAmount(amount)` — returns masked string when active
- All expense cards, stats, totals, and work-hours displays consume this hook
- Visual indicator: small eye/eye-off icon next to totals
- Tap again to reveal

## Data

- **Reads/Writes**: `user_settings` table, `active_model` (MMKV), `security-store` (MMKV)
