import { createContext } from 'react';
import adminService from '../services/adminService';
import goodService from '../services/goodService';
import orderService from '../services/orderService';

const ServiceContext = createContext();

const ServiceProvider = ({ children }) => {
  const value = {
    admin: adminService,
    good: goodService,
    order: orderService,
  };

  return <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>;
};

export { ServiceContext, ServiceProvider };
