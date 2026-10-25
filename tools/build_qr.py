"""사이트 QR(docs/qr/jbae-qr*)과 같은 모양의 QR 을 만든다 — 29×29 격자, 가운데 11×11 모듈 나비 판.

오류 정정은 H(30%까지 복원). 나비 판은 비율이 아니라 모듈 수로 잡아 격자에 딱 맞춘다.
주소가 길면 격자가 커지므로 짧은 주소를 쓴다(https://jbae.art/catalog 는 24자라 29×29 에 들어간다).
만든 뒤 세 장 모두 다시 읽어서 주소가 맞는지 확인한다.

필요한 것: pip install qrcode pillow opencv-python-headless
사용: python3 tools/build_qr.py <주소> <저장 폴더> <파일 이름 앞부분>
예:   python3 tools/build_qr.py https://jbae.art/catalog docs/qr catalog-qr
"""
import sys
from pathlib import Path

import cv2
import numpy as np
import qrcode
from PIL import Image, ImageChops

LOGO = Path(__file__).resolve().parent.parent / 'docs' / 'qr' / 'nabi-logo.png'
MODULE_PX = 48            # 사이트 QR 과 같은 1776px(37모듈 × 48)
QUIET = 4                 # 둘레 여백(모듈)
PLATE = 11                # 가운데 비우는 판(모듈, 홀수)
LOGO_SHARE = 0.74         # 판 안에서 나비가 차지하는 폭
STYLES = {                # 이름: (바탕, 코드)
    '':        ((242, 236, 225), (58, 51, 42)),   # 사이트 무드 '자연 결'
    '-mono':   ((255, 255, 255), (0, 0, 0)),
}


def matrix(url):
    code = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, border=0)
    code.add_data(url)
    code.make(fit=True)
    return code.get_matrix()


def draw(cells, paper, ink, with_logo):
    size = len(cells)
    side = (size + 2 * QUIET) * MODULE_PX
    image = Image.new('RGB', (side, side), paper)
    start = (size - PLATE) // 2
    for y, row in enumerate(cells):
        for x, dark in enumerate(row):
            in_plate = start <= x < start + PLATE and start <= y < start + PLATE
            if dark and not (with_logo and in_plate):
                left, top = (x + QUIET) * MODULE_PX, (y + QUIET) * MODULE_PX
                image.paste(ink, (left, top, left + MODULE_PX, top + MODULE_PX))
    if with_logo:
        plate_px = PLATE * MODULE_PX
        logo_px = round(plate_px * LOGO_SHARE)
        logo = Image.open(LOGO).convert('RGB').resize((logo_px, logo_px), Image.LANCZOS)
        corner = (start + QUIET) * MODULE_PX + (plate_px - logo_px) // 2
        box = (corner, corner, corner + logo_px, corner + logo_px)
        # 나비 그림의 흰 바탕이 종이색에 스며들게 곱하기로 얹는다
        image.paste(ImageChops.multiply(image.crop(box), logo), box[:2])
    return image


def check(path, url):
    """휴대폰 화면에 잡히는 크기에 가깝게 줄여서 읽는다.
    OpenCV 는 1776px 원본 그대로는 나비 판이 있는 코드를 자주 못 찾는다(사이트 QR 도 같다)."""
    image = cv2.imread(str(path))
    detector = cv2.QRCodeDetector()
    for side in (600, 300):
        small = cv2.resize(image, (side, side), interpolation=cv2.INTER_AREA)
        found = detector.detectAndDecode(small)[0]
        if found != url:
            sys.exit(f'QR 을 읽지 못했어요: {path.name} ({side}px) → {found!r}')
    print('확인', path.name, url)


def main(url, out_dir, prefix):
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    cells = matrix(url)
    print(f'{len(cells)}×{len(cells)} 모듈')
    jobs = [(f'{prefix}{suffix}.png', colors, True) for suffix, colors in STYLES.items()]
    jobs.append((f'{prefix}-plain.png', STYLES[''], False))
    for name, (paper, ink), with_logo in jobs:
        path = out / name
        draw(cells, paper, ink, with_logo).save(path, dpi=(300, 300))
        check(path, url)


if __name__ == '__main__':
    main(*sys.argv[1:4])
