// HTML tarafına bu çizim için bir canvas lazım:
// <canvas id="gameCanvas"></canvas>
// <div id="scoreboard">Skor: 0</div>

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = Math.min(window.innerWidth - 20, 800);
  canvas.height = 450;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const startX = 50;
const startY = canvas.height - 60 - 50;
let keys = {};
let score = 0;
const gravity = 0.5;

class Platform {
  constructor(x, y, width, height, type = 'static') {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.direction = 1;
    this.speed = 2;
    this.range = 100;
    this.startX = x;
  }
  update() {
    if (this.type === 'moving') {
      this.x += this.speed * this.direction;
      if (this.x > this.startX + this.range || this.x < this.startX) {
        this.direction *= -1;
      }
    }
  }
  draw() {
    ctx.fillStyle = this.type === 'moving' ? '#ff7f50' : '#4682b4';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.strokeStyle = '#2a4a8d';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
}

class Player {
  constructor() {
    this.width = 40;
    this.height = 60;
    this.x = startX;
    this.y = startY;
    this.vx = 0;
    this.vy = 0;
    this.speed = 5;
    this.jumping = false;
    this.color = '#0b3d91';
  }
  update(platforms) {
    if (keys['arrowleft'] || keys['a']) {
      this.vx = -this.speed;
    } else if (keys['arrowright'] || keys['d']) {
      this.vx = this.speed;
    } else {
      this.vx = 0;
    }
    this.vy += gravity;
    this.x += this.vx;
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    this.y += this.vy;
    let onPlatform = false;
    for (let plat of platforms) {
      if (
        this.x < plat.x + plat.width &&
        this.x + this.width > plat.x &&
        this.y + this.height > plat.y &&
        this.y + this.height < plat.y + plat.height &&
        this.vy >= 0
      ) {
        this.y = plat.y - this.height;
        this.vy = 0;
        this.jumping = false;
        onPlatform = true;
      }
    }
    if (this.y + this.height > canvas.height) {
      this.y = canvas.height - this.height;
      this.vy = 0;
      this.jumping = false;
      onPlatform = true;
    }
    return onPlatform;
  }
  jump() {
    if (!this.jumping) {
      this.vy = -12;
      this.jumping = true;
    }
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x + 10, this.y + 15, 8, 8);
    ctx.fillRect(this.x + 22, this.y + 15, 8, 8);
    ctx.fillStyle = 'black';
    ctx.fillRect(this.x + 13, this.y + 17, 4, 4);
    ctx.fillRect(this.x + 25, this.y + 17, 4, 4);
  }
}

class Obstacle {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = '#b22222';
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + this.size);
    ctx.lineTo(this.x + this.size / 2, this.y);
    ctx.lineTo(this.x + this.size, this.y + this.size);
    ctx.closePath();
    ctx.fill();
  }
  checkCollision(player) {
    return (
      player.x < this.x + this.size &&
      player.x + player.width > this.x &&
      player.y < this.y + this.size &&
      player.y + player.height > this.y
    );
  }
}

class Coin {
  constructor(x, y, radius = 10) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = '#ffcc00';
    this.collected = false;
  }
  draw() {
    if (this.collected) return;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cc9900';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  checkCollision(player) {
    if (this.collected) return false;
    const distX = Math.abs(this.x - (player.x + player.width / 2));
    const distY = Math.abs(this.y - (player.y + player.height / 2));
    if (distX < this.radius + player.width / 2 && distY < this.radius + player.height / 2) {
      this.collected = true;
      return true;
    }
    return false;
  }
}

const levels = [
  {
    platforms: [
      new Platform(0, canvas.height - 20, canvas.width, 20),
      new Platform(150, 350, 120, 15),
      new Platform(320, 280, 120, 15, 'moving'),
      new Platform(500, 220, 120, 15),
      new Platform(680, 150, 100, 15)
    ],
    obstacles: [
      new Obstacle(250, canvas.height - 40, 30),
      new Obstacle(600, canvas.height - 50, 40)
    ],
    coins: [
      new Coin(180, 320),
      new Coin(360, 250),
      new Coin(530, 190),
      new Coin(700, 120)
    ]
  },
  {
    platforms: [
      new Platform(0, canvas.height - 20, canvas.width, 20),
      new Platform(100, 370, 100, 15),
      new Platform(250, 320, 100, 15),
      new Platform(400, 270, 100, 15),
      new Platform(550, 220, 100, 15),
      new Platform(700, 170, 80, 15, 'moving')
    ],
    obstacles: [
      new Obstacle(200, canvas.height - 40, 30),
      new Obstacle(450, 250, 40),
      new Obstacle(600, 210, 30)
    ],
    coins: [
      new Coin(120, 340),
      new Coin(280, 290),
      new Coin(430, 240),
      new Coin(570, 190),
      new Coin(730, 140)
    ]
  }
];

const player = new Player();
let currentLevel = 0;
let platforms = levels[currentLevel].platforms;
let obstacles = levels[currentLevel].obstacles;
let coins = levels[currentLevel].coins;

window.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  if ((e.key === ' ' || e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') && !player.jumping) {
    player.jump();
  }
});
window.addEventListener('keyup', e => {
  keys[e.key.toLowerCase()] = false;
});

function updateScore() {
  document.getElementById('scoreboard').innerText = `Skor: ${score}`;
}

function respawnPlayer() {
  player.x = startX;
  player.y = startY;
  player.vx = 0;
  player.vy = 0;
  player.jumping = false;
}

function nextLevel() {
  currentLevel++;
  if (currentLevel >= levels.length) {
    alert(`Tebrikler! Tüm bölümleri tamamladın. Toplam skor: ${score}`);
    currentLevel = 0;
    score = 0;
  }
  platforms = levels[currentLevel].platforms;
  obstacles = levels[currentLevel].obstacles;
  coins = levels[currentLevel].coins;
  coins.forEach(c => (c.collected = false));
  respawnPlayer();
  updateScore();
}

function resetGame() {
  score = 0;
  currentLevel = 0;
  platforms = levels[currentLevel].platforms;
  obstacles = levels[currentLevel].obstacles;
  coins = levels[currentLevel].coins;
  coins.forEach(c => (c.collected = false));
  respawnPlayer();
  updateScore();
  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  platforms.forEach(p => {
    if (p.type === 'moving') p.update();
    p.draw();
  });

  const onPlatform = player.update(platforms);

  for (let obs of obstacles) {
    obs.draw();
    if (obs.checkCollision(player)) {
      alert(`Engele çarptın! Skor: ${score}`);
      respawnPlayer();
      break;
    }
  }

  let allCollected = true;
  coins.forEach(c => {
    c.draw();
    if (!c.collected && c.checkCollision(player)) {
      score++;
      updateScore();
    }
    if (!c.collected) allCollected = false;
  });

  player.draw();

  if (allCollected) {
    alert(`Bölüm tamamlandı! Skor: ${score}`);
    nextLevel();
  }

  requestAnimationFrame(gameLoop);
}

resetGame();