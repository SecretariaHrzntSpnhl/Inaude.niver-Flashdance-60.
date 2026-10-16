const mountDiscoBalls = () => {
  const container = document.createElement('div');
  container.className = 'disco-balls';
  container.setAttribute('aria-hidden', 'true');
  document.body.appendChild(container);

  const balls = [
    { x: '8%', y: '12%', size: '120px', duration: '18s', parallax: 0.8, reflection: 'gold' },
    { x: '72%', y: '10%', size: '150px', duration: '22s', parallax: 1.3, reflection: 'red' },
    { x: '18%', y: '72%', size: '170px', duration: '26s', parallax: 1.1, reflection: 'gold' },
    { x: '80%', y: '78%', size: '140px', duration: '20s', parallax: 0.9, reflection: 'red' },
    { x: '52%', y: '18%', size: '95px', duration: '15s', parallax: 1.6, reflection: 'gold' }
  ];

  balls.forEach((ball) => {
    const node = document.createElement('span');
    node.className = `disco-ball disco-ball--${ball.reflection}`;
    node.style.setProperty('--x', ball.x);
    node.style.setProperty('--y', ball.y);
    node.style.setProperty('--size', ball.size);
    node.style.setProperty('--duration', ball.duration);
    node.style.setProperty('--parallax', ball.parallax.toString());
    node.innerHTML = '<span class="disco-ball__cord"></span><span class="disco-ball__sphere"></span>';
    container.appendChild(node);
  });

  let scrollFrame = 0;
  const celebration = document.querySelector('#celebrar');
  let celebrationTop = 0;

  const measureCelebration = () => {
    if (celebration) {
      celebrationTop = celebration.getBoundingClientRect().top + window.scrollY;
    }
  };

  const updateScrollEffect = () => {
    const fadeDistance = window.innerHeight * 0.72;
    const progress = Math.min(window.scrollY / fadeDistance, 1);
    container.style.setProperty('--scroll-opacity', (1 - progress).toString());
    container.style.setProperty('--scroll-shift', `${progress * -32}px`);
    container.style.setProperty('--scroll-scale', (1 - progress * 0.08).toString());
    container.style.setProperty('--scroll-blur', `${progress * 3}px`);
    if (celebration) {
      const fillStart = Math.max(celebrationTop - window.innerHeight, 0);
      const fillDistance = window.innerHeight * 0.62;
      const rawProgress = Math.min(Math.max((window.scrollY - fillStart) / fillDistance, 0), 1);
      const fillProgress = rawProgress * rawProgress * (3 - 2 * rawProgress);
      document.documentElement.style.setProperty('--burgundy-fill', fillProgress.toString());
      document.documentElement.style.setProperty(
        '--burgundy-edge-y',
        `${(1 - fillProgress) * window.innerHeight}px`
      );
      document.documentElement.style.setProperty(
        '--burgundy-edge-opacity',
        Math.min(rawProgress * 8, (1 - rawProgress) * 8).toString()
      );
    }

    scrollFrame = 0;
  };

  const requestScrollUpdate = () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(updateScrollEffect);
  };

  const updatePointer = (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 18;
    const y = (event.clientY / window.innerHeight - 0.5) * 18;
    document.documentElement.style.setProperty('--pointer-x', `${x}px`);
    document.documentElement.style.setProperty('--pointer-y', `${y}px`);
  };

  measureCelebration();
  updateScrollEffect();
  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', () => {
    measureCelebration();
    requestScrollUpdate();
  }, { passive: true });
  window.addEventListener('load', () => {
    measureCelebration();
    requestScrollUpdate();
  }, { once: true });
  document.addEventListener('pointermove', updatePointer, { passive: true });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountDiscoBalls);
} else {
  mountDiscoBalls();
}
