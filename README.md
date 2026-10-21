# 배정혜(J.Bae) 작품 포트폴리오

한국화 작가 배정혜의 개인 포트폴리오. 빌드 도구 없는 순수 HTML/CSS/JS이고,
모든 내용은 `data.json` 한 파일에서 나온다. GitHub Pages로 배포된다.

- 공개 주소: https://jbae.art
- 디자인 무드: **자연 결** — 모래빛 바탕, 고운바탕 + 본고딕, 각진 형태(곡률·그림자 없이 1px 선)

## 파일 구조

```
index.html            첫 화면 (히어로 · 작품 연보 · 작가 · 약력 · 문의)
year.html             한 시기의 작품 전체 (?year=2023 처럼 붙여서 연다)
catalog.html          전시 도록 — 책처럼 넘겨 보는 화면 (#p=5 처럼 붙이면 그 쪽부터)
catalog.json          도록 내용. 전시가 정해지면 이 파일만 채운다
data.json             작가 정보 + 시기별 작품. 내용은 전부 여기서 온다
css/
  tokens.css          색·글씨·간격·곡률. 디자인을 바꾸려면 여기부터 본다
  base.css            리셋, 타이포 기본, 바탕 질감
  layout.css          머리띠, 히어로, 구획 골격, 작품 연보
  components.css      버튼, 약력, 작품 격자, 라이트박스, 등장 모션
  catalog.css         도록 화면 전용
js/
  data.js             data.json 읽기 + 화면용으로 다듬기
  motion.js           스크롤 등장, 머리띠 반응
  home.js             첫 화면 그리기
  year.js             시기별 작품 그리기
  cv.js               약력 그리기
  lightbox.js         작품 크게 보기
  catalog.js          도록: 쪽 넘김 · 쪽 번호 · 넘김 단추
  catalog-pages.js    도록: catalog.json → 쪽 만들기 (빈 값은 자리 표시)
  catalog-tools.js    도록: 모아보기 · 자동 넘기기 · 크게 보기 · 전체 화면 · 링크 복사
  catalog-turn.js     도록: 가운데 잡고 넘기기 · 넘기는 종이에만 뒷면 비침
  vendor/page-flip.browser.js  쪽 넘김 라이브러리 StPageFlip 2.0.7 (MIT)
images/               작품 원본 (라이트박스가 쓴다)
images/thumb/         격자·연보용 WebP 썸네일 (자동 생성)
tools/
  build_image_meta.py 이미지 크기 측정 + 썸네일 생성
docs/qr/              사이트로 이동하는 QR 코드
```

## 내용을 고치려면

### 작가 정보
`data.json`의 `artist`를 고친다. 이름, 태그라인, 소개글, 이메일, 전화, 인스타그램, 약력(`cv`).

약력의 각 줄은 **두 칸 이상 띄어쓰기**로 나뉜다. 이 구분에 맞춰 표로 그려진다.

```
1995.10   제1회 배정혜 개인전   인사갤러리 (서울)
└ 연도 ┘  └────  이름  ────┘  └──  장소  ──┘
```

### 작품 추가
1. `images/<연도>/` 아래에 이미지를 넣는다
2. `data.json`의 해당 시기 `works`에 항목을 추가한다
   (`title` `material` `size` `description` `image`)
3. **`python3 tools/build_image_meta.py` 를 실행한다** — 이미지 크기를 재서
   `data.json`에 `w` `h` `thumb`를 넣고 썸네일을 만든다. 이걸 빼먹으면
   격자 배치가 틀어지고 로딩 중 화면이 밀린다

### 시기 숨기기
작품 이미지가 전부 자리표시자(`picsum`)인 시기는 화면에 나오지 않는다.
지금은 2026 · 2010 · 2008 · 2007 네 시기가 여기에 해당한다.

### 전시 도록 채우기
`catalog.json` 을 고친다. 비어 있는 값은 화면에 흐린 자리 표시로 나온다.

- `cover` 표지 (제목 · 부제 · 기간 · 장소 · 표지 작품 이미지)
- `greeting` · `note` 인사말 · 작가 노트. `body` 에 문단을 하나씩 넣는다
- `works` 작품 — **한 쪽에 한 점.** 긴 작품도 쪽 안에 통째로 맞춘다. 항목 수만큼 쪽이 생긴다
- `cv` · `colophon` 약력 · 전시 정보. `rows` 에 `{label, value}` 로 넣는다
- 쪽 순서: 표지 → 인사말 → 작가 노트 → 작품 → 약력 → 전시 정보 → 뒤표지.
  전체 쪽 수가 홀수가 되면 뒤표지 앞에 빈 쪽이 저절로 들어간다

넘길 때 그림자는 쓰지 않는다(`drawShadow:false` + 그늘 요소 숨김).
넘기는 동안 들린 종이에만 같은 장 뒷면이 좌우 뒤집혀 8% 로 비친다(`--through`).
지금은 홈에서 링크하지 않고 `noindex` 로 검색에서 빼 두었다.

## 알아둘 것

**작품 이미지에 세로형이 거의 없다.** 가로형 56점 / 정사각 62점 / 세로형 4점이고,
「구름에 기대 꿈을 그리다」는 8.28 : 1 파노라마다. 그래서 격자는 비율에 따라
칸 수를 바꾼다 (`js/data.js`의 `spanOf`). 세로 벽돌쌓기(Masonry)를 쓰면 안 된다.

**로컬에서 열려면 서버가 필요하다.** `data.json`을 fetch로 읽고 JS 모듈을 쓰기 때문에
파일을 더블클릭하면 동작하지 않는다.

```bash
python3 -m http.server 8899
# http://localhost:8899
```
