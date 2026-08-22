/* 작품 하나를 크게 보는 화면.
   누른 자리에서 자라나듯 열리고, 좌우·키보드·스와이프로 넘긴다. */

import { esc, titleHTML } from './data.js';
import { prefersStillness } from './motion.js';

let works = [];
let at = 0;
let opener = null;      // 열기 직전 눌렀던 버튼 — 닫을 때 초점을 돌려준다
let root, stage, elTitle, elMeta, elDesc, elCount;

export function setupViewer(list){
  works = list;
  root    = document.querySelector('.viewer');
  stage   = root.querySelector('.viewer-stage');
  elTitle = root.querySelector('.viewer-title');
  elMeta  = root.querySelector('.viewer-meta');
  elDesc  = root.querySelector('.viewer-desc');
  elCount = root.querySelector('.viewer-count');

  root.querySelector('.viewer-close').addEventListener('click', close);
  root.querySelector('[data-step="prev"]').addEventListener('click', () => step(-1));
  root.querySelector('[data-step="next"]').addEventListener('click', () => step(1));
  root.addEventListener('click', e => { if(e.target === root) close(); });

  document.addEventListener('keydown', e => {
    if(!root.hasAttribute('open')) return;
    if(e.key === 'Escape')     close();
    if(e.key === 'ArrowLeft')  step(-1);
    if(e.key === 'ArrowRight') step(1);
    if(e.key === 'Tab')        trapFocus(e);
  });

  let touchX = 0;
  root.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, {passive:true});
  root.addEventListener('touchend', e => {
    const moved = e.changedTouches[0].clientX - touchX;
    if(Math.abs(moved) > 50) step(moved < 0 ? 1 : -1);
  }, {passive:true});
}

export function open(index, fromElement){
  at = index;
  opener = fromElement || document.activeElement;
  paint();
  root.setAttribute('open', '');
  document.body.classList.add('is-locked');
  root.querySelector('.viewer-close').focus();
  growFrom(fromElement);
}

function close(){
  root.removeAttribute('open');
  document.body.classList.remove('is-locked');
  stage.innerHTML = '';
  if(opener) opener.focus();
}

function step(direction){
  at = (at + direction + works.length) % works.length;
  paint();
}

function paint(){
  const work = works[at];
  if(!work) return;
  stage.innerHTML = `<img src="${esc(work.image)}" alt="${esc(work.title)}"
    ${work.w ? `width="${work.w}" height="${work.h}"` : ''}>`;
  elTitle.innerHTML = titleHTML(work.title);
  elMeta.textContent = [work.material, work.size].filter(Boolean).join(' · ');
  elDesc.textContent = work.description || '';
  elCount.textContent = `${at + 1} / ${works.length}`;
}

/** 눌렀던 썸네일 자리에서 큰 이미지가 자라나오게 한다. */
function growFrom(source){
  if(!source || prefersStillness()) return;
  const image = stage.querySelector('img');
  const from = source.getBoundingClientRect();
  if(!image || !from.width) return;
  const run = () => {
    const to = image.getBoundingClientRect();
    if(!to.width) return;
    image.animate([
      { transformOrigin:'center',
        transform:`translate(${from.left + from.width/2 - (to.left + to.width/2)}px,
                             ${from.top + from.height/2 - (to.top + to.height/2)}px)
                   scale(${from.width / to.width})`,
        opacity:.4 },
      { transform:'none', opacity:1 }
    ], { duration:460, easing:'cubic-bezier(.2,.7,.3,1)' });
  };
  image.complete ? run() : image.addEventListener('load', run, {once:true});
}

/** 열려 있는 동안 초점이 뒤쪽 화면으로 새어나가지 않게 묶어둔다. */
function trapFocus(event){
  const stops = root.querySelectorAll('button');
  if(!stops.length) return;
  const first = stops[0], last = stops[stops.length - 1];
  if(event.shiftKey && document.activeElement === first){
    event.preventDefault(); last.focus();
  } else if(!event.shiftKey && document.activeElement === last){
    event.preventDefault(); first.focus();
  }
}
