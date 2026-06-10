import { elements, setRecordingState, showFeedback } from './ui.js';
import { startTimer, stopTimer } from './timer.js';

let mediaRecorder = null;
let recordedChunks = [];

function downloadRecording() {
  const blob = new Blob(recordedChunks, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `grabacion-${new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')}.webm`;
  link.click();
  URL.revokeObjectURL(url);
  recordedChunks = [];
}

export function stopRecording() {
  if (!mediaRecorder || mediaRecorder.state === 'inactive') return;

  mediaRecorder.stop();
  if (mediaRecorder.stream) {
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
  }
  stopTimer();
  setRecordingState(false);
  showFeedback('Grabación guardada', 'success');
}

export async function startRecording(resolutionValue) {
  try {
    const [width, height] = resolutionValue.split('x').map(Number);

    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: { ideal: width },
        height: { ideal: height },
        frameRate: { ideal: 30 },
      },
      audio: true,
    });

    recordedChunks = [];

    mediaRecorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
        ? 'video/webm;codecs=vp8,opus'
        : 'video/webm',
    });

    mediaRecorder.stream = stream;

    mediaRecorder.addEventListener('dataavailable', (e) => {
      if (e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    });

    mediaRecorder.addEventListener('stop', () => {
      if (recordedChunks.length > 0) {
        downloadRecording();
      }
      if (mediaRecorder && mediaRecorder.stream) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
      stopTimer();
      setRecordingState(false);
    });

    mediaRecorder.addEventListener('error', () => {
      showFeedback('Error durante la grabación', 'error');
      stopTimer();
      setRecordingState(false);
    });

    const videoTrack = stream.getVideoTracks()[0];
    videoTrack.addEventListener('ended', () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    });

    mediaRecorder.start(1000);
    setRecordingState(true);
    startTimer(elements.timerEl);
    showFeedback('Grabando...', 'success');

  } catch (err) {
    if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
      showFeedback('Selección de pantalla cancelada', 'error');
    } else {
      showFeedback(`Error: ${err.message}`, 'error');
    }
  }
}
