/* =====================
   Shared Utilities
   ===================== */

async function loadData() {
  const res = await fetch('data.json');
  if (!res.ok) throw new Error('데이터를 불러올 수 없습니다.');
  return res.json();
}

function getYearParam() {
  const params = new URLSearchParams(window.location.search);
  return params.get('year');
}

// Nav scroll effect
document.addEventListener('scroll', () => {
  const nav = document.getElementById('main-nav');
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
});

// Intersection Observer for fade-in
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);

/* =====================
   Index Page
   ===================== */

function hasRealWorks(year) {
  return year.works && year.works.some(w => w.image && !w.image.includes('picsum'));
}

function renderIndex(data) {
  const { artist } = data;
  const years = data.years.filter(hasRealWorks);

  // Nav & Hero
  document.title = `${artist.name} | 포트폴리오`;
  setTextById('nav-name', artist.name);
  setTextById('hero-name', artist.name);
  setTextById('hero-tagline', artist.tagline);

  // Hero background – most recent year's thumbnail
  const heroBg = document.getElementById('hero-bg');
  if (heroBg) {
    const recentYear = years[0]; // hasRealWorks로 필터된 배열, 최신순 정렬 가정
    const picked = [recentYear ? recentYear.thumbnail : null].filter(Boolean);
    picked.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      heroBg.appendChild(img);
    });
  }

  // About
  setTextById('about-name', artist.name);
  setTextById('about-bio', artist.bio);

  const contactEl = document.getElementById('about-contact');
  if (contactEl) {
    contactEl.innerHTML = `
      <a href="mailto:${artist.email}"><span>&#9993;</span> ${artist.email}</a>
      <a href="${artist.instagram}" target="_blank" rel="noopener"><span>&#9654;</span> Instagram</a>
    `;
  }

  // CV
  renderCV(artist.cv);

  // Works
  const worksList = document.getElementById('works-list');
  if (!worksList) return;
  worksList.innerHTML = '';

  years.forEach((year, i) => {
    const item = document.createElement('div');
    item.className = `work-item${i % 2 === 1 ? ' reverse' : ''}`;
    item.dataset.yearId = year.id;
    item.innerHTML = `
      <a href="year.html?year=${year.id}" class="work-thumb">
        <img
          src="${year.thumbnail}"
          alt="${year.year}년 작품 썸네일"
          loading="lazy"
        />
      </a>
      <div class="work-info">
        <span class="work-year-badge">${year.year}</span>
        <p class="work-desc">${year.description}</p>
        <a href="year.html?year=${year.id}" class="btn-view">작품 보기 &rarr;</a>
      </div>
    `;
    worksList.appendChild(item);
    observer.observe(item);
  });

  // 연도 클릭 시 스크롤 위치 저장
  worksList.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="year.html"]');
    if (link) {
      sessionStorage.setItem('indexScrollY', window.scrollY);
    }
  });

  // 돌아왔을 때 스크롤 복원
  const savedY = sessionStorage.getItem('indexScrollY');
  if (savedY !== null) {
    sessionStorage.removeItem('indexScrollY');
    requestAnimationFrame(() => {
      setTimeout(() => window.scrollTo({ top: parseInt(savedY), behavior: 'instant' }), 50);
    });
  }

  // Contact
  const contactLinks = document.getElementById('contact-links');
  if (contactLinks) {
    contactLinks.innerHTML = `
      <a href="mailto:${artist.email}" class="contact-link"><span>&#9993;</span> ${artist.email}</a>
      <a href="${artist.instagram}" target="_blank" rel="noopener" class="contact-link"><span>&#9654;</span> Instagram</a>
    `;
  }

  // Footer
  const year = new Date().getFullYear();
  setTextById('footer-text', `\u00A9 ${year} ${artist.name}. All rights reserved.`);
}

/* =====================
   CV Section
   ===================== */

