import { useContext } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ServiceContext } from '../../contexts/ServiceContext';
import Button from '../common/Button';

const navItems = [
  { key: 'dashboard', label: '后台首页', to: '/admin', permission: 'dashboard:view' },
  { key: 'products', label: '商品管理', to: '/admin/products', permission: 'products:view' },
  { key: 'categories', label: '分类管理', to: '/admin/categories', permission: 'categories:view' },
  { key: 'orders', label: '订单管理', to: '/admin/orders', permission: 'orders:view' },
  { key: 'roles', label: '角色权限', to: '/admin/roles', permission: 'roles:view' },
];

const AdminShell = () => {
  const { admin } = useContext(ServiceContext);
  const navigate = useNavigate();
  const currentAdmin = admin.getCurrentAdmin();
  const menuKeys = admin.getMenuKeys();

  const handleLogout = () => {
    admin.logout();
    navigate('/admin/login');
  };

  return (
    <div className="pm-admin-app">
      <div className="pm-admin-layout">
        <div className="pm-admin-brand-panel">
          <div className="pm-admin-logo">
            <span className="pm-admin-brand-pixel" aria-hidden="true" />
            <div>
              <strong>Pixel Mall Admin</strong>
              <p className="pm-help">奶油像素商城后台</p>
            </div>
          </div>
        </div>
        <header className="pm-admin-header">
          <div>
            <h1 className="pm-admin-title">后台管理</h1>
            <p className="pm-help">当前角色：{currentAdmin?.nickname} / {currentAdmin?.role}</p>
          </div>
          <Button type="button" variant="ghost" onClick={handleLogout}>退出登录</Button>
        </header>
        <aside className="pm-admin-side">
          <Link className="pm-admin-home-link" to="/home">返回商城首页</Link>
          {navItems
            .filter((item) => menuKeys.includes(item.key) && admin.hasPermission(item.permission))
            .map((item) => (
              <NavLink
                key={item.key}
                className={({ isActive }) => `pm-admin-nav-link${isActive ? ' is-active' : ''}`}
                to={item.to}
                end={item.to === '/admin'}
              >
                {item.label}
              </NavLink>
            ))}
        </aside>
        <main className="pm-admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
