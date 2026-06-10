window.Recorder = window.Recorder || {};

(function () {
  let mediaRecorder = null;
  let recordedChunks = [];

  function downloadRecording() {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'grabacion-' + new Date().toISOString().slice(0, 19).replace(/[:-]/g, '') + '.webm';
    link.click();
    URL.revokeObjectURL(url);
    recordedChunks = [];
  }

  Recorder.stopRecording = function () {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') return;

    mediaRecorder.stop();
    if (mediaRecorder.stream) {
      mediaRecorder.stream.getTracks().forEach(function (track) { track.stop(); });
    }
    Recorder.stopTimer();
    Recorder.setRecordingState(false);
    Recorder.showFeedback('Grabaci\u00f3n guardada', 'success');
  };

  Recorder.startRecording = async function (resolutionValue) {
    try {
      var parts = resolutionValue.split('x');
      var width = Number(parts[0]);
      var height = Number(parts[1]);

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

      mediaRecorder.addEventListener('dataavailable', function (e) {
        if (e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      });

      mediaRecorder.addEventListener('stop', function () {
        if (recordedChunks.length > 0) {
          downloadRecording();
        }
        if (mediaRecorder && mediaRecorder.stream) {
          mediaRecorder.stream.getTracks().forEach(function (track) { track.stop(); });
        }
        Recorder.stopTimer();
        Recorder.setRecordingState(false);
      });

      mediaRecorder.addEventListener('error', function () {
        Recorder.showFeedback('Error durante la grabaci\u00f3n', 'error');
        Recorder.stopTimer();
        Recorder.setRecordingState(false);
      });

      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.addEventListener('ended', function () {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      });

      mediaRecorder.start(1000);
      Recorder.setRecordingState(true);
      Recorder.startTimer(Recorder.elements.timerEl);
      Recorder.showFeedback('Grabando...', 'success');

    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
        Recorder.showFeedback('Selecci\u00f3n de pantalla cancelada', 'error');
      } else {
        Recorder.showFeedback('Error: ' + err.message, 'error');
      }
    }
  };
})();
