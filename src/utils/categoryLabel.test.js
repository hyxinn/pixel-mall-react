import test from 'node:test';
import assert from 'node:assert/strict';

import { splitCategoryLabel } from './categoryLabel.js';

test('splitCategoryLabel handles empty values', () => {
  assert.deepEqual(splitCategoryLabel(''), { line1: '', line2: '' });
  assert.deepEqual(splitCategoryLabel(null), { line1: '', line2: '' });
});

test('splitCategoryLabel splits short and long category names for sticker buttons', () => {
  assert.deepEqual(splitCategoryLabel('包包'), { line1: '包', line2: '包' });
  assert.deepEqual(splitCategoryLabel('发夹饰品'), { line1: '发夹', line2: '饰品' });
  assert.deepEqual(splitCategoryLabel('像素限定礼盒'), { line1: '像素限', line2: '定礼盒' });
});
