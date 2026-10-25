/* catalog.json 을 도록의 쪽(page) 하나하나로 바꾼다.
   짜임은 인쇄 도록 '도록 내지.pdf' 를 따른다 — 흰 종이, 가는 글씨, 작품 아래 한 줄 캡션.
   작품은 펼친 두 쪽 위에 놓고(js/catalog-layouts.js), 왼쪽·오른쪽 쪽이 그 절반씩을 보여 준다.
   값이 비어 있으면 흐린 자리 표시를 그린다. */

import { layoutSpread, captionTop } from './catalog-layouts.js';

function escapeHTML(text){
  return String(text).replace(/[&<>"']/g, ch => (
    {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]
  ));
}

/** 값이 있으면 그 글자, 없으면 흐린 자리 표시 글자 */
function textOr(value, placeholder){
  return value
    ? escapeHTML(value)
    : `<span class="cat-ph">${placeholder}</span>`;
}

function page(kind, inner, label){
  return {kind, label, inner};
}

/** mm 값을 CSS 변수로. 쪽 폭(185mm) 기준 비례라 화면 크기와 무관하게 같은 자리에 선다. */
const mm = value => `calc(${value.toFixed(2)} * var(--mm))`;

/* ---------- 표지 ---------- */

function coverPage(src, label){
  return page(label === '표지' ? 'cover' : 'back',
    `<img class="cat-cover-img" src="${escapeHTML(src)}" alt="${label}">`, label);
}

function blankPage(){
  return page('blank', '', '빈 쪽');
}

/* ---------- 속표지 · 작가 노트 · 약력 · 판권 ---------- */

/** 제목은 낱말마다 줄을 바꿔 세로로 쌓는다 (꿈결 / 물결 / 바람결) */
function stackedTitle(title){
  return title ? title.split(/\s+/).map(escapeHTML).join('<br>') : '<span class="cat-ph">전시 제목</span>';
}

function titlePage(info){
  return page('title', `
    <svg class="cat-tp-lines" viewBox="0 0 185 240" aria-hidden="true">
      <line x1="173" y1="0" x2="158" y2="26"/><line x1="133.6" y1="82" x2="122" y2="94.6"/>
    </svg>
    <h1 class="cat-tp-title">${stackedTitle(info.title)}</h1>
    <p class="cat-tp-artist">${textOr(info.artist, '작가')}</p>
    <div class="cat-tp-info">
      <p class="cat-tp-venue">${textOr(info.venue, '전시 장소')}</p>
      <p>${textOr(info.period, '전시 기간')}</p>
    </div>`, '속표지');
}

function notePage(note, artist){
  const body = (note.body || []).map(p => `<p>${escapeHTML(p)}</p>`).join('');
  return `
    <section class="cat-note">
      <h2 class="cat-note-head"><b>${escapeHTML(artist)}</b> ${escapeHTML(note.heading || '작가노트')}</h2>
      <div class="cat-note-body">${body}</div>
    </section>`;
}

/** 약력 한 줄 — "연도  내용 | 장소" */
function cvRowHTML(row){
  if(row.section) return `<h3 class="cat-cv-section">${escapeHTML(row.section)}</h3>`;
  const note = row.note ? `<span class="cat-cv-note">  |  ${escapeHTML(row.note)}</span>` : '';
  return `<p class="cat-cv-row"><span class="cat-cv-year">${escapeHTML(row.label || '')}</span>`
    + `<span>${escapeHTML(row.value)}${note}</span></p>`;
}

function cvPage(cv, info, contact){
  return page('cv', `
    <header class="cat-cv-head">
      <h2><b>${escapeHTML(info.artist)}</b> <span>${escapeHTML(info.artistEn || '')}</span></h2>
      <p class="cat-cv-contact">
        <span>${escapeHTML(contact.email || '')}</span>
        <span>인스타그램 ${escapeHTML(contact.instagram || '')}</span>
      </p>
    </header>
    <div class="cat-cv-cols">${(cv.rows || []).map(cvRowHTML).join('')}</div>`, '약력');
}

function colophonPage(info, contact, colophon){
  return page('colophon', `
    <div class="cat-colophon">
      <p class="cat-co-title">${stackedTitle(info.title)}</p>
      <svg class="cat-co-line" viewBox="0 0 12 12" aria-hidden="true"><line x1="11" y1="0" x2="0" y2="11"/></svg>
      <p class="cat-co-sub">${textOr(info.subtitle, '부제')}</p>
      <p class="cat-co-period">${textOr(info.period, '전시 기간')}</p>
      <p class="cat-co-venue">${textOr(info.venue, '전시 장소')}</p>
      <p class="cat-co-contact">문의 <b>${escapeHTML(contact.email || '')}</b>   누리집 <b>${escapeHTML(contact.site || '')}</b></p>
      <p class="cat-co-legal">${escapeHTML(colophon.legal || '')}</p>
      <p class="cat-co-copy">${escapeHTML(colophon.copyright || '')}</p>
    </div>`, '판권');
}

