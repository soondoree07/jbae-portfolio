# P002 작가포폴 (jbae-portfolio) — 프로젝트 규칙

> 전역 규칙(~/.claude/CLAUDE.md) 위에 이 프로젝트만의 것만 적는다. 자세한 사정은 `RESUME.md`.

## 한 줄 소개
한국화 작가 배정혜(J.Bae) 작품 포트폴리오 · 전시 도록. 빌드 없는 HTML/CSS/JS + `data.json`. https://jbae.art

## 실행
- 개발 서버: `harness.json` 의 `dev` (`python3 -m http.server <포트>`). 파일을 더블클릭하면 fetch · 모듈 때문에 안 뜬다
- 검증: `verify-task` (단위 `npm test` = 데이터 모양 · `js/data.js` 계산, 흐름 `npm run e2e` = 주요 화면 PC · 390px)
- 배포: main 에 push 하면 GitHub Pages(main 루트, 옛 Jekyll 빌드)가 곧 공개한다. **배포 중이라 코드 변경은 L3**
- `package.json` 은 테스트 도구용일 뿐이다. 사이트는 node 없이 돈다. `node_modules/` 는 커밋하지 않는다

## 이 프로젝트만의 규칙
- **`catalogs.json` 의 `default` 를 바꾸지 않는다.** 인쇄한 QR(jbae.art/catalog)이 정부청사 도록을 연다(시험이 지킨다)
- 작품을 더하면 `python3 tools/build_image_meta.py` 를 꼭 돌린다(w · h · thumb, 빠지면 시험 실패 · 격자 틀어짐)
- 세로 Masonry 금지 — 비율에 따라 칸 수(`js/data.js` 의 `spanOf`). 파노라마 8.28:1 이 있다
- 곡률 · 그림자 · 기울임 없음(`css/tokens.css` 에 변수 자체가 없다). 경계는 1px 선
- RESUME 의 "화면에서 일부러 뺀 것"을 되살리지 않는다(안내 문구 · "작품 N점" 등). 예외는 작품 연보 안내 한 줄뿐
- 전화번호는 데이터 · 화면 어디에도 넣지 않는다. 이메일은 남긴다
- 시기 설명 문체는 `-다` 체. 인스타 아이디는 주소에서 뽑아 쓴다(`instagramHandle`)
- 도록 넘김 그림자는 쓰지 않는다. 사용자 PC 는 늘 동작 줄이기 상태라 핵심 애니메이션에 그 분기를 넣지 않는다
- `catalog-v1.*` 는 1판 보관본. 링크하지 않는다
- devlog `project` 필드명: **`jbae`**

## 빠른 참조
| 목적 | 문서 |
|---|---|
| 파일 구조 · 내용 고치는 법 · 도록 채우기 | `README.md` |
| 레이어 · 데이터 흐름 · 시험 위치 | `ARCHITECTURE.md` |
| 이어하기 · 디자인 결정 · 잡은 버그 | `RESUME.md` · `LAST_CHAT.md` |
| 진행 중 · 끝난 작업 | `docs/exec-plans/` |
| 미뤄 둔 문제 · 100줄 기준선 | `docs/exec-plans/tech-debt-tracker.md` |
