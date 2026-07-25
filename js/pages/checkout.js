import config from '../config.js';
import { getCart, getCartTotal, getCartCount } from '../features/cart.js';
import { createOrder, DELIVERY_FEE } from '../features/checkout.js';
import { getCurrentUser, addAddress } from '../core/auth.js';
import { rules, initFormValidation } from '../core/forms.js';
import { showToast } from '../core/toast.js';

const formatPrice = price => `${config.currency}${price.toLocaleString('en-NG')}`;

const renderCheckoutItems = () => {
  const container = document.getElementById('checkout-items');
  if (!container) return;
  const cart = getCart();

  container.innerHTML = Object.values(cart).map(({ item, qty }) => `
    <div class="checkout-item-row">
      <img class="checkout-item-img" src="${item.image}" alt="${item.name}" loading="lazy" />
      <div>
        <div class="checkout-item-name">${item.name}</div>
        <div class="checkout-item-qty">Qty ${qty}</div>
      </div>
      <div class="checkout-item-price">${formatPrice(item.price * qty)}</div>
    </div>
  `).join('');
};

const getFulfilment = () => document.querySelector('input[name="fulfilment"]:checked')?.value ?? 'pickup';

const syncSummary = () => {
  const subtotal = getCartTotal();
  const fulfilment = getFulfilment();
  const deliveryFee = fulfilment === 'delivery' ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  document.getElementById('checkout-subtotal').textContent = formatPrice(subtotal);
  const feeRow = document.getElementById('checkout-delivery-fee-row');
  if (feeRow) feeRow.hidden = fulfilment !== 'delivery';
  const feeEl = document.getElementById('checkout-delivery-fee');
  if (feeEl) feeEl.textContent = formatPrice(deliveryFee);
  document.getElementById('checkout-total').textContent = formatPrice(total);
};

const syncDeliveryFields = () => {
  const fields = document.getElementById('delivery-fields');
  if (fields) fields.hidden = getFulfilment() !== 'delivery';
  syncSummary();
};

const populateSavedAddresses = () => {
  const user = getCurrentUser();
  const group = document.getElementById('saved-address-group');
  const select = document.getElementById('saved-address-select');
  const saveRow = document.getElementById('save-address-row');
  if (!user || !user.addresses?.length) return;

  if (group) group.hidden = false;
  if (saveRow) saveRow.hidden = false;

  user.addresses.forEach(addr => {
    const option = document.createElement('option');
    option.value = addr.id;
    option.textContent = `${addr.label} — ${addr.line1}, ${addr.city}`;
    select.appendChild(option);
  });

  select?.addEventListener('change', () => {
    const selected = user.addresses.find(a => a.id === select.value);
    const nameInput = document.getElementById('checkout-name');
    const addressInput = document.getElementById('checkout-address');
    const cityInput = document.getElementById('checkout-city');
    if (selected) {
      if (nameInput) nameInput.value = user.name;
      if (addressInput) addressInput.value = selected.line1;
      if (cityInput) cityInput.value = selected.city;
    }
  });
};

export const init = () => {
  const empty = document.getElementById('checkout-empty');
  const content = document.getElementById('checkout-content');

  if (getCartCount() === 0) {
    if (empty) empty.hidden = false;
    if (content) content.hidden = true;
    return;
  }

  renderCheckoutItems();
  syncDeliveryFields();
  populateSavedAddresses();

  document.querySelectorAll('input[name="fulfilment"]').forEach(radio => {
    radio.addEventListener('change', syncDeliveryFields);
  });

  const form = document.getElementById('checkout-form');
  if (!form) return;

  const getSchema = () => {
    if (getFulfilment() !== 'delivery') return {};
    return {
      name: [rules.required('Please enter your name')],
      phone: [rules.required('Please enter a phone number'), rules.phone()],
      address: [rules.required('Please enter your delivery address')],
      city: [rules.required('Please enter your city')]
    };
  };

  initFormValidation(form, getSchema(), () => {
    const fulfilment = getFulfilment();
    const address = fulfilment === 'delivery' ? {
      name: form.elements.namedItem('name').value.trim(),
      phone: form.elements.namedItem('phone').value.trim(),
      line1: form.elements.namedItem('address').value.trim(),
      city: form.elements.namedItem('city').value.trim()
    } : null;
    const notes = form.elements.namedItem('notes')?.value.trim() ?? '';

    if (fulfilment === 'delivery' && document.getElementById('save-address-checkbox')?.checked) {
      addAddress({ label: 'Saved Address', line1: address.line1, city: address.city });
    }

    createOrder({ fulfilment, address, notes });
    showToast('Order placed successfully', 'success');

    import('../router.js').then(({ navigate }) => navigate('/order-confirmation'));
  });
};
