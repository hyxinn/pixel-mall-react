import { defaultCategories, defaultProducts, defaultShops } from '../mock/data';
import { buildProductSnapshot, getProductPriceInfo } from '../utils/productDisplay';
import { cloneValue, loadFromStorage, saveToStorage } from '../utils/storage';
import SubscribableService from './subscribableService';

const PRODUCT_KEY = 'pixelMall:products';
const CATEGORY_KEY = 'pixelMall:categories';
const DEFAULT_ON_SALE_STOCK = 60;
const LOW_STOCK_WARNING_THRESHOLD = 5;
const defaultProductCoverById = Object.fromEntries(defaultProducts.map((product) => [product.id, product.cover]));
const shopIdByProductId = Object.fromEntries(
  defaultShops.flatMap((shop) => shop.productIds.map((productId) => [productId, shop.id])),
);

const normalizeText = (value) => String(value ?? '').trim();
const normalizeMoney = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
};
const normalizeStock = (value, status) => {
  const stock = Number(value);
  if (Number.isFinite(stock) && stock >= 0) {
    return stock;
  }
  return status === 'on-sale' ? DEFAULT_ON_SALE_STOCK : 0;
};
const hasCategoryId = (category) => Boolean(normalizeText(category?.id));
const normalizeCategory = (input, fallbackSort = 1) => ({
  id: normalizeText(input.id),
  name: normalizeText(input.name) || '未命名分类',
  description: normalizeText(input.description),
  sort: Number(input.sort) || fallbackSort,
});

const hasStoredValue = (key) => typeof window !== 'undefined' && window.localStorage.getItem(key) !== null;

class GoodService extends SubscribableService {
  products = [];
  categories = [];
  shops = [];

  constructor() {
    super();
    this._loadData();
  }

  getGoodList(filters = {}) {
    const { keyword = '', categoryId = 'all', status = 'all', includeDeleted = true } = filters;
    const normalizedKeyword = normalizeText(keyword).toLowerCase();

    return this.products
      .filter((product) => {
        if (!includeDeleted && product.status === 'deleted') {
          return false;
        }

        if (categoryId !== 'all' && product.categoryId !== categoryId) {
          return false;
        }

        if (status !== 'all' && product.status !== status) {
          return false;
        }

        if (!normalizedKeyword) {
          return true;
        }

        return [product.name, product.description, product.categoryName].some((field) =>
          String(field ?? '').toLowerCase().includes(normalizedKeyword),
        );
      })
      .map((product) => cloneValue(product));
  }

  getPublicGoodList(filters = {}) {
    return this.getGoodList({ ...filters, includeDeleted: false }).filter(
      (product) => product.status === 'on-sale' && product.stock > 0,
    );
  }

  searchProducts(keyword) {
    return this.getPublicGoodList({ keyword });
  }

  advancedSearchProducts(filters = {}) {
    const { keyword = '', categoryId = 'all', discount = 'all', stock = 'all', price = 'all', sort = 'default' } = filters;
    const [minPrice, maxPrice] = String(price).split('-').map((value) => Number(value));
    const hasPriceRange = price !== 'all' && Number.isFinite(minPrice) && Number.isFinite(maxPrice);
    const products = this.getPublicGoodList({ keyword, categoryId }).filter((product) => {
      const priceInfo = getProductPriceInfo(product);
      if (discount === 'discount' && !priceInfo.hasDiscount && !priceInfo.saleTag) {
        return false;
      }
      if (stock === 'low' && !(product.stock > 0 && product.stock < LOW_STOCK_WARNING_THRESHOLD)) {
        return false;
      }
      if (stock === 'enough' && product.stock < LOW_STOCK_WARNING_THRESHOLD) {
        return false;
      }
      if (hasPriceRange && (priceInfo.currentPrice < minPrice || priceInfo.currentPrice > maxPrice)) {
        return false;
      }
      return true;
    });

    return products.sort((left, right) => {
      const leftPrice = getProductPriceInfo(left).currentPrice;
      const rightPrice = getProductPriceInfo(right).currentPrice;
      if (sort === 'price-asc') return leftPrice - rightPrice;
      if (sort === 'price-desc') return rightPrice - leftPrice;
      if (sort === 'stock-desc') return right.stock - left.stock;
      return left.id - right.id;
    });
  }

