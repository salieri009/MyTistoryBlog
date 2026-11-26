# 조사: 방문자가 두 번째 글을 읽게 하려면 (v3.2, 2026-11-26)

v3.1(다음 걸음, 재방문 기억, 검색, 홈 길잡이) 다음 라운드를 위해 논문, 업계 연구, GitHub 테마, 블로그 글을 찾아봤습니다.
여기에는 무엇을 근거로 무엇을 넣고 무엇을 뺐는지를 적습니다.
측정 방법과 기준선은 [retention-baseline.md](retention-baseline.md)에 있습니다.

## 1. 가장 강한 근거: 두 번째 페이지

- Chartbeat이 뉴스·미디어 사이트의 첫 방문 3억 건을 분석했습니다.
  - 1쪽만 본 사람의 7일 안 재방문율은 8%였습니다.
  - 1쪽만 더 보면 22%(2.75배)였습니다.
  - 효과는 4쪽에서 멈췄습니다.
  - 새 방문자의 86%는 7일 안에 돌아오지 않았습니다.
- 그래서 이번 라운드의 목표는 **글을 다 읽은 순간의 첫 클릭 한 번**입니다.

## 2. 블로그 데이터에서 확인한 사실 (RSS, 2026-11-26)

- RSS에는 최근 5편만 나옵니다. 설명은 약 300자 요약이고, 이미지 필드는 없습니다.
- 최근 글은 거의 모두 루트 카테고리 "컴퓨터 공학"에 있습니다.
  - 그래서 티스토리 "같은 카테고리의 글"은 사실상 최신 글 목록입니다.
- 태그는 글마다 약 10개이고, 시리즈를 넘어 겹칩니다.
  - 예: `개인공부 :: SCM…`와 `최종 프로젝트 6일차`가 SCM·MES 태그를 공유합니다.
  - 관련도를 판단할 가장 좋은 신호는 태그입니다.
- RSS는 5편뿐이라 관련도 계산의 재료가 되지 못합니다. 그래서 태그 페이지(`/tag/<태그>`)를 씁니다. 이 스킨이 렌더링하므로 기존 목록 파서를 그대로 쓸 수 있습니다.

## 3. 근거 → 결정

| 근거 | 결정 |
|---|---|
| 글 **끝** 링크가 중간 링크보다 클릭이 55% 많았습니다. 관련 글은 인기 글보다 14% 많았습니다. 이미지가 있으면 더 좋았고, 효과는 모바일에서 더 컸습니다 (Center for Media Engagement × 지역 뉴스룸 7곳 A/B) | 글 끝에 관련 글을 썸네일과 함께 둡니다. 인기 글은 사이드와 푸터에 그대로 둡니다 |
| 관련 링크는 글 바로 아래에 둡니다. 빈 공간이나 군더더기는 "가짜 끝"이 됩니다. 광고 사이에 섞인 링크는 눈에 띄지 않습니다 (NN/g) | 새 블록은 시리즈 목록 바로 다음, 글쓴이·댓글보다 앞에 둡니다. 광고 자리는 건드리지 않습니다 |
| 위쪽 순서의 추천이 관련도와 상관없이 더 많이 눌립니다 (추천 약 1천만 건, arXiv 1802.06565) | 목록은 3개로 하고, 가장 관련 높은 글을 첫 줄에 둡니다 |
| 링크 문구(정보 냄새)가 클릭과 이탈을 예측합니다 (Pirolli & Card, SNIF-ACT). 냄새는 독자의 목표에 따라 다릅니다 (Nielsen) | 행마다 이유를 씁니다: "같은 태그 · Prometheus · Spring Boot", "다음 편 · 4일차" |
| 의미가 비슷한 글로 가는 링크, 위쪽 링크가 더 성공합니다 (Dimitrov et al., WWW 2017) | 태그 겹침으로 고르고, 시리즈 이동 화살표를 글 맨 위에 둡니다 (velog 시리즈 박스) |
| 체류 시간·스크롤로 훑기·대충 읽기·정독을 구분할 수 있고, 추천에 쓸 수 있습니다 (Grinberg, WWW 2018, Chartbeat 770만 페이지뷰). 참여 시간은 창이 열린 시간이 아니라 실제로 조작한 시간입니다 (Chartbeat) | 한 글의 주제가 여럿이면 주제별 칩으로 나눕니다. 처음 선택되는 칩은 **이 독자가 실제로 오래 읽은 섹션의 주제**입니다 |
| 진척이 보이면 완주율이 오릅니다: 목표 기울기 (Hull; Kivetz et al. 2006), 부여된 진척 효과 (Nunes & Drèze 2006, 34% 대 19%) | 시리즈 목록에 이 브라우저에서 읽은 편을 표시하고 "N편 읽음"을 보여 줍니다. 홈 길잡이에도 같은 숫자를 씁니다 |
| 글 끝에는 강한 다음 행동을 줍니다 (NN/g) | 시리즈 최신 편에서는 막다른 길 대신 티스토리 구독으로 안내합니다 |
| Wikipedia "Read more" 클릭률: 모바일 웹 19%, 데스크톱 3.4% | 관련 글 행은 폰에서 한 줄 전체를 링크로 하고, 최소 높이를 64px로 합니다 |
| GitHub 패턴: jekyll-tagging-related_posts(드문 태그일수록 가중치), Chirpy(자동 관련 글), gatsby-starter-hoodie·velog(시리즈 박스) | 점수 `Σ 1/log2(2 + 태그 글 수)`를 쓰고, 시리즈 화살표를 맨 위에 둡니다 |

