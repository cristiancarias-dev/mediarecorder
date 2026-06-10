const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resolutionSelect = document.getElementById('resolution');
const statusEl = document.getElementById('status');
const timerEl = document.getElementById('timer');
const feedbackEl = document.getElementById('feedback');

let mediaRecorder = null;
let recordedChunks = [];
let timerInterval = null;
let startTime = null;

function formatTime(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timerEl.textContent = formatTime(elapsed);
}

function startTimer() {
    startTime = Date.now();
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    startTime = null;
}

function setRecordingState(isRecording) {
    if (isRecording) {
        startBtn.disabled = true;
        stopBtn.disabled = false;
        resolutionSelect.disabled = true;
        statusEl.classList.remove('hidden');
        feedbackEl.textContent = 'Grabando...';
        feedbackEl.className = 'feedback success';
    } else {
        startBtn.disabled = false;
        stopBtn.disabled = true;
        resolutionSelect.disabled = false;
        statusEl.classList.add('hidden');
        timerEl.textContent = '00:00';
    }
}

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

function stopRecording() {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') return;

    mediaRecorder.stop();
    if (mediaRecorder.stream) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    stopTimer();
    setRecordingState(false);
    feedbackEl.textContent = 'Grabación guardada';
    feedbackEl.className = 'feedback success';
}

startBtn.addEventListener('click', async () => {
    try {
        const [width, height] = resolutionSelect.value.split('x').map(Number);

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
            feedbackEl.textContent = 'Error durante la grabación';
            feedbackEl.className = 'feedback error';
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
        startTimer();
        feedbackEl.textContent = 'Grabando...';
        feedbackEl.className = 'feedback success';

    } catch (err) {
        if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
            feedbackEl.textContent = 'Selección de pantalla cancelada';
        } else {
            feedbackEl.textContent = `Error: ${err.message}`;
        }
        feedbackEl.className = 'feedback error';
    }
});

stopBtn.addEventListener('click', stopRecording);