  getSearchSuggestions(keyword = '', limit = 8) {
    const normalizedKeyword = normalizeText(keyword).toLowerCase();
    const terms = [];
    const addTerm = (term) => {
      const value = normalizeText(term);
      if (value && !terms.includes(value)) {
        terms.push(value);
      }
    };

    this.getCategoryList().forEach((category) => addTerm(category.name));
    this.getPublicGoodList().forEach((product) => {
      if (!normalizedKeyword || [product.name, product.description, product.categoryName, product.saleTag].some((field) => String(field ?? '').toLowerCase().includes(normalizedKeyword))) {
        addTerm(product.name);
        addTerm(product.categoryName);
        addTerm(product.saleTag);
      }
    });

    return terms.slice(0, limit);
  }

  getSearchFilterOptions(keyword = '') {
    const products = this.getPublicGoodList({ keyword });
    const categories = this.getCategoryList().filter((category) => products.some((product) => product.categoryId === category.id));
    const prices = products.map((product) => getProductPriceInfo(product).currentPrice);
    return {
      categories,
      hasDiscount: products.some((product) => {
        const priceInfo = getProductPriceInfo(product);
        return priceInfo.hasDiscount || priceInfo.saleTag;
      }),
      hasLowStock: products.some((product) => product.stock > 0 && product.stock < LOW_STOCK_WARNING_THRESHOLD),
      priceRanges: prices.length ? [
        { key: '0-80', label: '¥80 以下' },
        { key: '80-150', label: '¥80-150' },
        { key: '150-9999', label: '¥150 以上' },
      ] : [],
    };
  }

  getRecommendedGoods(productId, categoryId, limit = 4) {
    const parsedId = Number(productId);
    const publicProducts = this.getPublicGoodList().filter((product) => product.id !== parsedId);
    const sameCategory = publicProducts.filter((product) => product.categoryId === categoryId);
    const others = publicProducts.filter((product) => product.categoryId !== categoryId);
    return [...sameCategory, ...others].slice(0, limit).map((product) => cloneValue(product));
  }

  getFeaturedShops(limit = 3) {
    return this.shops
      .filter((shop) => shop.featured)
      .slice(0, limit)
      .map((shop) => ({ ...cloneValue(shop), products: this.getGoodsByShopId(shop.id).slice(0, 3) }));
  }

  getShopById(shopId) {
    const shop = this.shops.find((item) => item.id === shopId);
    return shop ? cloneValue(shop) : null;
  }

  getGoodsByShopId(shopId) {
    return this.getPublicGoodList().filter((product) => product.shopId === shopId);
  }

  getGoodById(id) {
    const parsedId = Number(id);
    const product = this.products.find((item) => item.id === parsedId);
    return product ? cloneValue(product) : null;
  }

  getCategoryList() {
    return this.categories
      .filter(hasCategoryId)
      .slice()
      .sort((left, right) => left.sort - right.sort)
      .map((category) => cloneValue(category));
  }

  getCategoryById(id) {
    const category = this.categories.find((item) => item.id === id);
    return category ? cloneValue(category) : null;
  }

  getDashboardStats() {
    const onSaleCount = this.products.filter((product) => product.status === 'on-sale').length;
    const offSaleCount = this.products.filter((product) => product.status === 'off-sale').length;
    const deletedCount = this.products.filter((product) => product.status === 'deleted').length;
    const lowStockCount = this.products.filter((product) => product.stock > 0 && product.stock < LOW_STOCK_WARNING_THRESHOLD).length;

    return {
      total: this.products.length,
      onSaleCount,
      offSaleCount,
      deletedCount,
      lowStockCount,
      categoryCount: this.categories.length,
    };
  }

  buildProductSnapshot(product) {
    return buildProductSnapshot(product);
  }

  reload() {
    this._loadData();
  }

  addGood(input) {
    const product = this._normalizeProduct({
      ...input,
      id: this._nextProductId(),
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
    });

    this.products.unshift(product);
    this._saveProducts();
    this.notify();
    return cloneValue(product);
  }

  updateGood(input) {
    const parsedId = Number(input.id);
    const current = this.products.find((item) => item.id === parsedId);

    if (!current) {
      return null;
    }

    const product = this._normalizeProduct({
      ...current,
      ...input,
      id: parsedId,
      createdAt: current.createdAt,
      updatedAt: new Date().toLocaleString(),
    });

    this.products = this.products.map((item) => (item.id === parsedId ? product : item));
    this._saveProducts();
    this.notify();
    return cloneValue(product);
  }

  deleteGood(id) {
    const parsedId = Number(id);
    const product = this.products.find((item) => item.id === parsedId);

    if (!product) {
      return false;
    }

    product.status = 'deleted';
    product.updatedAt = new Date().toLocaleString();
    this._saveProducts();
    this.notify();
    return true;
  }

