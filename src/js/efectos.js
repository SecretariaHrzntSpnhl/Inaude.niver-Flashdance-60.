const EFFECTS = [
  'flash',
  'vinyl',
  'curtain',
  'sparkle',
  'waves',
  'zoom',
  'slide3d',
  'mosaic',
  'mirror',
  'glow'
];

const getRandomEffect = (previousEffect = null) => {
  const options = previousEffect ? EFFECTS.filter((effect) => effect !== previousEffect) : EFFECTS;
  return options[Math.floor(Math.random() * options.length)];
};

const applyEntryEffects = () => {
  const slides = document.querySelectorAll('.slide');
  const cards = document.querySelectorAll('.gallery-card');
  let lastEffect = null;

  slides.forEach((slide) => {
    const media = slide.querySelector('.slide__media');
    if (!media) return;

    if (slide.closest('[data-carousel]')) {
      media.classList.remove('entry-animate', ...EFFECTS.map((name) => `entry-${name}`));
      return;
    }

    const effect = getRandomEffect(lastEffect);
    lastEffect = effect;

    media.classList.remove(...EFFECTS.map((name) => `entry-${name}`));
    media.classList.add('entry-animate', `entry-${effect}`);
  });

  cards.forEach((card) => {
    const effect = getRandomEffect(lastEffect);
    lastEffect = effect;

    card.classList.remove(...EFFECTS.map((name) => `entry-${name}`));
    card.classList.add('entry-animate', `entry-${effect}`);
  });
};

const observeCarousel = () => {
  const carousel = document.querySelector('[data-carousel]');
  if (!carousel) return;

  const observer = new MutationObserver(() => {
    applyEntryEffects();
  });

  observer.observe(carousel, { childList: true, subtree: true });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    applyEntryEffects();
    observeCarousel();
  });
} else {
  applyEntryEffects();
  observeCarousel();
}
