interface Brick extends Coord {
  status: number;
}
interface Coord {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
}
interface Args {
  canvas: HTMLCanvasElement;
  gameContainer: HTMLElement;
  nodeList: NodeListOf<HTMLElement>;
}
interface Sounds {
  win: string;
  brick: string;
  paddle: string;
  loseLife: string;
  gameOver: string;
}
interface Colors {
  text?: string;
  paddle?: string;
  bricks?: string;
  ball?: string;
}
interface Options {
  sounds: Sounds;
  colors?: Colors;
  ballRadius?: number;
  paddleHeight?: number;
  paddleWidth?: number;
  lives?: number;
  levels?: number;
}

function getBrickCoords(
  nodeList: NodeListOf<HTMLElement>,
  gameContainer: HTMLElement
): Brick[] {
  const parentRect: DOMRect = gameContainer.getBoundingClientRect();
  return Array.from(nodeList).map((el) => {
    const rect: DOMRect = el.getBoundingClientRect();
    return {
      x: rect.left - parentRect.left,
      y: rect.top - parentRect.top,
      width: el.offsetWidth,
      height: el.offsetHeight,
      text: el.innerText,
      status: 0,
    };
  });
}
function brickBreakerGame(args: Args, options: Options) {
  const { win, brick, paddle, loseLife, gameOver: gameOverSound } = options.sounds;

  const canvas = args.canvas;
  const ctx = args.canvas.getContext('2d');
  const initialBricks = getBrickCoords(args.nodeList, args.gameContainer);
  const resetBricks = () => initialBricks.map((coord) => ({ ...coord, status: 0 }));
  let bricks: Brick[] = initialBricks;

  const ballRadius = options.ballRadius || 10;
  const paddleHeight = options.paddleHeight || 10;
  const paddleWidth = options.paddleWidth || 75;
  const levels = options.levels || 2;
  let level = 1;
  let lives = options.lives || 100;

  let x = canvas.width / 2;
  let y = canvas.height - 50;
  let paddleX = (canvas.width - paddleWidth) / 2;

  let dx = 3;
  let dy = -3;
  let rightPressed = false;
  let leftPressed = false;
  let score = 0;
  let gameCleared = false;
  let gameOver = false;

  const BLUE = '#a9ccea';
  const DARK_BLUE = '#30667a';

  const colors = {
    paddle: DARK_BLUE,
    ball: DARK_BLUE,
    bricks: BLUE,
    text: BLUE,
    ...options.colors,
  };

  function playAudio(audioFile: string, volume?: number): void {
    const audio: HTMLAudioElement = new Audio(audioFile);
    audio.volume = volume || 0.75;
    audio.play();
  }

  function resetCoordValues() {
    x = canvas.width / 2;
    y = canvas.height - 50;
    dx = 3;
    dy = -3;
    paddleX = (canvas.width - paddleWidth) / 2;
  }

  function brickCollision(b) {
    score++;
    // Every score multiple of 3, increase ball speed by 0.5.
    if (score % 3 === 0) {
      dx = dx < 0 ? dx - 0.5 : dx + 0.5;
      dy = dy < 0 ? dy - 0.5 : dy + 0.5;
    }
    playAudio(brick);
    const totalExpectedScore = bricks.length * ((level * (level + 1)) / 2);
    if (score === totalExpectedScore) {
      gameOver = true;
      playAudio(win);
      drawOverlay(level < levels ? 'Click to start next level' : 'You Win');
      if (level < levels) {
        const resetListener = () => {
          gameOver = false;
          level++;
          bricks = resetBricks();
          resetCoordValues();
          draw();
          canvas.removeEventListener('click', resetListener);
        };
        canvas.addEventListener('click', resetListener);
      }
    }
  }

  function brickCollisionDetection() {
    // console.log('bricks', bricks);
    // Add or substract ball radius offset to make collision more precise.
    // No offset and the collision happens when the center of the ball contacts the brick.
    // Offset using just ballRadius without dividing makes it so multipl bricks can be hit simultaneosly on the corners.
    const brOffset = ballRadius / 1.125;
    bricks.forEach((b) => {
      if (
        b.status < level &&
        x + brOffset > b.x &&
        x - brOffset < b.x + b.width &&
        y + brOffset > b.y &&
        y - brOffset < b.y + b.height
      ) {
        dy = -dy;
        b.status++;
        brickCollision(b);
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
          resetCoordValues();
        }
      }
    }
  }

  function drawItem(item, color) {
    ctx.beginPath();
    item();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
  }

  const drawBall = () =>
    drawItem(() => ctx.arc(x, y, ballRadius, 0, Math.PI * 2), colors.ball);

  const drawPaddle = () =>
    drawItem(
      () =>
        ctx.rect(paddleX, canvas.height - paddleHeight - 30, paddleWidth, paddleHeight),
      colors.paddle
    );

  function roundedRect(
    rectX: number,
    rectY: number,
    rectWidth: number,
    rectHeight: number,
    cornerRadius?: number
  ) {
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

  const LevelStatusColors = [[BLUE], [DARK_BLUE, BLUE]];

  function drawBricks() {
    // console.log('bricks', bricks);
    bricks.forEach((brick: Brick) => {
      if (brick.status < level) {
        ctx.fillStyle = LevelStatusColors[level - 1][brick.status];
        ctx.strokeStyle = LevelStatusColors[level - 1][brick.status];

        roundedRect(brick.x, brick.y, brick.width, brick.height, 10);
        ctx.fillStyle = '#000000';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(brick.text, brick.x + brick.width / 2, brick.y + brick.height / 2);
      }
    });
  }

  function drawText(text, width, height) {
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = colors.text;
    ctx.fillText(text, width, height);
  }

  const drawScore = () => drawText('Score: ' + score, 38, canvas.height - 15);

  const drawLives = () =>
    drawText('Lives: ' + lives, canvas.width - 45, canvas.height - 15);

  function drawOverlay(text) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawText(text, canvas.width / 2, canvas.height / 2);
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

  const keyDownBase = (keyCode: number, bool: boolean) => {
    rightPressed = bool && keyCode === 39;
    leftPressed = bool && keyCode === 37;
  };

  const keyDownHandler = (e: KeyboardEvent) => keyDownBase(e.keyCode, true);

  const keyUpHandler = (e: KeyboardEvent) => keyDownBase(e.keyCode, false);

  document.addEventListener('keydown', keyDownHandler, false);
  document.addEventListener('keyup', keyUpHandler, false);

  const canvasRect = canvas.getBoundingClientRect();

  function mouseMoveHandler(e: MouseEvent) {
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

  draw();

  return { clearGame };
}
