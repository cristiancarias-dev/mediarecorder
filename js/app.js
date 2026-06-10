import { elements } from './ui.js';
import { startRecording, stopRecording } from './recorder.js';

elements.startBtn.addEventListener('click', () => {
  startRecording(elements.resolutionSelect.value);
});

elements.stopBtn.addEventListener('click', stopRecording);
