const EMOJIS = {
  easy: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'],
  medium: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
  hard: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮']
};

let state = {
  level: null,
  cards: [],
  flipped: [],
  matched: 0,
  moves: 0,
  timer: 0,
  timerInterval: null,
  locked: false
};

const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const board = document.getElementById('board');
const movesEl = document.getElementById('moves');
const timerEl = document.getElementById('timer');
const winModal = document.getElementById('win-modal');
const winMessage = document.getElementById('win-message');
const bestScoreDisplay = document.getElementById('best-score-display');

// ---- شروع ----
document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.level = btn.dataset.level;
    startGame();
  });
});

document.getElementById('back-btn').addEventListener('click', goHome);
document.getElementById('restart-btn').addEventListener('click', () => startGame());
document.getElementById('play-again-btn').addEventListener('click', () => {
  winModal.classList.remove('show');
  startGame();
});
document.getElementById('home-btn').addEventListener('click', () => {
  winModal.classList.remove('show');
  goHome();
});

function goHome() {
  clearInterval(state.timerInterval);
  startScreen.classList.add('active');
  gameScreen.classList.remove('active');
  updateBestScoreDisplay();
}

function startGame() {
  // ریست
  clearInterval(state.timerInterval);
  state.flipped = [];
  state.matched = 0;
  state.moves = 0;
  state.timer = 0;
  state.locked = false;
  movesEl.textContent = '0';
  timerEl.textContent = '00:00';

  // ساخت کارت‌ها
  const emojis = [...EMOJIS[state.level], ...EMOJIS[state.level]];
  shuffle(emojis);

  board.className = `board ${state.level}`;
  board.innerHTML = '';

  emojis.forEach((emoji, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = index;
    card.dataset.emoji = emoji;

    card.innerHTML = `
      <div class="card-face card-front">${emoji}</div>
      <div class="card-face card-back">❓</div>
    `;

    card.addEventListener('click', () => flipCard(card));
    board.appendChild(card);
  });

  startScreen.classList.remove('active');
  gameScreen.classList.add('active');

  // شروع تایمر
  state.timerInterval = setInterval(() => {
    state.timer++;
    timerEl.textContent = formatTime(state.timer);
  }, 1000);
}

function flipCard(card) {
  if (state.locked || card.classList.contains('flipped') || card.classList.contains('matched')) return;

  card.classList.add('flipped');
  state.flipped.push(card);

  if (state.flipped.length === 2) {
    state.moves++;
    movesEl.textContent = state.moves;
    state.locked = true;

    const [first, second] = state.flipped;

    if (first.dataset.emoji === second.dataset.emoji) {
      // جفت شد
      first.classList.add('matched');
      second.classList.add('matched');
      state.matched += 2;
      state.flipped = [];
      state.locked = false;

      // چک برد
      const totalCards = EMOJIS[state.level].length * 2;
      if (state.matched === totalCards) {
        setTimeout(showWin, 600);
      }
    } else {
      // اشتباه
      setTimeout(() => {
        first.classList.remove('flipped');
        second.classList.remove('flipped');
        state.flipped = [];
        state.locked = false;
      }, 800);
    }
  }
}

function showWin() {
  clearInterval(state.timerInterval);

  // ذخیره بهترین رکورد
  const key = `best-${state.level}`;
  const current = { moves: state.moves, time: state.timer };
  const saved = JSON.parse(localStorage.getItem(key) || 'null');

  let isNewRecord = false;
  if (!saved || state.moves < saved.moves || (state.moves === saved.moves && state.timer < saved.time)) {
    localStorage.setItem(key, JSON.stringify(current));
    isNewRecord = true;
  }

  winMessage.innerHTML = `
    با <strong>${state.moves}</strong> حرکت<br>
    در <strong>${formatTime(state.timer)}</strong>
    ${isNewRecord ? '<br><span style="color:#22c55e">🏆 رکورد جدید!</span>' : ''}
  `;
  winModal.classList.add('show');
}

function updateBestScoreDisplay() {
  const levels = ['easy', 'medium', 'hard'];
  const names = { easy: 'آسان', medium: 'متوسط', hard: 'سخت' };
  let text = 'بهترین رکوردها: ';

  const records = levels.map(l => {
    const data = JSON.parse(localStorage.getItem(`best-${l}`) || 'null');
    if (!data) return null;
    return `${names[l]}: ${data.moves} حرکت`;
  }).filter(Boolean);

  bestScoreDisplay.textContent = records.length ? records.join(' | ') : 'هنوز رکوردی ثبت نشده';
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `\( {m}: \){s}`;
}

// اولین بار
updateBestScoreDisplay();

// ثبت Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(() => console.log('Service Worker registered'))
    .catch(err => console.log('SW error:', err));
                 }
