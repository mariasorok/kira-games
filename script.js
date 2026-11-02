// ======================
// ВКЛАДКИ
// ======================
const tabs = document.querySelectorAll('.tab');
const screens = document.querySelectorAll('.screen');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    screens.forEach(s => s.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('screen-' + tab.dataset.screen).classList.add('active');
    if (tab.dataset.screen === 'draw') resizeCanvas();
  });
});

// ======================
// ЗВУКИ
// ======================
let audioCtx;
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playDing() {
  const ctx = getCtx();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(880, ctx.currentTime);
  o.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
  g.gain.setValueAtTime(0.3, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.4);
}

function playBuzz() {
  const ctx = getCtx();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'square';
  o.frequency.setValueAtTime(180, ctx.currentTime);
  g.gain.setValueAtTime(0.15, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.25);
}

function playWin() {
  const ctx = getCtx();
  const notes = [523.25, 659.25, 783.99, 1046.50];
  notes.forEach((freq, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = freq;
    const t = ctx.currentTime + i * 0.15;
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.4);
  });
}

// ======================
// 1. ЦВЕТА (СОРТЕР)
// ======================
const COLORS = [
  { name: 'red',    hex: '#e53935' },
  { name: 'blue',   hex: '#1e88e5' },
  { name: 'yellow', hex: '#fdd835' },
  { name: 'green',  hex: '#43a047' },
  { name: 'purple', hex: '#8e24aa' },
  { name: 'orange', hex: '#fb8c00' },
  { name: 'pink',   hex: '#ec407a' }
];

// Картинки для каждого цвета. 
// Если картинка не найдется, покажется смайлик (fallback).
const ITEMS_MAP = {
  red: [
    { file: 'apple.png', fallback: '🍎' },
    { file: 'strawberry.png', fallback: '🍓' },
    { file: 'tomato.png', fallback: '🍅' },
    { file: 'car_red.png', fallback: '🚗' },
    { file: 'ladybug.png', fallback: '🐞' }
  ],
  blue: [
    { file: 'blueberry.png', fallback: '🫐' },
    { file: 'whale.png', fallback: '🐳' },
    { file: 'ball_blue.png', fallback: '🔵' },
    { file: 'jeans.png', fallback: '👖' },
    { file: 'heart_blue.png', fallback: '💙' }
  ],
  yellow: [
    { file: 'banana.png', fallback: '🍌' },
    { file: 'lemon.png', fallback: '🍋' },
    { file: 'sunflower.png', fallback: '🌻' },
    { file: 'cheese.png', fallback: '🧀' },
    { file: 'chick.png', fallback: '🐥' }
  ],
  green: [
    { file: 'apple_green.png', fallback: '🍏' },
    { file: 'cucumber.png', fallback: '🥒' },
    { file: 'frog.png', fallback: '🐸' },
    { file: 'broccoli.png', fallback: '🥦' },
    { file: 'tree.png', fallback: '🌳' }
  ],
  purple: [
    { file: 'grapes.png', fallback: '🍇' },
    { file: 'eggplant.png', fallback: '🍆' },
    { file: 'umbrella.png', fallback: '☂️' },
    { file: 'ball_purple.png', fallback: '🟣' },
    { file: 'blackberry.png', fallback: '🫐' }
  ],
  orange: [
    { file: 'orange.png', fallback: '🍊' },
    { file: 'carrot.png', fallback: '🥕' },
    { file: 'ball_orange.png', fallback: '🏀' },
    { file: 'fox.png', fallback: '🦊' },
    { file: 'pumpkin.png', fallback: '🎃' }
  ],
  pink: [
    { file: 'pig.png', fallback: '🐷' },
    { file: 'flamingo.png', fallback: '🦩' },
    { file: 'tulip.png', fallback: '🌷' },
    { file: 'candy.png', fallback: '🍬' },
    { file: 'bow.png', fallback: '🎀' }
  ]
};

let currentColor = null;
let isRoundEnding = false;
let lastColorName = null;
const basketEl = document.getElementById('basket');
const itemsEl = document.getElementById('items');

function newColorRound() {
  isRoundEnding = false;
  itemsEl.innerHTML = '';
  
  // Выбираем цвет, который не совпадает с предыдущим
  let availableColors = COLORS.filter(c => c.name !== lastColorName);
  currentColor = availableColors[Math.floor(Math.random() * availableColors.length)];
  lastColorName = currentColor.name;
  
  basketEl.style.background = currentColor.hex;
  
  // Берем все 5 картинок этого цвета, перемешиваем и выбираем 3 правильных
  let correctItems = ITEMS_MAP[currentColor.name];
  let correctChoices = [...correctItems].sort(() => Math.random() - 0.5).slice(0, 3);
  
  // Берем неправильные цвета
  let otherColors = COLORS.filter(c => c.name !== currentColor.name);
  let wrongChoices = [];
  otherColors.sort(() => Math.random() - 0.5).slice(0, 2).forEach(c => {
    let wrongList = ITEMS_MAP[c.name];
    // Берем случайную картинку из списка неправильного цвета
    wrongChoices.push(wrongList[Math.floor(Math.random() * wrongList.length)]);
  });

  // Собираем всё вместе
  let pool = [];
  correctChoices.forEach(item => pool.push({ color: currentColor.name, itemData: item }));
  wrongChoices.forEach((item, idx) => pool.push({ color: otherColors[idx].name, itemData: item }));
  
  pool.sort(() => Math.random() - 0.5);

  pool.forEach(data => {
    const div = document.createElement('div');
    div.className = 'item';
    
    const img = document.createElement('img');
    img.src = `images/${data.itemData.file}`;
    img.alt = data.itemData.fallback;
    img.className = 'item-img';
    
    img.onerror = function() {
      this.style.display = 'none';
      const span = document.createElement('span');
      span.textContent = data.itemData.fallback;
      span.className = 'item-fallback';
      div.appendChild(span);
    };
    
    div.appendChild(img);
    div.dataset.color = data.color;
    div.addEventListener('click', () => handleItemClick(div));
    itemsEl.appendChild(div);
  });
}

