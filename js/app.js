import { initTheme } from './core/theme.js';
import { loadShell, initNav } from './core/nav.js';
import { initCart } from './features/cart.js';
import { initFavourites } from './features/favourites.js';
import { initRatings } from './features/ratings.js';
import { initItemModal } from './features/item-modal.js';
import { initRouter } from './router.js';

const init = async () => {
  initTheme();
  await loadShell();
  initNav();
  initCart();
  initFavourites();
  initRatings();
  initItemModal();
  initRouter();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
