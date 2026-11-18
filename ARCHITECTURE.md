# 구조

파일마다 역할은 `README.md` 의 "파일 구조"에 있다. 여기엔 흐름과 시험만 적는다.

## 레이어
빌드 없는 정적 사이트라 `check-arch` 는 건너뛴다(`harness.json` 의 `stack: static`). 대신 이 방향을 지킨다.

```
data.js · copy.js · motion.js          (자료 읽기 · 공용 도구)
  → cv.js · lightbox.js · writing-data.js · return-spot.js · catalog-layouts.js
  → home.js · year.js · catalogs.js · writings.js · writing.js · catalog-*.js   (화면 하나씩)
```

- 화면 파일끼리는 import 하지 않는다. 도록 1판(`catalog-v1-*`)은 지금 판과 섞지 않는다
- `js/vendor/` 는 외부 라이브러리(StPageFlip). 고치지 않는다

## 흐름
```
index.html ─ home.js ─ data.js ─ fetch data.json ─> 히어로 · 작가 · 작품 연보 · 약력 · 문의
year.html?year=<id> ─ year.js ─> 시기 격자 (spanOf 로 칸 수) ─ lightbox.js
catalogs.html ─ catalogs.js ─ catalogs.json ─> 도록 표지 목록
catalog.html?id=<id> ─ catalog.js ─ catalogs.json(없으면 default) ─ catalogs/<id>.json + data.json(w · h)
                     ─ catalog-pages.js · catalog-layouts.js ─> StPageFlip
writings.html · writing.html?id= ─ writing-data.js ─ writings.json (비면 '기록' 메뉴 숨김)
```

- 이미지 크기 · 썸네일은 `tools/build_image_meta.py` 가 `data.json` 에 미리 넣는다
- 배포: GitHub Pages 가 main 루트를 그대로 낸다. `/catalog` 처럼 확장자 없는 주소는 Pages 가 `catalog.html` 로 잇는다

## 시험
- 단위: `tests/*.test.js` (Vitest) — `data.json` · `catalogs.json` · 도록 내용 모양, `js/data.js` 계산
- 흐름: `e2e/` (Playwright) — `python3 -m http.server` 로 띄워 첫 화면 · 시기 · 도록 목록 · 도록 · 기록 목록, PC · 390px. 바깥 주소(글꼴)는 막는다
