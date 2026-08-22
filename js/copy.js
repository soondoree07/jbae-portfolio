/* 눌러서 복사되는 연락처 줄.
   메일 프로그램이 없는 사람도 막히지 않도록, 링크가 아니라 복사로 동작한다. */

const DONE_TEXT = '복사했어요';
const FAIL_TEXT = '직접 복사해 주세요';
const HINT_TEXT = '눌러서 복사';
const RESET_AFTER = 2200;

async function writeToClipboard(text){
  if(navigator.clipboard && window.isSecureContext){
    try{ await navigator.clipboard.writeText(text); return true; }catch{ /* 아래 방법으로 넘어간다 */ }
  }
  // 옛 브라우저나 보안 연결이 아닌 곳에서 쓰는 방법
  const holder = document.createElement('textarea');
  holder.value = text;
  holder.setAttribute('readonly', '');
  holder.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
  document.body.appendChild(holder);
  holder.select();
  let ok = false;
  try{ ok = document.execCommand('copy'); }catch{ ok = false; }
  holder.remove();
  return ok;
}

export function copyLineHTML(value, label){
  return `
    <button class="copy-line" type="button" data-copy="${value}" aria-label="${label} 복사">
      <span class="copy-value">${value}</span>
      <span class="copy-note" aria-live="polite">${HINT_TEXT}</span>
    </button>`;
}

/** 복사가 막혔으면 글자를 대신 선택해 준다. 바로 Ctrl+C 하거나 길게 눌러 복사할 수 있다. */
function selectText(node){
  try{
    const range = document.createRange();
    range.selectNodeContents(node);
    const picked = window.getSelection();
    picked.removeAllRanges();
    picked.addRange(range);
  }catch{ /* 선택까지 막히면 그냥 둔다 */ }
}

export function bindCopyLines(root){
  if(!root) return;
  let timer = null;
  root.addEventListener('click', async (e) => {
    const line = e.target.closest('.copy-line');
    if(!line) return;
    const note = line.querySelector('.copy-note');
    const ok = await writeToClipboard(line.dataset.copy);
    if(!ok) selectText(line.querySelector('.copy-value'));

    clearTimeout(timer);
    note.textContent = ok ? DONE_TEXT : FAIL_TEXT;
    line.classList.toggle('is-done', ok);
    timer = setTimeout(() => {
      note.textContent = HINT_TEXT;
      line.classList.remove('is-done');
    }, RESET_AFTER);
  });
}
