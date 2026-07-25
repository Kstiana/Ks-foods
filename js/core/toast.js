import config from '../config.js';
import { icon } from './icons.js';

const TYPE_ICONS = {
  success: 'checkCircle',
  error: 'alertCircle',
  warning: 'alertCircle',
  info: 'infoCircle',
  '': 'infoCircle'
};

export const showToast = (message, type = '') => {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast${type ? ` toast-${type}` : ''}`;
  toast.setAttribute('role', 'status');
  toast.innerHTML = `
    <span class="toast-icon">${icon(TYPE_ICONS[type] ?? 'infoCircle', { size: 18 })}</span>
    <span class="toast-message">${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
    setTimeout(() => toast.remove(), 400);
  }, config.toastDuration);
};
