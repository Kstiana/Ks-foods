import menuItems from '../data/menu-data.js';
import config from '../config.js';
import { addToCart } from './cart.js';
import { getRating } from './ratings.js';
import { bindModal } from '../core/modal.js';
import { icon } from '../core/icons.js';

const formatPrice = price => `${config.currency}${price.toLocaleString('en-NG')}`;

let currentItem = null;
let currentQty = 1;
let itemModal = null;

const buildStarDisplay = rating => {
  const stars = [1, 2, 3, 4, 5].map(s => `
    <span style="color:${rating >= s ? 'var(--brand-gold)' : 'var(--border-strong)'};display:inline-flex;">
      ${icon('starFilled', { size: 18 })}
    </span>
  `).join('');
  return `${stars}<span class="rating-count">${rating ? `${rating.toFixed(1)} / 5` : 'No ratings yet'}</span>`;
};

const updateQtyDisplay = () => {
  const el = document.getElementById('modal-qty-value');
  if (el) el.textContent = currentQty;
};

export const openItemModal = (item, trigger = null) => {
  currentItem = item;
  currentQty = 1;

  const image = document.getElementById('modal-image');
  const catBadge = document.getElementById('modal-category-badge');
  const name = document.getElementById('modal-name');
  const desc = document.getElementById('modal-description');
  const rating = document.getElementById('modal-rating');
  const price = document.getElementById('modal-price');

  if (!image) return;

  image.src = item.image;
  image.alt = item.name;
  catBadge.textContent = item.category[0];
  name.textContent = item.name;
  desc.textContent = item.description;
  rating.innerHTML = buildStarDisplay(getRating(item.id));
  price.textContent = formatPrice(item.price);
  updateQtyDisplay();

  itemModal?.open(trigger);
};

export const initItemModal = () => {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;

  const incBtn = document.getElementById('modal-qty-inc');
  const decBtn = document.getElementById('modal-qty-dec');
  const addBtn = document.getElementById('modal-add-to-cart');
  const closeBtn = document.getElementById('modal-close-btn');

  itemModal = bindModal(overlay, {
    onClose: () => { currentItem = null; currentQty = 1; }
  });

  closeBtn?.addEventListener('click', () => itemModal.close());

  incBtn?.addEventListener('click', () => { currentQty++; updateQtyDisplay(); });
  decBtn?.addEventListener('click', () => { if (currentQty > 1) { currentQty--; updateQtyDisplay(); } });

  addBtn?.addEventListener('click', () => {
    if (!currentItem) return;
    addToCart(currentItem.id, currentQty, addBtn);
    itemModal.close();
  });

  document.addEventListener('click', e => {
    const card = e.target.closest('.menu-item');
    if (!card) return;
    if (e.target.closest('[data-add-id]') || e.target.closest('[data-fav-id]') || e.target.closest('.rating')) return;
    const id = Number(card.dataset.id);
    const item = menuItems.find(i => i.id === id);
    if (item) openItemModal(item, card);
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = document.activeElement?.closest('.menu-item');
    if (!card) return;
    const id = Number(card.dataset.id);
    const item = menuItems.find(i => i.id === id);
    if (item) { e.preventDefault(); openItemModal(item, card); }
  });
};
