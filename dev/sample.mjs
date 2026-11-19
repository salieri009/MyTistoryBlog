// Generic sample data for the preview harness. Not real blog content:
// on Tistory every value below comes from the platform's template tags.

const D = 'https://edge.daumcdn.net/tistory/tistory-admin/userblog/userblog-f6f1ed01ba71c67e3d4926cbd24915428841f14a/static';
export const injectedHead = [
  // What Tistory injects into every skin's <head> (captured from a live blog), so content renders as on Tistory.
  `<link rel="stylesheet" href="https://t1.daumcdn.net/tistory_admin/www/style/font.css">`,
  `<link rel="stylesheet" href="${D}/style/content.css">`,
  `<link rel="stylesheet" href="${D}/style/uselessPMargin.css">`,
  `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.3/styles/atom-one-light.min.css">`,
  `<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.3/highlight.min.js"></script>`,
  `<script>document.addEventListener('DOMContentLoaded',function(){document.querySelectorAll('pre code').forEach(function(b){hljs.highlightBlock(b)})})</script>`,
].join('\n');

const img = (w, h, hue) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},35%,62%)"/><stop offset="1" stop-color="hsl(${hue + 40},30%,38%)"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><circle cx="${w * 0.72}" cy="${h * 0.32}" r="${h * 0.12}" fill="rgba(255,255,255,.55)"/><path d="M0 ${h} L${w * 0.35} ${h * 0.55} L${w * 0.6} ${h * 0.8} L${w * 0.8} ${h * 0.6} L${w} ${h} Z" fill="rgba(0,0,0,.18)"/></svg>`)}`;

const cat = (name, n, subs = []) =>
  `<li class=""><a href="#" class="link_item"> ${name} <span class="c_cnt">(${n})</span></a>` +
  (subs.length ? `<ul class="sub_category_list">${subs.map(([s, c]) => `<li class=""><a href="#" class="link_sub_item"> ${s} <span class="c_cnt">(${c})</span></a></li>`).join('')}</ul>` : '') +
  `</li>`;

const categoryList =
  `<ul class="tt_category"><li class=""><a href="#" class="link_tit"> 분류 전체보기 <span class="c_cnt">(240)</span></a><ul class="category_list">` +
  cat('개발', 96, [['Cloud · DevOps', 24], ['Backend', 31], ['Frontend', 18], ['알고리즘', 23]]) +
  cat('일상', 58, [['여행', 14]]) +
  cat('취미', 47, [['게임', 21], ['프라모델', 9]]) +
  cat('어학', 26, [['영어', 12], ['일본어', 14]]) +
  cat('독서', 13) +
  `</ul></li></ul>`;

const blogMenu = `<ul><li class="t_menu_home first"><a href="#">홈</a></li><li class="t_menu_tag"><a href="#">태그</a></li><li class="t_menu_guestbook last"><a href="#">방명록</a></li></ul>`;

const titles = [
  '[샘플 과정] 최종 프로젝트 3일차 :: 아이디어를 꼬아 간 생각의 순서',
  '[샘플 과정] 최종 프로젝트 2일차 :: 대시보드를 버리고 생각해 보면',
  '당연함을 잃어버린다는 것',
  '주말 프라모델 작업기, 도색까지 3일',
  '일본어 문법 메모: 조사 は와 が의 차이',
  '세 번째 샘플 글. 아주아주 긴 제목이 두 줄을 넘어갈 때 줄바꿈과 말줄임이 어떻게 보이는지 확인하기 위한 문장',
];
const summary = '샘플 요약 문장입니다. 실제 블로그에서는 글 본문의 앞부분이 이 자리에 들어갑니다. 두 줄을 넘어가면 말줄임으로 잘립니다. 길이를 확인하기 위해 문장을 조금 더 이어서 씁니다.';
const DATES = ['2026.11.18', '2026.11.17', '2026.11.15', '2025.12.30', '2025.12.21', '2025.11.02'];
const date = (d) => `2026.11.${String(d).padStart(2, '0')}`;

const listRep = titles.map((t, i) => ({
  list_rep_link: '#', list_rep_title: t, list_rep_title_text: t, list_rep_summary: summary,
  list_rep_regdate: DATES[i], list_rep_category: ['개발', '개발', '일상', '취미', '어학', '개발'][i],
  list_rep_category_link: '#', list_rep_rp_cnt: [3, 0, 12, 1, 0, 5][i], list_rep_author: '샘플 필명',
  list_rep_thumbnail: i % 3 === 1 ? '' : img(400, 300, 140 + i * 30), list_rep_thumbnail_url: img(400, 300, 140 + i * 30),
}));

