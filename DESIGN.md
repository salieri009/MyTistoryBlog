# DESIGN — Salieri Index

Visual system for the skin in this repo. Product truth lives in PRODUCT.md.

## History

1. **이정표 (Signpost)**, tag `signpost-v1`: road guide-sign world. The owner rejected it as tacky ("밤티"):
   the literal green sign panels read as a highway sign, not a blog.
2. Three page-level proposals (`dev/proposals/`, run `node dev/proposals/build.mjs`):
   A 담백한 인덱스 · B 포토 저널 · C 다크 데스크. **A was chosen.**
3. **Salieri Index** (this document) = A, rebuilt on Tistory template tags and fitted to the owner's persona.
4. **v3.1, retention round (2026-11-21)**: same look, more reasons to stay. Baseline, measurements and the critique
   behind it are in `docs/retention-baseline.md`. Added: one next step at the end of a post, returning-reader memory,
   search as you type, a home guide; fixed: unreadable dark-mode comments, the header under Tistory's toolbar, posts
   that jumped while loading.
5. **v3.2, research round (2026-11-26)**: the first click after a post is the lever (a second page view lifts the
   7-day return rate from 8% to 22%). Research, decisions and what was rejected (hover previews, auto-loaded next
   posts) are in `docs/retention-research.md`. Added: "함께 읽을 글" by topic, the reader's own series progress, series
   arrows at the top of a post, a subscribe pointer on the latest episode, ranked next read. No new skin option.

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
  the body's top, and ends with "맨 위로" and then "다음에 읽기" (title first, the relation as muted meta), pinned
  under an outline that scrolls on its own (the current section is kept in view). The next-read link appears after
  60% of the post; it sits last so its reserved space never leaves a gap mid-rail. A post too short for an outline
  gets a rail with only "다음에 읽기".
