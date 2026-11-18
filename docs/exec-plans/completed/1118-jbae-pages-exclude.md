---
id: 1118-jbae-pages-exclude
project: P002
type: 수정
branch: claude/1118-jbae-pages-exclude
port: 4104
status: 완료
created: 2026-11-18
---

# 실행 계획: jbae-pages-exclude

## 목표
jbae.art 에서 개발 파일(package.json · tests · e2e · 문서 등)이 열리지 않게 한다. 사이트가 읽는 파일은 그대로 둔다.

## 완료 기준
- [x] `_config.yml` 의 `exclude` 에 개발 파일 · 문서 · Jekyll 기본 제외 목록이 있다 (`tests/pages-exclude.test.js`)
- [x] html · js 가 읽는 파일(src · href · fetch 이름), catalogs.json 의 source · cover, data.json 의 그림 주소가 하나도 제외되지 않는다 (같은 시험)
- [ ] 합친 뒤 jbae.art 에서 개발 파일은 404, 사이트 주소는 200 (PR 에 주소 목록)

## 접근법
저장소에 `_config.yml` 이 없어서 새로 만든다. Jekyll · Ruby 가 이 PC 에 없어 실제 빌드는 못 돌리고, 설정 파일을 읽어 "빠져야 할 것 / 남아야 할 것"을 시험으로 지킨다. 실제 결과는 합친 뒤 Pages 빌드로 확인한다.
- 버린 방법: `.nojekyll` 로 Jekyll 끄기 — 개발 파일을 숨기지 못한다(오히려 그대로 다 나감)

## 단계
1. 실패하는 시험 → 2. `_config.yml` → 3. verify-task → 4. PR

## 결정 기록
- 2026-11-18 · `docs/` 통째로 뺀다. `docs/qr/` QR 원본도 사이트는 안 읽고, QR 이 가리키는 주소는 jbae.art/catalog 등 사이트 주소라 영향 없음
- 2026-11-18 · `catalog-v1.*`(1판 보관본)는 남긴다. RESUME 에 보관 주소 https://jbae.art/catalog-v1.html 로 적혀 있음
- 2026-11-18 · `CNAME` 은 남긴다(Pages 사용자 도메인)
- 2026-11-18 · `logs/` · `test-results/` · `playwright-report/` 는 커밋 안 되지만 안전하게 같이 넣음

## 오류 기록
- 없음
<!-- 명령 · 메시지 핵심 · 원인 · 해결 · 로그 경로 -->

## 검증 결과
- 2026-11-18 · verify-task 1회차 통과(테스트 · 100줄 · 의존성 · 화면 · e2e · 문서 · 비밀값, 린트 · 빌드는 명령 없음). 단위 시험 3개 추가(`tests/pages-exclude.test.js`)
- Jekyll 실제 빌드는 이 PC 에 Ruby 가 없어 못 돌림 → 합친 뒤 PR 의 주소 목록으로 확인

## 리뷰
- Claude(Code Reviewer): 막음 없음. 제안 반영: 시험이 Jekyll 처럼 앞부분 일치로 판정 · writings.json · catalogs/*.json 그림 주소도 검사 · 파일 한 번만 읽기. ChatGPT 검토 없음
