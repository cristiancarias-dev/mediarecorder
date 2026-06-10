Recorder.elements.startBtn.addEventListener('click', function () {
  Recorder.startRecording(Recorder.elements.resolutionSelect.value);
});

Recorder.elements.stopBtn.addEventListener('click', Recorder.stopRecording);
