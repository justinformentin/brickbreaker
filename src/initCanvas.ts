const referenceContainer: HTMLElement = document.querySelector('.reference-container');
const blockContainer: HTMLElement = document.querySelector('.block-container');
const blockCanvas: HTMLCanvasElement = document.querySelector('.block-canvas');

const refHeight = referenceContainer.offsetHeight + 150 + 'px';
const refWidth = referenceContainer.offsetWidth + 'px';
blockCanvas.height = referenceContainer.offsetHeight + 150;
blockCanvas.width = referenceContainer.offsetWidth;

let playing = false;
let brickBreaker;

function getBrickCoords() {
  const parentRect = blockContainer.getBoundingClientRect();
  const blocks = blockContainer.querySelectorAll('a');
  return Array.from(blocks).map((el) => {
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left - parentRect.left,
      y: rect.top - parentRect.top,
      width: el.offsetWidth,
      height: el.offsetHeight,
      text: el.innerText,
      status: 1,
    };
  });
}

function convertToCanvas() {
  if (blockCanvas) {
    // const ctx = blockCanvas.getContext('2d');
    const coords = getBrickCoords();
    blockCanvas.style.display = 'block';
    playing = true;
    referenceContainer.style.height = refHeight;
    referenceContainer.style.width = refWidth;

    const sounds = {
      win: 'sounds/win.mp3',
      brick: 'sounds/brick.mp3',
      paddle: 'sounds/paddle.mp3',
      loseLife: 'sounds/loselife.mp3',
      gameOver: 'sounds/gameover.mp3',
    };
    brickBreaker = brickBreakerGame({ canvas: blockCanvas, coords }, { sounds });
    blockContainer.style.display = 'none';
  }
}

document.querySelector('.start-game').addEventListener('click', () => {
  if (!playing) {
    convertToCanvas();
  } else {
    // document.dispatchEvent(new Event('canvas:gameCleared'));
    brickBreaker.clearGame();
    referenceContainer.style.height = 'auto';
    blockCanvas.style.display = 'none';
    playing = false;
    blockContainer.style.display = 'flex';
  }
});
