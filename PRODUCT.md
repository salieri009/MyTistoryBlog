# PRODUCT — 살리에리의 인생살이 채널

> Written for impeccable (`/impeccable init` equivalent). Product truth only; visual decisions live in DESIGN.md.
> Interview substitution: the owner asked to proceed end-to-end without stopping, so these answers were inferred
> from the live blog (igewaedam630.tistory.com), its RSS description and category tree, not from a live interview.

## What it is

A personal Tistory blog, **살리에리의 인생살이 채널** (https://igewaedam630.tistory.com), run by Salieri (Jungwook Van,
GitHub `salieri009`). The owner's own description:

> 평소에 내가 좋아하는 것과 싫어하는 것들 그리고 왜 안되나 싶은 것들을 업로드 하는 블로그입니다.
> 제가 걸어온 길이 당신에게 있어서 도움이 되는 이정표였으면 좋겠네요.

It is a life log with a strong technical spine: long code-heavy TIL and project posts, alongside diary, travel,
hobby and language-study posts, many of them image-heavy.

**The skin is content-agnostic.** All titles, categories, counts, dates and images come from Tistory template tags
(치환자), so the skin works for whatever the blog publishes and needs no edit when the content changes.

## Readers and what success means

1. **Camp graders, peers and recruiters** reading a TIL or project post: they arrive on one permalink from a link,
   want to scan the structure (소제목 → 코드 → 실행결과 → 트러블슈팅 → 회고) and judge the depth fast.
   Success = the long post is easy to navigate and code is comfortable to read on desktop and phone.
2. **Search visitors** landing on a hobby/travel/language post: success = the post reads well and the blog's other
   roads (categories) are obvious enough to keep wandering.
3. **The owner** writing daily: success = posts written in the Tistory editor (headings size26/23, quotes style1–3,
   code blocks, tables, image blocks) look intentional without hand-styling.

## Surfaces and modes

| Surface | Tistory body id | Mode |
|---|---|---|
| Article permalink, notice, page | `tt-body-page`, `tt-body-notice` … | **Read** |
| Category / search / tag lists | `tt-body-category`, `tt-body-search`, `tt-body-tag` | **Read** (wayfinding) |
| Home (cover) | `tt-body-index` | **Experience** — the blog's front door |
| Guestbook, protected post | `tt-body-guestbook` | Read |

## Hard constraints

- Tistory skin format: `skin.html`, `style.css`, `index.xml`, `images/*` (flat), preview images. Template tags
  (`[##_…_##]`, `<s_…>`) must be preserved for every Tistory feature the blog uses.
- Keep working: search, category tree, blog menu, sidebar modules (editable in admin), cover (home) editor,
  comments and guestbook (`[##_comment_group_##]`, `[##_guestbook_group_##]`), paging, protected posts,
  revenue slots (`[##_revenue_list_upper_##]`/`lower`) because the blog runs AdSense, owner toolbar.
- Tistory injects its own CSS/JS (content.css, jQuery 3.5, highlight.js theme, PreventCopyContents plugin, Kakao).
  The skin must coexist with them and must not depend on jQuery.
- Korean-first typography: `word-break: keep-all`, Hangul-friendly line height, no uppercase transforms on Hangul.
- Content width for the editor: 720px.

## Must not happen

- Losing comments/guestbook/ads/sidebar editing after the switch.
- A themed look that makes 3,000-word TIL posts tiring to read.
- Category or post facts invented by the skin (counts, dates come only from Tistory tags).

## Socials

- GitHub: https://github.com/salieri009
- Twitter: https://twitter.com/@Salieri1845799
