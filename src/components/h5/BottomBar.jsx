import { NavLink, useLocation } from 'react-router-dom';



import { useServices, useServiceSnapshot } from '../../hooks/useServices';



const tabs = [

  { to: '/home', label: '首页', variant: 1, match: ['/home', '/'] },

  { to: '/category', label: '分类', variant: 2 },

  { to: '/cart', label: '购物车', variant: 3 },

  { to: '/messages', label: '消息', variant: 4 },

  { to: '/profile', label: '我的', variant: 5 },

];



const BottomBar = () => {

  const { pathname } = useLocation();

  const { user, cart, message } = useServices();

  const currentUser = useServiceSnapshot(user, (service) => service.getCurrentUser());

  const cartCount = useServiceSnapshot(cart, (service) => (
    currentUser ? service.getCartCount(currentUser.id) : 0
  ));

  const unreadCount = useServiceSnapshot(message, (service) => (
    currentUser ? service.getUnreadCount(currentUser.id) : 0
  ));



  return (

    <nav className="pm-bottom-bar" aria-label="底部导航">

      {tabs.map((tab) => (

        <NavLink

          key={tab.to}

          to={tab.to}

          className={({ isActive }) => {

            const active = isActive || (tab.match && tab.match.includes(pathname));

            return `pm-bottom-bar-chip pm-bottom-bar-chip-${tab.variant}${active ? ' is-active' : ''}`;

          }}

        >

          <span className="pm-bottom-bar-chip-label">{tab.label}</span>

          {tab.to === '/cart' && cartCount > 0 ? (

            <span className="pm-bottom-bar-badge">{cartCount > 99 ? '99+' : cartCount}</span>

          ) : null}

          {tab.to === '/messages' && unreadCount > 0 ? (

            <span className="pm-bottom-bar-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>

          ) : null}

        </NavLink>

      ))}

    </nav>

  );

};



export default BottomBar;

