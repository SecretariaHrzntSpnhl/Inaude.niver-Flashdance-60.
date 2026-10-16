const createAudioToggle = () => {
  const existing = document.querySelector('[data-audio-toggle]');
  if (existing) return;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'audio-toggle';
  toggle.dataset.audioToggle = 'true';
  toggle.setAttribute('aria-label', 'Ativar áudio da festa');
  toggle.textContent = '♫';
  document.body.appendChild(toggle);

  let audioContext = null;
  let masterGain = null;

  const createPulse = (frequency, gainValue, duration) => {
    if (!audioContext || !masterGain) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(gainValue, audioContext.currentTime + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(masterGain);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  };

  const tick = () => {
    if (!audioContext || !masterGain) return;

    const notes = [220, 277.18, 329.63, 392];
    const note = notes[Math.floor(Math.random() * notes.length)];
    createPulse(note, 0.03, 0.32);
  };

  const initAudio = async () => {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      audioContext = new AudioCtx();
      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.1;
      masterGain.connect(audioContext.destination);
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    toggle.textContent = '♫ on';
    toggle.classList.add('is-active');
    tick();
    window.clearInterval(window.__inaudeAudioInterval);
    window.__inaudeAudioInterval = window.setInterval(tick, 1500);
  };

  toggle.addEventListener('click', initAudio);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createAudioToggle);
} else {
  createAudioToggle();
}
