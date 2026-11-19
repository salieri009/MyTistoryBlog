# DESIGN — "이정표 (Signpost)" Tistory skin

Visual system for the skin in this repo. Product truth lives in PRODUCT.md.
Direction chosen from three frontend-slides previews (`.frontend-slides/slide-previews/style-a|b|c.html`):
**C — 이정표**. It comes from the blog's own line: "제가 걸어온 길이 … 이정표였으면 좋겠네요."

The skin is **data-agnostic**: every title, category, count, date and image comes from Tistory template tags.
Nothing about a specific blog is hard-coded.

## World

Road guide signage. Reflective green guide panels with a white inset border, route shields, distance numerals,
lane dashes and the amber edge line. The world owns the **frame**: the masthead, the category tree, the route
shield on posts, section openers, code and table setting, and the footer. The **reading column** stays calm.

Physical scene: people read on a laptop in daylight or on a phone at night. The skin follows the OS setting by default
(daylight = concrete ground, night = asphalt ground), and the owner can pin light or dark in the skin options.

## Color — strategy: Committed frame, Restrained column

| Token | Light (daylight) | Dark (night) | Role |
|---|---|---|---|
| `--ground` | `#ECEEEA` concrete | `#1C2024` asphalt | page ground |
| `--surface` | `#FFFFFF` | `#242A2F` | reading column, panels |
| `--ink` | `#15191C` | `#E8ECE7` | body text |
| `--ink-2` | `#4B535A` | `#A7AFB5` | secondary text |
| `--line` | `#D3D8D2` | `#363D44` | hairlines |
| `--sign` | `#0B6B45` | `#0D7A4F` | guide-sign field (option: blue `#1F4F9E`, brown `#6B4426`) |
| `--sign-ink` | `#F7F7F2` | `#F7F7F2` | text and border on the sign |
| `--amber` | `#F2B705` | `#F2B705` | edge line, highlight, progress, focus |
| `--code-bg` | `#1F2428` | `#15191C` | code blocks are always asphalt |

The sign color is a skin option: 고속도로 green (default), 일반도로 blue, 관광지 brown.
Text on the sign field is always `--sign-ink` (≥ 4.5:1 on all three).

## Type

- **Body / Hangul:** Pretendard Variable (workhorse Korean UI face, right for a Read surface). 17px, line-height 1.8,
  `word-break: keep-all`, measure ≤ 70ch inside a 720px column (matches `contentWidth`).
- **Signage numerals and Latin labels:** Overpass (Highway Gothic lineage) for shields, counts, dates, paging.
  Never uppercase-transform Hangul.
- **Code:** JetBrains Mono, with D2Coding as the Hangul fallback for comments in code.
- Scale: 14 / 15 / 17 / 20 / 24 / 30 / 38 / 48 (display max 3rem on articles, 4.5rem on the home sign).

## Signature moves (one system, used where it earns its place)

1. **Guide-sign panel**: `--sign` field, 14px radius, a 3px `--sign-ink` inset border drawn with box-shadow.
   Used for the masthead, the category tree ("destinations" with counts set as distances), and the home signboard
   cover. Never around body text.
2. **Route shield**: a white shield badge holding the post's number (`[##_article_rep_id_##]`) on the article header.
3. **Lane dashes**: a dashed rule (`repeating-linear-gradient`) for `<hr>`, section separators and the footer.
   The amber edge line runs under the footer and across the top of the page as the reading-progress bar.
4. **Exit list TOC**: h2/h3 contents shown as "출구" rows with arrow glyphs (authored SVG). Sticky rail at ≥ 1200px,
   collapsible at smaller sizes.

## Layout

- ≥ 1200px: `rail 280px | column ≤ 720px | toc 220px` on articles; `rail | column` on lists.
- < 1200px: the rail becomes a drawer opened from the masthead menu button (focus-trapped, Esc to close).
- Lists are rows, not cards: title, summary, meta, optional 4:3 thumbnail on the right.
- Home: covers defined in index.xml — `signboard` (big guide sign, items as destinations), `rows`, `gallery`.

## Components set in the world

- Code: asphalt panel, a language label from the `pre` class, a copy button, horizontal scroll, and token colors
  that override the highlight.js theme Tistory injects.
- Tables: wrapped for horizontal scroll, the header row tinted with `--sign` at 10%, Overpass numerals.
- Quotes: style1 = sign-tint panel with a full border, style2 = amber caution panel, style3 = plain boxed.
- Focus ring: 3px `--amber` with a 2px offset. Text selection uses `--amber` at 45%.

## Motion

One authored moment: the masthead sign settles in (opacity and 8px rise, 500ms ease-out-expo) on first paint.
Everything else is state feedback only. `prefers-reduced-motion` disables it.

## Refused on purpose

No eyebrow kickers, no gradient text, no glass, no side-bar callouts, no hard offset shadows, no emoji icons,
and no monospace outside code and numerals.
