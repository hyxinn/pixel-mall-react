import { defaultCarts } from '../mock/data';
import goodService from './goodService';
import { cloneValue, loadFromStorage, saveToStorage } from '../utils/storage';

const CART_KEY = 'pixelMall:carts';

class CartService {
  carts = [];

  constructor() {
    this._loadData();
  }

  getCartItems(userId) {
    return this.carts.filter((item) => item.userId === Number(userId)).map((item) => cloneValue(item));
  }

  getCartCount(userId) {
    return this.getCartItems(userId).reduce((count, item) => count + item.count, 0);
  }

  addItem(userId, goodId, count = 1) {
    const product = goodService.getGoodById(goodId);

    if (!product || product.status !== 'on-sale') {
      return { success: false, message: '商品不可加入购物车。' };
    }

    const existing = this.carts.find((item) => item.userId === Number(userId) && item.goodId === Number(goodId));

    if (existing) {
      existing.count += count;
    } else {
      this.carts.push({
        id: `${userId}-${goodId}`,
        userId: Number(userId),
        goodId: Number(goodId),
        count,
        checked: true,
        goodSnapshot: {
          id: product.id,
          name: product.name,
          price: product.price,
          cover: product.cover,
          status: product.status,
        },
      });
    }

    this._saveData();
    return { success: true };
  }

  updateCount(itemId, count) {
    const item = this.carts.find((cartItem) => cartItem.id === itemId);

    if (!item) {
      return false;
    }

    item.count = Math.max(1, Number(count) || 1);
    this._saveData();
    return true;
  }

  removeItem(itemId) {
    this.carts = this.carts.filter((item) => item.id !== itemId);
    this._saveData();
  }

  toggleItem(itemId) {
    const item = this.carts.find((cartItem) => cartItem.id === itemId);

    if (!item) {
      return false;
    }

    item.checked = !item.checked;
    this._saveData();
    return true;
  }

  toggleAll(userId, checked) {
    this.carts = this.carts.map((item) => (item.userId === Number(userId) ? { ...item, checked } : item));
    this._saveData();
  }

  _loadData() {
    this.carts = loadFromStorage([CART_KEY], defaultCarts);
    this._saveData();
  }

  _saveData() {
    saveToStorage(CART_KEY, this.carts);
  }
}

const cartService = new CartService();
export default cartService;
