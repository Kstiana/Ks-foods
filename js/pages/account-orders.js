import config from '../config.js';
import { getCurrentUser } from '../core/auth.js';
import { getUserOrders } from '../features/checkout.js';
import { addToCart } from '../features/cart.js';
import { showToast } from '../core/toast.js';

const formatPrice = price => `${config.currency}${price.toLocaleString('en-NG')}`;

const formatDate = iso => new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_LABELS = {
  confirmed: { label: 'Confirmed', badge: 'badge-info' },
  preparing: { label: 'Preparing', badge: 'badge-warning' },
  ready: { label: 'Ready', badge: 'badge-success' },
  completed: { label: 'Completed', badge: 'badge-success' }
};

const renderOrders = orders => {
  const list = document.getElementById('orders-list');
  const empty = document.getElementById('orders-empty');
  if (!list) return;

  if (!orders.length) {
    empty.hidden = false;
    return;
  }

  list.innerHTML = orders.map(order => {
    const status = STATUS_LABELS[order.status] ?? STATUS_LABELS.confirmed;
    const itemsSummary = order.items.map(i => `${i.name} × ${i.qty}`).join(', ');

    return `
      <div class="card order-card" data-order-id="${order.id}">
        <div class="order-card-header">
          <span class="order-card-id">Order #${order.id.slice(-8).toUpperCase()}</span>
          <span class="badge ${status.badge}">${status.label}</span>
        </div>
        <p class="order-card-date">${formatDate(order.createdAt)} · ${order.fulfilment === 'delivery' ? 'Delivery' : 'Pickup'}</p>
        <p class="order-card-items">${itemsSummary}</p>
        <div class="order-card-footer">
          <span class="order-card-total">${formatPrice(order.total)}</span>
          <button class="btn btn-secondary btn-sm" data-reorder="${order.id}">Reorder</button>
        </div>
      </div>
    `;
  }).join('');

  list.addEventListener('click', e => {
    const btn = e.target.closest('[data-reorder]');
    if (!btn) return;
    const order = orders.find(o => o.id === btn.dataset.reorder);
    if (!order) return;
    order.items.forEach(item => addToCart(item.itemId, item.qty));
    showToast('Items added to your cart', 'success');
  });
};

export const init = () => {
  const user = getCurrentUser();
  if (!user) return;

  const orders = getUserOrders(user.id);
  renderOrders(orders);
};