function renderCV(cv) {
  const container = document.getElementById('cv-content');
  if (!container || !cv) return;

  const blocks = [
    { heading: '학력',            data: cv.education,         full: false },
    { heading: '개인전',          data: cv.soloExhibitions,   full: false },
    { heading: '단체전 및 아트페어', data: cv.groupExhibitions, full: true, collapsible: true },
    { heading: '수상',            data: cv.awards,            full: false },
    { heading: '강의',            data: cv.teaching,          full: false },
    { heading: '작품소장',        data: cv.collections,       full: true, grid: true },
  ];

  blocks.forEach(block => {
    if (!block.data || block.data.length === 0) return;
    const div = document.createElement('div');
    div.className = 'cv-block' + (block.full ? ' cv-full' : '') + (block.collapsible ? ' cv-collapsible' : '');
    const items = block.data.map(item => `<li>${item}</li>`).join('');

    if (block.collapsible) {
      div.innerHTML = `
        <h3 class="cv-toggle" aria-expanded="false">
          ${block.heading}
          <span class="cv-toggle-icon">＋</span>
        </h3>
        <ul class="cv-list cv-collapse">${items}</ul>
      `;
      const h3 = div.querySelector('.cv-toggle');
      const list = div.querySelector('.cv-list');
      h3.addEventListener('click', () => {
        const expanded = h3.getAttribute('aria-expanded') === 'true';
        h3.setAttribute('aria-expanded', !expanded);
        h3.querySelector('.cv-toggle-icon').textContent = expanded ? '＋' : '－';
        list.classList.toggle('cv-collapse', expanded);
      });
    } else {
      div.innerHTML = `
        <h3>${block.heading}</h3>
        <ul class="cv-list${block.grid ? ' cv-collections' : ''}">${items}</ul>
      `;
    }
    container.appendChild(div);
  });
}

/* =====================
   Year Page
   ===================== */

let currentWorks = [];
let currentIndex = 0;

function renderYear(data, yearId) {
  const { artist, years } = data;
  const yearData = years.find(y => y.id === yearId);

  if (!yearData || !hasRealWorks(yearData)) {
    window.location.href = 'index.html';
    return;
  }

  document.title = `${yearData.year}년 작품 | ${artist.name}`;
  setTextById('nav-name', artist.name);
  setTextById('footer-text', `\u00A9 ${new Date().getFullYear()} ${artist.name}. All rights reserved.`);

  // Year Hero
  const heroEl = document.getElementById('year-hero');
  if (heroEl) {
    heroEl.innerHTML = `
      <div class="year-hero-img">
        <img src="${yearData.thumbnail}" alt="${yearData.year}년 대표 이미지" />
      </div>
      <div class="year-meta">
        <div class="year-number">${yearData.year}</div>
        <p class="year-desc">${yearData.description}</p>
      </div>
    `;
  }

  // Gallery
  const grid = document.getElementById('masonry-grid');
  const gallerySection = document.getElementById('gallery-section');

  if (!grid || !gallerySection) return;
  grid.innerHTML = '';
  gallerySection.style.display = 'block';

  // Flatten works for lightbox (expand type:group entries)
  const flatWorks = [];
  yearData.works.forEach(work => {
    if (work.type === 'group' && work.works) {
      work.works.forEach(w => flatWorks.push(w));
    } else {
      flatWorks.push(work);
    }
  });
  currentWorks = flatWorks;

  function createMasonryItem(work, flatIdx) {
    const item = document.createElement('div');
    item.className = 'masonry-item';
    item.innerHTML = `
      <img src="${work.image}" alt="${work.title}" loading="lazy" />
      <div class="masonry-caption">
        <h3>${work.title}</h3>
        <p>${work.material} &middot; ${work.size}</p>
      </div>
    `;
    item.addEventListener('click', () => openLightbox(flatIdx));
    return item;
  }

  // Build display groups: batch consecutive same-group works or type:group
  const displayGroups = [];
  let currentGroup = null;
  let flatIdx = 0;

  yearData.works.forEach(work => {
    if (work.type === 'group' && work.works) {
      // Explicit group: always its own row
      const startIdx = flatIdx;
      displayGroups.push({ isGroup: true, items: work.works.map((w, i) => ({ work: w, idx: startIdx + i })) });
      flatIdx += work.works.length;
    } else {
      const groupId = work.group || null;
      if (groupId && currentGroup && currentGroup.groupId === groupId) {
        currentGroup.items.push({ work, idx: flatIdx });
      } else {
        currentGroup = { groupId, isGroup: !!groupId, items: [{ work, idx: flatIdx }] };
        displayGroups.push(currentGroup);
      }
      flatIdx++;
    }
  });

  // Render
  displayGroups.forEach(dg => {
    if (dg.isGroup && dg.items.length > 1) {
      const groupEl = document.createElement('div');
      groupEl.className = 'masonry-group';
      dg.items.forEach(({ work, idx }) => groupEl.appendChild(createMasonryItem(work, idx)));
      grid.appendChild(groupEl);
    } else {
      dg.items.forEach(({ work, idx }) => grid.appendChild(createMasonryItem(work, idx)));
    }
  });
}