const coverItems = titles.map((t, i) => ({
  cover_item_url: '#', cover_item_title: t, cover_item_summary: summary,
  cover_item_thumbnail: i === 2 ? '' : img(480, 360, 120 + i * 35), cover_item_article_info: true,
  cover_item_category: ['개발', '개발', '일상', '취미', '어학', '개발'][i], cover_item_category_url: '#',
  cover_item_date: `${DATES[i]} 19:30`, cover_item_simple_date: DATES[i], cover_item_comment_count: i * 2,
}));

const articleBody = `<div class="tt_article_useless_p_margin contents_style">
<p data-ke-size="size16">샘플 본문입니다. 이 미리보기는 스킨이 티스토리 에디터 출력물을 어떻게 보여주는지 확인하기 위한 가짜 글입니다. 문단, 소제목, 목록, 인용, 코드, 표, 이미지가 모두 들어 있습니다. 한글 문장은 <code>word-break: keep-all</code>로 어절 단위로 줄바꿈되고, 아주 긴 영문 토큰 <code>org.springframework.boot.autoconfigure.SpringBootApplication</code>은 칸을 넘지 않아야 합니다.</p>
<h2 data-ke-size="size26">1. 문제 정의: 무엇을 해결하려 했나</h2>
<p data-ke-size="size16">두 번째 문단입니다. 본문 폭은 약 70자 안쪽으로 유지되어 긴 글을 읽어도 눈이 덜 피로해야 합니다. <a href="#">본문 링크</a>는 안내판 색으로, <mark>형광펜 강조</mark>는 호박색으로 표시됩니다.</p>
<ul data-ke-list-type="disc"><li>첫 번째 목록 항목</li><li>두 번째 목록 항목, 조금 더 길게 써서 줄바꿈이 생기도록 문장을 이어 갑니다.</li><li>세 번째 항목</li></ul>
<h3 data-ke-size="size23">1-1. 기본 구조</h3>
<p data-ke-size="size16">코드 블록 예시입니다.</p>
<pre class="python" data-ke-language="python"><code>from dataclasses import dataclass

@dataclass
class Sensor:
    name: str
    value: float

def alarm(sensors: list[Sensor], limit: float = 80.0) -&gt; list[str]:
    # 임계치를 넘은 센서 이름만 돌려준다
    return [s.name for s in sensors if s.value &gt; limit]
</code></pre>
<blockquote data-ke-style="style1"><p>인용 스타일 1입니다. 기억해 둘 한 문장을 강조할 때 씁니다.</p></blockquote>
<h3 data-ke-size="size23">1-2. 설정 파일</h3>
<pre class="yaml" data-ke-language="yaml"><code>apiVersion: apps/v1
kind: Deployment
metadata:
  name: sample-api
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: api
          image: registry.example.com/sample-api:1.4.2   # a deliberately long line to test horizontal scrolling inside the block
</code></pre>
<h2 data-ke-size="size26">2. 실행 결과</h2>
<figure class="imageblock alignCenter" data-ke-mobilestyle="widthOrigin"><span data-url="#"><img src="${img(1200, 700, 160)}" alt="샘플 이미지"></span><figcaption>이미지 캡션 예시</figcaption></figure>
<table style="border-collapse: collapse; width: 100%;" border="1" data-ke-align="alignLeft"><thead><tr><th>구분</th><th>이전</th><th>이후</th><th>변화</th></tr></thead><tbody><tr><td>응답 시간 (ms)</td><td>420</td><td>180</td><td>-57%</td></tr><tr><td>에러율</td><td>2.1%</td><td>0.3%</td><td>-1.8%p</td></tr><tr><td>배포 시간</td><td>15분</td><td>4분</td><td>-11분</td></tr></tbody></table>
<pre class="bash" data-ke-language="bash"><code>$ kubectl rollout status deploy/sample-api
deployment "sample-api" successfully rolled out</code></pre>
<h2 data-ke-size="size26">3. 트러블슈팅</h2>
<blockquote data-ke-style="style2"><p><b>주의.</b> 인용 스타일 2는 경고나 트러블슈팅 메모에 씁니다.</p></blockquote>
<p data-ke-size="size16">문제가 생긴 원인을 설명하는 문단입니다. 이어지는 단계는 번호 목록으로 정리합니다.</p>
<ol data-ke-list-type="decimal"><li>로그를 확인한다</li><li>설정 값을 비교한다</li><li>원인을 고치고 다시 배포한다</li></ol>
<hr data-ke-style="style1">
<h2 data-ke-size="size26">4. 회고</h2>
<blockquote data-ke-style="style3"><p>인용 스타일 3, 상자형입니다. 회고나 요약을 담기 좋습니다.</p></blockquote>
<p data-ke-size="size16">마지막 문단입니다. 이 아래로 태그, 이전·다음 글, 같은 카테고리의 글, 댓글이 이어집니다.</p>
</div>`;

