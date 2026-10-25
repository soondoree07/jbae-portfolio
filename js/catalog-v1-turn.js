/* 쪽을 넘기는 손맛 — 라이브러리 기본 동작에서 세 가지를 고친다.
   1) 쪽 가운데를 잡아도 세로로 접히며 넘어간다
   2) 넘기는 동안 들린 종이에만 뒷면이 비친다
   3) 표지를 넘길 때 쪽이 왼쪽 위로 밀리지 않는다 */

/**
 * 라이브러리는 잡은 자리로 위·아래 꼭짓점을 끌고 와서, 가운데를 잡으면 쪽이 대각선으로 찢어지듯 접힌다.
 * 가운데 띠에서 잡기 시작하면 손의 높이를 쪽 윗변에 고정해, 접히는 선이 세로로 서서 쪽이 옆으로 넘어가게 한다.
 */
const CORNER_BAND = 0.2;   // 위아래 20% 안에서 잡으면 원래처럼 꼭짓점을 잡는다

export function enableMiddleGrab(book){
  const start = book.startUserTouch.bind(book);
  const move = book.userMove.bind(book);
  const stop = book.userStop.bind(book);
  let grabbedMiddle = false;
  const level = pos => (grabbedMiddle ? {x:pos.x, y:book.getBoundsRect().top + 1} : pos);

  book.startUserTouch = (pos) => {
    const rect = book.getBoundsRect();
    const fromTop = (pos.y - rect.top) / rect.height;
    grabbedMiddle = fromTop > CORNER_BAND && fromTop < 1 - CORNER_BAND;
    start(level(pos));
  };
  book.userMove = (pos, isTouch) => move(level(pos), isTouch);
  book.userStop = (pos, isSwipe) => {
    stop(level(pos), isSwipe);
    grabbedMiddle = false;
  };
}

/**
 * 넘기는 동안 들린 종이에 .is-turning 을 붙인다. 비침(.cat-through)은 이 쪽에서만 보인다.
 * 들린 종이는 라이브러리 안쪽(flipController.flippingPage)에만 있고 넘김 도중에 바뀔 수 있어,
 * 넘기는 동안은 매 프레임 확인한다.
 */
export function showThroughWhileTurning(book){
  let marked = null;
  let frame = 0;

  const markTo = (el) => {
    if(el === marked) return;
    marked?.classList.remove('is-turning');
    el?.classList.add('is-turning');
    marked = el;
  };
  const follow = () => {
    markTo(book.getFlipController().flippingPage?.element ?? null);
    frame = requestAnimationFrame(follow);
  };

  book.on('changeState', (e) => {
    cancelAnimationFrame(frame);
    if(e.data === 'read') markTo(null);
    else follow();
  });
}

/**
 * 표지·뒤표지처럼 단단한 종이(hard)를 넘길 때 쪽이 왼쪽 위로 밀리는 라이브러리 버그를 고친다.
 * 라이브러리는 단단한 종이를 left:0 · top:0 에 놓고 회전만 시킨다. 책이 무대를 꽉 채울 때만 맞는 계산이라,
 * 책을 무대 가운데에 둔 이 화면에서는 왼쪽 쪽은 책의 왼쪽 여백만큼, 양쪽 모두 위 여백만큼 어긋난다.
 * 그려진 직후 책의 실제 자리(getRect 의 left · top)로 옮겨 준다. 오른쪽 쪽은 가로 위치가 이미 맞다.
 */
const LEFT_SIDE = 0;   // 라이브러리의 쪽 방향 값: 0 = 왼쪽, 1 = 오른쪽

export function fixHardPageOffset(book){
  const pageProto = Object.getPrototypeOf(book.getPage(0));
  const drawHard = pageProto.drawHard;
  pageProto.drawHard = function(base){
    drawHard.call(this, base);
    const rect = this.render.getRect();
    this.element.style.top = `${rect.top}px`;
    if(this.orientation === LEFT_SIDE) this.element.style.left = `${rect.left}px`;
  };
}
