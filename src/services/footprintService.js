import goodService from './goodService';
import SubscribableService from './subscribableService';
import { cloneValue, loadFromStorage, saveToStorage } from '../utils/storage';

const FOOTPRINT_KEY = 'pixelMall:footprints';
const MAX_FOOTPRINTS_PER_USER = 50;

class FootprintService extends SubscribableService {
  list = [];

  constructor() {
    super();
    this._loadData();
  }

  getFootprintsByUser(userId) {
    return this.list
      .filter((item) => item.userId === Number(userId))
      .map((item) => cloneValue(item));
  }

  getFootprintProducts(userId, limit = Infinity) {
    return this.getFootprintsByUser(userId)
      .slice(0, limit)
      .map((item) => goodService.getGoodById(item.productId))
      .filter(Boolean);
  }

  recordView(userId, productId) {
    const parsedUserId = Number(userId);
    const parsedProductId = Number(productId);
    const product = goodService.getGoodById(parsedProductId);

    if (!product) {
      return;
    }

    this.list = this.list.filter((item) => !(item.userId === parsedUserId && item.productId === parsedProductId));
    this.list.unshift({
      id: `footprint-${parsedUserId}-${parsedProductId}`,
      userId: parsedUserId,
      productId: parsedProductId,
      viewedAt: new Date().toLocaleString(),
    });

    const keepIds = new Set(
      this.list
        .filter((item) => item.userId === parsedUserId)
        .slice(0, MAX_FOOTPRINTS_PER_USER)
        .map((item) => item.id),
    );
    this.list = this.list.filter((item) => item.userId !== parsedUserId || keepIds.has(item.id));
    this._saveData();
  }

  removeFootprint(userId, productId) {
    this.list = this.list.filter((item) => !(item.userId === Number(userId) && item.productId === Number(productId)));
    this._saveData();
  }

  clearFootprints(userId) {
    this.list = this.list.filter((item) => item.userId !== Number(userId));
    this._saveData();
  }

  _loadData() {
    this.list = loadFromStorage([FOOTPRINT_KEY], []);
    this._saveData();
  }

  _saveData() {
    saveToStorage(FOOTPRINT_KEY, this.list);
    this.notify();
  }
}

const footprintService = new FootprintService();
export default footprintService;
