/* 스크롤에 반응하는 것들. 움직임을 끈 사용자에게는 아무것도 하지 않는다. */

const stillness = window.matchMedia('(prefers-reduced-motion: reduce)');

/** 화면에 들어온 순서대로, 서로 조금씩 늦게 떠오르게 한다. */
export function revealOnScroll(selector = '.reveal'){
  const targets = document.querySelectorAll(selector);
  if(stillness.matches){
    targets.forEach(el => el.classList.add('is-in'));
    return;
  }
  const watcher = new IntersectionObserver((entries) => {
    entries.forEach((entry, order) => {
      if(!entry.isIntersecting) return;
      entry.target.style.setProperty('--i', order % 4);
      entry.target.classList.add('is-in');
      watcher.unobserve(entry.target);
    });
  }, {threshold:.12, rootMargin:'0px 0px -8% 0px'});
  targets.forEach(el => watcher.observe(el));
}

/** 조금이라도 내려가면 머리띠에 바탕을 깔아 글자가 작품에 묻히지 않게 한다. */
export function stickyMasthead(){
  const bar = document.querySelector('.masthead');
  if(!bar) return;
  const sync = () => bar.classList.toggle('is-stuck', window.scrollY > 24);
  sync();
  window.addEventListener('scroll', sync, {passive:true});
}

export const prefersStillness = () => stillness.matches;
