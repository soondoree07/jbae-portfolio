/* 작품 펼침면 배치 — 인쇄 도록 '도록 내지.pdf'(2024 한가람 전시)의 자리를 그대로 따른다.
   모든 치수는 펼친 두 쪽(370×240mm) 위의 mm 다. 그림 비율에 맞춰 상자 안에 꽉 차게 맞춘다.
   어느 작품을 어떤 배치에 놓을지는 catalog.json 의 spreads 가 정한다. */

export const SPREAD_W = 370;
export const PAGE_W = 185;
export const PAGE_H = 240;

const EDGE = 8;                 // 바깥 여백
const OUTER = SPREAD_W - EDGE;  // 오른쪽 끝 362mm
const CAPTION_GAP = 1.8;        // 그림 아래 캡션까지

/** 비율(가로/세로)을 지키며 상자(maxW × maxH)에 들어가는 가장 큰 크기 */
function fit(ratio, maxW, maxH){
  const h = Math.min(maxH, maxW / ratio);
  return {w: h * ratio, h};
}

/**
 * 그림 한 점의 자리. side 는 캡션을 붙일 쪽 — 왼쪽에 붙은 그림은 캡션도 왼쪽 정렬, 오른쪽이면 오른쪽 정렬.
 */
function place(work, x, y, size, side){
  return {work, x, y, w:size.w, h:size.h, side};
}

/** 펼친 두 쪽을 가로질러 크게 한 점 (내지 3·6·8·10·13·16·17·19쪽) */
function big(works, align){
  const [a] = works;
  const size = fit(a.ratio, OUTER - EDGE, 212);
  const x = align === 'left' ? EDGE : OUTER - size.w;
  const y = EDGE + (212 - size.h) / 2;
  return [place(a, x, y, size, align === 'left' ? 'left' : 'right')];
}

/**
 * 두 점을 같은 높이로 양쪽에 (내지 4·7·9·11·15쪽). 파노라마 둘도 이 배치를 쓴다.
 * 한 점만 적으면 왼쪽 자리에만 놓는다 — 크기·높이가 다른 pair 펼침면과 같아 보인다.
 */
function pair(works){
  return sideBySide(works, {maxW:170, maxH:130, top:25});
}

/** 세로 그림 둘을 쪽마다 하나씩, 같은 높이로 크게 */
function portraits(works){
  return sideBySide(works, {maxW:160, maxH:209, top:11});
}

/** 왼쪽 쪽 바깥에 붙인 그림 하나, 오른쪽 쪽 바깥에 붙인 그림 하나. 둘의 높이를 맞춘다. */
function sideBySide(works, {maxW, maxH, top}){
  const [a, b] = works;
  const h = Math.min(maxH, ...works.map(w => maxW / w.ratio));
  const slots = [place(a, EDGE, top, {w:h * a.ratio, h}, 'left')];
  if(b) slots.push(place(b, OUTER - h * b.ratio, top, {w:h * b.ratio, h}, 'right'));
  return slots;
}

/** 왼쪽 쪽에 세로 그림, 오른쪽 쪽 위에 가로 그림 (내지 14쪽을 좌우로 뒤집은 꼴) */
function portraitLeft(works){
  const [tall, wide] = works;
  const tallSize = fit(tall.ratio, 160, 209);
  const wideSize = fit(wide.ratio, 166, 130);
  return [
    place(tall, EDGE, 11, tallSize, 'left'),
    place(wide, OUTER - wideSize.w, 20, wideSize, 'right'),
  ];
}

/** 오른쪽 쪽에만 한 점 (내지 2쪽). 왼쪽 쪽은 작가 노트이거나 비워 둔다. */
function right(works){
  const [a] = works;
  const size = fit(a.ratio, 157, 216.6);
  const y = EDGE + (216.6 - size.h) / 2;
  return [place(a, OUTER - size.w, y, size, 'right')];
}

const LAYOUTS = {big, pair, portraits, 'portrait-left':portraitLeft, right};

/** spreads 항목 하나 → 그림 자리 목록 */
export function layoutSpread(spread, works){
  const chosen = spread.works.map(n => works[n - 1]);
  if(chosen.some(w => !w)) throw new Error(`spreads 의 작품 번호가 works 에 없어요: ${spread.works}`);
  const layout = LAYOUTS[spread.layout];
  if(!layout) throw new Error(`모르는 배치예요: ${spread.layout}`);
  return layout(chosen, spread.align);
}

export function captionTop(slot){
  return slot.y + slot.h + CAPTION_GAP;
}
