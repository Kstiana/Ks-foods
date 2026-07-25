import menuItems from '../data/menu-data.js';
import { buildCard, observeCards } from '../ui/ui.js';
import { getFavourites } from '../features/favourites.js';
import { getCartCount, orderViaWhatsApp, openCart } from '../features/cart.js';
import { initScrollReveal } from '../ui/animations.js';

const renderCarousel = () => {
  const track = document.getElementById('chefs-picks-carousel');
  if (!track) return;

  const featured = menuItems.filter(item => item.featured);
  const favourites = getFavourites();
  featured.forEach(item => track.appendChild(buildCard(item, favourites.has(item.id))));
  observeCards(track);
};

const initCarouselControls = () => {
  const track = document.getElementById('chefs-picks-carousel');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  if (!track) return;

  const scrollAmount = () => track.querySelector('.menu-item')?.offsetWidth + 16 || 260;

  const updateButtons = () => {
    if (prevBtn) prevBtn.disabled = track.scrollLeft <= 4;
    if (nextBtn) nextBtn.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
  };

  prevBtn?.addEventListener('click', () => {
    track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
  });

  nextBtn?.addEventListener('click', () => {
    track.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
  });

  track.addEventListener('scroll', updateButtons, { passive: true });
  updateButtons();
};

const initHeroWhatsApp = () => {
  document.getElementById('whatsapp-hero-btn')?.addEventListener('click', e => {
    e.preventDefault();
    getCartCount() > 0 ? orderViaWhatsApp() : openCart();
  });
};

export const init = () => {
  renderCarousel();
  initCarouselControls();
  initHeroWhatsApp();
  initScrollReveal(document.getElementById('app'));
};
