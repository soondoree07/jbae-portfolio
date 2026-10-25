/* 전시 도록 — 책처럼 넘겨 보는 화면.
   쪽 넘김은 StPageFlip(js/vendor) 이 맡고, 여기서는 쪽 만들기 · 쪽 번호 · 넘김 단추를 잇는다.
   그림자는 쓰지 않는다. 라이브러리의 그늘도 전부 끈다. */

import { buildPages, pageHTML } from './catalog-pages.js';
import { bindTools } from './catalog-tools.js';
import { enableMiddleGrab, showThroughWhileTurning, fixHardPageOffset } from './catalog-turn.js';

const SOURCE = 'catalog.json';
// 작품 그림의 가로·세로(실측)는 사이트 자료에 있다. 두 곳에 따로 적지 않는다.
const SITE_DATA = 'data.json';
// 인쇄 도록 내지와 같은 185×240mm 비율. 실제 크기는 화면에 맞춰 늘고 준다.
const PAGE_W = 555;
const PAGE_H = 720;
// 한 쪽 폭이 이보다 좁아지면(=화면 폭이 두 배 미만) 펼침면 대신 한 쪽씩 보여 준다.
const SINGLE_PAGE_BELOW = 300;
// 넘기는 동작이 도록의 핵심이라, 윈도우 애니메이션 효과를 꺼 둔(동작 줄이기) 화면에서도 그대로 둔다
const FLIP_TIME = 700;

async function loadJSON(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error(`${url} 을 불러오지 못했습니다`);
  return res.json();
}

/** 이미지 주소 → 가로/세로 비율 */
function imageRatios(site){
  const ratios = new Map();
  for(const year of site.years || []){
    for(const w of year.works || []){
      if(w.image && w.w && w.h) ratios.set(w.image, w.w / w.h);
    }
  }
  return ratios;
}

/** 주소 끝의 #p=5 를 읽어 그 쪽에서 시작한다. 링크로 특정 쪽을 바로 보여 줄 수 있다. */
function pageFromHash(total){
  const found = location.hash.match(/p=(\d+)/);
  if(!found) return 0;
  return Math.min(Math.max(Number(found[1]) - 1, 0), total - 1);
}

function writeHash(index){
  history.replaceState(null, '', `#p=${index + 1}`);
}

function renderPages(bookEl, pages){
  bookEl.innerHTML = pages.map((_, i) => pageHTML(pages, i)).join('');
  return bookEl.querySelectorAll('.cat-page');
}

function createBook(bookEl, startPage){
  return new window.St.PageFlip(bookEl, {
    width:PAGE_W, height:PAGE_H,
    size:'stretch', autoSize:false,
    minWidth:SINGLE_PAGE_BELOW, maxWidth:1200, minHeight:200, maxHeight:1700,
    showCover:true, usePortrait:true,
    drawShadow:false, maxShadowOpacity:0,
    showPageCorners:false,  // 꼭짓점에 마우스만 올려도 접히지 않게 — 누를 때만 잡힌다
    flippingTime:FLIP_TIME, startPage,
  });
}

/** 펼침면이면 "2–3", 한 쪽이면 "1" 처럼 지금 보이는 쪽을 적는다. */
function visibleRange(book){
  const index = book.getCurrentPageIndex();
  const total = book.getPageCount();
  const spread = book.getOrientation() === 'landscape' && index > 0 && index < total - 1;
  return spread ? [index, Math.min(index + 1, total - 1)] : [index, index];
}

function bindCounter(book){
  const input = document.querySelector('.cat-count-input');
  const totalEl = document.querySelector('.cat-count-total');
  const sides = document.querySelectorAll('.cat-side');

  const sync = () => {
    const [from, to] = visibleRange(book);
    const total = book.getPageCount();
    input.value = from === to ? `${from + 1}` : `${from + 1}–${to + 1}`;
    totalEl.textContent = `/ ${total}`;
    sides[0].disabled = from === 0;
    sides[1].disabled = to >= total - 1;
    writeHash(from);
  };

  input.addEventListener('focus', () => input.select());
  input.addEventListener('change', () => {
    const wanted = parseInt(input.value, 10);
    if(Number.isFinite(wanted)) book.turnToPage(Math.min(Math.max(wanted - 1, 0), book.getPageCount() - 1));
    sync();
    input.blur();
  });

  book.on('flip', sync);
  book.on('changeOrientation', sync);
  sync();
}

const MOVES = {
  first: book => book.turnToPage(0),
  prev:  book => book.flipPrev(),
  next:  book => book.flipNext(),
  last:  book => book.turnToPage(book.getPageCount() - 1),
};

function bindMoves(book){
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-act]');
    const move = trigger && MOVES[trigger.dataset.act];
    if(!move) return;
    move(book);
  });

  document.addEventListener('keydown', (e) => {
    if(e.target.closest('input') || document.querySelector('.cat-thumbs:not([hidden]), .cat-zoom:not([hidden])')) return;
    const keyMove = {ArrowLeft:'prev', ArrowRight:'next', Home:'first', End:'last'}[e.key];
    if(!keyMove) return;
    e.preventDefault();
    MOVES[keyMove](book);
  });
}

async function init(){
  const [catalog, site] = await Promise.all([loadJSON(SOURCE), loadJSON(SITE_DATA)]);
  const pages = buildPages(catalog, imageRatios(site));
  const bookEl = document.querySelector('.cat-book');
  const pageEls = renderPages(bookEl, pages);

  const book = createBook(bookEl, pageFromHash(pages.length));
  book.loadFromHTML(pageEls);
  fixHardPageOffset(book);
  enableMiddleGrab(book);
  showThroughWhileTurning(book);

  bindCounter(book);
  bindMoves(book);
  bindTools(book, pages, visibleRange);
}

init().catch(err => {
  document.querySelector('.cat-book').innerHTML =
    '<p class="cat-error">도록을 불러오지 못했어요. 잠시 후 새로고침해 주세요.</p>';
  console.error(err);
});
