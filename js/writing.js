/* 글 한 편 — 제목 · 한 줄 정보 · 사진(선택) · 문단, 끝에 원문 링크와 앞뒤 글. */

import { esc } from './data.js';
import { stickyMasthead } from './motion.js';
import { loadWritings, showArchiveLink, writingMeta } from './writing-data.js';

const pick = (sel) => document.querySelector(sel);

function stepHTML(entry, direction){
  if(!entry) return '<span></span>';
  return `
    <a class="reading-step is-${direction}" href="writing.html?id=${encodeURIComponent(entry.id)}">
      <span class="reading-step-label">${direction === 'prev' ? '이전 글' : '다음 글'}</span>
      <span class="reading-step-title">${esc(entry.title)}</span>
    </a>`;
}

async function start(){
  stickyMasthead();
  showArchiveLink();
  const id = new URLSearchParams(location.search).get('id');
  const writings = await loadWritings().catch(() => []);
  const index = writings.findIndex(w => w.id === id);
  if(index < 0){ location.replace('writings.html'); return; }
  const entry = writings[index];

  document.title = `${entry.title} | 배정혜 J.Bae`;
  pick('.reading-kind').textContent = entry.kind || '';
  pick('.reading-title').textContent = entry.title;
  pick('.reading-meta').textContent = writingMeta(entry);
  /* 글마다 사진 한 장(선택). 기사 지면 · 전시 전경 · 작업실 사진 등 */
  if(entry.image){
    const figure = pick('.reading-figure');
    figure.innerHTML = `<img src="${esc(entry.image)}" alt="${esc(entry.imageCaption || entry.title)}">`
      + (entry.imageCaption ? `<figcaption>${esc(entry.imageCaption)}</figcaption>` : '');
    figure.hidden = false;
  }
  pick('.reading-body').innerHTML = (entry.body || []).map(p => `<p>${esc(p)}</p>`).join('');

  const source = pick('.reading-source');
  if(entry.link){
    source.innerHTML = `<a href="${esc(entry.link)}" target="_blank" rel="noopener">원문 보기 ↗</a>`;
  }else source.remove();

  pick('.reading-steps').innerHTML =
    stepHTML(writings[index - 1], 'prev') + stepHTML(writings[index + 1], 'next');
}

start();
