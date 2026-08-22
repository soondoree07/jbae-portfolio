"""작품 이미지의 실제 픽셀 크기를 재서 data.json에 넣고, 격자용 썸네일을 만든다.

크기를 미리 알아야 하는 이유:
  1. aspect-ratio를 지정할 수 있어 이미지 로딩 중 화면이 밀리지 않는다
  2. 가로로 긴 작품이 격자에서 몇 칸을 차지할지 계산할 수 있다
원본 JPEG는 건드리지 않는다. 라이트박스는 원본을 그대로 쓴다.
"""
import json, os, sys
from PIL import Image

THUMB_DIR = "images/thumb"
THUMB_BOX = (1200, 900)   # 이 상자 안에 들어가도록 축소. 파노라마도 가로 해상도가 남는다
QUALITY = 78


def thumb_path(src):
    stem, _ = os.path.splitext(src[len("images/"):])
    return f"{THUMB_DIR}/{stem}.webp"


def make_thumb(src, dst):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im = Image.open(src)
    w, h = im.size
    if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src):
        return w, h, False
    im = im.convert("RGB")
    im.thumbnail(THUMB_BOX, Image.LANCZOS)
    im.save(dst, "WEBP", quality=QUALITY, method=6)
    return w, h, True


def annotate(item, key="image"):
    """item[key] 이미지의 크기와 썸네일 경로를 item에 심는다."""
    src = item.get(key)
    if not src or src.startswith("http") or not os.path.exists(src):
        return 0
    dst = thumb_path(src)
    w, h, made = make_thumb(src, dst)
    item["w"], item["h"] = w, h
    item["thumb"] = dst
    return 1 if made else 0


def main():
    data = json.load(open("data.json", encoding="utf-8"))
    made = seen = 0
    for year in data["years"]:
        seen += 1
        annotate(year, "thumbnail")
        for work in year["works"]:
            made += annotate(work)
            for sub in work.get("works", []):
                made += annotate(sub)
    json.dump(data, open("data.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)
    print(f"시기 {seen}개 처리, 썸네일 {made}장 새로 생성")


if __name__ == "__main__":
    main()
