# 화가 포트폴리오 웹사이트

자연과 전통 회화의 미학을 담은 화가 포트폴리오 사이트입니다.
GitHub Pages로 배포되며, `data.json`과 이미지 파일만 교체하면 내용이 바뀝니다.

## 파일 구조

```
artist_portfolio/
├── index.html      # 메인 페이지 (Hero / About / Works / Contact)
├── year.html       # 연도별 상세 페이지 (Masonry 갤러리 + Lightbox)
├── style.css       # 전체 스타일
├── script.js       # 데이터 로딩 및 인터랙션
├── data.json       # 작가 정보 + 연도별 작품 데이터
└── images/         # 연도별 이미지 폴더 (2007 ~ 2026)
    ├── 2026/
    ├── 2025/
    ...
    └── 2007/
```

## 내용 수정 방법

### 1. 작가 정보 변경
`data.json` 상단의 `artist` 객체를 수정하세요.

```json
"artist": {
  "name": "작가 이름",
  "tagline": "한 줄 소개",
  "bio": "소개글",
  "email": "이메일",
  "instagram": "인스타그램 URL"
}
```

### 2. 작품 데이터 변경
`data.json`의 `years` 배열에서 각 연도별 데이터를 수정하세요.

```json
{
  "id": "2026",
  "year": 2026,
  "description": "연도 설명",
  "thumbnail": "images/2026/thumb.jpg",
  "works": [
    {
      "title": "작품 제목",
      "material": "유화",
      "size": "80×100cm",
      "description": "작품 설명",
      "image": "images/2026/01.jpg"
    }
  ]
}
```

### 3. 이미지 교체
- 각 연도 폴더(`images/2026/` 등)에 실제 이미지 파일을 넣고
- `data.json`의 `thumbnail` 및 `image` 경로를 해당 파일명으로 수정하세요.

## GitHub Pages 배포

1. GitHub 저장소 → **Settings → Pages**
2. Source: `Deploy from a branch`
3. Branch: `main` / `/ (root)` 선택 후 Save

배포 후 `https://[username].github.io/artist_portfolio/` 로 접속 가능합니다.

## 주요 기능

- 연도별 Editorial 레이아웃 (좌우 교차 배치)
- 연도 상세 페이지 Masonry 갤러리
- 작품 Lightbox (키보드 ← → ESC 지원)
- 스크롤 페이드인 애니메이션
- 모바일 반응형 디자인
- `data.json` 하나로 전체 콘텐츠 관리