- **Series facts**: the series list reads every page of the blog's own search (up to five). Counts ("12편",
  "12편 중 3번째") show only when all matches were read, and prev/next become 이전 편 / 다음 편 only for episode
  n ± 1; otherwise Tistory's own prev/next stay. The home guide says "최근 시리즈" (two or more episodes on the
  page, latest within 30 days), never "ongoing".
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
| Land on a post, confirm it is relevant | search visitor, grader | Breadcrumb `부모 › 자식` (both linked), series label (+ "12편 중 3번째" on wide screens), title, byline with avatar, date, comments, reading time; TOC rail/sheet |
| Finish, keep reading | search visitor | One next step: tags → prev/next, which become 이전 편 / 다음 편 in a series ("다음" first on phones) → series list (±2 episodes, rest on request; on the latest episode a line pointing at Tistory's subscribe button) → **함께 읽을 글** (a chip per topic, three posts each, see "Related by topic"; the same-category grid is the fallback). "다음에 읽기" also sits under the outline (rail after 60% read, phone sheet), ranked: next (or first unread) episode > first post of the reader's topic > Tistory's next post > same category. The post footer drops posts already linked above |
| Move through a series | grader, peer | ‹ › on the breadcrumb row go to episodes n ± 1 (only when both are known); the series list marks what this reader finished (읽음) or started (읽는 중) and says "N편 읽음" |
| Who wrote this, ask a question | grader, recruiter | Author card merged with Tistory's namecard, then comments themed like the body (16px/1.75, keep-all, dark mode) |
| Come back, see what is new | returning reader | "새 글" tags on rows newer than the last visit, "오늘" for today's posts, visited titles dimmed, "지난번에 「…」까지 읽었습니다 · 이어 읽기" under the post meta, home guide (이어 읽기 · 최근 시리즈 with "N편 읽음") above the latest posts |
| Look something up | any | Search as you type (first five matches, arrows + Enter), "/" opens search, an empty result lists most-read posts and top categories |
| Browse a topic | hobby/travel reader | Subcategory chips under the list head (current shaded), current category in the aside tree, rows show the deepest category only |

Tistory may append "'부모 > 자식' 카테고리의 다른 글" inside the body. It is Tistory content: the skin restyles it like
its own lists and turns its `<h4>` title into an `<h2>` (same text, same place) so the outline does not skip a level,
and the skin's own same-category grid steps aside (`.has-tistory-related`) so the list is not shown twice.
Aside default order: profile → 공지 → 카테고리 → 인기 글 → 최근 글 → 최근 댓글 → 태그 → 보관함 → 링크 → 방문자
(reorderable in 꾸미기 → 사이드바).

## Related by topic ("함께 읽을 글", since v3.2)

One post can be about more than one thing: a Spring Boot post that wires in Prometheus. A reader who came for
Prometheus should be led to Prometheus posts, not to whatever shares the category.
- **Topics = the post's own tags.** No dictionary. Tags that only repeat the series name or the category are left out.
- **Weight = where a tag appears.** Title and section headings x3, code x2 (imports, Gradle/Maven lines, config: what
  the post actually uses), other text x1. ASCII tags match whole words and glued runs ("Spring Boot" = "spring-boot"
  = "springboot", "java" is not found in "javascript"); Hangul tags match as substrings. A heading that is only the tag
  ("4. 회고") names a section and does not count. The top three tags with weight ≥ 1 are the topics.
- **Posts per topic** come from the blog's own tag pages (`/tag/<name>`, rendered by this skin, parsed like search).
  Left out: the post itself, its own series (the series list has those), anything already linked above. Order:
  shared topics weighted by rarity, `Σ 1 / log2(2 + posts with the tag)`, then newest. Three per topic.
- **The first chip is the reader's topic.** Engaged seconds per section (tab visible, input in the last 15 seconds),
  each section's seconds shared among the topics it mentions. Under five such seconds, the post's own weighting
  decides. The other chips always follow the post's weighting. Kept in memory only.
- Chips are WAI-ARIA tabs (arrows, Home, End), each with Tistory's post count for the tag; below the list,
  "#태그 글 N편 모두 보기". One topic: no chips. Fewer than two posts in all: no block, the category grid stays.
- **Cost.** At most three tag pages (`ALSO_MAX_TAGS`, checked by `npm run check`), read only once the reader is halfway
  through or near the tags, cached for the session. A reader who leaves early causes none.
- **Never moves the page.** The block is filled only while its place is below the view, or above it where scroll
  anchoring holds the view. If its place is in view when the data arrives (a short post, a jump to the comments), it
  waits until a scroll takes its place off screen. Its order is settled once, half a screen before it comes into view.

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
- The phone contents button (`.toc-fab`) steps aside while an ad (`.revenue_unit_wrap`, `ins.adsbygoogle`) or the
  reaction row passes beneath it, so nothing of the skin ever sits over an ad.
- Prefetch only on pointer-down (speculation rules, `conservative`): hover prefetch would count posts nobody opened in
  Tistory's view stats; prerender would run ads and analytics early. `npm run check` rejects a prerender rule.

## Returning readers (stored in the visitor's browser only)

| Key | Where | What |
|---|---|---|
| `salieri-visit` | localStorage | time of the last page view; `salieri-visit-prev` (sessionStorage) pins the previous visit for the session |
| `salieri-read` | localStorage | per post path: progress, section id and label, title, time; 30 most recent; ≥ 95% = done |
| `salieri-theme` | localStorage | the visitor's light/dark choice |
| `salieri-series:*` | sessionStorage | series list from the search page, 10 minutes |
| `salieri-tag:*` | sessionStorage | rows and post count of one tag page ("함께 읽을 글"), 30 minutes |

The reading log also drives the series marks (읽음, 읽는 중, "N편 읽음", "안 읽은 편") and the home guide's count.
Engaged seconds per section (which topic chip comes first) live in memory only and end with the page.
Nothing is sent anywhere. Blocked storage (private modes) only turns these features off.

## Tistory's own parts (themed, never hidden or moved)

- **Comment app and namecard** (`[##_comment_group_##]`, guestbook too): Tistory ships light-only colors; the skin
  re-colors them with its tokens, sets 16px/1.75 and `keep-all`, and flips Tistory's sprite icons on dark.
- **Reaction row** (`.container_postbtn`: 공감, 공유, 구독, 후원): skin colors only. Its share layer already offers URL
  copy and SNS, so the skin has no share button of its own.
- **Toolbar** (`.menu_toolbar`, fixed top-right on desktop): the header keeps its measured width free.
- **Image viewer**: body images open Tistory's own viewer (`data-phocus`), so the skin has no lightbox.
- **Structured data**: Tistory prints BlogPosting JSON-LD; the skin adds only BreadcrumbList.
- **Runtime rules** on "카테고리의 다른 글" (`th span {10px}`, `color_gray * {#909090 !important}`) are beaten by
  explicit sizes and colors on the spans the skin creates. The preview harness mirrors these, the comment markup, the
  reaction row and the toolbar (`dev/sample.mjs`).

## Layout stability

Most visitors arrive cold, so the first view must not jump (lab CLS on a post went from 0.24+ to under 0.07).
- Anything that changes above the body after the first paint either runs inline while the page is parsed
  (`salieriHead`, `salieriBody`, the resume line and the home guide in skin.html) or has its room reserved
  (code bar 36px, the section "#" is absolutely placed, the next-read link's space in the rail).
- `"Pretendard Fallback"`: Malgun Gothic with `size-adjust` 86% (85% bold) so Windows keeps Pretendard's line breaks
  until the web font arrives. JetBrains Mono loads without blocking the first paint.
- Late text that could wrap a line (the series position) stays off narrow screens.
- Series arrows: `salieriHead` makes their room on the breadcrumb row while parsing (absolutely placed, the row keeps
  92px free on the right), so filling them in later moves nothing.
- "함께 읽을 글" is inserted only off screen (see "Related by topic"). Lab CLS with it (390×844, slow 4G, CPU 4x):
  first view 0.0012, read to the end 0.019, jump to the comments 0.

## Motion

Hover color, the 2px reading-progress bar, a 160ms crossfade between pages of the blog (cross-document view
transitions, header held still) and a 200ms reveal of "다음에 읽기" in the rail. Everything is off under
`prefers-reduced-motion`.
