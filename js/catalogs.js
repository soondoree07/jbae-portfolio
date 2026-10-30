/* 전시 도록 목록 — catalogs.json 의 도록마다 앞표지와 이름을 한 칸씩 놓는다.
   누르면 그 도록(catalog.html?id=…)이 열린다. */

import { esc } from './data.js';
import { revealOnScroll, stickyMasthead } from './motion.js';
import { showArchiveLink } from './writing-data.js';

const LIST = 'catalogs.json';

function bookHTML(entry){
  return `
    <li class="shelf-item reveal">
      <a class="shelf-link" href="catalog.html?id=${encodeURIComponent(entry.id)}">
        <span class="shelf-cover"><img src="${esc(entry.cover)}" alt="${esc(entry.name)} 도록 표지" loading="lazy"></span>
        <span class="shelf-name">${esc(entry.name)}</span>
        <span class="shelf-title">${esc(entry.title || '')}</span>
      </a>
    </li>`;
}

async function start(){
  stickyMasthead();
  showArchiveLink();
  const shelf = document.querySelector('.shelf');
  try{
    const res = await fetch(LIST);
    if(!res.ok) throw new Error(`${LIST} 을 불러오지 못했습니다`);
    const list = await res.json();
    shelf.innerHTML = list.catalogs.map(bookHTML).join('');
    revealOnScroll();
  }catch(err){
    shelf.innerHTML = '<li class="shelf-error">도록 목록을 불러오지 못했어요. 잠시 후 새로고침해 주세요.</li>';
    console.error(err);
  }
}

start();
