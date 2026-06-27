# 진행 상황 (2026-06-27 KST 기준)

배정혜(J.Bae) 화가 포트폴리오. 바닐라 HTML/CSS/JS + `data.json` 기반.
현재 **사이트 UI 전면 개편**을 준비 중 — Claude Design 앱으로 디자인을 뽑아 들여올 계획.

## 오늘 완료한 것
- 프로젝트 정체 확정: `jbae-portfolio`가 본판. (`artist_portfolio`는 같은 레포 가리키는 옛 복제본)
- **`artist_portfolio` 폴더 삭제 완료.** 단, 그 안에만 있던 **작품 원본 .tif 132개(173MB)는 `~/artist_originals`로 이동해 보존.** (git 미추적이라 거기에만 있던 원본이었음)
- ⚠️ 삭제한 `artist_portfolio`의 git remote에 GitHub 토큰(`gho_…`)이 박혀 있었음 → 사용자에게 revoke 권고함 (미확인)
- UI 개편 방향 확정:
  - 작업 방식 = **통째로 새로 구축** (단, `data.json` 작품 데이터 + `images/`는 그대로 이전)
  - 무드 = 4종 모두 시도 (한지·여백 미니멀 / 먹·수묵 다크 / 자연·결 textile / 모던 에디토리얼)
  - **작가 기법(먹선 콜라쥬·바느질) 표현은 제외**
  - **인터랙션·모션 강화가 핵심** (스크롤 리빌, 패럴랙스, 호버 마이크로인터랙션, 스무스 스크롤 등)
- Claude Design용 프롬프트 4종 완성 → `docs/claude-design-prompts.md`에 보관

## 현재 막힌 지점 / 결정 대기
- 사용자가 아직 Claude Design에서 디자인을 안 만듦. **사용자 차례** — 프롬프트로 시안 생성 후 코드/스크린샷을 가져와야 다음 단계 진행 가능.

## 다음 액션 (이어할 작업)
1. 사용자가 Claude Design에서 뽑아온 **시안 코드(또는 스크린샷)** 받기
2. 받은 시안 기준으로 사이트 새로 구현 — 모션까지 살려서
3. `data.json`의 작가 정보 + 2007~2026 작품 데이터를 새 구조에 연결
4. 연도 상세(Masonry + 라이트박스) 재구현
5. GitHub Pages 배포 확인 후 commit/push

## 참고
- 데이터 구조: `data.json` = `{ artist:{name,nameEn,tagline,bio,email,phone,instagram,cv:{education,soloExhibitions,...}}, years:[{id,year,description,thumbnail,works:[{title,material,size,description,image}]}] }`
- 현재 섹션: Hero / About(소개) / CV(약력) / Works(작품 연보) / Contact, + `year.html` 연도 상세
- Claude Design은 외부 앱이라 Claude Code가 직접 조작 불가. 결과 코드/스크린샷을 받아서 이식하는 방식.
