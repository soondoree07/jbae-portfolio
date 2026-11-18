# 미뤄 둔 문제

## 100줄 기준선 (2026-11-18, 하네스 붙일 때)

100줄 넘는 코드 파일 9개. 더 커지면 `check-file-size` 가 막는다. 줄이면 여기서 지운다.

| 줄 | 파일 |
|---|---|
| 204 | `js/catalog-pages.js` |
| 157 | `js/catalog.js` |
| 149 | `js/catalog-v1-pages.js` (1판 보관본) |
| 137 | `js/catalog-v1-tools.js` (1판 보관본) |
| 137 | `js/catalog-tools.js` |
| 133 | `js/catalog-v1.js` (1판 보관본) |
| 123 | `js/home.js` |
| 111 | `js/data.js` |
| 106 | `js/lightbox.js` |

## 그 밖에

- 2026-11-18 · GitHub 저장소 기본 브랜치가 `claude/add-readme-bJWxJ`(옛 브랜치)다. 그래서 `start-task` 가 worktree 를 옛 브랜치에서 갈라 만들었다. 로컬은 `git remote set-head origin main` 으로 바로잡음. GitHub 설정(Settings → Default branch)을 main 으로 바꿀지는 정혁님 확인 필요
- **해결 11-18 (`_config.yml` exclude, PR jbae-pages-exclude)** · Pages 가 옛 Jekyll 빌드라 저장소의 개발 파일(`package.json` · `tests/` · `e2e/` · 문서)도 jbae.art 에서 열린다. 저장소가 공개라 새로 드러나는 건 없고 비밀값도 없다. 숨기려면 `_config.yml` 의 `exclude` (배포 설정 변경이라 따로)
- 2026-11-18 · `npm audit` high 5개: vitest 가 쓰는 `picomatch`(개발 도구에서만, 사이트에는 안 들어감)
- 2026-11-18 · 화면 캡처(ui-capture)는 전체 화면을 한 번에 찍어서 스크롤 등장(`.reveal`) 요소가 빈 칸으로 찍힌다. 사이트 문제는 아님
- 원본 이미지 무게 `images/` 69MB, 라이트박스는 원본(최대 6.8MB)을 쓴다 (RESUME "남은 숙제")
- 전화번호는 옛 커밋 기록에 남아 있다(히스토리는 다시 쓰지 않기로 2026-08-22 결정)
