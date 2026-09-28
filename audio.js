// Положите MP3 в assets/audio/<сочетание>/<слово>.mp3 и assets/audio/<сочетание>/sound.mp3.
// Пока файлов нет, используется голос браузера en-GB. Файл двери: assets/audio/door-open.mp3.
window.gameAudio = (() => {
  let enabled = true;
  let current = null;
  let voice = null;
  let generation = 0;
  if ('speechSynthesis' in window) {
    const pickVoice = () => {
      const voices = speechSynthesis.getVoices();
      voice = voices.find(v => /^en-GB/i.test(v.lang)) || voices.find(v => /^en/i.test(v.lang)) || null;
    };
    pickVoice();
    speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
  }
  function stop() {
    generation++;
    current?.pause();
    current = null;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }
  function play(file, fallback) {
    stop();
    if (!enabled) return;
    const token = generation;
    const speak = () => {
      if (token !== generation || !fallback || !('speechSynthesis' in window)) return;
      const utterance = new SpeechSynthesisUtterance(fallback);
      utterance.lang = 'en-GB';
      utterance.rate = 0.82;
      if (voice) utterance.voice = voice;
      speechSynthesis.speak(utterance);
    };
    const audio = new Audio(file);
    current = audio;
    audio.addEventListener('error', speak, { once: true });
    audio.play().catch(speak);
  }
  return {
    stop,
    sound: group => play(`assets/audio/${group.id}/sound.mp3`, group.say),
    word: (group, word) => play(`assets/audio/${group.id}/${word.text}.mp3`, word.text),
    door: () => play('assets/audio/door-open.mp3', ''),
    toggle() { enabled = !enabled; if (!enabled) stop(); return enabled; }
  };
})();
