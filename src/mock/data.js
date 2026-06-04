const seedTime = '2026-06-04 10:00:00';
const image = '/favicon.svg';

export const defaultCategories = [
  { id: 'cat-bag', name: '像素包包', description: '适合日常搭配的像素包袋。', sort: 1 },
  { id: 'cat-accessory', name: '发夹饰品', description: '奶油色系发夹和小饰品。', sort: 2 },
  { id: 'cat-home', name: '收藏摆件', description: '桌面装饰与摆件收藏。', sort: 3 },
];

export const defaultProducts = [
  {
    id: 1,
    name: '草莓云朵像素包',
    price: 129,
    categoryId: 'cat-bag',
    categoryName: '像素包包',
    cover: image,
    description: '柔和粉色的像素包，适合做首页主推商品。',
    stock: 16,
    status: 'on-sale',
    createdAt: seedTime,
    updatedAt: seedTime,
  },
  {
    id: 2,
    name: '杏仁奶油发夹',
    price: 59,
    categoryId: 'cat-accessory',
    categoryName: '发夹饰品',
    cover: image,
    description: '轻盈发夹，适合做后台商品编辑演示。',
    stock: 32,
    status: 'on-sale',
    createdAt: seedTime,
    updatedAt: seedTime,
  },
  {
    id: 3,
    name: '金色糖霜小镜',
    price: 88,
    categoryId: 'cat-home',
    categoryName: '收藏摆件',
    cover: image,
    description: '带轻复古感的像素小镜。',
    stock: 0,
    status: 'off-sale',
    createdAt: seedTime,
    updatedAt: seedTime,
  },
];

export const defaultUsers = [
  {
    id: 1,
    username: 'shopper',
    password: 'shopper123',
    nickname: '像素顾客',
  },
  {
    id: 2,
    username: 'guest',
    password: 'guest123',
    nickname: '体验用户',
  },
];

export const defaultAdmins = [
  {
    id: 'admin-1',
    username: 'admin',
    password: 'admin123',
    nickname: '系统管理员',
    role: 'admin',
  },
  {
    id: 'admin-2',
    username: 'operator',
    password: 'operator123',
    nickname: '商城运营',
    role: 'operator',
  },
];

export const adminMenuCatalog = [
  { key: 'dashboard', label: '后台首页', permission: 'dashboard:view' },
  { key: 'products', label: '商品管理', permission: 'products:view' },
  { key: 'categories', label: '分类管理', permission: 'categories:view' },
  { key: 'orders', label: '订单管理', permission: 'orders:view' },
  { key: 'roles', label: '角色权限', permission: 'roles:view' },
];

export const adminPermissionCatalog = [
  { key: 'dashboard:view', label: '查看后台首页', group: 'dashboard' },
  { key: 'products:view', label: '查看商品管理', group: 'products' },
  { key: 'products:manage', label: '管理商品', group: 'products' },
  { key: 'categories:view', label: '查看分类管理', group: 'categories' },
  { key: 'categories:manage', label: '管理分类', group: 'categories' },
  { key: 'orders:view', label: '查看订单管理', group: 'orders' },
  { key: 'orders:manage', label: '管理订单', group: 'orders' },
  { key: 'roles:view', label: '查看角色权限', group: 'roles' },
];

export const defaultRoleDefinitions = [
  {
    id: 'admin',
    name: '管理员',
    description: '拥有后台全部查看与管理能力。',
    menus: ['dashboard', 'products', 'categories', 'orders', 'roles'],
    permissions: [
      'dashboard:view',
      'products:view',
      'products:manage',
      'categories:view',
      'categories:manage',
      'orders:view',
      'orders:manage',
      'roles:view',
    ],
  },
  {
    id: 'operator',
    name: '运营',
    description: '默认可查看商品与订单，适合日常运营巡检。',
    menus: ['dashboard', 'products', 'orders'],
    permissions: ['dashboard:view', 'products:view', 'orders:view'],
  },
];

export const defaultOrders = [
  {
    id: 1,
    userId: 1,
    orderNo: 'PM202606040001',
    createTime: seedTime,
    payTime: seedTime,
    status: 2,
    price: 129,
    goodId: 1,
    source: 'buy-now',
    address: {
      receiver: '像素顾客',
      phone: '13800000000',
      detail: '奶油街道 01 号',
    },
    userSnapshot: {
      id: 1,
      nickname: '像素顾客',
      username: 'shopper',
    },
    goodSnapshot: {
      id: 1,
      name: '草莓云朵像素包',
      price: 129,
      cover: image,
      categoryName: '像素包包',
    },
    logistics: [
      { time: seedTime, text: '订单已支付，等待发货。' },
      { time: '2026-06-04 14:00:00', text: '仓库已打包，等待揽件。' },
    ],
  },
];

export const defaultCarts = [];
