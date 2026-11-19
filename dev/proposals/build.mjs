// Builds three static design proposals (home + post on one page) with the same generic sample content,
// so directions can be compared as real blog screens. Output: dev/proposals/{a,b,c}.html
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const img = (w, h, hue) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},32%,66%)"/><stop offset="1" stop-color="hsl(${hue + 35},28%,40%)"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><circle cx="${w * 0.72}" cy="${h * 0.3}" r="${h * 0.11}" fill="rgba(255,255,255,.5)"/><path d="M0 ${h} L${w * 0.32} ${h * 0.56} L${w * 0.58} ${h * 0.8} L${w * 0.8} ${h * 0.62} L${w} ${h} Z" fill="rgba(0,0,0,.16)"/></svg>`)}`;

const BLOG = '샘플 블로그 이름';
const DESC = '좋아하는 것과 싫어하는 것, 그리고 왜 안 되나 싶은 것들을 기록합니다. 블로그 설명이 이 자리에 들어갑니다.';
const CATS = [['전체', 240], ['개발', 96], ['일상', 58], ['취미', 47], ['어학', 26], ['독서', 13]];
const POSTS = [
  ['쿠버네티스 배포 파이프라인을 처음부터 다시 짜 본 기록', '개발', '11.18', 140],
  ['대시보드를 버리고 다시 생각해 본 화면 설계', '개발', '11.17', 200],
  ['당연함을 잃어버린다는 것', '일상', '11.15', 30],
  ['주말 프라모델 작업기: 도색까지 3일', '취미', '11.14', 100],
  ['일본어 문법 메모 — 조사 は와 が의 차이', '어학', '11.12', 280],
  ['소프트웨어 개발 초기 기획 프로세스 정리', '개발', '11.10', 170],
];
const SUM = '본문 앞부분이 요약으로 들어가는 자리입니다. 두 줄을 넘어가면 말줄임으로 잘리도록 길이를 조금 더 이어서 씁니다.';
const CODE = `<span class="k">def</span> <span class="f">alarm</span>(sensors, limit=<span class="n">80.0</span>):
    <span class="c"># 임계치를 넘은 센서 이름만 돌려준다</span>
    <span class="k">return</span> [s.name <span class="k">for</span> s <span class="k">in</span> sensors <span class="k">if</span> s.value &gt; limit]`;
