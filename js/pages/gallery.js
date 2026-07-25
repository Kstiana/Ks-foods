import galleryData from '../data/gallery-data.js';
import { bindModal } from '../core/modal.js';
import { initScrollReveal } from '../ui/animations.js';

let activeFilter = 'all';
let currentIndex = 0;
let lightbox = null;

const getFiltered = () => activeFilter === 'all' ? galleryData : galleryData.filter(img => img.category === activeFilter);

const renderGrid = () => {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  grid.innerHTML = galleryData.map((img, index) => `
    <div class="gallery-item reveal ${img.category !== activeFilter && activeFilter !== 'all' ? 'hidden-item' : ''}" data-index="${index}" data-category="${img.category}">
      <img src="${img.src}" alt="${img.alt}" loading="lazy" />
      <div class="gallery-item-overlay" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
      </div>
    </div>
  `).join('');
};

const applyFilter = () => {
  document.querySelectorAll('.gallery-item').forEach(item => {
    const matches = activeFilter === 'all' || item.dataset.category === activeFilter;
    item.classList.toggle('hidden-item', !matches);
  });
};

const showImage = index => {
  const image = document.getElementById('lightbox-image');
  const item = galleryData[index];
  if (!image || !item) return;
  currentIndex = index;
  image.src = item.src;
  image.alt = item.alt;
};

const initLightbox = () => {
  const overlay = document.getElementById('lightbox-overlay');
  if (!overlay) return;

  lightbox = bindModal(overlay);

  document.getElementById('gallery-grid')?.addEventListener('click', e => {
    const item = e.target.closest('.gallery-item');
    if (!item) return;
    showImage(Number(item.dataset.index));
    lightbox.open(item);
  });

  document.getElementById('lightbox-close-btn')?.addEventListener('click', () => lightbox.close());

  const step = delta => {
    const visible = getFiltered();
    if (!visible.length) return;
    const visibleIndices = visible.map(img => galleryData.indexOf(img));
    const posInVisible = visibleIndices.indexOf(currentIndex);
    const nextPos = (posInVisible + delta + visibleIndices.length) % visibleIndices.length;
    showImage(visibleIndices[nextPos]);
  };

  document.getElementById('lightbox-prev-btn')?.addEventListener('click', () => step(-1));
  document.getElementById('lightbox-next-btn')?.addEventListener('click', () => step(1));

  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
};

const initFilterTabs = () => {
  document.querySelectorAll('[data-gallery-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-gallery-filter]').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      activeFilter = btn.dataset.galleryFilter;
      applyFilter();
    });
  });
};

export const init = () => {
  activeFilter = 'all';
  renderGrid();
  initFilterTabs();
  initLightbox();
  initScrollReveal(document.getElementById('gallery-grid'));
};
