const PREFIX = 'kk_';

const buildKey = key => `${PREFIX}${key}`;

export const get = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(buildKey(key));
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const set = (key, value) => {
  try {
    localStorage.setItem(buildKey(key), JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

export const remove = key => {
  try {
    localStorage.removeItem(buildKey(key));
    return true;
  } catch {
    return false;
  }
};

export const has = key => {
  try {
    return localStorage.getItem(buildKey(key)) !== null;
  } catch {
    return false;
  }
};

export const generateId = (prefix = 'id') => {
  const random = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}_${time}${random}`;
};

export const isStorageAvailable = () => {
  try {
    const testKey = buildKey('__test__');
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};
