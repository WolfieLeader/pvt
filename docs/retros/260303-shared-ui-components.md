# Retro: Shared UI Components

**Date**: 2026-03-03

## What was built

8 reusable UI primitives in `src/components/ui/` (Text, Button, Card, Chip, IconButton, Skeleton, Screen) plus shared `usePressAnimation` hook and `AnimatedPressable` module. All use Reanimated spring press, platform-split feedback, and design system tokens.

## What went well

- Implementation order (Text first, then dependents) avoided circular deps
- Review/simplify cycle caught 7 real issues before runtime — Chip missing border width, Skeleton animation leak, Button text color clash
- `usePressAnimation` hook eliminated ~45 lines of duplicated Reanimated logic across 3 components

## What didn't

- Button used `<Text variant="body">` then overrode everything via className — fought the abstraction it was wrapping
- Card created Reanimated hooks unconditionally for non-pressable mode — wasted native-side registrations
- Used hardcoded `px-[20px]` and `rounded-[24px]` when theme tokens (`SCREEN.padding`, `rounded-card`) already existed

## Learnings

- When wrapping a component, either use its API properly or bypass it with the raw primitive — don't set defaults you'll immediately override
- Reanimated hooks have native-side cost even when unused — gate behind conditional rendering (inner component) for dual-mode components
- `withRepeat(..., -1, ...)` needs `cancelAnimation` cleanup on unmount — infinite animations leak without it
- Check `global.css` `@theme` for existing Tailwind utilities before using arbitrary `[value]` syntax
- Hoist inline style objects to module-level constants for hot-path components (Text, Screen)
