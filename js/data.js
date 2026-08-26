/* data.json 을 읽어 화면이 쓰기 좋은 모양으로 다듬는다. */

const SOURCE = 'data.json';
let cached = null;

export async function loadData(){
  if(cached) return cached;
  const res = await fetch(SOURCE);
  if(!res.ok) throw new Error('작품 자료를 불러오지 못했습니다');
  cached = await res.json();
  return cached;
}

/** 실제 작품 이미지가 있는 시기인가. (자리표시자만 있는 시기는 화면에 내지 않는다) */
export function hasRealWorks(chapter){
  return (chapter.works || []).some(w => w.image && !w.image.includes('picsum'));
}

export function visibleChapters(data){
  return data.years.filter(hasRealWorks);
}

export function findChapter(data, id){
  return visibleChapters(data).find(c => String(c.id) === String(id)) || null;
}

/** 한 시기의 작품을 평평하게 편다. 여러 점이 한 세트인 항목은 낱장으로 풀어낸다. */
export function flattenWorks(chapter){
  const out = [];
  (chapter.works || []).forEach(work => {
    if(work.type === 'group' && work.works) out.push(...work.works);
    else out.push(work);
  });
  return out;
}

/** 3:1을 넘는 띠 모양 작품. 격자에서도 시기 대표 자리에서도 따로 다뤄야 한다. */
export function isPanorama(item){
  return !!(item.w && item.h) && item.w / item.h >= 3;
}

/**
 * 가로로 긴 작품이 잘리지 않도록 격자에서 차지할 칸 수를 정한다.
 * 이 작가의 작품은 세로형이 거의 없고 3:1을 넘는 파노라마가 있다.
 *
 * 사진 비율만 보면 실제 작품 크기와 어긋나는 곳이 생긴다.
 * 45×100cm 짜리가 112×162cm 짜리보다 크게 걸리는 식이다.
 * 그럴 때는 data.json 의 작품에 span 을 적어 손으로 바로잡는다 (1 · 2 · "full").
 */
export function spanOf(work){
  if(work.span) return work.span;
  if(!work.w || !work.h) return 1;
  if(isPanorama(work)) return 'full';
  return work.w / work.h >= 1.55 ? 2 : 1;
}

/** '2018-2020' 같은 묶음 시기는 붙임표를 반각에서 전각으로 바꿔 읽기 좋게 한다. */
export function chapterLabel(chapter){
  return String(chapter.id).replace('-', '–');
}

/** https://www.instagram.com/artist_jbae/ → @artist_jbae */
export function instagramHandle(url){
  const name = String(url || '').replace(/\/+$/, '').split('/').pop();
  return name ? `@${name}` : '';
}

export function thumbOf(item){
  return item.thumb || item.image || item.thumbnail;
}

/** 화면에 그대로 꽂아도 안전하도록 태그 문자를 막는다. */
export function esc(value){
  return String(value ?? '').replace(/[&<>"]/g, ch =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
}

/** 작품 제목은 한 줄로 쓴다. 데이터에 든 줄바꿈은 빈칸으로 바꾼다. */
export function titleText(value){
  return esc(String(value ?? '').replace(/\s*\n\s*/g, ' '));
}
