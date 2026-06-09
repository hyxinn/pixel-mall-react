import { createContext } from 'react';
import addressService from '../services/addressService';
import adminService from '../services/adminService';
import cartService from '../services/cartService';
import favoriteService from '../services/favoriteService';
import footprintService from '../services/footprintService';
import goodService from '../services/goodService';
import messageService from '../services/messageService';
import orderService from '../services/orderService';
import searchService from '../services/searchService';
import userService from '../services/userService';
import mockApi from '../api/mockApi';

const ServiceContext = createContext();

const ServiceProvider = ({ children }) => {
  const value = {
    admin: adminService,
    good: goodService,
    order: orderService,
    search: searchService,
    user: userService,
    cart: cartService,
    favorite: favoriteService,
    footprint: footprintService,
    message: messageService,
    address: addressService,
    api: mockApi,
  };

  return <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>;
};

export { ServiceContext, ServiceProvider };
