import { isAlbumConfigured, listAlbumItems } from './album.js';

const previewSlides = [
  {
    url: '/preview-festa-1.jpg',
    author: 'Uma noite especial',
    description: 'Cada detalhe prepara o encontro.',
    alt: 'Mesa decorada para uma festa',
    type: 'image',
    isPreview: true
  },
  {
    url: '/preview-festa-2.jpg',
    author: 'Entre amigos',
    description: 'As melhores lembranças são feitas juntos.',
    alt: 'Amigos brindando em uma celebração',
    type: 'image',
    isPreview: true
  },
  {
    url: '/preview-festa-3.jpg',
    author: 'Celebrar a vida',
    description: 'Uma festa cheia de afeto e alegria.',
    alt: 'Balões coloridos em uma festa',
    type: 'image',
    isPreview: true
  },
  {
    url: '/preview-festa-4.jpg',
    author: 'Uma festa para recordar',
    description: 'Envie suas fotos para completar este álbum.',
    alt: 'Público celebrando sob confetes',
    type: 'image',
    isPreview: true
  }
];

const createSlide = (item, index) => {
  const article = document.createElement('article');
  article.className = 'slide';
  article.dataset.slideIndex = index.toString();

  const media = document.createElement('div');
  media.className = 'slide__media';
  if (item.type === 'video') {
    const video = document.createElement('video');
    video.src = item.url;
    video.playsInline = true;
    video.preload = 'none';
    video.setAttribute('aria-label', item.author ? `Vídeo compartilhado por ${item.author}` : 'Vídeo compartilhado');
    media.append(video);

    const playButton = document.createElement('button');
    playButton.className = 'slide__video-play';
    playButton.type = 'button';
    playButton.dataset.videoPlay = '';
    playButton.setAttribute('aria-label', item.author ? `Reproduzir vídeo compartilhado por ${item.author}` : 'Reproduzir vídeo compartilhado');
    playButton.innerHTML = '<span aria-hidden="true">▶</span>';
    media.append(playButton);
  } else {
    const image = document.createElement('img');
    image.src = item.url;
    image.alt = item.isPreview ? item.alt : item.author ? `Foto compartilhada por ${item.author}` : 'Foto compartilhada';
    image.loading = 'lazy';
    image.draggable = false;
    media.append(image);
  }
  article.append(media);

  const content = document.createElement('div');
  content.className = 'slide__content';
  const eyebrow = document.createElement('span');
  eyebrow.className = 'slide__eyebrow';
  eyebrow.textContent = item.isPreview ? 'Prévia ilustrativa' : 'Álbum compartilhado';
  if (item.author) {
    const title = document.createElement('h3');
    title.className = 'slide__title';
    title.textContent = item.author;
    content.append(eyebrow, title);
  } else {
    content.append(eyebrow);
  }
  const text = document.createElement('p');
  text.className = 'slide__text';
  text.textContent = item.description ?? 'Uma lembrança da festa.';
  const meta = document.createElement('div');
  meta.className = 'slide__meta';
  const mediaType = document.createElement('span');
  mediaType.textContent = item.isPreview ? 'Imagem ilustrativa' : item.type === 'video' ? 'Vídeo' : 'Foto';
  const location = document.createElement('span');
  location.textContent = item.isPreview ? 'Exemplo' : 'Lages, SC';
  meta.append(mediaType, location);
  content.append(text, meta);
  article.append(content);
  return article;
};

