# 진행 상황 (2026-08-22 KST 기준)

배정혜(J.Bae) 화가 포트폴리오. 바닐라 HTML/CSS/JS + `data.json` 기반.
**UI 전면 개편 진행 중** — 무드 확정, Claude Design 시안 대기.

## 오늘 완료한 것
- 레포·배포 상태 점검: https://soondoree07.github.io/jbae-portfolio/ 정상 (index·data.json·한글 파일명 이미지 모두 200)
- **무드 8종을 실제 작품·실제 문구로 렌더해 비교** → 비교 화면 아티팩트 발행
  https://claude.ai/code/artifact/d522a091-9f47-4907-ba0e-62819d5fa796
- **무드 3번 "자연 결(textile)" 확정.** 따뜻한 모래빛 + 고운바탕/본고딕 + 부드러운 곡률
- **UI 구조도 전부 바꿔도 된다**는 방침 확정 (기존 5단 구성에 얽매이지 않음)
- 확정 무드 기준 Claude Design 프롬프트 완성 → `docs/claude-design-prompts.md`
- UI/UX Pro Max 스킬로 팔레트·폰트 후보 조회 후, 실제 작품 색을 직접 확인해 팔레트 확정

## 개편에 반영할 결정 사항
- **더미 데이터 연도(2026·2010·2008·2007, 작품 12점)는 그대로 두고 계속 숨김.** 나중에 결정
- **연도 상세 = 갤러리 기본 + "순서대로 보기" 버튼**(라이트박스 슬라이드) 두 방식 모두 제공
  (현재는 갤러리·네비·footer를 전부 숨기고 라이트박스만 뜨는 반쪽 상태)
- 먹선·바느질 기법을 그래픽으로 흉내내는 표현은 제외. 질감은 종이·천 결 수준까지만
- 다크 모드 만들지 않음 (라이트 단일)

## ★ 레이아웃 결정 제약 — 작품 이미지 비율
세로로 긴 작품이 거의 없다. **가로형 56점 / 정사각 62점 / 세로형 4점.**
「구름에 기대 꿈을 그리다」는 **8.28 : 1 파노라마**(100×45cm 15점 세트), 5:1·4:1도 여럿.
→ 핀터레스트식 세로 Masonry는 이 데이터에 맞지 않는다. 가변 폭 가로 흐름이나
   비율에 따라 칸 수가 달라지는 그리드를 써야 하고, crop은 최소로.

## 다음 액션
1. `docs/claude-design-prompts.md`의 프롬프트를 Claude Design에 붙여넣어 시안 생성 — **사용자 차례**
2. 받은 시안으로 사이트 새로 구현, 모션까지 살려서
3. `data.json` 연결 (작가 정보 + 12개 시기 + 작품 122점)
4. 연도 상세(갤러리 + 순서대로 보기) 구현
5. 실사용 마감 → commit·push → Pages 확인

## 남아 있는 실사용 이슈 (개편과 함께 처리)
| 항목 | 내용 |
|---|---|
| 이미지 무게 | `images/` 69MB, 최대 6.8MB, 1MB 초과 7장. 리사이즈·WebP·srcset 없음 |
| SEO·공유 | title이 "작가 포트폴리오", description·OG·파비콘·sitemap 전부 없음 |
| 접근성 | 라이트박스 포커스 트랩 없음 |
| 문서 | README가 옛 폴더명(`artist_portfolio`) 기준 |
| 도메인 | github.io 주소 사용 중 |

## 참고
- 데이터 구조: `data.json` = `{ artist:{name,nameEn,tagline,bio,email,phone,instagram,cv:{education,soloExhibitions,groupExhibitions,awards,teaching,collections}}, years:[{id,year,description,thumbnail,works:[{title,material,size,description,image}]}] }`
- 약력 분량: 학력 2 / 개인전 7 / 단체전 70 / 수상 3 / 강의 2 / 소장처 13 — 단체전 70줄은 접기 필요
- 작품 크기 25cm~240cm, 일부는 "100×45cm (15pieces)"처럼 여러 점 한 세트
- `artist_portfolio`는 2026-06-27 삭제됨. 원본 .tif 132개는 `~/artist_originals`에 보존