const ICON = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
};
const head = (title, fonts, css) => `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
${fonts ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${fonts}&display=swap">` : ''}
<style>*,*::before,*::after{box-sizing:border-box}body{margin:0;word-break:keep-all;-webkit-font-smoothing:antialiased}a{color:inherit;text-decoration:none}img{display:block;max-width:100%}svg{width:20px;height:20px}h1,h2,h3{text-wrap:balance}
.k{color:var(--c-k)}.f{color:var(--c-f)}.n{color:var(--c-n)}.c{color:var(--c-c);font-style:italic}
.divider-label{font:600 12px/1 "Pretendard Variable",sans-serif;letter-spacing:.08em;color:#999;text-align:center;padding:40px 0 16px}
${css}</style></head><body>`;
const postBody = `
<p>샘플 본문입니다. 실제 글의 문단이 이 자리에 들어갑니다. 한글 문장은 어절 단위로 줄바꿈되고, 본문 폭은 70자 안쪽으로 유지되어 긴 글을 읽어도 눈이 덜 피로합니다. <a href="#">본문 링크</a>와 <code>inline code</code>도 이렇게 보입니다.</p>
<h2>1. 문제 정의</h2>
<p>두 번째 문단입니다. 소제목 아래로 설명이 이어지고, 코드와 인용이 섞입니다.</p>
<pre><div class="bar"><span>Python</span><button>복사</button></div><code>${CODE}</code></pre>
<blockquote>인용 문장입니다. 기억해 둘 한 문장을 강조할 때 씁니다.</blockquote>
<h2>2. 실행 결과</h2>
<p>마지막 문단입니다. 이 아래로 태그, 이전·다음 글, 댓글이 이어집니다.</p>`;

/* ---------------- A. 담백한 인덱스 ---------------- */
const A = head('A · 담백한 인덱스', 'family=JetBrains+Mono:wght@400;500', `
:root{--bg:#FFFFFF;--ink:#191A1C;--ink2:#5E6166;--ink3:#8B8F95;--line:#ECEDEF;--accent:#1E4FB8;--soft:#F5F6F8;--c-k:#B4256B;--c-f:#1E4FB8;--c-n:#9A5B00;--c-c:#8B8F95}
body{background:var(--bg);color:var(--ink);font-family:"Pretendard Variable",sans-serif}
.wrap{max-width:760px;margin:0 auto;padding:0 24px}
header{display:flex;align-items:center;justify-content:space-between;height:72px}
.logo{font-weight:800;font-size:18px;letter-spacing:-.02em}
nav{display:flex;align-items:center;gap:22px;font-size:15px;color:var(--ink2)}nav a:hover{color:var(--ink)}
.intro{padding:64px 0 40px}
.intro p{margin:0;font-size:30px;line-height:1.5;font-weight:600;letter-spacing:-.025em;max-width:640px}
.intro p em{font-style:normal;color:var(--accent)}
.me{display:flex;align-items:center;gap:10px;margin-top:28px;color:var(--ink2);font-size:14px}.me img{width:32px;height:32px;border-radius:50%}
.tabs{display:flex;flex-wrap:wrap;gap:4px 20px;padding:18px 0;border-top:1px solid var(--ink);border-bottom:1px solid var(--line);font-size:15px;color:var(--ink3)}
.tabs a b{font-weight:500;font-size:13px;margin-left:4px;color:var(--ink3);font-variant-numeric:tabular-nums}
.tabs a.on{color:var(--ink);font-weight:700}
.year{margin:36px 0 6px;font-size:13px;font-weight:700;color:var(--ink3)}
.idx{list-style:none;margin:0;padding:0}
.idx li a{display:grid;grid-template-columns:64px 1fr auto;gap:16px;align-items:baseline;padding:15px 0;border-bottom:1px solid var(--line)}
.idx time{font:500 14px "JetBrains Mono",monospace;color:var(--ink3)}
.idx strong{font-size:18px;font-weight:600;line-height:1.5;letter-spacing:-.01em}
.idx span{font-size:13px;color:var(--ink3)}
.idx a:hover strong{color:var(--accent);text-decoration:underline;text-underline-offset:4px;text-decoration-thickness:1.5px}
.more{display:inline-block;margin-top:20px;font-size:15px;font-weight:600;color:var(--accent)}
article{padding:24px 0 80px}
.cat{font-size:14px;font-weight:700;color:var(--accent)}
article h1{margin:12px 0 0;font-size:38px;line-height:1.3;letter-spacing:-.03em;font-weight:800}
.meta{margin-top:14px;font-size:14px;color:var(--ink3)}
.body{margin-top:40px;font-size:17px;line-height:1.85;color:#26282B}
.body p{margin:0 0 1.2em}.body a{color:var(--accent);text-decoration:underline;text-underline-offset:3px}
.body code{font:14px "JetBrains Mono",monospace;background:var(--soft);padding:2px 6px;border-radius:5px}
.body h2{margin:2.4em 0 .7em;font-size:24px;letter-spacing:-.02em;line-height:1.4}
.body pre{margin:1.6em 0;background:var(--soft);border-radius:12px;overflow:hidden}
.body pre .bar{display:flex;justify-content:space-between;align-items:center;padding:10px 16px;font-size:12px;font-weight:600;color:var(--ink3)}
.body pre button{border:0;background:none;color:var(--ink2);font:600 12px "Pretendard Variable";cursor:pointer}
.body pre code{display:block;background:none;padding:4px 18px 18px;font-size:14px;line-height:1.75;white-space:pre;overflow-x:auto}
.body blockquote{margin:1.6em 0;padding:0 0 0 0;font-size:20px;line-height:1.6;font-weight:600;letter-spacing:-.015em;color:var(--ink)}
.body blockquote::before{content:"“";display:block;font-size:44px;line-height:.6;color:var(--accent);margin-bottom:8px}
footer{border-top:1px solid var(--line);padding:28px 0 48px;font-size:14px;color:var(--ink3);display:flex;justify-content:space-between}
@media(max-width:640px){.intro p{font-size:23px}.idx li a{grid-template-columns:52px 1fr}.idx span{display:none}article h1{font-size:28px}nav a:not(:last-child){display:none}}
`) + `
<div class="wrap">
<header><a class="logo" href="#">${BLOG}</a><nav><a href="#">카테고리</a><a href="#">태그</a><a href="#">방명록</a><a href="#" aria-label="검색">${ICON.search}</a></nav></header>
<section class="intro"><p>${DESC.replace('기록합니다', '<em>기록합니다</em>')}</p><div class="me"><img src="${img(64, 64, 210)}" alt="">샘플 필명</div></section>
<div class="tabs">${CATS.map(([c, n], i) => `<a href="#" class="${i === 0 ? 'on' : ''}">${c}<b>${n}</b></a>`).join('')}</div>
<div class="year">2026</div>
<ul class="idx">${POSTS.map(([t, c, d]) => `<li><a href="#"><time>${d}</time><strong>${t}</strong><span>${c}</span></a></li>`).join('')}</ul>
<a class="more" href="#">글 전체 보기 →</a>
<div class="divider-label">글 화면</div>
<article><div class="cat">개발</div><h1>${POSTS[0][0]}</h1><div class="meta">샘플 필명 · 2026.11.18 · 댓글 3</div><div class="body">${postBody}</div></article>
<footer><span>© 샘플 필명</span><span>GitHub · RSS</span></footer>
</div></body></html>`;

/* ---------------- B. 포토 저널 ---------------- */
const CHIP = { 개발: ['#E3ECFF', '#1F4FC9'], 일상: ['#FFEADB', '#A8480B'], 취미: ['#E2F4E6', '#1D7238'], 어학: ['#F0E6FF', '#6A2EC0'], 독서: ['#F3EEDC', '#7A5A0A'], 전체: ['#1B1C1F', '#FFFFFF'] };
const chip = (c) => `<span class="chip" style="background:${CHIP[c][0]};color:${CHIP[c][1]}">${c}</span>`;
const B = head('B · 포토 저널', 'family=JetBrains+Mono:wght@400;500', `
:root{--bg:#F2F2EF;--card:#FFFFFF;--ink:#17181A;--ink2:#5A5D62;--ink3:#7D8086;--line:#E4E4E0;--c-k:#C2185B;--c-f:#1F4FC9;--c-n:#A8480B;--c-c:#8A8D92}
body{background:var(--bg);color:var(--ink);font-family:"Pretendard Variable",sans-serif}
.top{background:var(--card);border-bottom:1px solid var(--line);position:sticky;top:0;z-index:5}
.top .in{max-width:1180px;margin:0 auto;padding:0 24px;height:64px;display:flex;align-items:center;gap:24px}
.logo{font-weight:900;font-size:20px;letter-spacing:-.03em;margin-right:auto}
.top nav{display:flex;gap:6px}.top nav a{padding:8px 14px;border-radius:999px;font-size:14px;font-weight:600;color:var(--ink2)}.top nav a.on{background:var(--ink);color:#fff}
.ib{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:var(--bg)}
main{max-width:1180px;margin:0 auto;padding:32px 24px 80px}
.feature{display:grid;grid-template-columns:1.25fr 1fr;gap:0;background:var(--card);border-radius:22px;overflow:hidden}
.feature img{width:100%;height:100%;object-fit:cover;min-height:380px}
.feature .t{padding:44px 44px 40px;display:flex;flex-direction:column;justify-content:center;gap:16px}
.chip{display:inline-block;width:fit-content;padding:5px 11px;border-radius:999px;font-size:13px;font-weight:700}
.feature h2{margin:0;font-size:34px;line-height:1.3;letter-spacing:-.03em;font-weight:800}
.feature p{margin:0;color:var(--ink2);line-height:1.7;font-size:16px}
.date{font-size:13px;color:var(--ink3);font-variant-numeric:tabular-nums}
.sec{display:flex;align-items:baseline;justify-content:space-between;margin:48px 0 18px}.sec h3{margin:0;font-size:22px;font-weight:800;letter-spacing:-.02em}.sec a{font-size:14px;color:var(--ink2);font-weight:600}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px 22px}
.card img{aspect-ratio:4/3;width:100%;object-fit:cover;border-radius:16px;transition:transform .3s}
.card:hover img{transform:translateY(-3px)}
.card .chip{margin-top:14px}.card h4{margin:10px 0 6px;font-size:18px;line-height:1.45;font-weight:700;letter-spacing:-.015em}
.card p{margin:0 0 8px;font-size:14px;line-height:1.6;color:var(--ink2);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.post{max-width:760px;margin:0 auto}
.post .hero{border-radius:22px;width:100%;aspect-ratio:16/8;object-fit:cover}
.post h1{margin:28px 0 0;font-size:38px;line-height:1.3;letter-spacing:-.03em;font-weight:800}
.post .meta{display:flex;gap:12px;align-items:center;margin-top:14px;font-size:14px;color:var(--ink3)}
.body{margin-top:28px;background:var(--card);border-radius:22px;padding:44px 48px;font-size:17px;line-height:1.85}
.body p{margin:0 0 1.2em}.body a{color:#1F4FC9;text-decoration:underline;text-underline-offset:3px}
.body code{font:14px "JetBrains Mono",monospace;background:#F1F1EE;padding:2px 6px;border-radius:6px}
.body h2{margin:2.2em 0 .7em;font-size:24px;letter-spacing:-.02em}
.body pre{margin:1.6em 0;background:#F6F6F3;border:1px solid var(--line);border-radius:14px;overflow:hidden}
.body pre .bar{display:flex;justify-content:space-between;padding:10px 16px;font-size:12px;font-weight:700;color:var(--ink3);border-bottom:1px solid var(--line)}
.body pre button{border:0;background:var(--card);border-radius:8px;padding:3px 10px;font:600 12px "Pretendard Variable";color:var(--ink2)}
.body pre code{display:block;background:none;padding:16px 18px;font-size:14px;line-height:1.75;white-space:pre;overflow-x:auto}
.body blockquote{margin:1.6em 0;padding:20px 24px;background:#FFF6E9;border-radius:14px;color:#5B3A10}
footer{max-width:1180px;margin:0 auto;padding:32px 24px 56px;color:var(--ink3);font-size:14px;border-top:1px solid var(--line)}
@media(max-width:860px){.feature{grid-template-columns:1fr}.feature img{min-height:220px}.feature .t{padding:26px}.feature h2{font-size:26px}.grid{grid-template-columns:1fr 1fr}.top nav{display:none}.body{padding:26px 20px;border-radius:0;margin:28px -24px 0}.post h1{font-size:28px}}
@media(max-width:520px){.grid{grid-template-columns:1fr}}
`) + `
<div class="top"><div class="in"><a class="logo" href="#">${BLOG}</a><nav>${CATS.slice(0, 5).map(([c], i) => `<a href="#" class="${i === 0 ? 'on' : ''}">${c}</a>`).join('')}</nav><a class="ib" href="#" aria-label="검색">${ICON.search}</a></div></div>
<main>
<section class="feature"><img src="${img(900, 600, 160)}" alt=""><div class="t">${chip('개발')}<h2>${POSTS[0][0]}</h2><p>${SUM}</p><span class="date">2026.11.18 · 댓글 3</span></div></section>
<div class="sec"><h3>최근 글</h3><a href="#">전체 보기</a></div>
<div class="grid">${POSTS.slice(1).concat([POSTS[0]]).map(([t, c, d, h]) => `<a class="card" href="#"><img src="${img(480, 360, h)}" alt="">${chip(c)}<h4>${t}</h4><p>${SUM}</p><span class="date">2026.${d}</span></a>`).join('')}</div>
<div class="divider-label">글 화면</div>
<article class="post"><img class="hero" src="${img(1200, 600, 150)}" alt=""><h1>${POSTS[0][0]}</h1><div class="meta">${chip('개발')}<span>샘플 필명</span><span>2026.11.18</span></div><div class="body">${postBody}</div></article>
</main><footer>© 샘플 필명 · GitHub · RSS</footer></body></html>`;

/* ---------------- C. 다크 데스크 ---------------- */
const C = head('C · 다크 데스크', 'family=JetBrains+Mono:wght@400;500', `
:root{--bg:#121417;--side:#16191D;--card:#1B1F24;--ink:#E9E6DF;--ink2:#A9A69E;--ink3:#8C8981;--line:#262A30;--accent:#E7B455;--sage:#93B79E;--c-k:#E7B455;--c-f:#93B79E;--c-n:#E39A7B;--c-c:#7E7B74}
body{background:var(--bg);color:var(--ink);font-family:"Pretendard Variable",sans-serif}
.app{display:grid;grid-template-columns:280px 1fr;min-height:100vh}
aside{background:var(--side);border-right:1px solid var(--line);padding:32px 24px;position:sticky;top:0;height:100vh;overflow:auto}
.logo{display:block;font-size:20px;font-weight:800;letter-spacing:-.02em}
.desc{margin:10px 0 24px;font-size:14px;line-height:1.65;color:var(--ink2)}
.search{display:flex;align-items:center;gap:8px;height:40px;padding:0 12px;border-radius:10px;background:var(--card);border:1px solid var(--line);color:var(--ink3);font-size:14px}
.search svg{width:16px;height:16px}
.label{margin:28px 0 8px;font-size:12px;font-weight:700;letter-spacing:.04em;color:var(--ink3)}
.tree a{display:flex;justify-content:space-between;padding:8px 10px;margin:0 -10px;border-radius:8px;font-size:15px;color:var(--ink2)}
.tree a b{font-weight:500;font-size:13px;color:var(--ink3);font-variant-numeric:tabular-nums}
.tree a:hover{background:var(--card);color:var(--ink)}.tree a.on{background:var(--card);color:var(--ink);font-weight:700}.tree a.on b{color:var(--accent)}
.side-foot{margin-top:28px;display:flex;gap:8px}.side-foot a{display:grid;place-items:center;width:38px;height:38px;border-radius:10px;border:1px solid var(--line);color:var(--ink2)}
main{padding:56px 64px 80px;max-width:900px}
h2.h{margin:0 0 8px;font-size:15px;font-weight:700;color:var(--ink2)}
.list a{display:grid;grid-template-columns:1fr 168px;gap:28px;padding:26px 0;border-bottom:1px solid var(--line)}
.list a:first-child{grid-template-columns:1fr;padding-top:12px}
.list a:first-child img{order:-1;width:100%;aspect-ratio:21/9;height:auto;margin-bottom:6px}
.list a:first-child h3{font-size:30px}
.list img{width:168px;aspect-ratio:4/3;object-fit:cover;border-radius:12px;opacity:.92}
.list h3{margin:0;font-size:20px;line-height:1.45;font-weight:700;letter-spacing:-.015em}
.list a:hover h3{color:var(--accent)}
.list p{margin:8px 0 12px;font-size:15px;line-height:1.7;color:var(--ink2);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.m{font-size:13px;color:var(--ink3)}.m em{font-style:normal;color:var(--sage);font-weight:600;margin-right:10px}
article{margin-top:8px}
article .cat{color:var(--sage);font-weight:700;font-size:14px}
article h1{margin:10px 0 0;font-size:38px;line-height:1.3;letter-spacing:-.03em;font-weight:800}
article .meta{margin-top:14px;font-size:14px;color:var(--ink3)}
.body{margin-top:36px;max-width:700px;font-size:17px;line-height:1.85;color:#DAD7D0}
.body p{margin:0 0 1.2em}.body a{color:var(--accent);text-decoration:underline;text-underline-offset:3px}
.body code{font:14px "JetBrains Mono",monospace;background:var(--card);padding:2px 6px;border-radius:6px;color:var(--ink)}
.body h2{margin:2.3em 0 .7em;font-size:24px;letter-spacing:-.02em;color:var(--ink)}
.body pre{margin:1.6em 0;background:#0D0F12;border:1px solid var(--line);border-radius:12px;overflow:hidden}
.body pre .bar{display:flex;justify-content:space-between;padding:10px 16px;font-size:12px;font-weight:700;color:var(--ink3);border-bottom:1px solid var(--line)}
.body pre button{border:1px solid var(--line);background:none;border-radius:7px;padding:3px 10px;font:600 12px "Pretendard Variable";color:var(--ink2)}
.body pre code{display:block;background:none;padding:16px 18px;font-size:14px;line-height:1.75;white-space:pre;overflow-x:auto;color:#D8D5CE}
.body blockquote{margin:1.6em 0;padding:20px 24px;background:var(--card);border:1px solid var(--line);border-radius:12px;color:var(--ink)}
.divider-label{color:var(--ink3)!important}
@media(max-width:900px){.app{grid-template-columns:1fr}aside{position:static;height:auto}main{padding:32px 20px}.list a{grid-template-columns:1fr 100px;gap:16px}.list img{width:100px}article h1,.list a:first-child h3{font-size:26px}}
`) + `
<div class="app">
<aside><a class="logo" href="#">${BLOG}</a><p class="desc">${DESC}</p><div class="search">${ICON.search}검색</div>
<div class="label">카테고리</div><div class="tree">${CATS.map(([c, n], i) => `<a href="#" class="${i === 1 ? 'on' : ''}">${c}<b>${n}</b></a>`).join('')}</div>
<div class="label">최근 댓글</div><div class="tree"><a href="#">잘 읽었습니다. 궁금한 점이…</a><a href="#">저도 같은 문제를 겪었는데…</a></div>
<div class="side-foot"><a href="#" aria-label="테마">${ICON.moon}</a><a href="#" aria-label="메뉴">${ICON.menu}</a></div></aside>
<main><h2 class="h">개발 · 96편</h2>
<div class="list">${POSTS.slice(0, 4).map(([t, c, d, h]) => `<a href="#"><div><h3>${t}</h3><p>${SUM}</p><div class="m"><em>${c}</em>2026.${d} · 댓글 3</div></div><img src="${img(480, 360, h)}" alt=""></a>`).join('')}</div>
<div class="divider-label">글 화면</div>
<article><div class="cat">개발</div><h1>${POSTS[0][0]}</h1><div class="meta">샘플 필명 · 2026.11.18 · 댓글 3</div><div class="body">${postBody}</div></article>
</main></div></body></html>`;

writeFileSync(join(DIR, 'a.html'), A);
writeFileSync(join(DIR, 'b.html'), B);
writeFileSync(join(DIR, 'c.html'), C);
writeFileSync(join(DIR, 'index.html'), `<!doctype html><meta charset="utf-8"><title>디자인 시안</title><style>body{font-family:"Pretendard Variable",sans-serif;padding:40px;line-height:2}</style><h1>디자인 시안</h1><ul><li><a href="a.html">A · 담백한 인덱스</a></li><li><a href="b.html">B · 포토 저널</a></li><li><a href="c.html">C · 다크 데스크</a></li><li><a href="/home.html">현재 · 이정표</a></li></ul>`);
console.log('proposals → dev/proposals/{a,b,c}.html');
