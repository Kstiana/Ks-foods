import menuItems from '../data/menu-data.js';
import { renderCards } from '../ui/ui.js';
import { getFavourites } from './favourites.js';

let activeCategory = 'All';
let activeSearch = '';
let activeSort = 'default';
let globalSearchController = null;

const isFeaturedVisible = () => activeCategory === 'All' && !activeSearch.trim();

const syncFeaturedVisibility = () => {
  const featured = document.getElementById('featured-section');
  const menuHeading = document.getElementById('menu-heading');
  const show = isFeaturedVisible();
  if (featured) featured.hidden = !show;
  if (menuHeading) menuHeading.hidden = !show;
};

const getFiltered = () => {
  let items = [...menuItems];

  if (activeCategory === 'Favourites') {
    const favs = getFavourites();
    items = items.filter(item => favs.has(item.id));
  } else if (activeCategory !== 'All') {
    items = items.filter(item => item.category.includes(activeCategory));
  }

  if (activeSearch.trim()) {
    const q = activeSearch.trim().toLowerCase();
    items = items.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.some(c => c.toLowerCase().includes(q))
    );
  }

  switch (activeSort) {
    case 'price-asc': items.sort((a, b) => a.price - b.price); break;
    case 'price-desc': items.sort((a, b) => b.price - a.price); break;
    case 'name-asc': items.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'name-desc': items.sort((a, b) => b.name.localeCompare(a.name)); break;
    case 'rating-desc': items.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
  }

  return items;
};

const applyFilters = () => {
  syncFeaturedVisibility();
  const filtered = getFiltered();
  renderCards(filtered, getFavourites());
  updateActiveFiltersBar();
};

const buildChip = (label, onRemove) => {
  const chip = document.createElement('button');
  chip.className = 'filter-chip';
  chip.setAttribute('aria-label', `Remove filter: ${label}`);
  chip.innerHTML = `${label}<span class="filter-chip-x" aria-hidden="true">✕</span>`;
  chip.addEventListener('click', onRemove);
  return chip;
};

const updateActiveFiltersBar = () => {
  const container = document.getElementById('active-filters');
  if (!container) return;
  container.innerHTML = '';

  if (activeCategory !== 'All') {
    container.appendChild(buildChip(activeCategory, () => {
      setCategory('All');
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === 'All');
        btn.setAttribute('aria-pressed', btn.dataset.category === 'All');
      });
    }));
  }

  if (activeSearch.trim()) {
    container.appendChild(buildChip(`"${activeSearch.trim()}"`, () => {
      activeSearch = '';
      const input = document.getElementById('search-input');
      if (input) input.value = '';
      const clearBtn = document.getElementById('search-clear-btn');
      if (clearBtn) clearBtn.hidden = true;
      applyFilters();
    }));
  }

  if (activeSort !== 'default') {
    const label = document.querySelector(`#sort-select option[value="${activeSort}"]`)?.textContent ?? activeSort;
    container.appendChild(buildChip(label, () => {
      activeSort = 'default';
      const sel = document.getElementById('sort-select');
      if (sel) sel.value = 'default';
      applyFilters();
    }));
  }
};

export const setCategory = category => {
  activeCategory = category;
  applyFilters();
};

export const setSearch = query => {
  activeSearch = query;
  applyFilters();
};

export const setSort = value => {
  activeSort = value;
  applyFilters();
};

export const resetFilters = () => {
  activeCategory = 'All';
  activeSearch = '';
  activeSort = 'default';

  const input = document.getElementById('search-input');
  if (input) input.value = '';
  const clearBtn = document.getElementById('search-clear-btn');
  if (clearBtn) clearBtn.hidden = true;
  const sel = document.getElementById('sort-select');
  if (sel) sel.value = 'default';

  document.querySelectorAll('.filter-btn').forEach(btn => {
    const isAll = btn.dataset.category === 'All';
    btn.classList.toggle('active', isAll);
    btn.setAttribute('aria-pressed', isAll);
  });

  applyFilters();
};

export const refreshFavourites = () => {
  if (activeCategory === 'Favourites') applyFilters();
};

export const initFilter = () => {
  activeCategory = 'All';
  activeSearch = '';
  activeSort = 'default';

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      setCategory(btn.dataset.category);
    });
  });

  const searchInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear-btn');

  if (globalSearchController) globalSearchController.abort();
  globalSearchController = new AbortController();

  document.addEventListener('globalsearch', e => {
    activeSearch = e.detail;
    applyFilters();
  }, { signal: globalSearchController.signal });

  document.getElementById('sort-select')?.addEventListener('change', e => setSort(e.target.value));
  document.getElementById('empty-reset-btn')?.addEventListener('click', resetFilters);

  if (searchInput?.value) activeSearch = searchInput.value;
  if (clearBtn) clearBtn.hidden = !searchInput?.value;

  applyFilters();
};