const sidebar = {
  sidebar: true, sidebar_element: true, search: true,
  rctps_rep: titles.slice(0, 5).map((t, i) => ({ rctps_rep_link: '#', rctps_rep_title: t, rctps_rep_simple_date: date(18 - i) })),
  rctps_popular_rep: titles.slice(1, 6).map((t, i) => ({ rctps_rep_link: '#', rctps_rep_title: t, rctps_rep_category: ['개발', '취미', '일상', '어학', '개발'][i] })),
  rctrp_rep: [1, 2, 3].map((i) => ({ rctrp_rep_link: '#', rctrp_rep_desc: `샘플 댓글 ${i}: 잘 읽었습니다. 궁금한 점이 하나 있어요.`, rctrp_rep_name: `방문자${i}`, rctrp_rep_time: `11.${18 - i}` })),
  rct_notice: { rct_notice_rep: [{ notice_rep_link: '#', notice_rep_title: '샘플 공지사항' }] },
  archive_rep: ['2026/11', '2026/10', '2026/09'].map((d, i) => ({ archive_rep_link: '#', archive_rep_date: d, archive_rep_count: [12, 18, 9][i] })),
  link_rep: [{ link_url: '#', link_site: '샘플 링크' }, { link_url: '#', link_site: 'GitHub' }],
  random_tags: ['kubernetes', 'docker', 'spring', 'python', '여행', '일본어', '회고', 'AWS', 'TIL'].map((t, i) => ({ tag_link: '#', tag_name: t, tag_class: `cloud${(i % 5) + 1}` })),
};

const paging = {
  prev_page: 'href="#"', no_more_prev: 'no-more-prev', next_page: 'href="#"', no_more_next: '',
  paging_rep: [1, 2, 3, 4, 5].map((n) => ({ paging_rep_link: 'href="#"', paging_rep_link_num: n === 1 ? '<span class="selected">1</span>' : `<span>${n}</span>` })),
};

export const site = {
  title: '샘플 블로그 이름', page_title: '샘플 블로그 이름', blog_link: '#', rss_url: '#', taglog_link: '#', guestbook_link: '#',
  desc: '블로그 설명이 들어가는 자리입니다.\n여러 줄로 써도 됩니다.', blogger: '샘플 필명',
  image: img(120, 120, 200), blog_menu: blogMenu, category_list: categoryList,
  search_name: 'search', search_text: '', search_onclick_submit: "location.href='#'",
  revenue_list_upper: '', revenue_list_lower: '', count_total: '123,456', count_today: '321', count_yesterday: '654',
  ...sidebar,
  vars: { colorScheme: 'auto', tocMode: 'on', listStyle: 'index', logoImage: '', footerCopyright: '', heroText: '제가 걸어온 길이 당신에게 도움이 되는 *이정표*였으면 좋겠습니다.', githubUrl: '#', twitterUrl: '#', email: '' },
};

const article = (extra = {}) => ({
  permalink_article_rep: true, index_article_rep: false,
  article_rep_id: '512', article_rep_link: '#', article_rep_title: titles[0], article_rep_category: '개발', article_rep_category_link: '#',
  article_rep_author: '샘플 필명', article_rep_date: '2026.11.18 19:54', article_rep_simple_date: '2026.11.18', article_rep_desc: articleBody,
  rp_count: true, article_rep_rp_cnt: 3, ad_div: false,
  tag_label: { tag_label_rep: ['<a href="#" rel="tag">kubernetes</a>', '<a href="#" rel="tag">배포</a>', '<a href="#" rel="tag">회고</a>'].join(', ') },
  article_prev: { article_prev_link: '#', article_prev_title: titles[1], article_prev_date: '2026.11.17' },
  article_next: { article_next_link: '#', article_next_title: titles[2], article_next_date: '2026.11.19' },
  article_related: { article_related_rep: titles.slice(1, 5).map((t, i) => ({ article_related_rep_link: '#', article_related_rep_title: t, article_related_rep_date: date(16 - i), article_related_rep_thumbnail: i === 1 ? '' : img(320, 240, 100 + i * 40), article_related_rep_thumbnail_link: img(320, 240, 100 + i * 40) })) },
  rp: true,
  comment_group: '<div class="tt-comments-wrap" style="padding:28px;border:1px dashed var(--line-strong);border-radius:14px;color:var(--ink-3);text-align:center">티스토리 댓글 영역 (실제 블로그에서는 티스토리가 렌더링)</div>',
  ...extra,
});

