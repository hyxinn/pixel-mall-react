const PRODUCT_TONES = [
  'pm-pixel-product-pink',
  'pm-pixel-product-cream',
  'pm-pixel-product-gold',
];

const productImageModules = import.meta.glob('../assets/images/product/*', {
  eager: true,
  query: '?url',
  import: 'default',
});
const productImageByName = Object.fromEntries(
  Object.entries(productImageModules).map(([path, src]) => [path.split('/').pop(), src]),
);

const normalizePriceValue = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
};

export const getProductTone = (productId) => {
  const parsedId = Number(productId) || 0;
  return PRODUCT_TONES[parsedId % PRODUCT_TONES.length];
};

export const getProductPriceInfo = (product = {}) => {
  const currentPrice = normalizePriceValue(product.currentPrice ?? product.price);
  const originalCandidate = normalizePriceValue(product.originalPrice);
  const originalPrice = originalCandidate >= currentPrice ? originalCandidate : currentPrice;
  const saleTag = String(product.saleTag ?? '').trim();

  return {
    price: currentPrice,
    currentPrice,
    originalPrice,
    saleTag,
    hasDiscount: originalPrice > currentPrice,
  };
};

export const getEffectivePrice = (product) => getProductPriceInfo(product).currentPrice;

export const resolveProductImageSrc = (cover) => {
  const source = String(cover ?? '').trim();
  if (!source) {
    return '';
  }
  if (/^(https?:|data:|blob:)/.test(source)) {
    return source;
  }
  if (source.startsWith('/public/images/product/')) {
    return source.replace('/public', '');
  }
  if (source.startsWith('public/images/product/')) {
    return `/${source.slice('public/'.length)}`;
  }
  if (source.startsWith('/images/product/')) {
    return source;
  }
  if (source.startsWith('images/product/')) {
    return `/${source}`;
  }
  const filename = source.split('/').pop();
  return productImageByName[filename] ? `/images/product/${filename}` : source;
};

export const isLowStockProduct = (product = {}) => {
  const stock = Number(product.stock);
  return product.status === 'on-sale' && stock > 0 && stock < 5;
};

export const buildProductSnapshot = (product = {}) => {
  const priceInfo = getProductPriceInfo(product);

  return {
    id: Number(product.id) || 0,
    name: String(product.name ?? '').trim(),
    price: priceInfo.currentPrice,
    originalPrice: priceInfo.originalPrice,
    currentPrice: priceInfo.currentPrice,
    saleTag: priceInfo.saleTag,
    cover: String(product.cover ?? product.img ?? '').trim(),
    categoryName: String(product.categoryName ?? '').trim(),
    status: String(product.status ?? '').trim(),
  };
};

export const formatPrice = (value) => {
  const amount = Number(value) || 0;
  return `¥${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
};
