const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let size, offsetX, offsetY, cellSize;

let board, currentPlayer, gameOver;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const side = Math.min(canvas.width, canvas.height) * 0.8;
  size = side;
  offsetX = (canvas.width - side) / 2;
  offsetY = (canvas.height - side) / 2;
  cellSize = side / 3;
  drawBoard();
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function resetGame() {
  board = Array(3).fill(null).map(() => Array(3).fill(null));
  currentPlayer = 'X';
  gameOver = false;
  drawBoard();
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#888';

  for (let i = 1; i <= 2; i++) {
    // Linhas verticais
    ctx.beginPath();
    ctx.moveTo(offsetX + i * cellSize, offsetY);
    ctx.lineTo(offsetX + i * cellSize, offsetY + size);
    ctx.stroke();

    // Linhas horizontais
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY + i * cellSize);
    ctx.lineTo(offsetX + size, offsetY + i * cellSize);
    ctx.stroke();
  }

  // Redesenha as jogadas anteriores
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === 'X') drawX(r, c, false);
      if (board[r][c] === 'O') drawO(r, c, false);
    }
  }
}

canvas.addEventListener('click', (e) => {
  if (gameOver) {
    resetGame();
    return;
  }

  const x = e.clientX - offsetX;
  const y = e.clientY - offsetY;
  if (x < 0 || y < 0 || x > size || y > size) return;

  const c = Math.floor(x / cellSize);
  const r = Math.floor(y / cellSize);

  if (board[r][c]) return; // célula ocupada

  if (currentPlayer === 'X') {
    drawX(r, c, true);
    board[r][c] = 'X';
    if (checkWin('X')) return endGame('X');
    currentPlayer = 'O';
  } else {
    drawO(r, c, true);
    board[r][c] = 'O';
    if (checkWin('O')) return endGame('O');
    currentPlayer = 'X';
  }

  if (board.flat().every(cell => cell)) endGame(null); // empate
});

function drawX(row, col, animate = true) {
  const x0 = offsetX + col * cellSize;
  const y0 = offsetY + row * cellSize;
  const pad = cellSize * 0.2;
  const x1 = x0 + pad;
  const y1 = y0 + pad;
  const x2 = x0 + cellSize - pad;
  const y2 = y0 + cellSize - pad;
  const line1 = { x1, y1, x2, y2 };
  const line2 = { x1: x2, y1, x2: x1, y2 };

  ctx.lineWidth = 10;
  ctx.strokeStyle = '#00ffff';
  ctx.lineCap = 'round';

  if (!animate) {
    ctx.beginPath();
    ctx.moveTo(line1.x1, line1.y1);
    ctx.lineTo(line1.x2, line1.y2);
    ctx.moveTo(line2.x1, line2.y1);
    ctx.lineTo(line2.x2, line2.y2);
    ctx.stroke();
    return;
  }

  const duration = 400;
  let start = null;

  function step(time) {
    if (!start) start = time;
    const elapsed = time - start;
    ctx.save();
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#00ffff';
    ctx.lineCap = 'round';

    const progress1 = Math.min(elapsed / duration, 1);
    const progress2 = Math.max(0, Math.min((elapsed - duration) / duration, 1));

    drawBoard();

    // desenha a primeira linha
    ctx.beginPath();
    ctx.moveTo(line1.x1, line1.y1);
    ctx.lineTo(line1.x1 + (line1.x2 - line1.x1) * progress1,
                line1.y1 + (line1.y2 - line1.y1) * progress1);
    ctx.stroke();

    // desenha a segunda linha (depois da primeira)
    if (elapsed > duration) {
      ctx.beginPath();
      ctx.moveTo(line2.x1, line2.y1);
      ctx.lineTo(line2.x1 + (line2.x2 - line2.x1) * progress2,
                  line2.y1 + (line2.y2 - line2.y1) * progress2);
      ctx.stroke();
    }
    ctx.restore();

    if (elapsed < duration * 2) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function drawO(row, col, animate = true) {
  const x0 = offsetX + col * cellSize + cellSize / 2;
  const y0 = offsetY + row * cellSize + cellSize / 2;
  const radius = cellSize * 0.3;

  ctx.lineWidth = 10;
  ctx.strokeStyle = '#ff4081';

  if (!animate) {
    ctx.beginPath();
    ctx.arc(x0, y0, radius, 0, 2 * Math.PI);
    ctx.stroke();
    return;
  }

  const duration = 800;
  let start = null;

  function step(time) {
    if (!start) start = time;
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);

    drawBoard();

    ctx.beginPath();
    ctx.arc(x0, y0, radius, 0, progress * 2 * Math.PI);
    ctx.stroke();

    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function checkWin(p) {
  const lines = [
    // Linhas horizontais
    [[0,0],[0,1],[0,2]],
    [[1,0],[1,1],[1,2]],
    [[2,0],[2,1],[2,2]],
    // Verticais
    [[0,0],[1,0],[2,0]],
    [[0,1],[1,1],[2,1]],
    [[0,2],[1,2],[2,2]],
    // Diagonais
    [[0,0],[1,1],[2,2]],
    [[0,2],[1,1],[2,0]],
  ];

  for (const line of lines) {
    const [a,b,c] = line;
    if (board[a[0]][a[1]] === p && board[b[0]][b[1]] === p && board[c[0]][c[1]] === p) {
      drawWinLine(a, c);
      return true;
    }
  }
  return false;
}

function drawWinLine(a, c) {
  const pad = cellSize / 2;
  const x1 = offsetX + a[1] * cellSize + pad;
  const y1 = offsetY + a[0] * cellSize + pad;
  const x2 = offsetX + c[1] * cellSize + pad;
  const y2 = offsetY + c[0] * cellSize + pad;

  ctx.strokeStyle = '#0f0';
  ctx.lineWidth = 12;

  let progress = 0;
  function animate() {
    drawBoard();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + (x2 - x1) * progress, y1 + (y2 - y1) * progress);
    ctx.stroke();
    progress += 0.05;
    if (progress <= 1) requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

function endGame(winner) {
  gameOver = true;
  setTimeout(() => {
    ctx.font = `${cellSize * 0.5}px Arial`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const msg = winner ? `${winner} venceu!` : 'Empate!';
    ctx.fillText(msg, canvas.width / 2, offsetY / 2);
    ctx.font = `${cellSize * 0.25}px Arial`;
    ctx.fillText('Clique para reiniciar', canvas.width / 2, offsetY / 2 + cellSize * 0.4);
  }, 400);
}

resetGame();