function handleItemClick(el) {
  if (isRoundEnding) return;

  if (el.dataset.color === currentColor.name) {
    playDing();
    basketEl.classList.add('bounce');
    el.classList.add('fly');
    
    setTimeout(() => {
      basketEl.classList.remove('bounce');
      el.remove();
      
      const remainingCorrect = Array.from(itemsEl.children).filter(
        child => child.dataset.color === currentColor.name
      );

      if (remainingCorrect.length === 0) {
        endRound();
      }
    }, 500);
  } else {
    playBuzz();
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 400);
  }
}

function endRound() {
  isRoundEnding = true;
  setTimeout(playWin, 200);
  basketEl.classList.add('bounce');
  
  setTimeout(() => { itemsEl.innerHTML = ''; }, 800);
  setTimeout(() => { newColorRound(); }, 2000);
}

newColorRound();

// ======================
// 2. ЖИВОТНЫЕ
// ======================
const ANIMALS = [
  { id: 'cat',   emoji: '🐱', name: 'Кошка',  sound: 'Мяу!' },
  { id: 'dog',   emoji: '🐶', name: 'Собака', sound: 'Гав!' },
  { id: 'cow',   emoji: '🐮', name: 'Корова', sound: 'Муу!' },
  { id: 'sheep', emoji: '🐑', name: 'Овца',   sound: 'Бее!' },
  { id: 'horse', emoji: '🐴', name: 'Лошадь', sound: 'Иго-го!' },
  { id: 'duck',  emoji: '🦆', name: 'Утка',   sound: 'Кря!' },
];

const animalsGrid = document.getElementById('animals-grid');
const animalOverlay = document.getElementById('animal-overlay');
const animalBig = document.getElementById('animal-big');

ANIMALS.forEach(a => {
  const card = document.createElement('div');
  card.className = 'animal-card';
  card.innerHTML = `${a.emoji}<span>${a.name}</span>`;
  card.addEventListener('click', () => showAnimal(a));
  animalsGrid.appendChild(card);
});

function showAnimal(a) {
  animalBig.textContent = a.emoji;
  animalOverlay.classList.remove('hidden');
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(`${a.sound} ${a.name}`);
    u.lang = 'ru-RU';
    u.rate = 0.9;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }
}

document.getElementById('animal-back').addEventListener('click', () => {
  animalOverlay.classList.add('hidden');
  speechSynthesis.cancel();
});

// ======================
// 3. РИСОВАНИЕ
// ======================
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const palette = document.getElementById('palette');
const DRAW_COLORS = ['#e53935', '#1e88e5', '#fdd835', '#43a047', '#8e24aa', '#fb8c00'];
let currentDrawColor = DRAW_COLORS[0];
let drawing = false;
let lastX = 0, lastY = 0;

DRAW_COLORS.forEach((c, i) => {
  const dot = document.createElement('div');
  dot.className = 'color-dot' + (i === 0 ? ' active' : '');
  dot.style.background = c;
  dot.addEventListener('click', () => {
    currentDrawColor = c;
    document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
    dot.classList.add('active');
  });
  palette.appendChild(dot);
});

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const img = canvas.toDataURL();
  canvas.width = rect.width;
  canvas.height = rect.height;
  const tmp = new Image();
  tmp.onload = () => ctx.drawImage(tmp, 0, 0);
  tmp.src = img;
}
window.addEventListener('resize', resizeCanvas);
setTimeout(resizeCanvas, 100);

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const t = e.touches ? e.touches[0] : e;
  return { x: t.clientX - rect.left, y: t.clientY - rect.top };
}
function startDraw(e) { e.preventDefault(); drawing = true; const p = getPos(e); lastX = p.x; lastY = p.y; }
function moveDraw(e) {
  if (!drawing) return;
  e.preventDefault();
  const p = getPos(e);
  ctx.strokeStyle = currentDrawColor;
  ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(p.x, p.y); ctx.stroke();
  lastX = p.x; lastY = p.y;
}
function endDraw() { drawing = false; }

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', moveDraw);
canvas.addEventListener('mouseup', endDraw);
canvas.addEventListener('mouseleave', endDraw);
canvas.addEventListener('touchstart', startDraw, { passive: false });
canvas.addEventListener('touchmove', moveDraw, { passive: false });
canvas.addEventListener('touchend', endDraw);

document.getElementById('erase-btn').addEventListener('click', () => { currentDrawColor = '#ffffff'; });
document.getElementById('clear-btn').addEventListener('click', () => {
  if (confirm('Стереть весь рисунок?')) ctx.clearRect(0, 0, canvas.width, canvas.height);
});
document.getElementById('save-btn').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'risunok-kira.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});