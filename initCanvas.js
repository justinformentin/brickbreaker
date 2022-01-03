const referenceContainer = document.querySelector(".reference-container");
const blockContainer = document.querySelector(".block-container");
const blockCanvas = document.querySelector(".block-canvas");

referenceContainer.refHeight = referenceContainer.offsetHeight + 150 + "px";
referenceContainer.refWidth = referenceContainer.offsetWidth + "px";
blockCanvas.height = referenceContainer.offsetHeight + 150;
blockCanvas.width = referenceContainer.offsetWidth;

let playing = false;

function getBrickCoords() {
  const parentRect = blockContainer.getBoundingClientRect();
  const blocks = blockContainer.querySelectorAll("a");
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
    const ctx = blockCanvas.getContext("2d");
    const coords = getBrickCoords();
    blockCanvas.style.display = "block";
    playing = true;
    referenceContainer.style.height = referenceContainer.refHeight;
    referenceContainer.style.width = referenceContainer.refWidth;
    const brickBreaker = brickBreakerGame();
    brickBreaker(blockCanvas, ctx, coords);
    blockContainer.style.display = 'none';

  }
}

document.querySelector(".start-game").addEventListener("click", () => {
  if (!playing) {
    convertToCanvas();
  } else {
    document.dispatchEvent(new Event("canvas:gameCleared"));
    referenceContainer.style.height = "auto";
    blockCanvas.style.display = "none";
    playing = false;
    blockContainer.style.display = 'flex';
  }
});
