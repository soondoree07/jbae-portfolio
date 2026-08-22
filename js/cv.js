/* 약력. 줄마다 "연도 / 이름 / 장소" 세 덩어리가 두 칸 이상 띄어쓰기로 나뉘어 있다.
   단체전은 70줄이라 기본으로 접어 둔다. */

import { esc } from './data.js';

const BLOCKS = [
  { key:'education',        title:'학력',              open:true  },
  { key:'soloExhibitions',  title:'개인전',            open:true  },
  { key:'groupExhibitions', title:'단체전 및 아트페어', open:false },
  { key:'awards',           title:'수상',              open:true  },
  { key:'teaching',         title:'강의',              open:true  },
  { key:'collections',      title:'작품 소장',         open:true, tags:true },
];

const rowHTML = (line) => {
  const [year, name, place] = String(line).trim().split(/\s{2,}/);
  if(!name) return `<li class="cv-row is-plain"><span class="yr">${esc(year)}</span></li>`;
  return `<li class="cv-row${place ? '' : ' is-plain'}">
      <span class="yr">${esc(year)}</span>
      <span>${esc(name)}</span>
      ${place ? `<span class="place">${esc(place)}</span>` : ''}
    </li>`;
};

const tagsHTML = (items) =>
  `<ul class="cv-tags">${items.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;

export function renderCV(cv, mount){
  if(!cv || !mount) return;
  mount.innerHTML = BLOCKS.map((block, i) => {
    const items = cv[block.key];
    if(!items || !items.length) return '';
    const id = `cv-panel-${i}`;
    const body = block.tags
      ? tagsHTML(items)
      : `<ul class="cv-list" id="${id}">${items.map(rowHTML).join('')}</ul>`;
    return `
      <section class="cv-block reveal" data-collapsed="${!block.open}">
        <button class="cv-head" type="button" aria-expanded="${block.open}" aria-controls="${id}">
          <h3>${esc(block.title)}</h3>
          <span class="cv-meta">
            <span class="cv-count">${items.length}</span>
            <span class="cv-mark" aria-hidden="true"></span>
          </span>
        </button>
        ${block.tags ? `<div id="${id}">${body}</div>` : body}
      </section>`;
  }).join('');

  mount.addEventListener('click', (e) => {
    const head = e.target.closest('.cv-head');
    if(!head) return;
    const block = head.closest('.cv-block');
    const collapsed = block.dataset.collapsed === 'true';
    block.dataset.collapsed = String(!collapsed);
    head.setAttribute('aria-expanded', String(collapsed));
  });
}
