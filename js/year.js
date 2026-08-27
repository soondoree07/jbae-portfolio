/* 한 시기의 작품 전체 — 비율에 맞춰 놓은 격자 + 순서대로 보기 */

import { loadData, findChapter, flattenWorks, chapterLabel, spanOf, displayRatio, thumbOf, esc, titleText } from './data.js';
import { revealOnScroll, stickyMasthead } from './motion.js';
import { setupViewer, open as openViewer } from './lightbox.js';

const pick = (sel) => document.querySelector(sel);

function pieceHTML(work, index){
  /* 같은 크기의 작품이 같은 높이로 걸리도록 칸의 비율을 정해 준다 */
  const ratio = displayRatio(work);
  const shape = ratio ? ` style="--ratio:${ratio.toFixed(4)}"` : '';
  return `
    <figure class="piece reveal" data-span="${spanOf(work)}"${shape}>
      <button class="piece-plate" type="button" data-index="${index}"
              aria-label="${esc(work.title)} 크게 보기">
        <img src="${esc(thumbOf(work))}" alt="${esc(work.title)}" loading="lazy"
             ${work.w ? `width="${work.w}" height="${work.h}"` : ''}>
      </button>
      <figcaption class="piece-cap">
        <span class="piece-title" title="${titleText(work.title)}">${titleText(work.title)}</span>
        <span class="piece-meta">${esc([work.material, work.size].filter(Boolean).join(' · '))}</span>
      </figcaption>
    </figure>`;
}

async function start(){
  stickyMasthead();
  const id = new URLSearchParams(location.search).get('year');
  if(!id){ location.replace('index.html'); return; }

  const data = await loadData();
  const chapter = findChapter(data, id);
  if(!chapter){ location.replace('index.html'); return; }

  const works = flattenWorks(chapter);
  const label = chapterLabel(chapter);

  document.title = `${label} 작품 | ${data.artist.name}`;
  pick('.brand-ko').textContent = data.artist.name;
  pick('.brand-en').textContent = data.artist.nameEn;
  pick('.chapter-hero h1').textContent = label;
  /* 설명이 없는 시기가 여덟 곳이라, 비어 있으면 자리째 없앤다 */
  const blurb = pick('.chapter-hero p');
  if(chapter.description) blurb.textContent = chapter.description;
  else blurb.remove();

  const gallery = pick('.gallery');
  gallery.innerHTML = works.map(pieceHTML).join('');

  setupViewer(works);
  gallery.addEventListener('click', (e) => {
    const plate = e.target.closest('.piece-plate');
    if(plate) openViewer(Number(plate.dataset.index), plate);
  });
  pick('.start-tour').addEventListener('click', (e) => openViewer(0, e.currentTarget));

  revealOnScroll();
}

start();
