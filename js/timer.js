let timerInterval = null;
let startTime = null;

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function updateTimer(timerEl) {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  timerEl.textContent = formatTime(elapsed);
}

export function startTimer(timerEl) {
  startTime = Date.now();
  updateTimer(timerEl);
  timerInterval = setInterval(() => updateTimer(timerEl), 1000);
}

export function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  startTime = null;
}
