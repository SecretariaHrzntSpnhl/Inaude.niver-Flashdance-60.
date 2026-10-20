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
const PHOTO_TRANSITIONS = ['focus', 'silver', 'warm'];

const createSlide = (item, index) => {
  const article = document.createElement('article');
  article.className = 'slide';
  article.dataset.slideIndex = index.toString();
  article.dataset.slideKey = item.name ?? item.url;

  const media = document.createElement('div');
  media.className = 'slide__media';
  if (item.type === 'video') {
    const video = document.createElement('video');
    video.src = item.url;
    video.playsInline = true;
    video.preload = 'none';
    video.setAttribute('aria-label', item.author ? `Vídeo compartilhado por ${item.author}` : 'Vídeo compartilhado');
    media.append(video);

    const videoBadge = document.createElement('span');
    videoBadge.className = 'slide__video-badge';
    videoBadge.innerHTML = '<span aria-hidden="true"></span> VÍDEO DO ÁLBUM';
    media.append(videoBadge);

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
  let isPreview = originalSlides === previewSlides;

  const track = carousel.querySelector('[data-carousel-track]');
  if (!(track instanceof HTMLElement)) return;

  const carouselShell = carousel.parentElement;
  const dots = carousel.parentElement?.querySelector('[data-carousel-status]');
  const nextButton = carousel.querySelector('[data-carousel-next]');
  const prevButton = carousel.querySelector('[data-carousel-prev]');
  const hint = carousel.parentElement?.querySelector('[data-carousel-hint]');
  const cinemaPlayer = carousel.querySelector('[data-cinema-player]');
  const cinemaVideo = cinemaPlayer?.querySelector('[data-cinema-video]');
  const cinemaTitle = cinemaPlayer?.querySelector('[data-cinema-title]');
  const cinemaToggle = cinemaPlayer?.querySelector('[data-cinema-toggle]');
  const cinemaMute = cinemaPlayer?.querySelector('[data-cinema-mute]');
  const cinemaSeek = cinemaPlayer?.querySelector('[data-cinema-seek]');
  const cinemaCurrent = cinemaPlayer?.querySelector('[data-cinema-current]');
  const cinemaDuration = cinemaPlayer?.querySelector('[data-cinema-duration]');
  const cinemaStatus = cinemaPlayer?.querySelector('[data-cinema-status]');
  const cinemaClose = cinemaPlayer?.querySelector('[data-cinema-close]');
  const uploadParams = new URLSearchParams(window.location.search);
  const uploadedItemName = uploadParams.get('album-item');

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
  const uploadedCount = Number(uploadParams.get('album-enviado'));
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
  let offset = 0;
  let lastFrame = 0;
  let dragging = false;
  let pointerStart = 0;
  let offsetStart = 0;
  let paused = reducedMotion.matches || originalSlides.length < 2;
  let resumeTimer = 0;
  let pageTurnTimer = 0;
  let activeVideo = null;
  let activePlayButton = null;
  let lastRenderedIndex = -1;
  let lastTransition = '';
  let refreshRunning = false;

  const getSlideWidth = () => track.children[0]?.getBoundingClientRect().width ?? 0;
  const getCycleWidth = () => getSlideWidth() * originalSlides.length;
  const getCenteredTrackIndex = () => {
    const slideWidth = getSlideWidth();
    return slideWidth ? Math.floor((carousel.clientWidth / 2 - offset) / slideWidth) : 1;
  };
  const getCurrentIndex = () =>
    ((getCenteredTrackIndex() - 1) % originalSlides.length + originalSlides.length) % originalSlides.length;

  const normalizeOffset = (value) => {
    const cycleWidth = getCycleWidth();
    if (!cycleWidth) return 0;
    return -(((-value % cycleWidth) + cycleWidth) % cycleWidth);
  };

  const render = () => {
    track.style.transform = `translate3d(${offset}px, 0, 0)`;

    const centeredTrackIndex = getCenteredTrackIndex();
    const currentIndex = getCurrentIndex();
    if (currentIndex !== lastRenderedIndex) {
      track.querySelector('.slide.is-arriving')?.classList.remove('is-arriving');
      const activeSlide = track.children[centeredTrackIndex];
      if (activeSlide instanceof HTMLElement) {
        const transitions = PHOTO_TRANSITIONS.filter((transition) => transition !== lastTransition);
        lastTransition = transitions[Math.floor(Math.random() * transitions.length)] ?? PHOTO_TRANSITIONS[0];
        activeSlide.dataset.transition = lastTransition;
        void activeSlide.offsetWidth;
        activeSlide.classList.add('is-arriving');
      }
    }

    if (dots instanceof HTMLElement) {
      if (currentIndex !== lastRenderedIndex) {
        [...dots.children].forEach((dot, index) => {
          dot.classList.toggle('is-active', index === currentIndex);
          if (dot instanceof HTMLButtonElement) {
            if (index === currentIndex) dot.setAttribute('aria-current', 'true');
            else dot.removeAttribute('aria-current');
          }
        });
      }
    }
    lastRenderedIndex = currentIndex;
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

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainder}`;
  };

  const updateCinemaPlaybackControl = () => {
    if (!(cinemaVideo instanceof HTMLVideoElement) || !(cinemaToggle instanceof HTMLButtonElement)) return;
    const playing = !cinemaVideo.paused && !cinemaVideo.ended;
    cinemaToggle.textContent = playing ? 'Ⅱ' : '▶';
    cinemaToggle.setAttribute('aria-label', playing ? 'Pausar vídeo' : 'Reproduzir vídeo');
  };

  const centerSlide = (index) => {
    const slideWidth = getSlideWidth();
    offset = slideWidth
      ? carousel.clientWidth / 2 - (index + 1) * slideWidth - slideWidth / 2
      : 0;
    offset = normalizeOffset(offset);
  };

  const refreshAlbum = async () => {
    if (!isAlbumConfigured || refreshRunning || document.hidden || activeVideo) return;
    refreshRunning = true;
    try {
      const latestSlides = await listAlbumItems(Number.POSITIVE_INFINITY);
      if (!latestSlides.length && isPreview) {
        if (previewIsError) {
          previewIsError = false;
          previewMessage = 'O álbum espera pelas primeiras fotos. Abaixo, uma prévia com imagens ilustrativas.';
          message.textContent = previewMessage;
          message.dataset.state = '';
        }
        return;
      }
      const unchanged =
        !isPreview &&
        latestSlides.length === originalSlides.length &&
        latestSlides.every((slide, index) => slide.name === originalSlides[index].name);
      if (unchanged) {
        if (message.dataset.state === 'error') {
          message.textContent = `${originalSlides.length} lembrança(s) da festa.`;
          message.dataset.state = '';
        }
        return;
      }

      const currentKey = track.children[getCenteredTrackIndex()]?.dataset.slideKey;
      const currentKeyIndex = latestSlides.findIndex((slide) => slide.name === currentKey);
      stopActiveVideo();
      originalSlides = latestSlides.length ? latestSlides : previewSlides;
      isPreview = originalSlides === previewSlides;
      previewIsError = false;
      previewMessage = 'O álbum espera pelas primeiras fotos. Abaixo, uma prévia com imagens ilustrativas.';

      const refreshedOriginals = originalSlides.map((slide, index) => createSlide(slide, index));
      track.replaceChildren(
        cloneSlide(refreshedOriginals[refreshedOriginals.length - 1]),
        ...refreshedOriginals,
        ...refreshedOriginals.map(cloneSlide)
      );

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
        dots.hidden = originalSlides.length < 2 || originalSlides.length > 12;
      }
      if (hint instanceof HTMLElement) hint.hidden = originalSlides.length < 2;
      if (nextButton instanceof HTMLButtonElement) nextButton.hidden = originalSlides.length < 2;
      if (prevButton instanceof HTMLButtonElement) prevButton.hidden = originalSlides.length < 2;

      message.textContent = isPreview ? previewMessage : `${originalSlides.length} lembrança(s) da festa.`;
      message.dataset.state = '';
      lastRenderedIndex = -1;
      const requestedItemIndex = uploadedItemName
        ? originalSlides.findIndex((slide) => slide.name === uploadedItemName)
        : -1;
      centerSlide(
        requestedItemIndex >= 0
          ? requestedItemIndex
          : currentKeyIndex >= 0
            ? currentKeyIndex
            : 0
      );
      render();
    } catch (error) {
      message.textContent = `Não foi possível atualizar as lembranças. ${
        error instanceof Error ? error.message : 'Tente novamente mais tarde.'
      }`;
      message.dataset.state = 'error';
    } finally {
      refreshRunning = false;
    }
  };

  const openCinema = (video, playButton) => {
    if (
      !(cinemaPlayer instanceof HTMLElement) ||
      !(cinemaVideo instanceof HTMLVideoElement) ||
      !(cinemaTitle instanceof HTMLElement) ||
      !(cinemaStatus instanceof HTMLElement) ||
      !(cinemaSeek instanceof HTMLInputElement) ||
      !(cinemaCurrent instanceof HTMLElement) ||
      !(cinemaDuration instanceof HTMLElement)
    ) {
      message.textContent = 'O reprodutor de vídeo não está disponível neste momento.';
      message.dataset.state = 'error';
      return;
    }

    stopActiveVideo();
    activeVideo = video;
    activePlayButton = playButton;
    paused = true;
    window.clearTimeout(resumeTimer);
    window.clearTimeout(pageTurnTimer);
    message.textContent = carouselMessage;
    message.dataset.state = carouselMessageState;
    cinemaTitle.textContent =
      video.closest('.slide')?.querySelector('.slide__title')?.textContent?.trim() || 'Uma lembrança da festa';
    cinemaStatus.textContent = '';
    cinemaVideo.src = video.currentSrc || video.src;
    cinemaVideo.currentTime = 0;
    cinemaVideo.muted = false;
    cinemaSeek.value = '0';
    cinemaCurrent.textContent = '0:00';
    cinemaDuration.textContent = '0:00';
    if (cinemaMute instanceof HTMLButtonElement) {
      cinemaMute.textContent = '♫';
      cinemaMute.setAttribute('aria-label', 'Silenciar vídeo');
    }
    cinemaPlayer.hidden = false;
    carousel.classList.add('is-cinema-open');
    carouselShell?.classList.add('is-cinema-open');
    track.inert = true;
    track.setAttribute('aria-hidden', 'true');
    if (dots instanceof HTMLElement) dots.inert = true;
    if (nextButton instanceof HTMLButtonElement) nextButton.disabled = true;
    if (prevButton instanceof HTMLButtonElement) prevButton.disabled = true;
    cinemaClose?.focus({ preventScroll: true });
    carousel.scrollLeft = 0;

    cinemaVideo.play().then(updateCinemaPlaybackControl).catch((error) => {
      cinemaStatus.textContent = 'Toque em reproduzir para iniciar o vídeo.';
      updateCinemaPlaybackControl();
      if (error instanceof Error && error.name !== 'NotAllowedError') {
        cinemaStatus.textContent = `Não foi possível reproduzir o vídeo. ${error.message}`;
      }
    });
  };

  const closeCinema = () => {
    if (!(cinemaPlayer instanceof HTMLElement) || cinemaPlayer.hidden) return;
    if (cinemaVideo instanceof HTMLVideoElement) {
      cinemaVideo.pause();
      cinemaVideo.removeAttribute('src');
      cinemaVideo.load();
    }
    cinemaPlayer.hidden = true;
    carousel.classList.remove('is-cinema-open');
    carouselShell?.classList.remove('is-cinema-open');
    track.inert = false;
    track.removeAttribute('aria-hidden');
    if (dots instanceof HTMLElement) dots.inert = false;
    if (nextButton instanceof HTMLButtonElement) nextButton.disabled = originalSlides.length < 2;
    if (prevButton instanceof HTMLButtonElement) prevButton.disabled = originalSlides.length < 2;
    activeVideo = null;
    paused = reducedMotion.matches || originalSlides.length < 2;
    pauseTemporarily();
    activePlayButton?.focus({ preventScroll: true });
    activePlayButton = null;
    carousel.scrollLeft = 0;
  };

  cinemaPlayer?.addEventListener('click', (event) => {
    if (event.target === cinemaPlayer) closeCinema();
  });
  cinemaPlayer?.addEventListener('keydown', (event) => {
    if (event instanceof KeyboardEvent && event.key === 'Escape') {
      event.preventDefault();
      closeCinema();
    }
  });
  cinemaClose?.addEventListener('click', () => {
    closeCinema();
  });
  cinemaToggle?.addEventListener('click', () => {
    if (!(cinemaVideo instanceof HTMLVideoElement)) return;
    if (cinemaVideo.paused) {
      cinemaVideo.play().catch((error) => {
        if (cinemaStatus instanceof HTMLElement) {
          cinemaStatus.textContent = `Não foi possível reproduzir o vídeo. ${
            error instanceof Error ? error.message : 'Tente novamente.'
          }`;
        }
      });
    } else {
      cinemaVideo.pause();
    }
    updateCinemaPlaybackControl();
  });
  cinemaMute?.addEventListener('click', () => {
    if (!(cinemaVideo instanceof HTMLVideoElement) || !(cinemaMute instanceof HTMLButtonElement)) return;
    cinemaVideo.muted = !cinemaVideo.muted;
    cinemaMute.textContent = cinemaVideo.muted ? '♪' : '♫';
    cinemaMute.setAttribute('aria-label', cinemaVideo.muted ? 'Ativar som do vídeo' : 'Silenciar vídeo');
  });
  cinemaSeek?.addEventListener('input', () => {
    if (!(cinemaVideo instanceof HTMLVideoElement) || !Number.isFinite(cinemaVideo.duration)) return;
    cinemaVideo.currentTime = (Number(cinemaSeek.value) / 1000) * cinemaVideo.duration;
  });
  cinemaVideo?.addEventListener('loadedmetadata', () => {
    if (cinemaDuration instanceof HTMLElement && cinemaVideo instanceof HTMLVideoElement) {
      cinemaDuration.textContent = formatTime(cinemaVideo.duration);
    }
  });
  cinemaVideo?.addEventListener('timeupdate', () => {
    if (
      !(cinemaVideo instanceof HTMLVideoElement) ||
      !(cinemaSeek instanceof HTMLInputElement) ||
      !(cinemaCurrent instanceof HTMLElement)
    ) {
      return;
    }
    cinemaCurrent.textContent = formatTime(cinemaVideo.currentTime);
    if (Number.isFinite(cinemaVideo.duration) && cinemaVideo.duration > 0) {
      cinemaSeek.value = Math.round((cinemaVideo.currentTime / cinemaVideo.duration) * 1000).toString();
    }
  });
  cinemaVideo?.addEventListener('play', updateCinemaPlaybackControl);
  cinemaVideo?.addEventListener('pause', updateCinemaPlaybackControl);
  cinemaVideo?.addEventListener('ended', closeCinema);
  cinemaVideo?.addEventListener('error', () => {
    if (cinemaStatus instanceof HTMLElement) cinemaStatus.textContent = 'Não foi possível carregar este vídeo. Feche e tente novamente.';
  });
  cinemaPlayer?.addEventListener('keydown', (event) => {
    if (
      event instanceof KeyboardEvent &&
      event.code === 'Space' &&
      !(event.target instanceof HTMLButtonElement) &&
      !(event.target instanceof HTMLInputElement) &&
      cinemaVideo instanceof HTMLVideoElement
    ) {
      event.preventDefault();
      if (cinemaVideo.paused) {
        cinemaVideo.play().catch((error) => {
          if (cinemaStatus instanceof HTMLElement) {
            cinemaStatus.textContent = `Não foi possível reproduzir o vídeo. ${
              error instanceof Error ? error.message : 'Tente novamente.'
            }`;
          }
        });
      } else {
        cinemaVideo.pause();
      }
    }
  });

  carousel.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const playButton = target.closest('[data-video-play]');
    if (!(playButton instanceof HTMLButtonElement)) return;
    const video = playButton.parentElement?.querySelector('video');
    if (!(video instanceof HTMLVideoElement)) return;

    openCinema(video, playButton);
  });

  const animate = (timestamp) => {
    if (!lastFrame) lastFrame = timestamp;
    const elapsed = Math.min(timestamp - lastFrame, 40);
    lastFrame = timestamp;

    if (!paused && !dragging && !document.hidden) {
      offset = normalizeOffset(offset - elapsed * 0.035);
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
    const currentIndex = getCurrentIndex();
    const targetIndex = (currentIndex + direction + originalSlides.length) % originalSlides.length;
    offset = normalizeOffset(
      carousel.clientWidth / 2 - (targetIndex + 1) * slideWidth - slideWidth / 2
    );
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
    const slideWidth = getSlideWidth();
    offset = normalizeOffset(
      carousel.clientWidth / 2 - (index + 1) * slideWidth - slideWidth / 2
    );
    render();
  });

  carousel.addEventListener('pointerdown', (event) => {
    if (
      event.target instanceof Element &&
      event.target.closest('.carousel__controls, [data-video-play], video, [data-cinema-player]')
    ) {
      return;
    }
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

  const uploadedItemIndex = uploadedItemName
    ? originalSlides.findIndex((slide) => slide.name === uploadedItemName)
    : -1;
  centerSlide(uploadedItemIndex >= 0 ? uploadedItemIndex : 0);
  render();
  window.requestAnimationFrame(animate);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) void refreshAlbum();
  });
  window.setInterval(() => {
    void refreshAlbum();
  }, 10000);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountCarousel, { once: true });
} else {
  mountCarousel();
}
