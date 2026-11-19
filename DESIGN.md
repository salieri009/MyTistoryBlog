# DESIGN — Salieri Index

Visual system for the skin in this repo. Product truth lives in PRODUCT.md.

## History

1. **이정표 (Signpost)**, tag `signpost-v1`: road guide-sign world. The owner rejected it as tacky ("밤티"):
   the literal green sign panels read as a highway sign, not a blog.
2. Three page-level proposals (`dev/proposals/`, run `node dev/proposals/build.mjs`):
   A 담백한 인덱스 · B 포토 저널 · C 다크 데스크. **A was chosen.**
3. **Salieri Index** (this document) = A, rebuilt on Tistory template tags and fitted to the owner's persona.

The skin is **data-agnostic**: every title, category, count, date and image comes from Tistory template tags.
Persona-specific values (hero sentence, GitHub/X links) are **skin option defaults** in index.xml, editable in admin.

## Persona → design

| Persona trait (from the owner's writing skills) | Design response |
|---|---|
| Voice: short declarative sentences, honest, no emoji, no flourish, no long dash | Text-first index, no decoration, no cards as structure, no emoji icons |
| Diagram skill fixes a "Salieri palette" (blue flow, slate text, navy Evidence boxes) | The skin uses the same palette, so diagrams and skin match |
| Daily TIL titles `[과정] N일차 :: 주제` | `::` splits a title into a muted series label + the main title, in lists and on the post |
| Root category "나의 성장기", life log over years | Posts grouped by year in every index (growth log) |
| Posts have 트러블슈팅 and 회고 sections | Quote style2 = trouble (red tint), style3 = resolved/retro (green tint), style1 = key line |
| Long code-heavy posts | TOC (right rail ≥ 1240px, collapsible below), reading time, code copy, Evidence-style code panel |
| Developer, reads at night | Dark mode follows the OS, with a visitor toggle |

## Color (Salieri palette)

| Token | Light | Dark | Role |
|---|---|---|---|
| `--ink` | `#1E293B` | `#E2E8F0` | text |
| `--ink-2` / `--ink-3` | `#475569` / `#64748B` | `#B4C0D0` / `#8C9AB0` | secondary / tertiary |
| `--line` | `#E2E8F0` | `#1E293B` | dividers |
| `--accent` | `#2563EB` | `#60A5FA` | links, category, active TOC, hero emphasis |
| `--risk*` | `#DC2626` on `#FEF2F2` | tinted | quote style2 (트러블슈팅) |
| `--ok*` | `#16A34A` on `#F0FDF4` | tinted | quote style3 (해결 · 회고) |
| `--mark` | `#FDE68A` | 30% | `<mark>`, text selection |
| `--code-bg` | `#1E293B` | `#0B1222` | code = Evidence panel, text `#E2E8F0` |

Strategy: restrained. One accent; the semantic colors appear only inside posts, where they mean something.

## Type

- Pretendard Variable for everything. 17px body, line-height 1.85, column 720px (= `contentWidth`).
- Mono (Cascadia Code → JetBrains Mono) only for code and index dates.
- Scale: 12 / 13 / 14 / 15 / 17 / 18 / 20 / 24 / 30 / 38. Headings 650–800, tracking −0.02 to −0.03em.

## Layout (desktop-first, 1200px container)

- Header: title left; blog menu, 카테고리 (panel with the full tree), search, theme right.
- **≥ 1080px:** two columns. Home and lists: `main | aside 288px` (gap 72px). The aside holds the profile and
  every sidebar module, with the category tree as the primary wayfinding (current category highlighted).
  Posts: `article ≤ 760px | contents rail 232px`, centered as one unit (gap 88px); the rail is sticky, starts at
  the body's top, and ends with "맨 위로".
- **< 1080px:** one column. Category tabs (edge fade, current tab centered) replace the aside tree; the aside
  modules stack below the list; posts get a collapsible inline TOC, and while reading, a bottom-right
  current-section button (44px) that opens the contents as a bottom sheet with "맨 위로".
- Home: no intro text by default; the page opens on the latest-posts index. The intro (option `heroText`, optional
  `heroSub`) renders only when the owner writes it. Profile links (GitHub, 포트폴리오, velog, LinkedIn, X, 이메일, RSS)
  live in the aside profile card and the post author card; then covers with real section
  heads (25px/800 over a rule): `index` (default), `featured`, `gallery`.
- Lists: list head + year-grouped index; option `listStyle = summary` adds summaries and thumbnails.
- Post: category, series label, title, meta (author · date · comments · reading time), body, tags,
  prev/next (series label kept), related, comments. Footer on posts: compact 최근 글 · 인기 글 · 카테고리.
- Type steps: body 16 → item 18/20 → section 25 (≥ 1.25 each, the detector's flat-hierarchy rule).

## User flows → layout

Most visitors land on a post (search, shared links, camp submissions), not on the home page.

| Flow | Who | Layout answer |
|---|---|---|
| Land on a post, confirm it is relevant | search visitor, grader | Breadcrumb `부모 › 자식` (both linked), series label, title, byline with avatar, date, comments, reading time; TOC rail/sheet |
| Finish, keep reading | search visitor | End of post: tags → prev/next ("다음 글" first on phones) → same-category posts with thumbnails |
| Who wrote this, ask a question | grader, recruiter | Author card (avatar, name, 2-line intro, GitHub/이메일/RSS, "댓글로 질문하기") right before comments |
| Come back, see what is new | returning reader | Shorter hero, latest-posts index first; the aside's own "최근 글" is hidden on home (duplicate) |
| Browse a topic | hobby/travel reader | Subcategory chips under the list head (current shaded), current category in the aside tree, rows show the deepest category only |

Tistory may append "'부모 > 자식' 카테고리의 다른 글" inside the body. It is Tistory content: the skin restyles it like
its own lists and turns its `<h4>` title into an `<h2>` (same text, same place) so the outline does not skip a level,
and the skin's own same-category grid steps aside (`.has-tistory-related`) so the list is not shown twice.
Aside default order: profile → 공지 → 카테고리 → 인기 글 → 최근 글 → 최근 댓글 → 태그 → 보관함 → 링크 → 방문자
(reorderable in 꾸미기 → 사이드바).

## Markdown pasted into the basic editor

The owner drafts posts in Markdown and pastes them into Tistory's basic editor, which keeps them as plain text
(one `<p>` with `<br>` line breaks; pipe tables end up inside code blocks). `images/script.js` (`initMarkdown`)
renders those parts client-side: headings (`#`, a lone `1. 제목` line, a short line such as `회고`), lists, quotes,
fences, tables with or without a separator row, inline code/bold/links. Runs of plain paragraphs are converted only
when they score as Markdown, so editor-built posts are untouched (checked on live posts 506, 511, 512 vs 508).

## Tistory policy constraints (checked 2026-11-19)

- Never hide, cover or push away Tistory's ads, including the self-ad Tistory inserts at the top or bottom of
  the post body (operating policy 2-⑰, notice 2646). The skin styles `.revenue_unit_wrap` spacing only.
- No anchor/fixed-to-edge ads, offerwalls, interstitials or popups in any implementation, skin code included
  (notices 2687, 2692, 2707). The sticky contents rail sits in its own column and covers nothing.
- No forced redirects (policy 2-⑮). Keep `[##_revenue_list_upper_##]` / `lower` in place.
- Uploading a changed index.xml resets all skin settings and covers: re-check options after every upload.

## Motion

None beyond hover color and a 2px reading-progress bar. `prefers-reduced-motion` respected.
