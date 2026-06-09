import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ServiceContext } from '../../contexts/ServiceContext';
import { useServiceSnapshot } from '../../hooks/useServices';

export const RequireAdminAuth = ({ children }) => {
  const { admin } = useContext(ServiceContext);
  const location = useLocation();

  const isAuthenticated = useServiceSnapshot(admin, (service) => service.isAuthenticated());

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export const RequirePermission = ({ permission, redirectTo = '/admin', children }) => {
  const { admin } = useContext(ServiceContext);

  const hasPermission = useServiceSnapshot(admin, (service) => service.hasPermission(permission));

  if (!hasPermission) {
    return <Navigate replace to={redirectTo} />;
  }

  return children;
};

const PermissionGate = ({ permission, fallback = null, children }) => {
  const { admin } = useContext(ServiceContext);

  const hasPermission = useServiceSnapshot(admin, (service) => service.hasPermission(permission));

  if (!hasPermission) {
    return fallback;
  }

  return children;
};

export default PermissionGate;
