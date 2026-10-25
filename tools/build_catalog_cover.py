"""도록 표지 그림을 만든다.

인쇄용 '도록 표지2.pdf'(펼친 표지 375.5×240mm)를 그림으로 바꿔
오른쪽 185mm 는 앞표지, 왼쪽 185mm 는 뒤표지로 자른다(가운데 책등은 버린다).
뒤표지 왼쪽 아래의 옛 QR(qrfy.io 단축 주소, 2026-10-25 에 이미 죽어 있었다)을 지우고
인스타그램 · 포트폴리오 사이트 QR 을 나란히 넣는다.

필요한 것: pip install pymupdf qrcode pillow opencv-python-headless
          Pretendard-Regular.otf (https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/public/static/)
사용: python3 tools/build_catalog_cover.py <도록 표지2.pdf> <Pretendard-Regular.otf>
"""
import sys
from pathlib import Path

import cv2
import numpy as np
import pymupdf
import qrcode
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent.parent / 'images' / 'catalog'
DPI = 254                      # 1mm = 10px
PX_PER_MM = DPI / 25.4
PAGE_MM = 185
QR_LINKS = [('https://www.instagram.com/artist_jbae/', 'Instagram', 'qr-insta.png'),
            ('https://jbae.art', 'jbae.art', 'qr-site.png')]
INK = (77, 77, 79)             # 내지 글자색 #4d4d4f


def px(mm):
    return round(mm * PX_PER_MM)


def render_spread(pdf_path):
    pix = pymupdf.open(pdf_path)[0].get_pixmap(dpi=DPI)
    return Image.frombytes('RGB', (pix.width, pix.height), pix.samples)


def make_qr(url):
    code = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=0, box_size=10)
    code.add_data(url)
    code.make()
    return code.make_image(fill_color=(30, 30, 30), back_color='white').convert('RGB')


def place_qr_codes(back, font):
    """옛 QR 자리(가로 12mm, 세로 약 203mm)에 13mm QR 둘을 19mm 간격으로 놓고 아래에 이름을 단다."""
    draw = ImageDraw.Draw(back)
    draw.rectangle((px(10), px(200), px(30), px(218.5)), fill='white')
    side, pad, top = px(13), px(1.2), px(199.5)
    for i, (url, label, filename) in enumerate(QR_LINKS):
        code = make_qr(url)
        code.save(OUT / filename)
        left = px(12 + i * 19)
        draw.rounded_rectangle((left, top, left + side, top + side), radius=px(1.2),
                               outline=(205, 205, 205), width=3, fill='white')
        back.paste(code.resize((side - 2 * pad, side - 2 * pad), Image.NEAREST), (left + pad, top + pad))
        width = draw.textlength(label, font=font)
        draw.text((left + (side - width) / 2, top + side + px(.9)), label, font=font, fill=INK)
    return side, top


def check_qr_codes(back, side, top):
    """넣은 QR 이 실제로 읽히는지 확인한다. 하나라도 안 읽히면 멈춘다."""
    detector = cv2.QRCodeDetector()
    image = cv2.cvtColor(np.array(back), cv2.COLOR_RGB2BGR)
    for i, (url, _, _) in enumerate(QR_LINKS):
        left = px(12 + i * 19) - 20
        found = detector.detectAndDecode(image[top - 20:top + side + 20, left:left + side + 40])[0]
        if found != url:
            sys.exit(f'QR 을 읽지 못했어요: {url} → {found!r}')
        print('QR 확인', found)


def main(pdf_path, font_path):
    OUT.mkdir(parents=True, exist_ok=True)
    spread = render_spread(pdf_path)
    width, height = spread.size
    back = spread.crop((0, 0, px(PAGE_MM), height))
    front = spread.crop((width - px(PAGE_MM), 0, width, height))
    side, top = place_qr_codes(back, ImageFont.truetype(font_path, px(2.3)))
    check_qr_codes(back, side, top)
    back.save(OUT / 'cover-back.jpg', quality=88)
    front.save(OUT / 'cover-front.jpg', quality=88)


if __name__ == '__main__':
    main(*sys.argv[1:3])
