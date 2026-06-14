import test from 'node:test';
import assert from 'node:assert/strict';

import { buildAddressManageUrl, readSelectedAddressId } from './orderAddress.js';

test('buildAddressManageUrl ignores unsafe or empty return paths', () => {
  assert.equal(buildAddressManageUrl(''), '/address');
  assert.equal(buildAddressManageUrl('profile'), '/address');
  assert.equal(buildAddressManageUrl('https://example.com'), '/address');
});

test('buildAddressManageUrl encodes valid app return paths', () => {
  assert.equal(
    buildAddressManageUrl('/createOrder/1?sku=奶油白'),
    '/address?returnTo=%2FcreateOrder%2F1%3Fsku%3D%E5%A5%B6%E6%B2%B9%E7%99%BD',
  );
});

test('readSelectedAddressId normalizes location state ids', () => {
  assert.equal(readSelectedAddressId(null), '');
  assert.equal(readSelectedAddressId({}), '');
  assert.equal(readSelectedAddressId({ selectedAddressId: 12 }), '12');
  assert.equal(readSelectedAddressId({ selectedAddressId: 'addr-1' }), 'addr-1');
});