const mountCarousel = async () => {
  const carousel = document.querySelector('[data-carousel]');
  const empty = document.querySelector('[data-carousel-empty]');
  const message = document.querySelector('[data-carousel-message]');
  if (!(carousel instanceof HTMLElement) || !(empty instanceof HTMLElement) || !(message instanceof HTMLElement)) return;

  let originalSlides = [];
  let previewMessage = '';
  let previewIsError = false;
  if (!isAlbumConfigured) {
    originalSlides = previewSlides;
    previewMessage = 'Álbum ainda não conectado. Estas fotos são apenas ilustrativas.';
  } else {
    try {
      originalSlides = await listAlbumItems(Number.POSITIVE_INFINITY);
    } catch (error) {
      originalSlides = previewSlides;
      previewMessage = `Não foi possível carregar as fotos do álbum. ${
        error instanceof Error ? error.message : 'Tente novamente mais tarde.'
      } Abaixo, uma prévia com fotos ilustrativas.`;
      previewIsError = true;
    }
  }

  if (!originalSlides.length) {
    originalSlides = previewSlides;
    previewMessage = 'O álbum espera pelas primeiras fotos. Abaixo, uma prévia com imagens ilustrativas.';
  }
  const isPreview = originalSlides === previewSlides;

  const track = carousel.querySelector('[data-carousel-track]');
  if (!(track instanceof HTMLElement)) return;

  const dots = carousel.parentElement?.querySelector('[data-carousel-status]');
  const nextButton = carousel.querySelector('[data-carousel-next]');
  const prevButton = carousel.querySelector('[data-carousel-prev]');
  const hint = carousel.parentElement?.querySelector('[data-carousel-hint]');

  const originals = originalSlides.map((slide, index) => createSlide(slide, index));
  const cloneSlide = (slide) => {
    const clone = slide.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    return clone;
  };
  const leadingClone = cloneSlide(originals[originals.length - 1]);
  const clones = originals.map(cloneSlide);
  track.replaceChildren(leadingClone, ...originals, ...clones);

  if (dots instanceof HTMLElement) {
    dots.replaceChildren();
    if (originalSlides.length <= 12) {
      originalSlides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = `carousel__dot${index === 0 ? ' is-active' : ''}`;
        dot.type = 'button';
        dot.setAttribute('aria-label', `Ir para a lembrança ${index + 1}`);
        dot.dataset.dotIndex = index.toString();
        dots.append(dot);
      });
    }
    dots.hidden = originalSlides.length < 2;
    if (originalSlides.length > 12) dots.hidden = true;
  }
  if (hint instanceof HTMLElement) hint.hidden = originalSlides.length < 2;
  if (nextButton instanceof HTMLButtonElement) nextButton.hidden = originalSlides.length < 2;
  if (prevButton instanceof HTMLButtonElement) prevButton.hidden = originalSlides.length < 2;

  carousel.hidden = false;
  empty.hidden = true;
  message.textContent = isPreview ? previewMessage : `${originalSlides.length} lembrança(s) da festa.`;
  const uploadedCount = Number(new URLSearchParams(window.location.search).get('album-enviado'));
  if (Number.isInteger(uploadedCount) && uploadedCount > 0) {
    message.textContent =
      uploadedCount === 1
        ? 'Parabéns por colaborar com o álbum! Sua lembrança já está aqui. Continue vendo o carrossel.'
        : `Parabéns por colaborar com o álbum! Suas ${uploadedCount} lembranças já estão aqui. Continue vendo o carrossel.`;
    message.dataset.state = 'success';
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.hash}`);
  } else {
    message.dataset.state = previewIsError ? 'error' : '';
  }
  const carouselMessage = message.textContent;
  const carouselMessageState = message.dataset.state;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const videos = [...track.querySelectorAll('video')];
  let offset = 0;
  let lastFrame = 0;
  let dragging = false;
  let pointerStart = 0;
  let offsetStart = 0;
  let paused = reducedMotion.matches || originalSlides.length < 2;
  let resumeTimer = 0;
  let pageTurnTimer = 0;
  let activeVideo = null;
  let lastRenderedIndex = -1;

  const getSlideWidth = () => track.children[0]?.getBoundingClientRect().width ?? 0;
  const getCycleWidth = () => getSlideWidth() * originalSlides.length;

  const normalizeOffset = (value) => {
    const cycleWidth = getCycleWidth();
    if (!cycleWidth) return 0;
    return -(((-value % cycleWidth) + cycleWidth) % cycleWidth);
  };

  const render = () => {
    track.style.transform = `translate3d(${offset}px, 0, 0)`;

    if (dots instanceof HTMLElement) {
      const slideWidth = getSlideWidth();
      const currentIndex = slideWidth
        ? (Math.round(Math.abs(offset) / slideWidth) - 1 + originalSlides.length) % originalSlides.length
        : 0;
      if (currentIndex !== lastRenderedIndex) {
        [...dots.children].forEach((dot, index) => {
          dot.classList.toggle('is-active', index === currentIndex);
          if (dot instanceof HTMLButtonElement) {
            if (index === currentIndex) dot.setAttribute('aria-current', 'true');
            else dot.removeAttribute('aria-current');
          }
        });
        lastRenderedIndex = currentIndex;
      }
    }
  };

  const pauseTemporarily = () => {
    paused = true;
    window.clearTimeout(resumeTimer);
    if (!reducedMotion.matches && originalSlides.length > 1) {
      resumeTimer = window.setTimeout(() => {
        paused = false;
      }, 1800);
    }
  };

  const stopActiveVideo = () => {
    if (!activeVideo) return;
    activeVideo.pause();
    activeVideo.controls = false;
    activeVideo.currentTime = 0;
    activeVideo.parentElement?.classList.remove('is-playing');
    const playButton = activeVideo.parentElement?.querySelector('[data-video-play]');
    if (playButton instanceof HTMLButtonElement) playButton.hidden = false;
    activeVideo = null;
  };

  const finishVideo = (video) => {
    if (activeVideo !== video) return;
    video.controls = false;
    video.parentElement?.classList.remove('is-playing');
    const playButton = video.parentElement?.querySelector('[data-video-play]');
    if (playButton instanceof HTMLButtonElement) playButton.hidden = false;
    activeVideo = null;
    paused = reducedMotion.matches || originalSlides.length < 2;
  };

  const failVideo = (video, error) => {
    if (activeVideo !== video) return;
    finishVideo(video);
    message.textContent = `Não foi possível reproduzir este vídeo. ${error}`;
    message.dataset.state = 'error';
  };

  videos.forEach((video) => {
    video.addEventListener('ended', () => finishVideo(video));
    video.addEventListener('error', () => failVideo(video, 'Toque no botão para tentar novamente.'));
  });

  carousel.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const playButton = target.closest('[data-video-play]');
    if (!(playButton instanceof HTMLButtonElement)) return;
    const video = playButton.parentElement?.querySelector('video');
    if (!(video instanceof HTMLVideoElement)) return;

    stopActiveVideo();
    activeVideo = video;
    paused = true;
    window.clearTimeout(resumeTimer);
    message.textContent = carouselMessage;
    message.dataset.state = carouselMessageState;
    video.controls = true;
    video.parentElement?.classList.add('is-playing');
    playButton.hidden = true;
    video.play().catch((error) => {
      failVideo(video, error instanceof Error ? error.message : 'Tente novamente.');
    });
  });

  const animate = (timestamp) => {
    if (!lastFrame) lastFrame = timestamp;
    const elapsed = Math.min(timestamp - lastFrame, 40);
    lastFrame = timestamp;

    if (!paused && !dragging && !document.hidden) {
      offset = normalizeOffset(offset - elapsed * 0.024);
      render();
    }
    window.requestAnimationFrame(animate);
  };

  const moveBySlide = (direction) => {
    stopActiveVideo();
    pauseTemporarily();
    window.clearTimeout(pageTurnTimer);
    carousel.classList.remove('is-page-turning-next', 'is-page-turning-prev');
    void carousel.offsetWidth;
    carousel.classList.add(direction > 0 ? 'is-page-turning-next' : 'is-page-turning-prev');
    pageTurnTimer = window.setTimeout(() => {
      carousel.classList.remove('is-page-turning-next', 'is-page-turning-prev');
    }, 680);
    const slideWidth = getSlideWidth();
    const currentIndex = (Math.round(Math.abs(offset) / slideWidth) - 1 + originalSlides.length) % originalSlides.length;
    offset = normalizeOffset(-(currentIndex + 1 + direction) * slideWidth);
    render();
  };

  nextButton?.addEventListener('click', () => moveBySlide(1));
  prevButton?.addEventListener('click', () => moveBySlide(-1));

  dots?.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const index = Number(target.dataset.dotIndex);
    if (!Number.isInteger(index)) return;
    stopActiveVideo();
    pauseTemporarily();
    offset = normalizeOffset(-(index + 1) * getSlideWidth());
    render();
  });

  carousel.addEventListener('pointerdown', (event) => {
    if (event.target instanceof Element && event.target.closest('.carousel__controls, [data-video-play], video')) return;
    if (originalSlides.length < 2 || (event.pointerType === 'mouse' && event.button !== 0)) return;
    dragging = true;
    paused = true;
    window.clearTimeout(resumeTimer);
    pointerStart = event.clientX;
    offsetStart = offset;
    carousel.classList.add('is-dragging');
    carousel.setPointerCapture(event.pointerId);
  });

  carousel.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    offset = normalizeOffset(offsetStart + event.clientX - pointerStart);
    render();
  });

  const finishDragging = (event) => {
    if (!dragging) return;
    dragging = false;
    carousel.classList.remove('is-dragging');
    if (carousel.hasPointerCapture(event.pointerId)) {
      carousel.releasePointerCapture(event.pointerId);
    }
    pauseTemporarily();
  };

  carousel.addEventListener('pointerup', finishDragging);
  carousel.addEventListener('pointercancel', finishDragging);
  carousel.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse' && !activeVideo) paused = true;
  });
  carousel.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'mouse' && !dragging && !activeVideo) paused = false;
  });

  reducedMotion.addEventListener('change', (event) => {
    if (!activeVideo) paused = event.matches || originalSlides.length < 2;
  });

  window.addEventListener('resize', () => {
    offset = normalizeOffset(offset);
    render();
  });

  offset = -getSlideWidth();
  render();
  window.requestAnimationFrame(animate);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountCarousel, { once: true });
} else {
  mountCarousel();
}
