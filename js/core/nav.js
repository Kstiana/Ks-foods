import { renderNavAuth } from './auth.js';

export const loadShell = async () => {
  const [headerHtml, footerHtml] = await Promise.all([
    fetch('/partials/header.html').then(res => res.text()),
    fetch('/partials/footer.html').then(res => res.text())
  ]);
  document.getElementById('header-mount').innerHTML = headerHtml;
  document.getElementById('footer-mount').innerHTML = footerHtml;
};

export const initNav = () => {
  const header = document.getElementById('site-header');
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const primaryNav = document.getElementById('primary-nav');
  const navClose = document.getElementById('primary-nav-close');
  const navOverlay = document.getElementById('nav-overlay');
  const searchToggle = document.getElementById('search-toggle-btn');
  const searchWrapper = document.getElementById('search-bar-wrapper');
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear-btn');
  const backToTop = document.getElementById('back-to-top');

  const openNav = () => {
    primaryNav?.classList.add('open');
    navOverlay?.classList.add('open');
    mobileToggle?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeNav = () => {
    primaryNav?.classList.remove('open');
    navOverlay?.classList.remove('open');
    mobileToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  mobileToggle?.addEventListener('click', () => {
    primaryNav?.classList.contains('open') ? closeNav() : openNav();
  });

  navClose?.addEventListener('click', closeNav);
  navOverlay?.addEventListener('click', closeNav);

  primaryNav?.addEventListener('click', e => {
    if (e.target.closest('a[data-link]')) closeNav();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && primaryNav?.classList.contains('open')) closeNav();
  });

  searchToggle?.addEventListener('click', () => {
    const isOpen = searchWrapper.classList.toggle('open');
    searchWrapper.setAttribute('aria-hidden', String(!isOpen));
    searchToggle.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) searchInput?.focus();
  });

  searchInput?.addEventListener('input', () => {
    if (searchClear) searchClear.hidden = !searchInput.value;
    document.dispatchEvent(new CustomEvent('globalsearch', { detail: searchInput.value }));
  });

  searchClear?.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.hidden = true;
    searchInput.focus();
    document.dispatchEvent(new CustomEvent('globalsearch', { detail: '' }));
  });

  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle('scrolled', y > 10);
    if (backToTop) backToTop.hidden = y < 400;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  renderNavAuth();
  document.addEventListener('authchange', renderNavAuth);

  const navAuth = document.getElementById('nav-auth');
  const authSlot = document.getElementById('primary-nav-auth-slot');
  const mobileNavQuery = window.matchMedia('(max-width: 767px)');

  const placeNavAuth = () => {
    if (!navAuth) return;
    if (mobileNavQuery.matches) {
      authSlot?.appendChild(navAuth);
    } else {
      mobileToggle?.insertAdjacentElement('beforebegin', navAuth);
    }
  };

  placeNavAuth();
  mobileNavQuery.addEventListener('change', placeNavAuth);

  const syncHeaderHeight = () => {
    if (!header) return;
    document.documentElement.style.setProperty('--header-total-height', `${header.getBoundingClientRect().height}px`);
  };

  syncHeaderHeight();
  window.addEventListener('resize', syncHeaderHeight);
  if (window.ResizeObserver && header) {
    new ResizeObserver(syncHeaderHeight).observe(header);
  }
};
