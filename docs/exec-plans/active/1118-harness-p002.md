---
id: 1118-harness-p002
project: P002
type: 설정
branch: claude/1118-harness-p002
port: 4102
status: 진행 중
created: 2026-11-18
---

# 실행 계획: harness-p002

## 목표
"내가 하는 모든 프로젝트에 하네스 다 적용시켜" (정혁님 2026-11-18)
= 작가포폴(jbae.art)에 하네스 검증 환경을 붙인다. 사이트 동작은 바꾸지 않는다.

## 완료 기준
- [ ] `harness.json` · 프로젝트 `CLAUDE.md`(기존 내용 합침) · `ARCHITECTURE.md` · `docs/exec-plans/tech-debt-tracker.md` 가 있다
- [ ] 단위 테스트(Vitest)가 `data.json` · `catalogs.json` · 도록 내용 파일의 모양과 `js/data.js` 순수 계산을 잡는다
- [ ] E2E(Playwright)가 첫 화면 · 시기 화면 · 도록 목록 · 도록 · 기록 목록이 뜨고 콘솔 오류 · 가로 스크롤이 없음을 PC · 390px 로 확인한다
- [ ] 개발 파일(node_modules · 로그 · 테스트 결과)이 저장소와 jbae.art 에 올라가지 않는다
- [ ] `verify-task` 8가지가 모두 통과한다

## 접근법
- 빌드 도구가 없는 정적 사이트라 개발용 `package.json` 만 새로 둔다(테스트 도구만, 사이트는 그대로 파일을 읽는다)
- 개발 서버는 README 에 있던 `python3 -m http.server` 를 그대로 쓴다(새 의존성 없이, 포트가 차 있으면 바로 실패)
- 전체 기준 첫 검사(100줄 · 비밀값 · git 기록)를 직접 돌리고 결과를 tech-debt-tracker 에 남긴다
- 버린 방법: `serve` 같은 Node 서버로 `/catalog` 확장자 없는 주소까지 흉내 내기 — 의존성만 늘고 GitHub Pages 동작과 똑같지도 않다. 대신 `catalogs.json` 의 `default` 를 단위 테스트로 지킨다

## 단계
1. worktree 기준 브랜치 바로잡기(main 위로)
2. 전체 기준 첫 검사
3. package.json · Vitest · Playwright 설치, .gitignore
4. 단위 테스트 · E2E
5. harness.json · CLAUDE.md · ARCHITECTURE.md · tech-debt-tracker
6. 커밋 → verify-task → PR

## 결정 기록
- 2026-11-18 · worktree 가 옛 브랜치 `claude/add-readme-bJWxJ` 에서 갈라져 있었다(GitHub 기본 브랜치가 그것). 커밋 전이라 main 으로 옮기고, 로컬 `origin/HEAD` 를 `git remote set-head origin main` 으로 바꿈 — 안 바꾸면 하네스 검사가 옛 브랜치와 비교해 거의 모든 파일을 "새 파일"로 본다. GitHub 기본 브랜치 설정은 건드리지 않음(정혁님 확인 필요, tech-debt)
- 2026-11-18 · GitHub Pages = 옛(Jekyll) 빌드 · main 루트 · Actions 워크플로 없음(`pages-build-deployment` 만). `node_modules/` 는 .gitignore 로 저장소에 안 들어가니 공개되지 않는다. `package.json` · `tests/` · `e2e/` · 문서는 jbae.art 에서도 열리지만 저장소가 이미 공개라 새로 드러나는 것은 없고 비밀값도 없다. `_config.yml` 로 빼는 건 배포 설정 변경이라 이 작업에서 하지 않음
- 2026-11-18 · `package.json` 은 개발용(`private`, `type: module`), 의존성은 `vitest` · `@playwright/test`(하네스와 같은 1.63.0 이라 브라우저를 새로 받지 않음)뿐
- 2026-11-18 · 개발 · E2E 서버 = `python3 -m http.server`(README 에 있던 방법, 의존성 없음). 포트가 차 있으면 바로 실패한다. E2E 포트 4152
- 2026-11-18 · `stack: static` 이라 레이어 검사는 건너뛴다(CODE_STYLE). 지킬 방향은 ARCHITECTURE.md 에 글로 적음. 린트 · 빌드 명령은 없어서 키를 뺌
- 2026-11-18 · `/catalog`(확장자 없는 주소)는 Pages 기능이라 로컬 서버에선 못 본다. 대신 `catalogs.json` 의 `default` 를 단위 테스트로 지키고, E2E 는 `catalog.html`(id 없이)로 같은 도록을 연다
- 2026-11-18 · 사이트 파일(HTML · CSS · JS · JSON)은 하나도 고치지 않음
- 2026-11-18 · 합치기 레벨 L3 예상 — 배포 중인 프로젝트 · 의존성 추가

## 오류 기록
- `git stash pop` 이 `.gitignore` 충돌 → main 쪽 내용으로 되돌리고 새 줄을 다시 붙임
- ui-capture 첫 실행이 세션 끊김으로 중간에 죽음(137) → 다시 돌려 통과
- 캡처에서 시기 화면 아래쪽 작품이 빈 칸으로 찍힘 → 스크롤 등장(`.reveal`) 요소가 전체 화면 캡처 때 안 나타난 것, 사이트 문제 아님(tech-debt)

## 검증 결과
- 첫 전체 검사(하네스 붙이기 전): 100줄 넘는 파일 9개 · 비밀값 0 · git 기록 속 키 모양 0 · `.env` 등 비밀 파일 커밋 기록 0 · 레이어 검사 대상 아님 · 빌드 · 린트 없음
- 단위 34개 통과 · E2E 10개(5화면 × PC · 390px) 통과 · ui-capture 통과
- verify-task 1회차 통과 (커밋 edc52fe): 테스트 · 100줄 · 의존성 방향(정적이라 건너뜀) · 화면 · 흐름 · 문서 · 비밀값 통과, 린트 · 빌드는 명령 없음
