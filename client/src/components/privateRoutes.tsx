import React, { useContext } from 'react';
import { AuthContext } from '../contexts/authContext';
import { Navigate } from 'react-router';

type PrivateRoutesProps = {
  children: React.ReactNode | React.ReactElement;
  allowedRoles?: string[];
};

const PrivateRoutes = ({ children, allowedRoles }: PrivateRoutesProps) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to='/auth/login' replace />;
  }

  const isAuthorized = allowedRoles ? allowedRoles.includes(user.role) : true;

  if (!isAuthorized) {
    return <Navigate to='/auth/login' replace />;
  }

  return <>{children}</>;
};

export default PrivateRoutes;
