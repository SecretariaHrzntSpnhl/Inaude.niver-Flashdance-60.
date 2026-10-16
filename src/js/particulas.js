const createParticles = () => {
  const canvas = document.createElement('canvas');
  canvas.className = 'particle-layer';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const particles = Array.from({ length: 70 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 2.6 + 1.2,
    dx: (Math.random() - 0.5) * 0.7,
    dy: Math.random() * 0.9 + 0.4,
    hue: Math.random() > 0.75 ? 0 : Math.random() > 0.5 ? 40 : 50,
    alpha: Math.random() * 0.8 + 0.2
  }));

  const resize = () => {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  };

  const draw = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach((particle) => {
      particle.x += particle.dx;
      particle.y += particle.dy;

      if (particle.x < 0 || particle.x > window.innerWidth) particle.dx *= -1;
      if (particle.y > window.innerHeight) particle.y = -10;

      ctx.beginPath();
      ctx.fillStyle = `hsla(${particle.hue}, 90%, 60%, ${particle.alpha})`;
      ctx.shadowColor = `hsla(${particle.hue}, 90%, 65%, 0.7)`;
      ctx.shadowBlur = 10;
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener('resize', resize);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createParticles);
} else {
  createParticles();
}
