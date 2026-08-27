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
 * 실제 작품 크기(cm)에서 화면에 쓸 가로세로 비율을 뽑는다. 표기는 세로×가로 순이다.
 *
 * 사진 비율은 촬영마다 1~2% 씩 달라서, 같은 112×162cm 작품이 나란히 걸려도
 * 높이가 어긋나 보인다. 작품 크기를 기준으로 삼으면 같은 크기는 언제나 같게 걸린다.
 *
 * 다만 연작은 예외다. '100×45cm (15pieces)' 는 낱장 크기라
 * 열다섯 장을 이어 찍은 사진(8.28:1)과 아무 상관이 없다. 그대로 쓰면 작품이 잘려 나간다.
 */
const SERIES_MARK = /pieces|ea\./i;

export function artRatio(work){
  const size = work && work.size;
  if(!size || SERIES_MARK.test(size)) return null;
  const nums = String(size).match(/[\d.]+/g);
  if(!nums || nums.length < 2) return null;
  const height = parseFloat(nums[0]), width = parseFloat(nums[1]);
  return height > 0 && width > 0 ? width / height : null;
}

/** 화면에 걸 비율. 작품 크기를 우선하고, 없으면 사진 비율로 물러선다. */
export function displayRatio(item){
  if(!item) return null;
  const byArt = artRatio(item);
  if(byArt) return byArt;
  return item.w && item.h ? item.w / item.h : null;
}

/** 3:1을 넘는 띠 모양 작품. 격자에서도 시기 대표 자리에서도 따로 다뤄야 한다. */
export function isPanorama(item){
  const ratio = displayRatio(item);
  return !!ratio && ratio >= 3;
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
  const ratio = displayRatio(work);
  if(!ratio) return 1;
  if(ratio >= 3) return 'full';
  return ratio >= 1.55 ? 2 : 1;
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
