import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ServiceContext } from '../../contexts/ServiceContext';
import { useServiceVersion } from '../../hooks/useServices';

export const RequireAdminAuth = ({ children }) => {
  const { admin } = useContext(ServiceContext);
  const location = useLocation();

  useServiceVersion(admin);

  if (!admin.isAuthenticated()) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export const RequirePermission = ({ permission, redirectTo = '/admin', children }) => {
  const { admin } = useContext(ServiceContext);

  useServiceVersion(admin);

  if (!admin.hasPermission(permission)) {
    return <Navigate replace to={redirectTo} />;
  }

  return children;
};

const PermissionGate = ({ permission, fallback = null, children }) => {
  const { admin } = useContext(ServiceContext);

  useServiceVersion(admin);

  if (!admin.hasPermission(permission)) {
    return fallback;
  }

  return children;
};

export default PermissionGate;
