/* 연보에서 시기로 들어갔다가 돌아올 때, 떠났던 자리로 되돌린다.
   목록 맨 위로 튀어 오르면 어디까지 보고 있었는지 매번 다시 찾아야 한다. */

const KEY = 'jbae:chapter-spot';

/* sessionStorage 가 막힌 브라우저에서도 화면은 그대로 돌아야 한다. */
function read(){
  try{ return sessionStorage.getItem(KEY); }catch{ return null; }
}
function write(value){
  try{ sessionStorage.setItem(KEY, value); }catch{}
}

function navigationType(){
  const entry = performance.getEntriesByType?.('navigation')[0];
  return entry ? entry.type : '';
}

/* 돌아오는 길일 때만 자리를 되살린다.
   "← 작품 연보로"와 머리띠의 '작품'은 #works 를 달고 오고, 뒤로가기는 자리표가 없다.
   머리띠의 작가 이름(index.html)을 눌러 온 경우는 맨 위가 맞으므로 손대지 않는다. */
function isReturning(){
  if(location.hash === '#works') return true;
  return !location.hash && navigationType() === 'back_forward';
}

/** 시기로 들어가는 순간, 지금 보고 있던 높이를 적어 둔다. */
export function rememberSpot(mount){
  mount.addEventListener('click', (event) => {
    if(event.target.closest('a[href^="year.html"]')) write(String(Math.round(window.scrollY)));
  });
}

/** 떠났던 자리로 되돌린다. 되돌렸으면 true — 부른 쪽은 자리표 이동을 건너뛴다. */
export function restoreSpot(){
  if(!isReturning()) return false;
  const spot = Number(read());
  if(!Number.isFinite(spot) || spot <= 0) return false;
  /* 작품 이미지에 크기가 박혀 있어 사진이 도착하기 전에도 높이가 맞다. */
  requestAnimationFrame(() => window.scrollTo(0, spot));
  return true;
}
