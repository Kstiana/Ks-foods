    import { isAuthenticated } from './core/auth.js';

const ROUTES = [
  { path: '/', partial: 'home', module: 'home', title: 'Kristy\'s Kitchen — Authentic Nigerian Delicacies', description: 'Authentic Nigerian delicacies — soups, swallows, grills, snacks, drinks and more. Order now.' },
  { path: '/menu', partial: 'menu', module: 'menu', title: 'Menu — Kristy\'s Kitchen', description: 'Browse our full menu of authentic Nigerian dishes.' },
  { path: '/about', partial: 'about', module: 'about', title: 'Our Story — Kristy\'s Kitchen', description: 'The story behind Kristy\'s Kitchen and the people who cook it.' },
  { path: '/gallery', partial: 'gallery', module: 'gallery', title: 'Gallery — Kristy\'s Kitchen', description: 'A look inside Kristy\'s Kitchen — the food, the space, the people.' },
  { path: '/reservations', partial: 'reservations', module: 'reservations', title: 'Reservations — Kristy\'s Kitchen', description: 'Book a table at Kristy\'s Kitchen.' },
  { path: '/reviews', partial: 'reviews', module: 'reviews', title: 'Reviews — Kristy\'s Kitchen', description: 'See what our guests are saying about Kristy\'s Kitchen.' },
  { path: '/contact', partial: 'contact', module: 'contact', title: 'Contact & Location — Kristy\'s Kitchen', description: 'Find us, call us, or send a message.' },
  { path: '/faq', partial: 'faq', module: 'faq', title: 'FAQ — Kristy\'s Kitchen', description: 'Answers to common questions about ordering, delivery, and reservations.' },
  { path: '/login', partial: 'login', module: 'account-login', title: 'Log In — Kristy\'s Kitchen', description: 'Log in to your Kristy\'s Kitchen account.', guestOnly: true },
  { path: '/signup', partial: 'signup', module: 'account-signup', title: 'Sign Up — Kristy\'s Kitchen', description: 'Create your Kristy\'s Kitchen account.', guestOnly: true },
  { path: '/account', partial: 'profile', module: 'account-profile', title: 'My Account — Kristy\'s Kitchen', description: 'Manage your profile and preferences.', protected: true },
  { path: '/account/orders', partial: 'orders', module: 'account-orders', title: 'My Orders — Kristy\'s Kitchen', description: 'View your order history.', protected: true },
  { path: '/checkout', partial: 'checkout', module: 'checkout', title: 'Checkout — Kristy\'s Kitchen', description: 'Review your order and check out.' },
  { path: '/order-confirmation', partial: 'order-confirmation', module: 'order-confirmation', title: 'Order Confirmed — Kristy\'s Kitchen', description: 'Your order has been placed.' }
];

const NOT_FOUND_ROUTE = { path: '/404', partial: 'not-found', module: 'not-found', title: 'Page Not Found — Kristy\'s Kitchen', description: 'The page you\'re looking for could not be found.' };

const appEl = () => document.getElementById('app');

const normalizePath = pathname => {
  let path = pathname || '/';
  // Strip a trailing /index.html (opening the file directly, or a server that resolves it explicitly)
  path = path.replace(/\/index\.html$/i, '/');
  // Collapse any trailing slash (except for the root path itself)
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  return path || '/';
};

const findRoute = pathname => {
  const normalized = normalizePath(pathname);
  return ROUTES.find(route => route.path === normalized) ?? null;
};

const setMeta = route => {
  document.title = route.title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = route.description;
};

const setActiveNavLinks = pathname => {
  document.querySelectorAll('[data-link]').forEach(link => {
    const linkPath = new URL(link.href, window.location.origin).pathname;
    link.classList.toggle('active', linkPath === pathname);
    if (linkPath === pathname) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
};

const updateSearchVisibility = pathname => {
  const toggleBtn = document.getElementById('search-toggle-btn');
  const wrapper = document.getElementById('search-bar-wrapper');
  if (!toggleBtn) return;

  const showSearch = pathname === '/menu';
  toggleBtn.hidden = !showSearch;

  if (!showSearch && wrapper) {
    wrapper.classList.remove('open');
    wrapper.setAttribute('aria-hidden', 'true');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }
};

const focusMainHeading = () => {
  const heading = appEl()?.querySelector('h1');
  if (!heading) return;
  heading.setAttribute('tabindex', '-1');
  heading.focus();
};

const loadPartial = async name => {
  const response = await fetch(`/partials/${name}.html`);
  if (!response.ok) throw new Error(`Failed to load partial: ${name}`);
  return response.text();
};

const closeTransientUI = () => {
  document.querySelectorAll('.drawer.open, .modal-overlay.open').forEach(el => {
    el.classList.remove('open');
    el.setAttribute('aria-hidden', 'true');
  });
  document.body.style.overflow = '';
  document.querySelector('.primary-nav.open')?.classList.remove('open');
  document.querySelector('.nav-overlay.open')?.classList.remove('open');
}

export const navigate = (path, { replace = false } = {}) => {
  if (window.location.pathname === path && !replace) return;
  if (replace) window.history.replaceState({}, '', path);
  else window.history.pushState({}, '', path);
  renderRoute(path);
};

export const renderRoute = async path => {
  let route = findRoute(path);

  if (route?.protected && !isAuthenticated()) {
    window.history.replaceState({}, '', '/login');
    route = findRoute('/login');
  } else if (route?.guestOnly && isAuthenticated()) {
    window.history.replaceState({}, '', '/account');
    route = findRoute('/account');
  }

  if (!route) route = NOT_FOUND_ROUTE;

  const mount = appEl();
  if (!mount) return;

  closeTransientUI();

  try {
    const html = await loadPartial(route.partial);
    mount.innerHTML = html;
    mount.classList.remove('page-enter');
    void mount.offsetWidth;
    mount.classList.add('page-enter');
    // animation-fill-mode:forwards holds the animation's final transform on
    // #app indefinitely, which breaks position:fixed for anything rendered
    // inside it (modals end up anchored to #app instead of the viewport).
    // Drop the class once the entrance animation is done so #app returns to
    // a plain, untransformed state.
    mount.addEventListener('animationend', () => mount.classList.remove('page-enter'), { once: true });

    setMeta(route);
    setActiveNavLinks(route === NOT_FOUND_ROUTE ? '' : route.path);
    updateSearchVisibility(route === NOT_FOUND_ROUTE ? '' : route.path);
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    focusMainHeading();

    const pageModule = await import(`./pages/${route.module}.js`);
    pageModule.init?.();
  } catch {
    mount.innerHTML = '<div class="section"><div class="section-inner"><h1>Something went wrong</h1><p>Please refresh the page and try again.</p></div></div>';
  }
};

const handleLinkClick = e => {
  const link = e.target.closest('a[data-link]');
  if (!link) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  const url = new URL(link.href, window.location.origin);
  navigate(url.pathname);
};

export const initRouter = () => {
  document.addEventListener('click', handleLinkClick);
  window.addEventListener('popstate', () => renderRoute(window.location.pathname));
  renderRoute(window.location.pathname);
};
