import test from 'node:test';
import assert from 'node:assert/strict';

import {
  cloneValue,
  loadFromStorage,
  removeFromStorage,
  saveToStorage,
} from './storage.js';

const createLocalStorageMock = () => {
  const store = new Map();

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
};

test('cloneValue returns a deep copy', () => {
  const source = { user: { name: '像素顾客' }, tags: ['会员'] };
  const cloned = cloneValue(source);

  cloned.user.name = '新顾客';
  cloned.tags.push('收藏');

  assert.deepEqual(source, { user: { name: '像素顾客' }, tags: ['会员'] });
  assert.deepEqual(cloned, { user: { name: '新顾客' }, tags: ['会员', '收藏'] });
});

test('loadFromStorage returns a cloned fallback without window storage', () => {
  const originalWindow = globalThis.window;
  delete globalThis.window;

  const fallback = { items: [1] };
  const result = loadFromStorage('missing', fallback);
  result.items.push(2);

  assert.deepEqual(fallback, { items: [1] });
  assert.deepEqual(result, { items: [1, 2] });

  if (originalWindow !== undefined) {
    globalThis.window = originalWindow;
  }
});

test('saveToStorage, loadFromStorage and removeFromStorage work with localStorage', () => {
  const originalWindow = globalThis.window;
  globalThis.window = { localStorage: createLocalStorageMock() };

  saveToStorage('pixel:test', { count: 2 });
  assert.deepEqual(loadFromStorage('pixel:test', { count: 0 }), { count: 2 });

  removeFromStorage('pixel:test');
  assert.deepEqual(loadFromStorage('pixel:test', { count: 0 }), { count: 0 });

  if (originalWindow === undefined) {
    delete globalThis.window;
  } else {
    globalThis.window = originalWindow;
  }
});

test('loadFromStorage supports key migration order and invalid JSON fallback', () => {
  const originalWindow = globalThis.window;
  globalThis.window = { localStorage: createLocalStorageMock() };

  window.localStorage.setItem('legacy:key', JSON.stringify(['legacy']));
  assert.deepEqual(loadFromStorage(['new:key', 'legacy:key'], []), ['legacy']);

  window.localStorage.setItem('broken:key', '{bad json');
  assert.deepEqual(loadFromStorage('broken:key', ['fallback']), ['fallback']);

  if (originalWindow === undefined) {
    delete globalThis.window;
  } else {
    globalThis.window = originalWindow;
  }
});
