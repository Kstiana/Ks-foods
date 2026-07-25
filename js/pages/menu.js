import menuItems from '../data/menu-data.js';
import { renderShimmer, renderFeatured } from '../ui/ui.js';
import { initFilter } from '../features/filter.js';
import { getFavourites } from '../features/favourites.js';

export const init = () => {
  renderShimmer();

  const featured = menuItems.filter(item => item.featured);
  renderFeatured(featured, getFavourites());

  initFilter();
};
