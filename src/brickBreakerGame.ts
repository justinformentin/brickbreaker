function brickBreakerGame(args, options) {
  const { win, brick, paddle, loseLife, gameOver: gameOverSound } = options.sounds;

  const canvas = args.canvas;
  const ctx = args.canvas.getContext('2d');
  const bricks = args.coords;

  const ballRadius = 10;
  const paddleHeight = 10;
  const paddleWidth = 75;

  let x = canvas.width / 2;
  let y = canvas.height - 30;
  let paddleX = (canvas.width - paddleWidth) / 2;

  let dx = 3;
  let dy = -3;
  let rightPressed = false;
  let leftPressed = false;
  let score = 0;
  let lives = 3;
  let gameCleared = false;
  let gameOver = false;
  // const BLUE = '#96c9dc';
  const BLUE = '#a9ccea';
  const DARK_BLUE = '#30667a';

  function playAudio(audioFile, volume?: number) {
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

  function brickCollisionDetection() {
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
        playAudio(brick);
        if (score === bricks.length) {
          gameOver = true;
          playAudio(win);
          drawOverlay('You Win');
        }
      }
    });
  }

  function paddleCollisionDetection() {
    // IF BALL HITS WALL, CHANGE DIRECTION
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
    if (y + dy < ballRadius) {
      // IF BALL HITS CEILING, CHANGE DIRECTIOn
      dy = -dy;
    } else if (y + dy > canvas.height - ballRadius - (paddleHeight + 20)) {
      if (x > paddleX && x < paddleX + paddleWidth && y > paddleHeight) {
        // BALL ABOVE PADDLE
        // IF BALL IS MOVING ONE DIRECTION AND HITS HALF OF PADDLE ON OTHER SIDE, CHANGE DIRECTIONS
        const paddleMidPoint = paddleX + paddleWidth / 2;
        const ballMoveLeftHitRight = dx < 0 && x > paddleMidPoint;
        const ballMoveRightHitLeft = dx > 0 && x < paddleMidPoint;
        if (ballMoveLeftHitRight || ballMoveRightHitLeft) dx = -dx;
        // PADDLE COLLISION, CHANGE BALL DIRECTION
        dy = -dy;
        playAudio(paddle);
      } else {
        // BALL UNDER PADDLE
        // REMOVE LIFE
        lives--;
        // RESET BALL SPEED
        dx = -3;
        dy = -3;

        if (!lives) {
          gameOver = true;
          drawOverlay('Game Over');
          playAudio(gameOverSound);
        } else {
          playAudio(loseLife);
          gameStartCoords();
        }
      }
    }
  }

  function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = DARK_BLUE;
    ctx.fill();
    ctx.closePath();
  }

  function drawPaddle() {
    ctx.beginPath();
    const paddleRectY = canvas.height - paddleHeight - 30;
    ctx.rect(paddleX, paddleRectY, paddleWidth, paddleHeight);
    ctx.fillStyle = DARK_BLUE;
    ctx.fill();
    ctx.closePath();
  }

  function roundedRect(rectX, rectY, rectWidth, rectHeight, cornerRadius?) {
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
        ctx.fillText(coord.text, coord.x + coord.width / 2, coord.y + coord.height / 2);
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
    if (!gameOver) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBricks();
      drawBall();
      drawPaddle();
      drawScore();
      drawLives();
      brickCollisionDetection();
      paddleCollisionDetection();
      handleKeyPresses();
      // Move ball
      x += dx;
      y += dy;
      !gameCleared && requestAnimationFrame(draw);
    }
  }

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

  const clearGame = () => {
    gameCleared = true;
    ctx && ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.removeEventListener('canvas:gameCleared', clearGame);
    document.removeEventListener('keydown', keyDownHandler);
    document.removeEventListener('keyup', keyUpHandler);
    canvas.removeEventListener('mousemove', mouseMoveHandler, false);
  };

  document.addEventListener('canvas:gameCleared', clearGame);

  gameStartCoords();
  draw();

  return { clearGame };
}