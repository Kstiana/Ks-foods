import { icon } from './icons.js';

let scrollLockCount = 0;

const lockScroll = () => {
  scrollLockCount++;
  document.body.style.overflow = 'hidden';
};

const unlockScroll = () => {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) document.body.style.overflow = '';
};

export const trapFocus = (e, container) => {
  if (!container) return;
  const focusable = Array.from(container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )).filter(el => !el.disabled && el.offsetParent !== null);

  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
  } else {
    if (document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
};

export const bindModal = (overlay, { container, onOpen, onClose } = {}) => {
  let trigger = null;
  const modalEl = container ?? overlay.querySelector('.modal, .drawer-inner') ?? overlay;

  const keydownHandler = e => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') trapFocus(e, modalEl);
  };

  const overlayClickHandler = e => {
    if (e.target === overlay) close();
  };

  const open = (triggerEl = null) => {
    trigger = triggerEl;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    lockScroll();
    document.addEventListener('keydown', keydownHandler);
    overlay.addEventListener('click', overlayClickHandler);
    requestAnimationFrame(() => {
      const focusTarget = modalEl.querySelector('[data-autofocus]') ?? modalEl.querySelector('button, input, [href]');
      focusTarget?.focus();
    });
    onOpen?.();
  };

  const close = () => {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    unlockScroll();
    document.removeEventListener('keydown', keydownHandler);
    overlay.removeEventListener('click', overlayClickHandler);
    trigger?.focus();
    onClose?.();
  };

  return { open, close };
};

export const confirm = ({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary'
} = {}) => {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay modal-plain';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-plain-body">
          <h2 class="modal-plain-title">${title}</h2>
          <p>${message}</p>
          <div class="modal-plain-actions">
            <button class="btn btn-secondary" data-action="cancel">${cancelLabel}</button>
            <button class="btn btn-${variant}" data-action="confirm" data-autofocus>${confirmLabel}</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const modal = bindModal(overlay, {
      onClose: () => {
        overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
        setTimeout(() => overlay.remove(), 400);
      }
    });

    overlay.addEventListener('click', e => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (!action) return;
      modal.close();
      resolve(action === 'confirm');
    });

    requestAnimationFrame(() => modal.open());
  });
};

export const closeIconMarkup = icon('close', { size: 20 });
