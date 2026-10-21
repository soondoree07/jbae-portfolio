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

/* 바깥 .cat-page 는 라이브러리가 display 를 직접 바꾸므로, 쪽 안 배치는 안쪽 .cat-sheet 가 맡는다 */
function page(kind, inner, label){
  return {kind, label, html:`<div class="cat-page cat-page--${kind}"><div class="cat-sheet">${inner}</div></div>`};
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

function writingPage(kind, block, label){
  const sign = block.author !== undefined
    ? `<p class="cat-sign">${textOr(block.author, '쓴 사람')}</p>` : '';
  return page(kind, `
    <h2 class="cat-heading">${escapeHTML(block.heading || label)}</h2>
    <div class="cat-body">${paragraphs(block.body)}</div>${sign}`, label);
}

function workPage(work, order){
  const meta = [work.material, work.size, work.year].filter(Boolean).join(', ');
  return page('work', `
    <figure class="cat-work">
      <div class="cat-work-art">${picture(work.image, work.title, `작품 ${order}`)}</div>
      <figcaption>
        <span class="cat-work-title">${textOr(work.title, '작품 제목')}</span>
        <span class="cat-work-meta">${meta ? escapeHTML(meta) : '<span class="cat-ph">재료, 크기, 연도</span>'}</span>
      </figcaption>
    </figure>`, `작품 ${order}`);
}

function rowsPage(kind, block, label){
  const rows = (block.rows || []);
  const list = rows.length
    ? rows.map(r => `<div class="cat-row"><dt>${escapeHTML(r.label)}</dt><dd>${textOr(r.value, '내용')}</dd></div>`).join('')
    : '';
  const body = list ? `<dl class="cat-rows">${list}</dl>` : `<div class="cat-body">${paragraphs([])}</div>`;
  return page(kind, `<h2 class="cat-heading">${escapeHTML(block.heading || label)}</h2>${body}`, label);
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
    writingPage('greeting', catalog.greeting || {}, '인사말'),
    writingPage('note', catalog.note || {}, '작가 노트'),
    ...(catalog.works || []).map((w, i) => workPage(w, i + 1)),
    rowsPage('cv', catalog.cv || {}, '약력'),
    rowsPage('colophon', catalog.colophon || {}, '전시 정보'),
  ];
  if((pages.length + 1) % 2) pages.push(blankPage());
  pages.push(backPage(catalog.back || {}));
  return pages;
}

/** 안쪽 쪽 아래에 쪽 번호를 단다. 표지와 뒤표지에는 달지 않는다. */
export function withFolio(pageInfo, index, total){
  if(index === 0 || index === total - 1 || pageInfo.kind === 'blank') return pageInfo.html;
  return pageInfo.html.replace(/<\/div>$/, `<span class="cat-folio">${index + 1}</span></div>`);
}