## 4. 하지 않은 것

| 아이디어 | 이유 |
|---|---|
| 내부 링크 미리보기 카드(호버, gwern·LessWrong식) | Wikipedia A/B에서 조회수가 **줄었습니다**(서로 다른 문서 수는 늘었습니다). 성공 지표가 조회수 ÷ 방문자라 반대 방향입니다. 미리보기를 만들려면 글 HTML을 받아야 하는데, 그 요청이 조회수로 잡힐 수 있습니다. 폰에는 호버가 없습니다 |
| 다음 글 자동 이어 붙이기(무한 스크롤) | 아무도 고르지 않은 글이 로드되고 광고가 돕니다. 정책상 민감합니다 |
| 이탈 감지 팝업, 전면 레이어 | 티스토리 공지 2687·2692·2707 위반입니다 |
| 클리프행어 장치 | 자이가르닉 효과는 2025년 메타분석(Ghibellini & Meier)에서 보편적이지 않다고 나왔습니다 |
| PWA·서비스 워커 | 스킨 파일이 하위 경로에서 서빙되므로 루트 범위로 등록할 수 없습니다 |
| 새 스킨 옵션 | index.xml이 바뀌면 업로드할 때 스킨 옵션과 커버가 모두 초기화됩니다. `npm run check`가 옵션 목록이 바뀌는 것을 막습니다 |

## 5. 들어간 것 (v3.2)

1. **함께 읽을 글** (`initAlso`)
   - 이 글의 태그가 주제 후보입니다.
   - 비중은 등장 위치로 매깁니다.

     | 위치 | 가중치 |
     |---|---|
     | 제목, 소제목 | ×3 |
     | 코드 | ×2 (import, Gradle/Maven, 설정 파일) |
     | 나머지 본문 | ×1 |

   - "4. 회고"처럼 태그만으로 된 소제목은 주제로 치지 않습니다.
   - 상위 3개 주제마다 칩을 만들고, 칩마다 글 3개를 보여 줍니다.
   - 첫 칩은 독자의 참여 시간이 가장 많이 걸린 주제입니다. 나머지 칩은 글의 비중 순입니다.
2. **시리즈 진척**: 읽음·읽는 중 표시, "N편 읽음", 다음 편을 이미 읽었으면 "안 읽은 편".
3. **글 맨 위 ‹ ›**: 자리는 파싱 중에 잡습니다. 이웃 편(n ± 1)이 확인될 때만 채웁니다.
4. **최신 편의 출구**: "가장 최근 편입니다. 새 편은 구독하면 받아 볼 수 있습니다. · 구독 버튼으로".
5. **다음에 읽기 순위**: 시리즈 다음 편(안 읽은 편) > 독자 주제의 첫 글 > 티스토리 다음 글 > 같은 카테고리.