  toggleGoodStatus(id) {
    const parsedId = Number(id);
    const product = this.products.find((item) => item.id === parsedId);

    if (!product || product.status === 'deleted') {
      return null;
    }

    product.status = product.status === 'on-sale' ? 'off-sale' : 'on-sale';
    product.updatedAt = new Date().toLocaleString();
    this._saveProducts();
    this.notify();
    return cloneValue(product);
  }

  addCategory(input) {
    const category = {
      id: input.id || `cat-${Date.now()}`,
      name: normalizeText(input.name),
      description: normalizeText(input.description),
      sort: Number(input.sort) || this.categories.length + 1,
    };

    this.categories.push(category);
    this._saveCategories();
    this.notify();
    return cloneValue(category);
  }

  updateCategory(input) {
    const category = this.categories.find((item) => item.id === input.id);

    if (!category) {
      return null;
    }

    category.name = normalizeText(input.name);
    category.description = normalizeText(input.description);
    category.sort = Number(input.sort) || category.sort;

    this.products = this.products.map((product) =>
      product.categoryId === category.id
        ? { ...product, categoryName: category.name, updatedAt: new Date().toLocaleString() }
        : product,
    );

    this._saveCategories();
    this._saveProducts();
    this.notify();
    return cloneValue(category);
  }

  deleteCategory(id) {
    const usedByProducts = this.products.some((product) => product.categoryId === id && product.status !== 'deleted');

    if (usedByProducts) {
      return { success: false, message: '该分类下仍有商品，无法删除。' };
    }

    this.categories = this.categories.filter((item) => item.id !== id);
    this._saveCategories();
    this.notify();
    return { success: true };
  }

  _nextProductId() {
    return this.products.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  }

  _normalizeProduct(input) {
    const category = this.categories.find((item) => item.id === input.categoryId) || this.categories[0];
    const cover = normalizeText(input.cover || input.img || '/favicon.svg');
    const legacyPrice = normalizeMoney(input.price);
    const nextCurrentPrice = normalizeMoney(input.currentPrice ?? legacyPrice);
    const nextOriginalPrice = Math.max(normalizeMoney(input.originalPrice ?? legacyPrice), nextCurrentPrice);
    const saleTag = normalizeText(input.saleTag);
    const normalizedProduct = {
      id: Number(input.id),
      name: normalizeText(input.name),
      price: nextCurrentPrice,
      originalPrice: nextOriginalPrice,
      currentPrice: nextCurrentPrice,
      saleTag,
      categoryId: input.categoryId || category?.id || '',
      categoryName: category?.name || '',
      shopId: input.shopId || shopIdByProductId[Number(input.id)] || '',
      cover,
      img: cover,
      description: normalizeText(input.description),
      status: input.status || 'off-sale',
      stock: normalizeStock(input.stock, input.status || 'off-sale'),
      createdAt: input.createdAt || new Date().toLocaleString(),
      updatedAt: input.updatedAt || new Date().toLocaleString(),
    };

    const priceInfo = getProductPriceInfo(normalizedProduct);

    return {
      ...normalizedProduct,
      price: priceInfo.currentPrice,
      originalPrice: priceInfo.originalPrice,
      currentPrice: priceInfo.currentPrice,
      saleTag: priceInfo.saleTag,
    };
  }

  _saveProducts() {
    saveToStorage(PRODUCT_KEY, this.products);
  }

  _saveCategories() {
    saveToStorage(CATEGORY_KEY, this.categories);
  }

  _loadData() {
    const hasCategoryStorage = hasStoredValue(CATEGORY_KEY);
    const hasProductStorage = hasStoredValue(PRODUCT_KEY);

    this.shops = defaultShops.map((shop) => cloneValue(shop));

    const legacyCategories = hasCategoryStorage ? [] : loadFromStorage([CATEGORY_KEY], defaultCategories);
    const categorySource = hasCategoryStorage
      ? loadFromStorage([CATEGORY_KEY], [])
      : legacyCategories.length
        ? legacyCategories
        : defaultCategories;

    this.categories = categorySource
      .filter(hasCategoryId)
      .map((category, index) => normalizeCategory(category, index + 1))
      .sort((a, b) => a.sort - b.sort);

    const legacyProducts = hasProductStorage ? [] : loadFromStorage(['goodList'], []);
    const productSource = hasProductStorage
      ? loadFromStorage([PRODUCT_KEY], [])
      : legacyProducts.length
        ? legacyProducts
        : defaultProducts;

    this.products = productSource.map((product) => {
      const defaultCover = defaultProductCoverById[Number(product.id)];
      return this._normalizeProduct({
        description: '',
        status: 'on-sale',
        ...product,
        cover: defaultCover || product.cover || product.img,
      });
    });

    this._saveCategories();
    this._saveProducts();
    this.notify();
  }
}

const goodService = new GoodService();
export default goodService;
