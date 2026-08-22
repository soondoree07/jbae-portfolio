# 포트폴리오 QR 코드

작가님 사이트 https://soondoree07.github.io/jbae-portfolio/ 로 이동하는 QR 코드.

## 어떤 파일을 쓰나

| 파일 | 쓸 곳 |
|---|---|
| `jbae-qr-sand.svg` | **인쇄물 기본.** 명함, 전시 라벨, 도록, 리플렛. 벡터라 아무리 키워도 안 깨짐 |
| `jbae-qr-sand.png` | 웹, 카카오톡, 인스타 등 화면용 (1600px) |
| `jbae-qr-mono.svg` / `.png` | 흑백 인쇄, 스티커, 신문 광고처럼 색을 못 쓰는 곳 |
| `jbae-qr-ink-transparent.png` | 작품 이미지나 색지 위에 얹을 때 (배경 없음) |

색은 사이트와 같은 무드 3(자연 결) — 바탕 `#F2ECE1`, 코드 `#3A332A`.

## 인쇄할 때 지켜야 할 것

- **최소 크기 2.5cm × 2.5cm.** 명함에 넣을 때 이보다 작으면 인식률이 떨어진다
- 큰 인쇄물은 **읽는 거리 ÷ 10** 이 적정 크기다. 1m 떨어져 찍는 전시 배너면 10cm
- 코드 둘레의 **여백(밝은 테두리)을 잘라내지 말 것.** 파일에 이미 포함돼 있다
- 어두운 배경 위에 흰 코드로 반전시키지 말 것 — 못 읽는 스캐너가 있다
- 작품 이미지 위에 얹으려면 코드 뒤에 밝은 면을 깔아 대비를 확보한다

## 규격

버전 6 (41×41 모듈), 오류 정정 레벨 H.
H 레벨이라 **코드의 30%가 가려지거나 긁혀도 읽힌다.** 인쇄물에서 중요하다.
나중에 가운데에 작가 이니셜 같은 로고를 넣고 싶으면 이 여유분으로 가능하다.

## 주소가 바뀌면

지금은 GitHub Pages 기본 주소를 가리킨다.
나중에 개인 도메인(예: `jbae.kr`)을 붙여도 **기본 주소가 새 도메인으로 자동 넘어가므로
이미 인쇄한 QR은 계속 작동한다.**

다만 이 경우엔 QR이 깨진다. 인쇄 전에 확인할 것:
- 레포 이름을 바꾸거나 비공개로 돌리는 경우
- GitHub Pages 배포를 끄는 경우

## 다시 만들려면

`segno`(파이썬, 의존성 없음)로 생성했다. 설치 없이 휠만 받아 쓰는 방식:

```bash
python3 -m pip download segno -d /tmp/qrwheel --no-deps -q
python3 - <<'PY'
import sys, glob
sys.path.insert(0, glob.glob("/tmp/qrwheel/segno-*.whl")[0])
import segno
q = segno.make("https://soondoree07.github.io/jbae-portfolio/", error='h')
q.save("jbae-qr-sand.svg", scale=10, border=4, dark="#3A332A", light="#F2ECE1")
PY
```
