/* 전시 도록 — 책처럼 넘겨 보는 화면.
   쪽 넘김은 StPageFlip(js/vendor) 이 맡고, 여기서는 쪽 만들기 · 쪽 번호 · 넘김 단추를 잇는다.
   그림자는 쓰지 않는다. 라이브러리의 그늘도 전부 끈다. */

import { buildPages, withFolio } from './catalog-pages.js';
import { bindTools } from './catalog-tools.js';

const SOURCE = 'catalog.json';
// A4 세로 비율. 실제 크기는 화면에 맞춰 늘고 준다.
const PAGE_W = 595;
const PAGE_H = 842;
// 한 쪽 폭이 이보다 좁아지면(=화면 폭이 두 배 미만) 펼침면 대신 한 쪽씩 보여 준다.
const SINGLE_PAGE_BELOW = 300;
// 넘기는 동작이 도록의 핵심이라, 윈도우 애니메이션 효과를 꺼 둔(동작 줄이기) 화면에서도 그대로 둔다
const FLIP_TIME = 700;

async function loadCatalog(){
  const res = await fetch(SOURCE);
  if(!res.ok) throw new Error('도록 자료를 불러오지 못했습니다');
  return res.json();
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
  bookEl.innerHTML = pages.map((p, i) => withFolio(p, i, pages.length)).join('');
  return bookEl.querySelectorAll('.cat-page');
}

function createBook(bookEl, startPage){
  return new window.St.PageFlip(bookEl, {
    width:PAGE_W, height:PAGE_H,
    size:'stretch', autoSize:false,
    minWidth:SINGLE_PAGE_BELOW, maxWidth:1200, minHeight:200, maxHeight:1700,
    showCover:true, usePortrait:true,
    drawShadow:false, maxShadowOpacity:0,
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
  const catalog = await loadCatalog();
  const pages = buildPages(catalog);
  const bookEl = document.querySelector('.cat-book');
  const pageEls = renderPages(bookEl, pages);

  const book = createBook(bookEl, pageFromHash(pages.length));
  book.loadFromHTML(pageEls);

  bindCounter(book);
  bindMoves(book);
  bindTools(book, pages, visibleRange);
}

init().catch(err => {
  document.querySelector('.cat-book').innerHTML =
    '<p class="cat-error">도록을 불러오지 못했어요. 잠시 후 새로고침해 주세요.</p>';
  console.error(err);
});
