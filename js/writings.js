/* 기록 목록 — writings.json 의 글마다 한 줄. 종류 · 제목 · 글쓴이 · 실린 곳 · 날짜, 사진이 있으면 오른쪽에 작게.
   누르면 그 글(writing.html?id=…)이 열린다. */

import { esc } from './data.js';
import { revealOnScroll, stickyMasthead } from './motion.js';
import { loadWritings, showArchiveLink, writingMeta } from './writing-data.js';

function rowHTML(entry){
  return `
    <li class="writing-item reveal">
      <a class="writing-link" href="writing.html?id=${encodeURIComponent(entry.id)}">
        <span class="writing-kind">${esc(entry.kind)}</span>
        <span class="writing-title">${esc(entry.title)}</span>
        <span class="writing-meta">${esc(writingMeta(entry))}</span>
        ${entry.image ? `<span class="writing-thumb"><img src="${esc(entry.image)}" alt="" loading="lazy"></span>` : ''}
      </a>
    </li>`;
}

async function start(){
  stickyMasthead();
  showArchiveLink();
  const list = document.querySelector('.writing-list');
  try{
    const writings = await loadWritings();
    list.innerHTML = writings.length
      ? writings.map(rowHTML).join('')
      : '<li class="load-error">아직 올린 기록이 없어요. 평론과 기사가 모이면 여기에 올려 둘게요.</li>';
    revealOnScroll();
  }catch(err){
    list.innerHTML = '<li class="load-error">기록을 불러오지 못했어요. 잠시 후 새로고침해 주세요.</li>';
    console.error(err);
  }
}

start();
