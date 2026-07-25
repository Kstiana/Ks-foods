import config from '../config.js';
import { getLastOrder, getPointsEarned } from '../features/checkout.js';
import { isAuthenticated } from '../core/auth.js';

const formatPrice = price => `${config.currency}${price.toLocaleString('en-NG')}`;

const buildWhatsAppMessage = order => {
  const lines = order.items.map(item =>
    `• ${item.name} x${item.qty} — ${formatPrice(item.price * item.qty)}`
  );

  const fulfilmentLine = order.fulfilment === 'delivery'
    ? `Delivery to: ${order.address?.line1}, ${order.address?.city}`
    : 'Pickup at the restaurant';

  return [
    `Hello! I'd like to confirm my order from ${config.name}:`,
    '',
    `Order #${order.id}`,
    fulfilmentLine,
    '',
    ...lines,
    '',
    `*Total: ${formatPrice(order.total)}*`,
    order.notes ? `Notes: ${order.notes}` : '',
    '',
    'Please confirm. Thank you!'
  ].filter(Boolean).join('\n');
};

export const init = () => {
  const order = getLastOrder();
  const empty = document.getElementById('confirmation-empty');
  const content = document.getElementById('confirmation-content');

  if (!order) {
    if (empty) empty.hidden = false;
    if (content) content.hidden = true;
    return;
  }

  document.getElementById('confirmation-order-id').textContent = `#${order.id.slice(-8).toUpperCase()}`;

  document.getElementById('confirmation-items').innerHTML = order.items.map(item => `
    <div class="cart-summary-row">
      <span>${item.name} × ${item.qty}</span>
      <span>${formatPrice(item.price * item.qty)}</span>
    </div>
  `).join('');

  document.getElementById('confirmation-subtotal').textContent = formatPrice(order.subtotal);
  const deliveryRow = document.getElementById('confirmation-delivery-row');
  if (order.deliveryFee > 0) {
    if (deliveryRow) deliveryRow.hidden = false;
    document.getElementById('confirmation-delivery-fee').textContent = formatPrice(order.deliveryFee);
  }
  document.getElementById('confirmation-total').textContent = formatPrice(order.total);

  const loyaltyBanner = document.getElementById('loyalty-banner');
  if (isAuthenticated() && loyaltyBanner) {
    loyaltyBanner.hidden = false;
    document.getElementById('loyalty-points-earned').textContent = `+${getPointsEarned(order.total)} loyalty points earned`;
  }

  const whatsappBtn = document.getElementById('confirmation-whatsapp-btn');
  whatsappBtn?.addEventListener('click', e => {
    e.preventDefault();
    const msg = encodeURIComponent(buildWhatsAppMessage(order));
    window.open(`https://wa.me/${config.whatsapp}?text=${msg}`, '_blank');
  });
};