export const pages = {
  home: {
    body_id: 'tt-body-index',
    cover_group: { cover_rep: [
      { __cover: 'index', cover_title: '최근 글', cover_url: '#', cover_item: coverItems },
      { __cover: 'featured', cover_title: '추천 글', cover_url: '', cover_item: coverItems.slice(0, 3) },
      { __cover: 'gallery', cover_title: '사진이 있는 글', cover_url: '#', cover_item: coverItems.slice(0, 6) },
    ] },
  },
  category: {
    body_id: 'tt-body-category',
    list: { list_conform: '개발', list_count: 96, list_description: '카테고리 설명이 있으면 여기에 표시됩니다.', list_style: '', list_empty: false, list_rep: listRep },
    paging,
  },
  search: {
    body_id: 'tt-body-search', search_text: '배포',
    list: { list_conform: '배포', list_count: 0, list_description: '블로그 설명', list_style: '', list_empty: true, list_rep: [] },
  },
  post: { body_id: 'tt-body-page', article_rep: [article()] },
  'post-dark': { body_id: 'tt-body-page', article_rep: [article()], vars: { colorScheme: 'dark' } },
  'category-summary': { body_id: 'tt-body-category', list: { list_conform: '개발', list_count: 96, list_description: '카테고리 설명이 있으면 여기에 표시됩니다.', list_style: '', list_empty: false, list_rep: listRep }, paging, vars: { listStyle: 'summary' } },
  protected: {
    body_id: 'tt-body-page',
    article_protected: { article_rep_title: '보호된 샘플 글', article_rep_category: '일상', article_rep_category_link: '#', article_rep_date: '2026.11.10 10:00', article_password: 'pw', article_dissolve: 'return false;' },
  },
  tags: { body_id: 'tt-body-tag', tag: { tag_rep: sidebar.random_tags.concat(sidebar.random_tags.map((t) => ({ ...t, tag_name: t.tag_name + '2' }))) } },
  guestbook: { body_id: 'tt-body-guestbook', guest: true, guestbook_group: '<div style="padding:28px;border:1px dashed var(--line-strong);border-radius:14px;color:var(--ink-3);text-align:center">티스토리 방명록 영역</div>' },
};

// Home in dark mode, and home without a cover (Tistory falls back to index_article_rep per post).
pages['home-dark'] = { ...pages.home, vars: { colorScheme: 'dark' } };
pages['home-nocover'] = {
  body_id: 'tt-body-index', paging,
  article_rep: titles.map((t, i) => ({
    index_article_rep: true, permalink_article_rep: false, article_rep_link: '#', article_rep_title: t, article_rep_summary: summary,
    article_rep_category: ['개발', '개발', '일상', '취미', '어학', '개발'][i], article_rep_simple_date: DATES[i],
    article_rep_thumbnail: i % 2 ? '' : img(240, 180, 150 + i * 20), article_rep_thumbnail_raw_url: img(240, 180, 150 + i * 20),
  })),
};

// Markdown pasted into Tistory's basic editor: one <p> with <br> line breaks (as seen on the live blog),
// plus a pipe table pasted into a code block. script.js should turn both into real HTML.
const mdLines = [
  '샘플 마크다운 원고를 기본 편집기에 그대로 붙여 넣은 글입니다.', '', '아무튼 시작해 보자.', '',
  '1. 첫 번째 섹션 제목', '', '설명 문단입니다. 대표적으로 다음과 같은 데이터가 있다.',
  '- 공정 조건값: 온도, 압력, 진공도 등', '- 설비 상태값: 진동, 소음 등 **별도 센서**로 수집하는 값', '',
  '2. 두 번째 섹션 제목', '', '서비스들을 연결할 수 있다.', '서비스| 역할', 'IoT Core| MQTT 메시지 수집', 'S3| 대량 데이터 저장', 'Athena| `SQL`로 조회', '',
  '## 3. 해시가 남아 있는 제목', '', '```python', 'def hello(name):', '    return f"hi {name}"', '```', '',
  '> 인용으로 붙여 넣은 문장입니다.', '', '![실행 화면 캡처](https://t1.daumcdn.net/tistory_admin/static/images/openGraph/opengraph.png)', '', '세 단계로 정리했다.', '1. 설비 데이터 레이어', '2. IoT 데이터 레이어', '3. AI 하네스 레이어', '',
  '회고', '', '마지막 문단입니다. [링크](https://example.com)도 있습니다.',
];
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const mdBody = `<div class="tt_article_useless_p_margin contents_style"><p data-ke-size="size16">${mdLines.map(esc).join('<br>')}</p>
<pre class="gherkin"><code>| ID     | 역할 | 원하는 것 | MVP |
| UC-01 | 정비사 | 원인 후보를 순서대로 보고 싶다 | 1 |
| UC-02 | 정비사 | 몇 건 기준인지 보고 싶다 | 1 |</code></pre></div>`;
pages['post-md'] = { body_id: 'tt-body-page', article_rep: [article({ article_rep_desc: mdBody, article_rep_title: '[샘플 과정] 최종 프로젝트 2일차:: 마크다운으로 붙여 넣은 글' })] };
