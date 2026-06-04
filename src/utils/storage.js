const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const cloneValue = (value) => JSON.parse(JSON.stringify(value));

const readRaw = (keys) => {
  if (!canUseStorage()) {
    return null;
  }

  for (const key of keys) {
    const value = window.localStorage.getItem(key);
    if (value) {
      return value;
    }
  }

  return null;
};

export const loadFromStorage = (keys, fallbackValue) => {
  const keyList = Array.isArray(keys) ? keys : [keys];
  const raw = readRaw(keyList);

  if (!raw) {
    return cloneValue(fallbackValue);
  }

  try {
    return JSON.parse(raw);
  } catch {
    return cloneValue(fallbackValue);
  }
};

export const saveToStorage = (key, value) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

export const removeFromStorage = (key) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(key);
};
