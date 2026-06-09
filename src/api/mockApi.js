import addressService from '../services/addressService';
import adminService from '../services/adminService';
import cartService from '../services/cartService';
import favoriteService from '../services/favoriteService';
import footprintService from '../services/footprintService';
import goodService from '../services/goodService';
import messageService from '../services/messageService';
import orderService from '../services/orderService';
import userService from '../services/userService';

const MOCK_DELAY = 120;

const withMockLatency = (factory, delay = MOCK_DELAY) =>
  new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(typeof factory === 'function' ? factory() : factory);
    }, delay);
  });

const mockApi = {
  products: {
    list(filters) {
      return withMockLatency(() => goodService.getPublicGoodList(filters));
    },
    adminList(filters) {
      return withMockLatency(() => goodService.getGoodList(filters));
    },
    search(keyword) {
      return withMockLatency(() => goodService.searchProducts(keyword));
    },
    detail(id) {
      return withMockLatency(() => goodService.getGoodById(id));
    },
    recommended(productId, categoryId, limit) {
      return withMockLatency(() => goodService.getRecommendedGoods(productId, categoryId, limit));
    },
    featuredShops(limit) {
      return withMockLatency(() => goodService.getFeaturedShops(limit));
    },
    shopDetail(shopId) {
      return withMockLatency(() => goodService.getShopById(shopId));
    },
    dashboardStats() {
      return withMockLatency(() => goodService.getDashboardStats());
    },
    create(payload) {
      return withMockLatency(() => goodService.addGood(payload));
    },
    update(payload) {
      return withMockLatency(() => goodService.updateGood(payload));
    },
    remove(id) {
      return withMockLatency(() => goodService.deleteGood(id));
    },
    toggleStatus(id) {
      return withMockLatency(() => goodService.toggleGoodStatus(id));
    },
    reload() {
      return withMockLatency(() => goodService.reload());
    },
  },

  categories: {
    list() {
      return withMockLatency(() => goodService.getCategoryList());
    },
    detail(id) {
      return withMockLatency(() => goodService.getCategoryById(id));
    },
    create(payload) {
      return withMockLatency(() => goodService.addCategory(payload));
    },
    update(payload) {
      return withMockLatency(() => goodService.updateCategory(payload));
    },
    remove(id) {
      return withMockLatency(() => goodService.deleteCategory(id));
    },
  },

  user: {
    current() {
      return withMockLatency(() => userService.getCurrentUser());
    },
    login(username, password) {
      return withMockLatency(() => userService.login(username, password));
    },
    register(payload) {
      return withMockLatency(() => userService.register(payload));
    },
    logout() {
      return withMockLatency(() => userService.logout());
    },
  },

  cart: {
    list(userId) {
      return withMockLatency(() => cartService.getEnrichedCartItems(userId));
    },
    count(userId) {
      return withMockLatency(() => cartService.getCartCount(userId));
    },
    selectedTotal(userId) {
      return withMockLatency(() => cartService.getSelectedTotal(userId));
    },
    validateCheckout(userId) {
      return withMockLatency(() => cartService.validateCheckout(userId));
    },
    refreshSnapshots(userId) {
      return withMockLatency(() => cartService.refreshSnapshots(userId));
    },
    add(userId, goodId, count = 1) {
      return withMockLatency(() => cartService.addItem(userId, goodId, count));
    },
    updateCount(itemId, count) {
      return withMockLatency(() => cartService.updateCount(itemId, count));
    },
    remove(itemId) {
      return withMockLatency(() => {
        cartService.removeItem(itemId);
        return { success: true };
      });
    },
    setChecked(itemId, checked) {
      return withMockLatency(() => cartService.setItemChecked(itemId, checked));
    },
    toggleAll(userId, checked) {
      return withMockLatency(() => cartService.toggleAll(userId, checked));
    },
  },

  orders: {
    list(filters) {
      return withMockLatency(() => orderService.getOrderList(filters));
    },
    byUser(userId) {
      return withMockLatency(() => orderService.getOrdersByUser(userId));
    },
    detail(orderId) {
      return withMockLatency(() => orderService.getOrderById(orderId));
    },
    create(userId, goodId, price, quantity, address) {
      return withMockLatency(() => orderService.createOrder(userId, goodId, price, quantity, address));
    },
    createFromCart(userId, address) {
      return withMockLatency(() => orderService.createOrderFromCart(userId, address));
    },
    pay(orderId) {
      return withMockLatency(() => orderService.payOrder(orderId));
    },
    failPayment(orderId) {
      return withMockLatency(() => orderService.failPayment(orderId));
    },
    ship(orderId, trackingNo) {
      return withMockLatency(() => orderService.shipOrder(orderId, trackingNo));
    },
    confirmReceipt(orderId, userId) {
      return withMockLatency(() => orderService.confirmReceipt(orderId, userId));
    },
    replyReview(orderId, reviewId, reply) {
      return withMockLatency(() => orderService.replyReview(orderId, reviewId, reply));
    },
    handleReturn(orderId, returnId, action, note) {
      return withMockLatency(() => orderService.handleReturnRequest(orderId, returnId, action, note));
    },
    dashboardStats() {
      return withMockLatency(() => orderService.getDashboardStats());
    },
    reload() {
      return withMockLatency(() => orderService.reload());
    },
  },

  favorites: {
    list(userId) {
      return withMockLatency(() => favoriteService.getFavoriteProducts(userId));
    },
    isFavorite(userId, productId) {
      return withMockLatency(() => favoriteService.isFavorite(userId, productId));
    },
    toggle(userId, productId) {
      return withMockLatency(() => favoriteService.toggleFavorite(userId, productId));
    },
    remove(userId, productId) {
      return withMockLatency(() => {
        favoriteService.removeFavorite(userId, productId);
        return { success: true };
      });
    },
  },

  addresses: {
    list(userId) {
      return withMockLatency(() => addressService.getAddressesByUser(userId));
    },
    detail(id) {
      return withMockLatency(() => addressService.getAddressById(id));
    },
    default(userId) {
      return withMockLatency(() => addressService.getDefaultAddress(userId));
    },
    create(userId, payload) {
      return withMockLatency(() => addressService.addAddress(userId, payload));
    },
    update(userId, payload) {
      return withMockLatency(() => addressService.updateAddress(userId, payload));
    },
    remove(userId, id) {
      return withMockLatency(() => addressService.deleteAddress(userId, id));
    },
    setDefault(userId, id) {
      return withMockLatency(() => addressService.setDefaultAddress(userId, id));
    },
  },

  admin: {
    current() {
      return withMockLatency(() => adminService.getCurrentAdmin());
    },
    login(payload) {
      return withMockLatency(() => adminService.login(payload));
    },
    logout() {
      return withMockLatency(() => adminService.logout());
    },
    roles() {
      return withMockLatency(() => adminService.getRoles());
    },
    updateRoleAccess(roleId, payload) {
      return withMockLatency(() => adminService.updateRoleAccess(roleId, payload));
    },
    resetRoles() {
      return withMockLatency(() => adminService.resetRoles());
    },
    reload() {
      return withMockLatency(() => adminService.reload());
    },
  },

  footprints: {
    recordView(userId, productId) {
      return withMockLatency(() => {
        footprintService.recordView(userId, productId);
        return { success: true };
      });
    },
  },

  messages: {
    openProductChat(userId, product) {
      return withMockLatency(() => messageService.openProductChat(userId, product));
    },
  },
};

export default mockApi;
