const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const msgEl = document.getElementById('message');
const restartBtn = document.getElementById('restartBtn');

let gameRunning = false;
let score = 0;
let bestScore = localStorage.getItem('snakeXmasBest') || 0;
bestEl.textContent = bestScore;

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{x: 10, y: 10}];
let food = {};
let dx = 0;
let dy = 0;
let speed = 150;

function init() {
  snake = [{x: 10, y: 10}];
  dx = 0;
  dy = 0;
  score = 0;
  generateFood();
  updateScore();
  msgEl.textContent = 'Swipe or Arrow Keys to Start!';
  gameRunning = false;
  restartBtn.style.display = 'none';
  draw();
}

function generateFood() {
  food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
  };
  // Ensure not on snake
  for(let part of snake) {
    if(part.x === food.x && part.y === food.y) {
      generateFood();
      return;
    }
  }
}

function update() {
  if(!gameRunning) return;

  const head = {x: snake[0].x + dx, y: snake[0].y + dy};

  // Wall collision
  if(head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    gameOver();
    return;
  }

  // Self collision
  for(let part of snake) {
    if(head.x === part.x && head.y === part.y) {
      gameOver();
      return;
    }
  }

  snake.unshift(head);

  // Eat food
  if(head.x === food.x && head.y === food.y) {
    score += 10;
    speed = Math.max(80, speed - 2);  // Gradual speed up
    updateScore();
    generateFood();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  // Clear
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Snake body (Christmas lights)
  for(let i = 0; i < snake.length; i++) {
    const part = snake[i];
    ctx.fillStyle = i === 0 ? '#e74c3c' : (i % 3 === 0 ? '#2ecc71' : '#f39c12');
    ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
  }

  // Food (Gift)
  ctx.fillStyle = '#f1c40f';
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
  ctx.fillStyle = '#e67e22';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🎁', food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2 + 4);

  // Snow on canvas (simple dots)
  ctx.fillStyle = '#fff';
  for(let i = 0; i < 20; i++) {
    const sx = Math.random() * canvas.width;
    const sy = Math.random() * canvas.height;
    ctx.beginPath();
    ctx.arc(sx, sy, 1, 0, Math.PI * 2);
    ctx.fill();
  }
}

function gameOver() {
  gameRunning = false;
  if(score > bestScore) {
    bestScore = score;
    localStorage.setItem('snakeXmasBest', bestScore);
    bestEl.textContent = bestScore;
  }
  msgEl.innerHTML = `Game Over! Score: ${score} 🎄 Merry Christmas!`;
  restartBtn.style.display = 'inline-block';
}

function updateScore() {
  scoreEl.textContent = score;
}

function changeDirection(newDx, newDy) {
  if((dx === -newDx && dy === newDy) || (dx === newDx && dy === -newDy)) return;  // Prevent reverse
  dx = newDx;
  dy = newDy;
  if(!gameRunning) {
    gameRunning = true;
    msgEl.textContent = '';
    gameLoop = setInterval(update, speed);
  }
}

// Controls
document.addEventListener('keydown', e => {
  e.preventDefault();
  if(e.key === 'ArrowUp') changeDirection(0, -1);
  if(e.key === 'ArrowDown') changeDirection(0, 1);
  if(e.key === 'ArrowLeft') changeDirection(-1, 0);
  if(e.key === 'ArrowRight') changeDirection(1, 0);
});

// Touch swipe
let startX, startY;
canvas.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
}, {passive: true});

canvas.addEventListener('touchend', e => {
  if(!startX || !startY) return;
  let endX = e.changedTouches[0].clientX;
  let endY = e.changedTouches[0].clientY;
  let diffX = endX - startX;
  let diffY = endY - startY;
  if(Math.abs(diffX) > Math.abs(diffY)) {
    if(diffX > 0) changeDirection(1, 0);
    else changeDirection(-1, 0);
  } else {
    if(diffY > 0) changeDirection(0, 1);
    else changeDirection(0, -1);
  }
  startX = startY = null;
});

// Restart
function restart() {
  clearInterval(gameLoop);
  init();
  draw();
}

// Start
init();
draw();