/* =====================
   Lightbox
   ===================== */

function openLightbox(index) {
  currentIndex = index;
  updateLightbox();
  document.getElementById('lightbox').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  document.body.style.overflow = '';
}

function updateLightbox() {
  const work = currentWorks[currentIndex];
  if (!work) return;

  const img = document.getElementById('lightbox-img');
  if (img) {
    img.src = work.image;
    img.alt = work.title;
  }

  setTextById('lightbox-title', work.title);
  setTextById('lightbox-desc', work.description);
  setTextById('lb-counter', `${currentIndex + 1} / ${currentWorks.length}`);

  const meta = document.getElementById('lightbox-meta');
  if (meta) {
    meta.innerHTML = `
      <span><strong>재료</strong> ${work.material}</span>
      <span><strong>크기</strong> ${work.size}</span>
    `;
  }
}

function prevWork() {
  currentIndex = (currentIndex - 1 + currentWorks.length) % currentWorks.length;
  updateLightbox();
}

function nextWork() {
  currentIndex = (currentIndex + 1) % currentWorks.length;
  updateLightbox();
}

/* =====================
   Lightbox Event Listeners
   ===================== */

document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn  = document.getElementById('lb-prev');
  const nextBtn  = document.getElementById('lb-next');
  const lightbox = document.getElementById('lightbox');

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn)  prevBtn.addEventListener('click', prevWork);
  if (nextBtn)  nextBtn.addEventListener('click', nextWork);

  // Close on background click
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const lb = document.getElementById('lightbox');
    if (!lb || !lb.classList.contains('active')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   prevWork();
    if (e.key === 'ArrowRight')  nextWork();
  });

  // Touch swipe for lightbox
  let touchStartX = 0;
  if (lightbox) {
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) {
        dx < 0 ? nextWork() : prevWork();
      }
    }, { passive: true });
  }

  // Hamburger menu
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks  = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }
});

/* =====================
   Helper
   ===================== */

function setTextById(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/* =====================
   Router: Detect Page & Init
   ===================== */

document.addEventListener('DOMContentLoaded', async () => {
  const isYearPage = !!document.getElementById('year-hero');

  try {
    const data = await loadData();

    if (isYearPage) {
      const yearId = getYearParam();
      if (!yearId) {
        window.location.href = 'index.html';
        return;
      }
      renderYear(data, yearId);
    } else {
      renderIndex(data);
    }
  } catch (err) {
    console.error(err);
    const errEl = document.querySelector('.loading');
    if (errEl) errEl.textContent = '데이터 로드 실패. data.json 파일을 확인해주세요.';
  }
});
