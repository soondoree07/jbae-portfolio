/* catalog.json 을 도록의 쪽(page) 하나하나로 바꾼다.
   값이 비어 있으면 자리 표시를 그린다. 전시가 정해지면 catalog.json 만 채우면 된다. */

const EMPTY_LINES = 7;

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

/** 문단 목록. 비었으면 빈 줄을 그어 글 들어갈 자리만 남긴다. */
function paragraphs(body){
  if(body && body.length) return body.map(p => `<p>${escapeHTML(p)}</p>`).join('');
  return `<div class="cat-ph-lines" aria-hidden="true">${'<span></span>'.repeat(EMPTY_LINES)}</div>`;
}

function picture(src, alt, label){
  if(src) return `<img src="${escapeHTML(src)}" alt="${escapeHTML(alt)}" loading="lazy">`;
  return `<div class="cat-ph-image"><span>${label}</span></div>`;
}

function page(kind, inner, label){
  return {kind, label, inner};
}

function coverPage(cover){
  return page('cover', `
    <div class="cat-cover-art">${picture(cover.image, cover.title, '표지 작품')}</div>
    <div class="cat-cover-text">
      <h1 class="cat-cover-title">${textOr(cover.title, '전시 제목')}</h1>
      <p class="cat-cover-sub">${textOr(cover.subtitle, '부제')}</p>
      <p class="cat-cover-meta">${textOr(cover.period, '전시 기간')}<br>${textOr(cover.venue, '전시 장소')}</p>
    </div>`, '표지');
}

/**
 * 한 쪽에 다 안 들어가는 글은 catalog.json 에서 pages 로 쪽을 나눠 적는다.
 * pages 가 없으면 key(body·rows) 하나가 한 쪽이다.
 */
function chunksOf(block, key){
  return block.pages && block.pages.length ? block.pages : [block[key] || []];
}

/** 제목은 첫 쪽에만, 서명은 마지막 쪽에만 단다. */
function headingOn(first, block, label){
  return first ? `<h2 class="cat-heading">${escapeHTML(block.heading || label)}</h2>` : '';
}

function writingPages(kind, block, label){
  const chunks = chunksOf(block, 'body');
  return chunks.map((body, i) => {
    const sign = i === chunks.length - 1 && block.author !== undefined
      ? `<p class="cat-sign">${textOr(block.author, '쓴 사람')}</p>` : '';
    return page(kind, `
      ${headingOn(i === 0, block, label)}
      <div class="cat-body">${paragraphs(body)}</div>${sign}`, label);
  });
}

function workPage(work, order){
  const meta = [work.material, work.size, work.year].filter(Boolean).join(', ');
  const about = work.description ? `<span class="cat-work-about">${escapeHTML(work.description)}</span>` : '';
  return page('work', `
    <figure class="cat-work">
      <div class="cat-work-art">${picture(work.image, work.title, `작품 ${order}`)}</div>
      <figcaption>
        <span class="cat-work-title">${textOr(work.title, '작품 제목')}</span>
        <span class="cat-work-meta">${meta ? escapeHTML(meta) : '<span class="cat-ph">재료, 크기, 연도</span>'}</span>
        ${about}
      </figcaption>
    </figure>`, `작품 ${order}`);
}

/** 줄 하나. section 이면 묶음 제목(개인전·수상 …), note 가 있으면 값 아래 작게 덧붙인다. */
function rowHTML(row){
  if(row.section) return `<div class="cat-row cat-row--section"><dt>${escapeHTML(row.section)}</dt></div>`;
  const note = row.note ? `<span class="cat-row-note">${escapeHTML(row.note)}</span>` : '';
  return `<div class="cat-row"><dt>${escapeHTML(row.label || '')}</dt><dd>${textOr(row.value, '내용')}${note}</dd></div>`;
}

function rowsPages(kind, block, label){
  return chunksOf(block, 'rows').map((rows, i) => {
    const body = rows.length
      ? `<dl class="cat-rows">${rows.map(rowHTML).join('')}</dl>`
      : `<div class="cat-body">${paragraphs([])}</div>`;
    return page(kind, `${headingOn(i === 0, block, label)}${body}`, label);
  });
}

function backPage(back){
  return page('back', `<p class="cat-back-line">${textOr(back.line, '뒤표지 글')}</p>`, '뒤표지');
}

function blankPage(){
  return page('blank', '', '빈 쪽');
}

/**
 * 도록 쪽 순서: 표지 → 인사말 → 작가 노트 → 작품 → 약력 → 전시 정보 → 뒤표지.
 * 펼침면에서 뒤표지가 홀로 서려면 전체 쪽 수가 짝수여야 한다. 홀수면 뒤표지 앞에 빈 쪽을 끼운다.
 */
export function buildPages(catalog){
  const pages = [
    coverPage(catalog.cover || {}),
    ...writingPages('greeting', catalog.greeting || {}, '인사말'),
    ...writingPages('note', catalog.note || {}, '작가 노트'),
    ...(catalog.works || []).map((w, i) => workPage(w, i + 1)),
    ...rowsPages('cv', catalog.cv || {}, '약력'),
    ...rowsPages('colophon', catalog.colophon || {}, '전시 정보'),
  ];
  if((pages.length + 1) % 2) pages.push(blankPage());
  pages.push(backPage(catalog.back || {}));
  return pages;
}

/** 표지·뒤표지는 두꺼운 종이라 뒷면이 비치지 않는다. 빈 쪽은 번호도 달지 않는다. */
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
 * 얇은 도록 종이처럼 뒷면 내용이 좌우가 뒤집힌 채 흐리게 비친다(.cat-through).
 * 쪽 번호는 표지·뒤표지·빈 쪽에는 달지 않는다.
 */
export function pageHTML(pages, index){
  const info = pages[index];
  const back = backSideOf(pages, index);
  const through = back
    ? `<div class="cat-through" aria-hidden="true"><div class="cat-sheet">${back.inner}</div></div>` : '';
  const folio = isThick(info) || info.kind === 'blank' ? '' : `<span class="cat-folio">${index + 1}</span>`;
  return `<div class="cat-page cat-page--${info.kind}">${through}<div class="cat-sheet">${info.inner}</div>${folio}</div>`;
}
