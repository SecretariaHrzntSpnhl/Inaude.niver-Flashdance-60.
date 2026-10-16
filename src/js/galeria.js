import { isAlbumConfigured, listAlbumItems } from './album.js';

const renderGallery = () => {
  const grid = document.querySelector('[data-gallery-grid]');
  const status = document.querySelector('[data-gallery-status]');
  const filters = document.querySelectorAll('[data-gallery-filter]');
  if (!(grid instanceof HTMLElement) || !(status instanceof HTMLElement)) return;

  let galleryItems = [];
  let activeFilter = 'all';

  const render = () => {
    const items =
      activeFilter === 'all'
        ? galleryItems
        : galleryItems.filter((item) => item.type === activeFilter);

    grid.replaceChildren();
    items.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'gallery-card';
      const media = item.type === 'video' ? document.createElement('video') : document.createElement('img');
      media.className = 'gallery-card__media';
      media.src = item.url;
      if (item.type === 'video') {
        media.controls = true;
        media.preload = 'metadata';
        media.playsInline = true;
        media.setAttribute('aria-label', item.author ? `Vídeo enviado por ${item.author}` : 'Vídeo compartilhado');
      } else {
        media.alt = item.author ? `Lembrança compartilhada por ${item.author}` : 'Lembrança compartilhada';
        media.loading = 'lazy';
      }
      card.append(media);

      const meta = document.createElement('div');
      meta.className = 'gallery-card__meta';
      const type = document.createElement('span');
      type.textContent = item.type === 'video' ? 'Vídeo' : 'Foto';
      if (item.author) {
        const author = document.createElement('span');
        author.textContent = item.author;
        meta.append(author);
      }
      meta.append(type);
      card.append(meta);
      grid.append(card);
    });

    if (!items.length && galleryItems.length) {
      status.textContent = 'Ainda não há lembranças deste tipo no álbum.';
    } else if (!items.length) {
      status.textContent = 'O álbum está esperando pelas primeiras fotos e vídeos da festa.';
    } else {
      status.textContent = `${galleryItems.length} lembrança(s) compartilhada(s) por todos.`;
    }
  };

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      filters.forEach((filter) => filter.classList.toggle('is-active', filter === button));
      activeFilter = button.dataset.galleryFilter ?? 'all';
      render();
    });
  });

  if (!isAlbumConfigured) {
    status.textContent = 'O álbum compartilhado ainda não está configurado. Nenhuma foto de exemplo será exibida.';
    return;
  }

  status.textContent = 'Carregando as lembranças compartilhadas…';
  listAlbumItems()
    .then((items) => {
      galleryItems = items;
      render();
    })
    .catch((error) => {
      status.textContent = `Não foi possível carregar o álbum. ${error instanceof Error ? error.message : 'Tente novamente mais tarde.'}`;
      status.dataset.state = 'error';
    });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderGallery, { once: true });
} else {
  renderGallery();
}
