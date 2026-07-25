import { get, set } from './store.js';

const getPreferred = () => {
  const saved = get('theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const apply = theme => {
  document.documentElement.setAttribute('data-theme', theme);
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.content = theme === 'dark' ? '#1e100a' : '#b01e1e';
  set('theme', theme);
};

export const getCurrentTheme = () => document.documentElement.getAttribute('data-theme') ?? 'light';

export const toggleTheme = () => {
  apply(getCurrentTheme() === 'dark' ? 'light' : 'dark');
};

export const initTheme = () => {
  apply(getPreferred());

  document.addEventListener('click', e => {
    if (e.target.closest('#theme-toggle-btn')) toggleTheme();
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!get('theme')) apply(e.matches ? 'dark' : 'light');
  });
};
