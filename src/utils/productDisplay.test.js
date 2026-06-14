import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildProductSnapshot,
  formatPrice,
  getEffectivePrice,
  getProductPriceInfo,
  getProductTone,
  isLowStockProduct,
  resolveProductImageList,
  resolveProductImageSrc,
} from './productDisplay.js';

test('getProductPriceInfo normalizes discounts and invalid price values', () => {
  assert.deepEqual(getProductPriceInfo({ price: 80, originalPrice: 120, saleTag: ' 限时 ' }), {
    price: 80,
    currentPrice: 80,
    originalPrice: 120,
    saleTag: '限时',
    hasDiscount: true,
  });

  assert.deepEqual(getProductPriceInfo({ currentPrice: -5, originalPrice: 3 }), {
    price: 0,
    currentPrice: 0,
    originalPrice: 3,
    saleTag: '',
    hasDiscount: true,
  });

  assert.equal(getProductPriceInfo({ price: 99, originalPrice: 88 }).originalPrice, 99);
});

test('getEffectivePrice returns the normalized current price', () => {
  assert.equal(getEffectivePrice({ price: 108, currentPrice: 88 }), 88);
  assert.equal(getEffectivePrice({ price: 'bad-value' }), 0);
});

test('getProductTone cycles stable placeholder classes by product id', () => {
  assert.equal(getProductTone(1), 'pm-pixel-product-cream');
  assert.equal(getProductTone(2), 'pm-pixel-product-gold');
  assert.equal(getProductTone(3), 'pm-pixel-product-pink');
});

test('resolveProductImageSrc supports public, absolute and bare product paths', () => {
  assert.equal(resolveProductImageSrc('/public/images/product/a.svg'), '/images/product/a.svg');
  assert.equal(resolveProductImageSrc('public/images/product/a.svg'), '/images/product/a.svg');
  assert.equal(resolveProductImageSrc('/images/product/a.svg'), '/images/product/a.svg');
  assert.equal(resolveProductImageSrc('images/product/a.svg'), '/images/product/a.svg');
  assert.equal(resolveProductImageSrc('https://example.com/a.svg'), 'https://example.com/a.svg');
  assert.equal(resolveProductImageSrc('a.svg'), '/images/product/a.svg');
});

test('resolveProductImageList deduplicates images and falls back safely', () => {
  assert.deepEqual(
    resolveProductImageList(['a.svg', '/images/product/a.svg'], 'b.svg'),
    ['/images/product/a.svg', '/images/product/b.svg'],
  );
  assert.deepEqual(resolveProductImageList([], ''), ['/images/product/favicon.svg']);
});

test('isLowStockProduct only flags on-sale products with stock from 1 to 4', () => {
  assert.equal(isLowStockProduct({ status: 'on-sale', stock: 1 }), true);
  assert.equal(isLowStockProduct({ status: 'on-sale', stock: 4 }), true);
  assert.equal(isLowStockProduct({ status: 'on-sale', stock: 5 }), false);
  assert.equal(isLowStockProduct({ status: 'off-sale', stock: 2 }), false);
});

test('buildProductSnapshot keeps stable order item fields', () => {
  assert.deepEqual(
    buildProductSnapshot({
      id: '7',
      name: '  像素发夹  ',
      currentPrice: 39,
      originalPrice: 59,
      saleTag: '新人价',
      cover: 'hairclip.svg',
      categoryName: '发夹饰品',
      status: 'on-sale',
      sales: '42',
    }),
    {
      id: 7,
      name: '像素发夹',
      price: 39,
      originalPrice: 59,
      currentPrice: 39,
      saleTag: '新人价',
      cover: 'hairclip.svg',
      images: ['/images/product/hairclip.svg'],
      categoryName: '发夹饰品',
      status: 'on-sale',
      sales: 42,
    },
  );
});

test('formatPrice keeps integer prices compact and decimal prices precise', () => {
  assert.equal(formatPrice(109), '¥109');
  assert.equal(formatPrice(39.5), '¥39.50');
  assert.equal(formatPrice('bad-value'), '¥0');
});
