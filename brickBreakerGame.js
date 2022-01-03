// import winSound from '../sounds/win.mp3';
// import brickSound from '../sounds/brick.mp3';
// import paddleSound from '../sounds/paddle.mp3';
// import loseLifeSound from '../sounds/loselife.mp3';
// import gameOverSound from '../sounds/gameover.mp3';
const winSound = '../sounds/win.mp3';
const brickSound = '../sounds/brick.mp3';
const paddleSound = '../sounds/paddle.mp3';
const loseLifeSound = '../sounds/loselife.mp3';
const gameOverSound = '../sounds/gameover.mp3';

function brickBreakerGame() {
  let canvas;
  let ctx;
  let ballRadius = 10;
  let x;
  let y;
  let dx = 2;
  let dy = -2;
  let paddleHeight = 10;
  let paddleWidth = 75;
  let paddleX;
  let rightPressed = false;
  let leftPressed = false;
  let score = 0;
  let lives = 2;
  let paddleRect;
  let bricks = [];
  let gameStarted = false;
  let gameCleared = false;
  let gameOver = false;
  // const BLUE = '#96c9dc';
  const BLUE = '#a9ccea';
  const DARK_BLUE = '#30667a';

  document.addEventListener('canvas:gameCleared', () => {
    !gameCleared && (gameCleared = true);
    ctx && ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  function playAudio(audioFile, volume){
    const audio = new Audio(audioFile);
    audio.volume = volume || 0.75;
    audio.play();
  }

  function gameStartCoords() {
    x = canvas.width / 2;
    y = canvas.height - 50;
    dx = 3;
    dy = -3;
    paddleX = (canvas.width - paddleWidth) / 2;
  }

  function collisionDetection() {
    bricks.forEach((b) => {
      if (
        b.status === 1 &&
        x > b.x &&
        x < b.x + b.width &&
        y > b.y &&
        y < b.y + b.height
      ) {
        dy = -dy;
        b.status = 0;
        score++;
        playAudio(brickSound);
        if (score === bricks.length) {
          gameOver = true;
          playAudio(winSound);
          drawOverlay('You Win');
        }
      }
    });
  }

  function drawBall() {
    let paddleOffsetHeight = 0;
    // if (renderedCount < 3) {
    //   paddleOffsetHeight = paddleHeight - 5;
    //   renderedCount++;
    // }
    ctx.beginPath();
    ctx.arc(x, y - paddleOffsetHeight, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = DARK_BLUE;
    ctx.fill();
    ctx.closePath();
  }

  function drawPaddle() {
    ctx.beginPath();
    paddleRect = {
      x: paddleX,
      y: canvas.height - paddleHeight - 30,
      width: paddleWidth,
      height: paddleHeight,
    };
    ctx.rect(paddleRect.x, paddleRect.y, paddleRect.width, paddleRect.height);

    ctx.fillStyle = DARK_BLUE;
    ctx.fill();
    ctx.closePath();
  }

  function roundedRect(rectX, rectY, rectWidth, rectHeight, cornerRadius) {
    const radius = Math.min(
      Math.max(rectWidth - 1, 1),
      Math.max(rectHeight - 1, 1),
      cornerRadius
    );
    const rx = rectX + radius / 2,
      ry = rectY + radius / 2,
      rw = rectWidth - radius,
      rh = rectHeight - radius;
    ctx.lineJoin = 'round';
    ctx.lineWidth = radius;
    ctx.strokeRect(rx, ry, rw, rh);
    ctx.fillRect(rx, ry, rw, rh);
    ctx.fill();
  }

  function drawBricks() {
    bricks.forEach((coord) => {
      if (coord.status === 1) {
        ctx.fillStyle = BLUE;
        ctx.strokeStyle = BLUE;
        roundedRect(coord.x, coord.y, coord.width, coord.height, 10);

        ctx.fillStyle = '#000000';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          coord.text,
          coord.x + coord.width / 2,
          coord.y + coord.height / 2
        );
      }
    });
  }

  function drawScore() {
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = DARK_BLUE;
    ctx.fillText('Score: ' + score, 38, canvas.height - 15);
  }

  function drawLives() {
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = DARK_BLUE;
    ctx.fillText('Lives: ' + lives, canvas.width - 45, canvas.height - 15);
  }

  function drawOverlay(text) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = DARK_BLUE;
    roundedRect(canvas.width / 2 - 100, canvas.height / 2 - 50, 200, 100);
    ctx.font = '16px Arial';
    ctx.fillStyle = DARK_BLUE;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  }

  function handleKeyPresses() {
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
      paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
      paddleX -= 7;
    }
  }

  function draw() {
    if (!gameStarted) {
      gameStartCoords();
      gameStarted = true;
    }

    if (gameCleared) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      gameCleared = false;
    } else if (!gameOver) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBricks();
      drawBall();
      drawPaddle();
      drawScore();
      drawLives();
      collisionDetection();
      handleKeyPresses();

      if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
      }

      if (y + dy < ballRadius) {
        dy = -dy;
        // console.log('y+dy<ballRadius', dy)
      } else if (y + dy > canvas.height - ballRadius - (paddleHeight + 20)) {
        // } else if (y + dy > paddleHeight) {
        // console.log('paddleHeight', paddleHeight)
        // console.log('y',y)
        if (x > paddleX && x < paddleX + paddleWidth && y > paddleHeight) {
          // if (intersectsPaddle([x, y], [paddleRect.x, paddleRect.y, paddleRect.width, paddleRect.height])) {
          dy = -dy;
          playAudio(paddleSound);
        } else {
          lives--;
          if (!lives) {
            gameOver = true;
            drawOverlay('Game Over');
            playAudio(gameOverSound);
          } else {
            playAudio(loseLifeSound);
            gameStartCoords();
          }
        }
      }

      x += dx;
      y += dy;
      !gameCleared && requestAnimationFrame(draw);
    }
  }

  return (canv, context, coords) => {
    // console.log('brickbreaker init canv', canv);
    canvas = canv;
    ctx = context;
    bricks = coords;
    x = canvas.width / 2;
    y = canvas.height - 30;
    paddleX = (canvas.width - paddleWidth) / 2;
    lives = 2;
    score = 0;
    gameCleared = false;
    gameOver = false;

    const keyDownBase = (keyCode, bool) => {
      rightPressed = bool && keyCode === 39;
      leftPressed = bool && keyCode === 37;
    };

    const keyDownHandler = (e) => keyDownBase(e.keyCode, true);

    const keyUpHandler = (e) => keyDownBase(e.keyCode, false);

    document.addEventListener('keydown', keyDownHandler, false);
    document.addEventListener('keyup', keyUpHandler, false);

    const canvasRect = canvas.getBoundingClientRect();
    function mouseMoveHandler(e) {
      const relativeX = e.clientX - canvas.offsetLeft;
      const paddleHalf = paddleWidth / 2;
      if (relativeX > canvasRect.left && relativeX < canvasRect.right) {
        const newLoc = relativeX - canvasRect.left;
        const leftWallLimit = newLoc - paddleHalf >= 0;
        const rightWallLimit = newLoc <= canvas.width - paddleHalf;
        if (leftWallLimit && rightWallLimit) {
          paddleX = relativeX - canvasRect.left - paddleHalf;
        }
      }
    }

    canvas.addEventListener('mousemove', mouseMoveHandler, false);

    draw();
  }

}
