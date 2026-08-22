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

/**
 * 가로로 긴 작품이 잘리지 않도록 격자에서 차지할 칸 수를 정한다.
 * 이 작가의 작품은 세로형이 거의 없고 3:1을 넘는 파노라마가 있다.
 */
export function spanOf(work){
  if(!work.w || !work.h) return 1;
  const ratio = work.w / work.h;
  if(ratio >= 3) return 'full';
  if(ratio >= 1.55) return 2;
  return 1;
}

/** '2018-2020' 같은 묶음 시기는 붙임표를 반각에서 전각으로 바꿔 읽기 좋게 한다. */
export function chapterLabel(chapter){
  return String(chapter.id).replace('-', '–');
}

export function thumbOf(item){
  return item.thumb || item.image || item.thumbnail;
}

/** 화면에 그대로 꽂아도 안전하도록 태그 문자를 막는다. */
export function esc(value){
  return String(value ?? '').replace(/[&<>"]/g, ch =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
}

/** 제목에 든 줄바꿈은 <br> 로 살린다. */
export function titleHTML(value){
  return esc(value).replace(/\n/g, '<br>');
}
