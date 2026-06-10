export const elements = {
  startBtn: document.getElementById('startBtn'),
  stopBtn: document.getElementById('stopBtn'),
  resolutionSelect: document.getElementById('resolution'),
  statusEl: document.getElementById('status'),
  timerEl: document.getElementById('timer'),
  feedbackEl: document.getElementById('feedback'),
};

export function setRecordingState(isRecording) {
  if (isRecording) {
    elements.startBtn.disabled = true;
    elements.stopBtn.disabled = false;
    elements.resolutionSelect.disabled = true;
    elements.statusEl.classList.remove('hidden');
    elements.feedbackEl.textContent = 'Grabando...';
    elements.feedbackEl.className = 'feedback success';
  } else {
    elements.startBtn.disabled = false;
    elements.stopBtn.disabled = true;
    elements.resolutionSelect.disabled = false;
    elements.statusEl.classList.add('hidden');
    elements.timerEl.textContent = '00:00';
  }
}

export function showFeedback(message, type = '') {
  elements.feedbackEl.textContent = message;
  elements.feedbackEl.className = `feedback ${type}`;
}