## 6. 로컬에서 확인한 것 (npm run dev, 헤드리스 Chrome, 2026-11-26)

| 확인 | 결과 |
|---|---|
| 글 위쪽에서의 태그 요청 | 0건. 절반을 읽었거나 태그 근처에 오면 3건 |
| 칩 순서, 아무 데도 머물지 않음 | Prometheus*(비중 9) · Spring Boot(6) · Docker(1) |
| Spring Boot 섹션에서 14초 머문 독자 | Spring Boot* · Prometheus · Docker |
| 같은 시간을 숨긴 탭으로 보냄 | Prometheus* (세지 않음) |
| 제외 | 현재 글, 같은 시리즈 글 빠짐. 두 주제에 걸친 글이 두 목록 모두 맨 위 |
| 태그 없는 글, 태그가 본문에 안 나오는 짧은 글 | 블록 없음, 요청 0건. 카테고리 격자 유지 |
| 대비(밝음·어두움, 1440·390) | 새 요소 모두 AA 통과 |
| impeccable `detect` (post, post-latest) | 0건 |
| CLS (390×844, 느린 4G, CPU 4배) | 첫 화면 0.0012 · 끝까지 0.019 · `#comments` 점프 0 · 데스크톱 끝까지 0.0009 · 짧은 글 0.0001 |

## 7. 배포 전에 블로그 주인이 확인할 것

**목록 페이지 요청이 티스토리 조회수에 잡히는지 확인합니다.** 태그 페이지와, v3.1부터 쓰던 검색 페이지가 대상입니다.

1. 관리 > 통계에서 오늘 조회수를 적어 둡니다.
2. 시크릿 창에서 시리즈 글 하나를 끝까지 한 번 읽습니다. 검색 요청 1–5건과 태그 요청 1–3건이 생깁니다.
3. 통계를 새로고침합니다.
   - +1이면 그대로 둡니다.
   - +1보다 크면 `ALSO_MAX_TAGS`를 1로 줄이거나, 비교 지표를 글별 조회수로 바꿉니다.

## 출처

- Chartbeat, 2쪽 방문자 재방문 2.75배: https://chartbeat.com/resources/general/increase-return-visits-news-sites/ · https://chartbeat.com/resources/articles/key-metric-that-predicts-return-visits-to-your-site/
- 글 끝 링크·관련 글 A/B (CME / Graham Media Group): https://digitalcontentnext.org/?p=20530 · https://www.warc.com/newsandopinion/news/now_click_here_how_links_impact_readers/41117
- NN/g, related content: https://www.nngroup.com/articles/related-content-pageviews/
- 추천 위치 편향: https://arxiv.org/abs/1802.06565v1
- 정보 채집 이론: https://www.nngroup.com/articles/information-foraging/ · https://en.wikipedia.org/wiki/Information_foraging
- Dimitrov, Singer, Lemmerich, Strohmaier, "What Makes a Link Successful on Wikipedia?", WWW 2017: https://arxiv.org/abs/1611.02508
- 부여된 진척 효과 (Nunes & Drèze 2006): https://msbfile03.usc.edu/digitalmeasures/jnunes/intellcont/Endowed%20Progress%20Effect-1.pdf · 목표 기울기: https://lawsofux.com/goal-gradient-effect/
- Wikipedia Page Previews: https://www.mediawiki.org/wiki/Page_Previews · Read more: https://www.mediawiki.org/wiki/Reading/Web/Projects/Read_more
- Chartbeat 참여 시간과 스크롤: https://chartbeat.com/resources/research/scroll-behavior-across-the-web/
- 자이가르닉 효과(2025 메타분석 포함): https://www.wikiwand.com/en/articles/Zeigarnik_effect
- GitHub: https://github.com/pronist/hello · https://www.github.com/devHudi/gatsby-starter-hoodie · toshimaru/jekyll-tagging-related_posts · https://gwern.net/design
