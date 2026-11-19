# 이정표 (Signpost) — Tistory skin

도로 안내 표지판에서 가져온 읽기 중심 티스토리 스킨입니다.
블로그 주소: https://igewaedam630.tistory.com/

- 초록 안내판 헤더, 카테고리를 행선지처럼 보여주는 안내판, 글 번호 방패, 차선 구분선
- 긴 글을 위한 목차(데스크톱은 오른쪽 고정, 모바일은 접기), 읽기 진행 바
- 코드 블록 언어 표시와 복사 버튼, 넓은 표 가로 스크롤
- 다크 모드(기기 설정 따름 + 토글), 안내판 색 3종(초록·파랑·갈색)
- 의존성 없음 (jQuery 불필요). 모든 내용은 티스토리 치환자에서 옵니다.

디자인 결정은 [DESIGN.md](DESIGN.md), 제품 맥락은 [PRODUCT.md](PRODUCT.md)에 있습니다.
방향 시안 3종은 `.frontend-slides/slide-previews/`에 있습니다(frontend-slides 스킬로 생성, C안 채택).

## 로컬에서 보기

```bash
npm run dev       # http://localhost:4173 — 샘플 데이터로 렌더링, 파일 저장 시 자동 새로고침
npm run check     # 렌더링 + 치환자/옵션/커버 정합성 검사
npm run package   # 검사 후 dist/ijeongpyo-skin.zip 생성 (티스토리 업로드용)
bash dev/check-contrast.sh   # 모든 미리보기 페이지의 글자 대비(WCAG AA) 검사
```

Node 22 이상이 필요합니다. 설치할 패키지는 없습니다.

## 티스토리에 적용하기

1. 블로그 관리 → 꾸미기 → 스킨 변경 → 현재 스킨을 **스킨 보관함에 저장** (되돌릴 지점)
2. **스킨 등록** → `dist/ijeongpyo-skin.zip` 업로드 → 적용
3. 꾸미기 → 스킨 편집 → 오른쪽 **스킨 옵션**에서 안내판 색, 화면 모드, 목차, 하단 링크 설정
4. 꾸미기 → 홈 화면 설정에서 커버 구성 (`이정표`, `목록`, `갤러리`)
5. 꾸미기 → 모바일 → **티스토리 모바일웹 자동 연결 끄기** (모바일에서도 이 스킨이 보이도록)

## 구조

```
skin.html  style.css  index.xml  preview*.jpg  images/script.js   ← 업로드 대상
dev/       로컬 미리보기 하네스 (render, serve, check, package)
legacy/    이전 스킨(Portfolio 원본, 적용 중이던 스킨의 CSS/JS 백업)
```