/* ---------- 작품 펼침면 ---------- */

/** "제목  크기 재료 연도" — 내지처럼 재료는 소문자(mixed media)로 적는다 */
function captionHTML(work){
  const material = work.material && work.material.toLowerCase();
  const meta = [work.size, material, work.year].filter(Boolean).map(escapeHTML).join(' ');
  return `<b>${textOr(work.title, '작품 제목')}</b>${meta ? ` ${meta}` : ''}`;
}

function slotHTML(slot){
  const {work} = slot;
  const capStyle = slot.side === 'left'
    ? `left:${mm(slot.x)}`
    : `right:${mm(370 - slot.x - slot.w)}`;
  return `
    <figure class="cat-fig" style="left:${mm(slot.x)};top:${mm(slot.y)};width:${mm(slot.w)};height:${mm(slot.h)}">
      <img src="${escapeHTML(work.image)}" alt="${escapeHTML(work.title)}" loading="lazy">
    </figure>
    <p class="cat-cap cat-cap--${slot.side}" style="${capStyle};top:${mm(captionTop(slot))}">${captionHTML(work)}</p>`;
}

/**
 * 펼침면 하나 → 왼쪽 쪽 · 오른쪽 쪽. 두 쪽이 같은 370mm 화폭을 나눠 보여 준다.
 * left 에 'note' 를 적으면 왼쪽 쪽에 작가 노트를 함께 싣는다.
 */
function spreadPages(spread, works, extras){
  const slots = layoutSpread(spread, works);
  const canvas = `<div class="cat-canvas">${slots.map(slotHTML).join('')}</div>`;
  const label = slots.map(s => s.work.title).join(' · ');
  const leftExtra = spread.left === 'note' ? extras.note : '';
  return [
    page('spread-left', `${leftExtra}${canvas}`, leftExtra ? `작가 노트 · ${label}` : label),
    page('spread-right', canvas, label),
  ];
}

/** 작품마다 그림 비율을 붙인다. 비율은 사이트 data.json 의 w·h(이미지 실측)에서 온다. */
function withRatios(works, ratios){
  return works.map(w => {
    const ratio = ratios.get(w.image);
    if(!ratio) throw new Error(`그림 비율을 찾지 못했어요: ${w.image}`);
    return {...w, ratio};
  });
}

/**
 * 도록 쪽 순서: 표지 → (빈 쪽 | 속표지) → (작가 노트 | 작품) → 작품 펼침면들 → (약력 | 판권) → 뒤표지.
 * 표지가 오른쪽에 홀로 서고, 뒤표지가 왼쪽에 홀로 서려면 전체 쪽 수가 짝수여야 한다.
 */
export function buildPages(catalog, ratios){
  const info = catalog.title || {};
  const contact = catalog.contact || {};
  const works = withRatios(catalog.works || [], ratios);
  const extras = {note: notePage(catalog.note || {}, info.artist || '')};
  const pages = [
    coverPage(catalog.cover.front, '표지'),
    blankPage(),
    titlePage(info),
    ...(catalog.spreads || []).flatMap(s => spreadPages(s, works, extras)),
    cvPage(catalog.cv || {}, info, contact),
    colophonPage(info, contact, catalog.colophon || {}),
  ];
  if((pages.length + 1) % 2) pages.push(blankPage());
  pages.push(coverPage(catalog.cover.back, '뒤표지'));
  return pages;
}

/** 표지·뒤표지는 두꺼운 종이라 뒷면이 비치지 않는다. */
const isThick = info => info.kind === 'cover' || info.kind === 'back';

/**
 * 같은 종이의 뒷면. 표지(0)가 오른쪽에 홀로 서므로 종이 한 장은 (0,1) (2,3) (4,5) … 로 짝을 이룬다.
 */
function backSideOf(pages, index){
  const partner = pages[index ^ 1];
  if(!partner || isThick(pages[index]) || isThick(partner)) return null;
  return partner;
}

/**
 * 쪽 하나의 HTML.
 * 바깥 .cat-page 는 라이브러리가 display 를 직접 바꾸므로, 쪽 안 배치는 안쪽 .cat-sheet 가 맡는다.
 * 얇은 종이처럼 뒷면 내용이 좌우가 뒤집힌 채 흐리게 비친다(.cat-through).
 */
export function pageHTML(pages, index){
  const info = pages[index];
  const back = backSideOf(pages, index);
  const sheet = (p) => `<div class="cat-sheet cat-sheet--${p.kind}">${p.inner}</div>`;
  const through = back ? `<div class="cat-through" aria-hidden="true">${sheet(back)}</div>` : '';
  return `<div class="cat-page cat-page--${info.kind}">${through}${sheet(info)}</div>`;
}
