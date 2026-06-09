import { Link, useNavigate } from 'react-router-dom';

import ThemePanel from '../components/common/ThemePanel';
import { ORDER_STATUS_TABS, orderListPathForStatus } from '../constants/orderTabs';
import { useServices, useServiceSnapshot } from '../hooks/useServices';

const orderIconClassMap = {
  all: 'pm-profile-icon-orders',
  0: 'pm-profile-icon-wallet',
  1: 'pm-profile-icon-receipt',
  2: 'pm-profile-icon-truck',
  3: 'pm-profile-icon-done',
};

const profileLinks = [
  { to: '/favorites', label: '收藏', icon: 'pm-profile-icon-heart' },
  { to: '/address', label: '地址', icon: 'pm-profile-icon-pin' },
  { to: '/footprints', label: '足迹', icon: 'pm-profile-icon-clock' },
  { to: '/admin/login', label: '后台', icon: 'pm-profile-icon-admin', className: 'pm-profile-link-admin' },
];

const ProfilePage = () => {
  const { user, api } = useServices();
  const navigate = useNavigate();
  const currentUser = useServiceSnapshot(user, (service) => service.getCurrentUser());
  const displayName = currentUser.nickname || currentUser.username;
  const avatarChar = displayName.trim().slice(0, 1) || 'U';

  const handleLogout = async () => {
    await api.user.logout();
    navigate('/login');
  };

  return (
    <main className="pm-page pm-profile-page">
      <section className="pm-profile-hero" aria-label="用户信息">
        <div className="pm-profile-hero-card">
          <div className="pm-profile-hero-top">
            <span className="pm-profile-hero-badge">Pixel Member</span>
            <button type="button" className="pm-profile-logout" onClick={handleLogout}>
              退出登录
            </button>
          </div>
          <div className="pm-profile-hero-main">
            <div className="pm-profile-avatar" aria-hidden>
              {avatarChar}
            </div>
            <div className="pm-profile-hero-text">
              <h2 className="pm-profile-name">{displayName}</h2>
              <p className="pm-profile-account">账号 {currentUser.username}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pm-profile-panel" aria-labelledby="profile-orders-title">
        <h2 className="pm-profile-panel-title" id="profile-orders-title">
          我的订单
        </h2>
        <nav className="pm-profile-order-tabs" aria-label="订单筛选">
          {ORDER_STATUS_TABS.map((tab) => (
            <Link
              key={tab.key}
              className="pm-profile-order-tab"
              to={orderListPathForStatus(tab.key)}
            >
              <span className={`pm-profile-menu-icon ${orderIconClassMap[tab.key]}`} aria-hidden />
              <span className="pm-profile-menu-text">{tab.label}</span>
            </Link>
          ))}
        </nav>
      </section>

      <section className="pm-profile-panel" aria-labelledby="profile-menu-title">
        <h2 className="pm-profile-panel-title" id="profile-menu-title">
          常用功能
        </h2>
        <nav className="pm-profile-links" aria-label="我的功能">
          {profileLinks.map((item) => (
            <Link className={`pm-profile-link ${item.className || ''}`.trim()} to={item.to} key={item.to}>
              <span className={`pm-profile-menu-icon ${item.icon}`} aria-hidden />
              <span className="pm-profile-menu-text">{item.label}</span>
            </Link>
          ))}
        </nav>
      </section>

      <section className="pm-profile-panel pm-profile-theme-panel" aria-labelledby="profile-theme-title">
        <h2 className="pm-profile-panel-title" id="profile-theme-title">
          主题外观
        </h2>
        <p className="pm-profile-panel-desc">切换配色后全站页面即时生效，设置会自动保存</p>
        <ThemePanel variant="profile" />
      </section>
    </main>
  );
};

export default ProfilePage;
