/* 첫 화면 — 히어로, 작품 연보, 작가, 약력, 문의 */

import { loadData, visibleChapters, chapterLabel, thumbOf, esc, flattenWorks, instagramHandle } from './data.js';
import { copyLineHTML, bindCopyLines } from './copy.js';
import { renderCV } from './cv.js';
import { revealOnScroll, stickyMasthead } from './motion.js';

/* 히어로에 걸 대표작. 태그라인 "꿈결·물결·바람결"과 같은 이름의 작품이라 이 시기를 쓴다. */
const HERO_CHAPTER = '2023';

const pick = (sel) => document.querySelector(sel);

function renderHero(artist, chapters){
  const chapter = chapters.find(c => String(c.id) === HERO_CHAPTER) || chapters[0];
  const works = flattenWorks(chapter);
  /* 시기 대표 이미지와 같은 작품을 찾아야 캡션이 어긋나지 않는다 */
  const lead = works.find(w => w.image === chapter.thumbnail) || works[0] || {};
  pick('.hero-name').textContent = artist.name;
  pick('.hero-en').textContent = artist.nameEn;
  pick('.hero-tagline').textContent = artist.tagline;
  /* 히어로에는 작품만 건다. 제목·재료·크기는 붙이지 않는다. */
  pick('.hero-plate').innerHTML = `
    <img src="${esc(thumbOf(chapter))}" alt="${esc(lead.title || chapter.year + '년 작품')}"
         ${chapter.w ? `width="${chapter.w}" height="${chapter.h}"` : ''} fetchpriority="high">`;
}

function renderChapters(chapters, mount){
  mount.innerHTML = chapters.map(chapter => {
    const href = `year.html?year=${encodeURIComponent(chapter.id)}`;
    return `
      <article class="chapter reveal">
        <div class="chapter-text">
          <a class="chapter-year" href="${href}">${esc(chapterLabel(chapter))}</a>
          ${chapter.description
            ? `<p class="chapter-desc">${esc(chapter.description)}</p>`
            : '<p class="chapter-desc is-empty" aria-hidden="true"></p>'}
        </div>
        <a class="chapter-plate" href="${href}" tabindex="-1" aria-hidden="true">
          <img src="${esc(thumbOf(chapter))}" alt="" loading="lazy"
               ${chapter.w ? `width="${chapter.w}" height="${chapter.h}"` : ''}>
        </a>
      </article>`;
  }).join('');
}

/* 전화번호는 공개 페이지에 내지 않는다 (기획서 방침). data.json 에는 남아 있지만 화면에는 쓰지 않는다. */
function renderAbout(artist){
  pick('.about-bio').textContent = artist.bio;
  pick('.about-lines').innerHTML = `
    <div class="about-line"><dt>이메일</dt><dd><a href="mailto:${esc(artist.email)}">${esc(artist.email)}</a></dd></div>
    <div class="about-line"><dt>인스타그램</dt><dd><a href="${esc(artist.instagram)}" target="_blank" rel="noopener">${esc(instagramHandle(artist.instagram))}</a></dd></div>`;
}

/* 메일 프로그램이 없는 사람은 mailto 를 눌러도 아무 일이 안 일어난다.
   그래서 이 자리는 주소를 그대로 보여주고 눌러서 복사하게 한다. */
function renderContact(artist){
  const box = pick('.contact-links');
  box.innerHTML =
    copyLineHTML(esc(artist.email), '이메일 주소') +
    copyLineHTML(esc(instagramHandle(artist.instagram)), '인스타그램 아이디');
  bindCopyLines(box);
}

function renderColophon(artist){
  pick('.colophon').innerHTML =
    `<span>© ${new Date().getFullYear()} ${esc(artist.name)}</span>`;
}

/* 주소에 #about 같은 자리표가 붙어 있으면 그 자리로 데려간다.
   내용이 그려지기 전에 브라우저가 먼저 이동을 끝내버려서, 다 그린 뒤 한 번 더 맞춘다. */
function jumpToHash(){
  const target = location.hash && document.querySelector(location.hash);
  if(target) requestAnimationFrame(() => target.scrollIntoView({behavior:'instant', block:'start'}));
}

async function start(){
  stickyMasthead();
  try{
    const data = await loadData();
    const { artist } = data;
    const chapters = visibleChapters(data);

    document.title = `${artist.name} ${artist.nameEn} | 작품 포트폴리오`;
    pick('.brand-ko').textContent = artist.name;
    pick('.brand-en').textContent = artist.nameEn;

    renderHero(artist, chapters);
    renderChapters(chapters, pick('.chapters'));
    renderAbout(artist);
    renderCV(artist.cv, pick('.cv'));
    renderContact(artist);
    renderColophon(artist);
    revealOnScroll();
    jumpToHash();
  }catch(err){
    console.error(err);
    pick('.chapters').innerHTML =
      '<p class="load-error">작품을 불러오지 못했어요. 잠시 후 새로고침해 주세요.</p>';
  }
}

start();
