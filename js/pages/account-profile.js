import { getCurrentUser, updateProfile, addAddress, removeAddress, logout } from '../core/auth.js';
import { renderLoyaltyBadge } from '../features/loyalty.js';
import { rules, initFormValidation } from '../core/forms.js';
import { showToast } from '../core/toast.js';
import { icon } from '../core/icons.js';

const renderHeader = user => {
  document.getElementById('profile-avatar').textContent = user.avatarInitials;
  document.getElementById('profile-name').textContent = user.name;
  document.getElementById('profile-email').textContent = user.email;
  document.getElementById('profile-loyalty-badge').textContent = renderLoyaltyBadge(user.loyaltyPoints ?? 0);
};

const renderProfileForm = user => {
  document.getElementById('profile-name-input').value = user.name;
  document.getElementById('profile-email-input').value = user.email;
};

const renderAddresses = user => {
  const list = document.getElementById('address-list');
  const note = document.getElementById('no-address-note');
  if (!list) return;

  const addresses = user.addresses ?? [];
  note.hidden = addresses.length > 0;

  list.innerHTML = addresses.map(addr => `
    <div class="address-card" data-address-id="${addr.id}">
      <div>
        <div class="address-card-label">${addr.label}</div>
        <div class="address-card-line">${addr.line1}, ${addr.city}</div>
      </div>
      <button class="address-remove-btn" data-remove-address="${addr.id}" aria-label="Remove address">
        ${icon('trash', { size: 14 })}
      </button>
    </div>
  `).join('');
};

const initProfileForm = () => {
  const form = document.getElementById('profile-form');
  if (!form) return;

  initFormValidation(form, {
    name: [rules.required('Please enter your name')]
  }, () => {
    const result = updateProfile({ name: form.elements.namedItem('name').value.trim() });
    if (result.success) {
      renderHeader(result.user);
      showToast('Profile updated', 'success');
    }
  });
};

const initAddressForm = user => {
  const addBtn = document.getElementById('add-address-btn');
  const cancelBtn = document.getElementById('cancel-address-btn');
  const form = document.getElementById('address-form');
  const list = document.getElementById('address-list');

  addBtn?.addEventListener('click', () => {
    form.hidden = false;
    addBtn.hidden = true;
  });

  cancelBtn?.addEventListener('click', () => {
    form.reset();
    form.hidden = true;
    addBtn.hidden = false;
  });

  initFormValidation(form, {
    label: [rules.required('Please enter a label')],
    line1: [rules.required('Please enter an address')],
    city: [rules.required('Please enter a city')]
  }, () => {
    const result = addAddress({
      label: form.elements.namedItem('label').value.trim(),
      line1: form.elements.namedItem('line1').value.trim(),
      city: form.elements.namedItem('city').value.trim()
    });

    if (result.success) {
      renderAddresses(result.user);
      form.reset();
      form.hidden = true;
      addBtn.hidden = false;
      showToast('Address saved', 'success');
    }
  });

  list?.addEventListener('click', e => {
    const btn = e.target.closest('[data-remove-address]');
    if (!btn) return;
    const result = removeAddress(btn.dataset.removeAddress);
    if (result.success) {
      renderAddresses(result.user);
      showToast('Address removed');
    }
  });
};

const initLogout = () => {
  document.getElementById('profile-logout-btn')?.addEventListener('click', async () => {
    logout();
    const { navigate } = await import('../router.js');
    navigate('/');
  });
};

export const init = () => {
  const user = getCurrentUser();
  if (!user) return;

  renderHeader(user);
  renderProfileForm(user);
  renderAddresses(user);
  initProfileForm();
  initAddressForm(user);
  initLogout();
};
