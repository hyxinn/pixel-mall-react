const PRODUCT_TONES = [
  'pm-pixel-product-pink',
  'pm-pixel-product-cream',
  'pm-pixel-product-gold',
];

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
