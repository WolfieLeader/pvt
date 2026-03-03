# Design System — Pvt.

## UI/UX Design System

### Design Language

Inspired by **Fuse Wallet** and **Five Cents** expense app:

- Off-white / near-black backgrounds with card-based UI
- Large border-radius (20-32px on cards/modals)
- Generous padding, visual hierarchy via opacity + font weight
- Clean separation through spacing (not borders)
- Minimal, professional fintech aesthetic

### Color Palette — Custom Primary (Rose × Pink blend)

Custom primary color defined in `global.css` via `@theme`. 77% rose / 23% pink blend — warm, slightly pink-tinted rose. Verified: lightness gaps within ±0.3% of Tailwind rose, hue span 11.1°, monotonic lightness.

**Generation process**: Base color generated via [uicolors.app](https://uicolors.app/generate/fb75ae), cross-referenced against [Tailwind v4 OKLCH colors](https://tailwindcss.com/docs/colors). To regenerate or tweak: start with uicolors.app, verify lightness curve against Tailwind rose/pink scales.

**Primary scale (final hex):**

| Shade | Hex     | Usage                                 |
| ----- | ------- | ------------------------------------- |
| 50    | #fff1f3 | Tinted backgrounds                    |
| 100   | #fee5e9 | Hover states, light fills             |
| 200   | #fdcdd8 | Soft borders, secondary backgrounds   |
| 300   | #fca5b8 | Inactive/disabled accents             |
| 400   | #f97190 | Secondary buttons, tags               |
| 500   | #f2416c | Primary accent — buttons, active tabs |
| 600   | #e01f53 | Pressed states, emphasis              |
| 700   | #be1344 | Dark text on light backgrounds        |
| 800   | #9f133e | High-contrast elements                |
| 900   | #87143a | Very dark accent                      |
| 950   | #4d051c | Near-black tinted                     |

**Semantic tokens (CSS custom properties via @theme):**

Light mode uses default values; dark mode overrides via `@variant dark`:

| Token        | Light                 | Dark                  | Usage                   |
| ------------ | --------------------- | --------------------- | ----------------------- |
| --background | #FCFCFC               | #0A0A0A               | Screen background       |
| --card       | #FFFFFF               | #161616               | Card/surface background |
| --text       | #1A1A1A               | #F5F5F5               | Primary text            |
| --muted      | #71717A               | #A1A1AA               | Secondary text          |
| --accent     | primary-500 (#f2416c) | primary-400 (#f97190) | Buttons, active tabs    |
| --success    | #22C55E               | #4ADE80               | Positive actions        |
| --danger     | #DC2626               | #F87171               | Destructive actions     |
| --border     | #E4E4E7               | #27272A               | Subtle dividers         |

**Usage in components:**

- `className="bg-background dark:bg-background"` (via CSS vars)
- `className="text-primary-500 dark:text-primary-400"`
- `className="bg-card dark:bg-card border-border"`
- No JS-based color switching — `dark:` prefix handles it

Theme follows system preference by default, manual toggle in settings. Components use `dark:` Tailwind prefix for two-theme styling. `theme-store` still controls system/manual toggle + provides `colorScheme` to the root View.

### Font — Inter

**Inter** (humanist sans-serif) — great readability, used by Fuse Wallet reference design. Loaded via `expo-font` — same font on both platforms for consistency.

### Platform-Specific Interactions

**iOS:**

- Buttons: scale (0.97) + opacity (0.8) on press
- Haptics: `expo-haptics` — light on tap, medium on success, heavy on delete
- Native-feel but custom-rendered components

**Android:**

- Buttons: scale (0.97) + Material ripple effect
- Haptics: only on important actions (delete, complete task, confirm expense)
- No ripple on minor interactions

### Component Patterns

- **No native components** — all custom for cross-platform consistency
- Buttons: rounded pill or rounded-rect, primary (filled) + secondary (outlined)
- Cards: elevated with subtle shadow, large radius, white background
- Inputs: bottom-border or rounded-rect style, clear focus states
- Lists: FlatList with card items, swipe actions where appropriate
- Bottom sheets (`@gorhom/bottom-sheet`) for quick actions (edit expense, mark done, category picker, filters)

### Styling Rules

- **Tokens live in two layers**: CSS tokens in `global.css` (`@theme`), JS constants in `src/consts/` (spacing, typography, haptics). Check both before using arbitrary values.
- **Never use `fontWeight`** — RN can't resolve weights from a single family name. Use per-weight font families: `font-sans` (400), `font-sans-medium` (500), `font-sans-semibold` (600), `font-sans-bold` (700). Defined in `global.css`, loaded via `use-load-fonts.ts`.
- **Check `global.css` `@theme` before using arbitrary Tailwind `[value]` syntax** — a token likely already exists (learned via retro 260303)

### UI Interaction Rules

- Modals dismiss w/ "Close"/X (not "Back"), leading position; "Back" = stack pop only
- Touch targets: minimum 44pt (iOS HIG)
- Reuse `src/components/ui/` — check before building custom
- All interactive elements need press animation (`usePressAnimation`) + haptics (`hapticFeedback`)

### Category Visuals

- **Icons**: Emoji strings stored in `categories` DB table (e.g. "🍕"). Universal, zero bundle cost, no lucide dependency
- **Colors**: Hex from Tailwind palette (400/500 level), stored on parent category rows only
- Children inherit parent color via `parent_id` FK lookup at query time
- One distinct hue per parent category (12 total): orange, blue, cyan, violet, pink, red, green, amber, sky, emerald, rose, gray

See [screens/](screens/) for per-screen layouts, navigation, and behavior.

### Platform Design Guidelines

The app takes inspiration from and follows **Apple Human Interface Guidelines** (iOS) and **Samsung OneUI** (Android/Galaxy). These are the primary design authorities for platform-native behavior, interaction patterns, and component conventions.

Target users are mainly **Galaxy (OneUI)** and **Apple** users.

**iOS — Apple HIG:**

- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Patterns](https://developer.apple.com/design/human-interface-guidelines/patterns)
- [Foundations](https://developer.apple.com/design/human-interface-guidelines/foundations)
- [Components](https://developer.apple.com/design/human-interface-guidelines/components)
- [Inputs](https://developer.apple.com/design/human-interface-guidelines/inputs)
- [Technologies](https://developer.apple.com/design/human-interface-guidelines/technologies)
- [Adopting Liquid Glass](https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass)
- [Apple Design Resources](https://developer.apple.com/design/)

**Android — Material Design 3 + Samsung OneUI:**

- [Material Design 3](https://m3.material.io/)
- [Android Design](https://developer.android.com/design/)
- [Samsung OneUI Developer](https://developer.samsung.com/one-ui/)
- [OneUI Design Guide (PDF)](https://design.samsung.com/global/contents/one-ui/download/oneui_design_guide_eng.pdf/)
- [Samsung Design System](https://developer.samsung.com/design-system/)
