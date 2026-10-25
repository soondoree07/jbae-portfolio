/* 도록 도구 줄의 넘김 말고 나머지 — 모아보기 · 자동 넘기기 · 크게 보기 · 전체 화면 · 링크 복사.
   좁은 화면에서는 이것들을 '더 보기' 메뉴 안에 접어 둔다. */

import { writeToClipboard } from './copy.js';
import { pageHTML } from './catalog-v1-pages.js';

const AUTOPLAY_EVERY = 3500;
const TOAST_FOR = 2200;

/* ---------- 알림 한 줄 ---------- */
let toastTimer = null;
function toast(message){
  const el = document.querySelector('.cat-toast');
  el.textContent = message;
  el.classList.add('is-shown');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-shown'), TOAST_FOR);
}

/* ---------- 덮는 창(모아보기 · 크게 보기) ---------- */
function openPanel(panel){
  panel.hidden = false;
  panel.querySelector('[data-act="close"]').focus();
}
function closePanels(){
  document.querySelectorAll('.cat-thumbs, .cat-zoom').forEach(p => { p.hidden = true; });
}

/* ---------- 더 보기 메뉴 ---------- */
function setMoreOpen(open){
  const toggle = document.querySelector('.cat-more-toggle');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.closest('.cat-more').classList.toggle('is-open', open);
}

/* ---------- 모아보기 ---------- */
function thumbSheet(pageInfo){
  const img = pageInfo.inner.match(/<img src="([^"]+)"/);
  return img ? `<img src="${img[1]}" alt="" loading="lazy">` : `<span>${pageInfo.label}</span>`;
}

function fillThumbs(pages){
  document.querySelector('.cat-thumb-list').innerHTML = pages.map((p, i) => `
    <li><button class="cat-thumb" type="button" data-page="${i}" aria-label="${i + 1}쪽, ${p.label}">
      <span class="cat-thumb-sheet">${thumbSheet(p)}</span>
      <span class="cat-thumb-num">${i + 1}</span>
    </button></li>`).join('');
}

function showThumbs(book, visibleRange){
  const [from, to] = visibleRange(book);
  document.querySelectorAll('.cat-thumb').forEach(btn => {
    const index = Number(btn.dataset.page);
    btn.classList.toggle('is-current', index >= from && index <= to);
  });
  openPanel(document.querySelector('.cat-thumbs'));
}

/* ---------- 크게 보기: 지금 보이는 쪽을 크게 복제해 띄운다 ---------- */
function showZoom(book, pages, visibleRange){
  const [from, to] = visibleRange(book);
  const shown = pages.slice(from, to + 1).map((_, i) => pageHTML(pages, from + i));
  const sheet = document.querySelector('.cat-zoom-sheet');
  sheet.innerHTML = shown.join('');
  sheet.classList.toggle('is-spread', shown.length > 1);
  openPanel(document.querySelector('.cat-zoom'));
}

/* ---------- 자동 넘기기 ---------- */
function makeAutoplay(book){
  const button = document.querySelector('[data-act="autoplay"]');
  let timer = null;
  const stop = () => {
    clearInterval(timer);
    timer = null;
    button.setAttribute('aria-pressed', 'false');
  };
  const atEnd = () => book.getCurrentPageIndex() >= book.getPageCount() - (book.getOrientation() === 'landscape' ? 2 : 1);
  const start = () => {
    if(atEnd()) book.turnToPage(0);
    button.setAttribute('aria-pressed', 'true');
    timer = setInterval(() => (atEnd() ? stop() : book.flipNext()), AUTOPLAY_EVERY);
  };
  return { toggle: () => (timer ? stop() : start()), stop };
}

/* ---------- 전체 화면 ---------- */
function toggleFullscreen(){
  if(document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen().catch(() => toast('이 브라우저에서는 전체 화면을 쓸 수 없어요'));
}

async function shareLink(){
  const ok = await writeToClipboard(location.href);
  toast(ok ? '링크를 복사했어요' : '주소창의 링크를 직접 복사해 주세요');
}

export function bindTools(book, pages, visibleRange){
  fillThumbs(pages);
  const autoplay = makeAutoplay(book);
  // 아이폰 사파리처럼 전체 화면을 막아 둔 곳에서는 단추를 감춘다
  if(!document.fullscreenEnabled) document.querySelector('[data-act="fullscreen"]').hidden = true;

  const actions = {
    thumbs:     () => { autoplay.stop(); showThumbs(book, visibleRange); },
    autoplay:   () => autoplay.toggle(),
    zoom:       () => { autoplay.stop(); showZoom(book, pages, visibleRange); },
    fullscreen: toggleFullscreen,
    share:      shareLink,
    close:      closePanels,
  };

  document.addEventListener('click', (e) => {
    const moreToggle = e.target.closest('.cat-more-toggle');
    if(moreToggle){ setMoreOpen(moreToggle.getAttribute('aria-expanded') !== 'true'); return; }
    if(!e.target.closest('.cat-more')) setMoreOpen(false);

    const thumb = e.target.closest('.cat-thumb');
    if(thumb){ book.turnToPage(Number(thumb.dataset.page)); closePanels(); return; }

    const trigger = e.target.closest('[data-act]');
    const action = trigger && actions[trigger.dataset.act];
    if(!action) return;
    if(trigger.closest('.cat-extra')) setMoreOpen(false);
    action();
  });

  // 덮는 창 바깥 바탕을 누르거나 Esc 를 누르면 닫는다
  document.querySelectorAll('.cat-thumbs, .cat-zoom').forEach(panel => {
    panel.addEventListener('click', (e) => { if(e.target === panel) closePanels(); });
  });
  document.addEventListener('keydown', (e) => {
    if(e.key !== 'Escape') return;
    closePanels();
    setMoreOpen(false);
  });
}
