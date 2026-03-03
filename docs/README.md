# docs/

- `plan.md` — 16-phase roadmap, deliverables per phase, key decisions, deps by phase, verification steps
- `design-system.md` — color palette, semantic tokens, typography, component patterns, platform interactions, styling rules
- `deps.md` — installed + planned deps w/ doc links, library roles, AI resources
- `models.md` — on-device LLM catalog (<4B), sizes, tiers, GGUF sources
- `screens/` — per-screen specs (layout, data, navigation, behavior): overview, home, expenses, tasks, chat, settings, onboarding
- `retros/` — post-impl retrospectives (`YYMMDD-topic.md`), API gotchas, learnings — read before working on related areas

## Product Posture

- Comfort-first UX for daily use
- App lock is optional/opt-in privacy, not a hard security boundary
- Security controls remain practical: hashed secrets, secure storage, retry throttling

## Project Folder Structure

- `src/features/{name}/` — feature modules w/ barrel `index.ts` as public API
- `src/{components, hooks, stores, utils, consts}/` — shared code (used by 2+ features)
- Feature-internal imports use relative paths; cross-feature imports use barrel (`~/features/security`)
- Feature-internal code is NOT exported from barrel
