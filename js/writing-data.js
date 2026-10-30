/* writings.json(작가노트 · 평론 · 서문 · 기사)을 읽어 기록 목록 · 글 화면 · 첫 화면 인용이 같이 쓴다.
   글이 하나도 없으면 머리띠의 '기록' 메뉴는 숨긴 채로 둔다 — 글을 넣으면 저절로 나타난다. */

const SOURCE = 'writings.json';
let cached = null;

async function loadSource(){
  if(cached) return cached;
  const res = await fetch(SOURCE);
  if(!res.ok) throw new Error(`${SOURCE} 을 불러오지 못했습니다`);
  cached = await res.json();
  return cached;
}

export async function loadWritings(){
  return (await loadSource()).writings || [];
}

/** 글이 있을 때만 머리띠의 '기록' 메뉴를 보인다. 못 읽으면 숨긴 채로 둔다 */
export async function showArchiveLink(){
  const writings = await loadWritings().catch(() => []);
  if(!writings.length) return;
  document.querySelectorAll('[data-archive-link]').forEach(link => { link.hidden = false; });
}

/** 첫 화면 인용 — quote 와 그 글. quote 가 비었거나 가리키는 글이 없으면 null */
export async function loadQuote(){
  const { quote, writings = [] } = await loadSource().catch(() => ({}));
  const entry = quote && quote.text && writings.find(w => w.id === quote.from);
  return entry ? { ...quote, entry } : null;
}

/** 글쓴이 · 실린 곳 · 날짜. 빈 칸은 건너뛴다. */
export function writingMeta(entry){
  return [entry.author, entry.source, entry.date].filter(Boolean).join(' · ');
}
