import test from 'node:test';
import assert from 'node:assert/strict';

import { PIXEL_TOAST_EVENT, showPixelToast } from './pixelToast.js';

test('showPixelToast dispatches a normalized toast event', () => {
  const originalWindow = globalThis.window;
  const originalCustomEvent = globalThis.CustomEvent;
  const dispatchedEvents = [];

  globalThis.CustomEvent = class CustomEvent {
    constructor(type, options = {}) {
      this.type = type;
      this.detail = options.detail;
    }
  };
  globalThis.window = {
    dispatchEvent(event) {
      dispatchedEvents.push(event);
    },
  };

  showPixelToast('保存成功', { duration: 800, tone: 'success' });

  assert.equal(dispatchedEvents.length, 1);
  assert.equal(dispatchedEvents[0].type, PIXEL_TOAST_EVENT);
  assert.deepEqual(dispatchedEvents[0].detail, {
    message: '保存成功',
    duration: 800,
    tone: 'success',
  });

  if (originalWindow === undefined) {
    delete globalThis.window;
  } else {
    globalThis.window = originalWindow;
  }
  if (originalCustomEvent === undefined) {
    delete globalThis.CustomEvent;
  } else {
    globalThis.CustomEvent = originalCustomEvent;
  }
});

test('showPixelToast ignores empty messages', () => {
  const originalWindow = globalThis.window;
  let dispatchCount = 0;

  globalThis.window = {
    dispatchEvent() {
      dispatchCount += 1;
    },
  };

  showPixelToast('');
  assert.equal(dispatchCount, 0);

  if (originalWindow === undefined) {
    delete globalThis.window;
  } else {
    globalThis.window = originalWindow;
  }
});
