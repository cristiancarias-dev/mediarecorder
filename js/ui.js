window.Recorder = window.Recorder || {};

Recorder.elements = {
  startBtn: document.getElementById('startBtn'),
  stopBtn: document.getElementById('stopBtn'),
  resolutionSelect: document.getElementById('resolution'),
  statusEl: document.getElementById('status'),
  timerEl: document.getElementById('timer'),
  feedbackEl: document.getElementById('feedback'),
};

Recorder.setRecordingState = function (isRecording) {
  const el = Recorder.elements;
  if (isRecording) {
    el.startBtn.disabled = true;
    el.stopBtn.disabled = false;
    el.resolutionSelect.disabled = true;
    el.statusEl.classList.remove('hidden');
    el.feedbackEl.textContent = 'Grabando...';
    el.feedbackEl.className = 'feedback success';
  } else {
    el.startBtn.disabled = false;
    el.stopBtn.disabled = true;
    el.resolutionSelect.disabled = false;
    el.statusEl.classList.add('hidden');
    el.timerEl.textContent = '00:00';
  }
};

Recorder.showFeedback = function (message, type) {
  if (type === undefined) type = '';
  Recorder.elements.feedbackEl.textContent = message;
  Recorder.elements.feedbackEl.className = 'feedback ' + type;
};
