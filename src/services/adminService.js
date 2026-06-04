import { adminMenuCatalog, adminPermissionCatalog, defaultAdmins, defaultRoleDefinitions } from '../mock/data';
import { cloneValue, loadFromStorage, removeFromStorage, saveToStorage } from '../utils/storage';

const ADMIN_LIST_KEY = 'pixelMall:admins';
const CURRENT_ADMIN_KEY = 'pixelMall:adminUser';
const ROLE_LIST_KEY = 'pixelMall:adminRoles';

const groupLabelMap = {
  dashboard: '后台首页',
  products: '商品管理',
  categories: '分类管理',
  orders: '订单管理',
  roles: '角色权限',
};

class AdminService {
  admins = [];
  currentAdmin = null;
  roles = [];

  constructor() {
    this._loadData();
  }

  login({ username, password }) {
    const admin = this.admins.find((item) => item.username === username && item.password === password);
    const role = this._findRole(admin?.role);

    if (admin && !role) {
      return { success: false, message: '当前账号角色配置缺失，请先恢复默认角色。' };
    }

    if (!admin) {
      return { success: false, message: '管理员账号或密码错误。' };
    }

    this.currentAdmin = {
      id: admin.id,
      username: admin.username,
      nickname: admin.nickname,
      role: admin.role,
    };

    saveToStorage(CURRENT_ADMIN_KEY, this.currentAdmin);
    return { success: true, admin: this.getCurrentAdmin() };
  }

  logout() {
    this.currentAdmin = null;
    removeFromStorage(CURRENT_ADMIN_KEY);
  }

  getCurrentAdmin() {
    return this.currentAdmin ? cloneValue(this.currentAdmin) : null;
  }

  isAuthenticated() {
    return Boolean(this.currentAdmin);
  }

  hasPermission(permission) {
    const currentRole = this._findRole(this.currentAdmin?.role);
    if (!currentRole) {
      return false;
    }

    return currentRole.permissions.includes(permission);
  }

  getRoles() {
    return this.roles.map((role) => ({
      ...cloneValue(role),
      permissionCount: role.permissions.length,
      menuCount: role.menus.length,
    }));
  }

  getRoleById(roleId) {
    const role = this._findRole(roleId);
    return role ? cloneValue(role) : null;
  }

  getPermissionCatalog() {
    return adminPermissionCatalog.map((permission) => ({
      ...permission,
      groupLabel: groupLabelMap[permission.group] || permission.group,
    }));
  }

  getMenuCatalog() {
    return cloneValue(adminMenuCatalog);
  }

  updateRoleAccess(roleId, { permissions = [], menus = [] }) {
    const role = this._findRole(roleId);

    if (!role) {
      return { success: false, message: '角色不存在。' };
    }

    const validPermissions = new Set(adminPermissionCatalog.map((item) => item.key));
    const validMenus = new Map(adminMenuCatalog.map((item) => [item.key, item.permission]));
    const normalizedPermissions = [...new Set(permissions)].filter((permission) => validPermissions.has(permission));
    const normalizedMenus = [...new Set(menus)].filter((menu) => validMenus.has(menu));

    const invalidMenu = normalizedMenus.find((menu) => !normalizedPermissions.includes(validMenus.get(menu)));
    if (invalidMenu) {
      return { success: false, message: '菜单可见范围必须先具备对应查看权限。' };
    }

    role.permissions = normalizedPermissions;
    role.menus = normalizedMenus;
    this._saveRoles();
    return { success: true, message: '角色权限已更新。' };
  }

  resetRoles() {
    this.roles = cloneValue(defaultRoleDefinitions);
    this._saveRoles();
    return { success: true, message: '角色权限已恢复默认配置。' };
  }

  getMenuKeys() {
    const currentRole = this._findRole(this.currentAdmin?.role);
    return currentRole ? [...currentRole.menus] : [];
  }

  _findRole(roleId) {
    return this.roles.find((item) => item.id === roleId);
  }

  _saveRoles() {
    saveToStorage(ROLE_LIST_KEY, this.roles);
  }

  _loadData() {
    this.admins = loadFromStorage([ADMIN_LIST_KEY], defaultAdmins);
    this.roles = loadFromStorage([ROLE_LIST_KEY], defaultRoleDefinitions);
    this.currentAdmin = loadFromStorage([CURRENT_ADMIN_KEY], null);
    saveToStorage(ADMIN_LIST_KEY, this.admins);
    this._saveRoles();
  }
}

const adminService = new AdminService();
export default adminService;
