import { get, set, generateId } from './store.js';
import { icon } from './icons.js';

const USERS_KEY = 'users';
const SESSION_KEY = 'session';

const hashPassword = password => {
  let hash = 5381;
  for (let i = 0; i < password.length; i++) {
    hash = (hash * 33) ^ password.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
};

const getUsers = () => get(USERS_KEY, []);
const saveUsers = users => set(USERS_KEY, users);

const getInitials = name => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const dispatchAuthChange = () => document.dispatchEvent(new CustomEvent('authchange'));

export const findUserByEmail = email => getUsers().find(u => u.email.toLowerCase() === email.trim().toLowerCase());

export const getCurrentUser = () => {
  const userId = get(SESSION_KEY);
  if (!userId) return null;
  return getUsers().find(u => u.id === userId) ?? null;
};

export const isAuthenticated = () => Boolean(getCurrentUser());

export const signup = ({ name, email, password }) => {
  if (findUserByEmail(email)) {
    return { success: false, error: 'An account with this email already exists' };
  }

  const user = {
    id: generateId('usr'),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
    avatarInitials: getInitials(name),
    addresses: [],
    loyaltyPoints: 0,
    favouriteIds: []
  };

  const users = getUsers();
  users.push(user);
  saveUsers(users);
  set(SESSION_KEY, user.id);
  dispatchAuthChange();

  return { success: true, user };
};

export const login = ({ email, password }) => {
  const user = findUserByEmail(email);
  if (!user || user.passwordHash !== hashPassword(password)) {
    return { success: false, error: 'Incorrect email or password' };
  }

  set(SESSION_KEY, user.id);
  dispatchAuthChange();
  return { success: true, user };
};

export const logout = () => {
  set(SESSION_KEY, null);
  dispatchAuthChange();
};

export const updateProfile = updates => {
  const current = getCurrentUser();
  if (!current) return { success: false, error: 'Not logged in' };

  const users = getUsers();
  const index = users.findIndex(u => u.id === current.id);
  if (index === -1) return { success: false, error: 'Account not found' };

  const updated = { ...users[index], ...updates };
  if (updates.name) updated.avatarInitials = getInitials(updates.name);
  users[index] = updated;
  saveUsers(users);
  dispatchAuthChange();

  return { success: true, user: updated };
};

export const addLoyaltyPoints = points => {
  const current = getCurrentUser();
  if (!current) return;
  updateProfile({ loyaltyPoints: (current.loyaltyPoints ?? 0) + points });
};

export const addAddress = address => {
  const current = getCurrentUser();
  if (!current) return { success: false, error: 'Not logged in' };
  const addresses = [...(current.addresses ?? []), { id: generateId('addr'), ...address }];
  return updateProfile({ addresses });
};

export const removeAddress = addressId => {
  const current = getCurrentUser();
  if (!current) return { success: false, error: 'Not logged in' };
  const addresses = (current.addresses ?? []).filter(a => a.id !== addressId);
  return updateProfile({ addresses });
};

const closeAuthMenu = menu => {
  menu.classList.remove('open');
  menu.previousElementSibling?.setAttribute('aria-expanded', 'false');
};

export const renderNavAuth = () => {
  const container = document.getElementById('nav-auth');
  if (!container) return;

  const user = getCurrentUser();

  if (!user) {
    container.innerHTML = `<a href="/login" data-link class="btn btn-ghost btn-sm">Log In</a>`;
    return;
  }

  container.innerHTML = `
    <button class="nav-auth-trigger" id="nav-auth-trigger" aria-haspopup="true" aria-expanded="false">
      <span class="nav-auth-avatar">${user.avatarInitials}</span>
      <span class="nav-auth-name">${user.name.split(' ')[0]}</span>
      ${icon('chevronDown', { size: 14 })}
    </button>
    <div class="nav-auth-menu" id="nav-auth-menu" role="menu">
      <a href="/account" data-link class="nav-auth-menu-item" role="menuitem">${icon('user', { size: 16 })}Profile</a>
      <a href="/account/orders" data-link class="nav-auth-menu-item" role="menuitem">${icon('receipt', { size: 16 })}My Orders</a>
      <div class="nav-auth-menu-divider"></div>
      <button class="nav-auth-menu-item" id="nav-logout-btn" role="menuitem">${icon('logout', { size: 16 })}Log Out</button>
    </div>
  `;

  const trigger = document.getElementById('nav-auth-trigger');
  const menu = document.getElementById('nav-auth-menu');

  trigger?.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = menu.classList.toggle('open');
    trigger.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', e => {
    if (menu?.classList.contains('open') && !e.target.closest('.nav-auth')) closeAuthMenu(menu);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu?.classList.contains('open')) closeAuthMenu(menu);
  });

  menu?.querySelectorAll('a[data-link]').forEach(link => {
    link.addEventListener('click', () => closeAuthMenu(menu));
  });

  document.getElementById('nav-logout-btn')?.addEventListener('click', async () => {
    logout();
    const { navigate } = await import('../router.js');
    navigate('/');
  });
};
