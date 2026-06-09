import SubscribableService from './subscribableService';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const SEARCH_HISTORY_KEY = 'pixelMall:searchHistory';
const MAX_HISTORY = 12;

class SearchService extends SubscribableService {
  history = [];

  constructor() {
    super();
    this._loadData();
  }

  getHistory(userId) {
    return this.history.filter((item) => item.userId === Number(userId)).map((item) => item.keyword);
  }

  recordSearch(userId, keyword) {
    const value = String(keyword ?? '').trim();
    if (!value) {
      return;
    }
    const parsedUserId = Number(userId) || 0;
    this.history = this.history.filter((item) => !(item.userId === parsedUserId && item.keyword === value));
    this.history.unshift({ userId: parsedUserId, keyword: value, createdAt: new Date().toLocaleString() });
    const keepKeys = new Set(
      this.history
        .filter((item) => item.userId === parsedUserId)
        .slice(0, MAX_HISTORY)
        .map((item) => item.keyword),
    );
    this.history = this.history.filter((item) => item.userId !== parsedUserId || keepKeys.has(item.keyword));
    this._saveData();
  }

  clearHistory(userId) {
    this.history = this.history.filter((item) => item.userId !== Number(userId));
    this._saveData();
  }

  _loadData() {
    this.history = loadFromStorage([SEARCH_HISTORY_KEY], []);
    this._saveData();
  }

  _saveData() {
    saveToStorage(SEARCH_HISTORY_KEY, this.history);
    this.notify();
  }
}

const searchService = new SearchService();
export default searchService;
