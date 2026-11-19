# Salieri Index — Tistory skin

글자가 먼저인 담백한 티스토리 스킨입니다.
블로그 주소: https://igewaedam630.tistory.com/

- 연도별로 묶인 글 목록 (날짜 · 제목 · 카테고리 · 썸네일), 홈 소개 문장과 프로필
- 글 상단 카테고리 경로, 글 끝 "이어 읽기 → 글쓴이 → 댓글" 흐름, 카테고리 페이지 하위 카테고리 칩
- `[과정] N일차 :: 주제` 형식의 제목을 시리즈명과 주제로 나눠 표시
- 긴 글을 위한 목차, 읽는 시간, 코드 복사, 표 가로 스크롤
- 인용 스타일 1·2·3 = 핵심 · 트러블슈팅 · 해결/회고
- 기본 편집기에 붙여 넣은 마크다운(제목·목록·표·코드·인용)을 자동으로 렌더링, 코드 블록에 넣은 마크다운 표는 실제 표로 변환
- Salieri 다이어그램 팔레트, 다크 모드 (기기 설정 + 토글)
- 의존성 없음. 모든 내용은 티스토리 치환자에서 옵니다

디자인 결정은 [DESIGN.md](DESIGN.md), 제품 맥락은 [PRODUCT.md](PRODUCT.md)에 있습니다.
이전 버전(이정표)은 태그 `signpost-v1`, 비교 시안은 `node dev/proposals/build.mjs`로 다시 만들 수 있습니다.

## 로컬에서 보기

```bash
npm run dev       # http://localhost:4173 — 샘플 데이터로 렌더링, 파일 저장 시 자동 새로고침
npm run check     # 렌더링 + 치환자/옵션/커버 정합성 검사
npm run package   # 검사 후 dist/salieri-index-skin.zip 생성 (티스토리 업로드용)
bash dev/check-contrast.sh   # 모든 미리보기 페이지의 글자 대비(WCAG AA) 검사
```

Node 22 이상이 필요합니다. 설치할 패키지는 없습니다.

## 티스토리에 적용하기

1. 블로그 관리 → 꾸미기 → 스킨 변경 → 현재 스킨을 **스킨 보관함에 저장** (되돌릴 지점)
2. **스킨 등록** → `dist/salieri-index-skin.zip` 업로드 → 적용
3. 꾸미기 → 스킨 편집 → 오른쪽 **스킨 옵션**에서 소개 문장, 한 줄 소개, GitHub · 포트폴리오 · velog · LinkedIn · X 주소, 화면 모드, 글 목록 형태, 목차 설정
4. 꾸미기 → 홈 화면 설정에서 커버 구성 (`인덱스`, `추천 글`, `갤러리`)
5. 꾸미기 → 모바일 → **티스토리 모바일웹 자동 연결 끄기** (모바일에서도 이 스킨이 보이도록)

## 구조

```
skin.html  style.css  index.xml  preview*.jpg  images/script.js   ← 업로드 대상
dev/       로컬 미리보기 하네스 (render, serve, check, package)
legacy/    이전 스킨(Portfolio 원본, 적용 중이던 스킨의 CSS/JS 백업)
```
