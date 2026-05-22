# Design Improvements — Done

## App.vue
- `body` background changed to `linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)`, min-height 100vh
- `.app` now uses flexbox centered both horizontally and vertically, with 60px vertical padding
- Added `.app__hero` wrapper with centered text alignment
- Title `.app__title` — 38px, weight 800, white, text-shadow for depth
- New `.app__subtitle` — "Select your travel dates", 17px, white at 78% opacity
- Removed `app__result` (Start/End debug block)
- Added `.app__card` wrapper — white, `border-radius: 24px`, `box-shadow: 0 24px 64px rgba(0,0,0,0.18)`, padding 32px, flex-centered

## DateRangePicker.vue (template + styles)
- `.dr-field` — `width: 100%`, `min-width: 420px`
- `.dr-field__inputs` — border upgraded to 2px solid #e5e7eb, `border-radius: 16px`, subtle box-shadow; focus-within shows accent blue border + glow
- `.dr-field__input` — changed to row layout, padding increased to 16px 20px, gap 12px
- Added `.dr-field__icon` span (accent blue) with inline calendar SVG for Departure, phone SVG for Return
- Added `.dr-field__text` flex column wrapper for label + value
- `.dr-field__label` — accent color `#0ea5e9`, weight 700, letter-spacing 0.08em
- `.dr-field__value` — 18px, weight 600, dark
- `.dr-field__input--active` — uses `#0ea5e9` accent inset shadow + `#f0f9ff` background
- `.dr-field__separator` — replaced text "→" with SVG arrow icon, lavender color `#c4b5fd`

## Calendar.vue (styles only)
- `.dr-calendar` — `border-radius` 12px → 16px; `box-shadow` upgraded to `0 20px 60px rgba(0,0,0,0.15)`
- `.dr-prev:hover:not([disabled])` / `.dr-next:hover:not([disabled])` — background `#e0f2fe`, border + color `#0ea5e9`

## Preserved (untouched)
- All `data-testid` attributes
- CSS classes: `is-start`, `is-end`, `is-in-range`, `is-hover-range`, `dr-field__input--active`
- All component logic

## Build
- `pnpm build` — 0 errors, 0 warnings
