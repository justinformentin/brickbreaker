let playing = false;
let brickBreaker;

function initBrickBreaker(args, options) {
  const { gameContainer, referenceContainer, canvas } = args;

  const refHeight = referenceContainer.offsetHeight + 150 + 'px';
  const refWidth = referenceContainer.offsetWidth + 'px';
  canvas.height = referenceContainer.offsetHeight + 150;
  canvas.width = referenceContainer.offsetWidth;

  if (!playing) {
    canvas.style.display = 'block';
    referenceContainer.style.height = refHeight;
    referenceContainer.style.width = refWidth;
    brickBreaker = brickBreakerGame(args, options);
    gameContainer.style.display = 'none';
    playing = true;
  } else {
    // document.dispatchEvent(new Event('canvas:gameCleared'));
    referenceContainer.style.height = 'auto';
    canvas.style.display = 'none';
    gameContainer.style.display = 'flex';
    brickBreaker.clearGame();
    playing = false;
  }
}
