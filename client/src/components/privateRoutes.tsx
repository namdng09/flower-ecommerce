import React, { useContext } from 'react';
import { AuthContext } from '../contexts/authContext';
import { Navigate } from 'react-router';

type PrivateRoutesProps = {
  children: React.ReactNode | React.ReactElement;
  role?: string;
};

const PrivateRoutes = ({ children, role }: PrivateRoutesProps) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to='/auth/login' replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to='/auth/login' replace />;
  }

  return <>{children}</>;
};

export default PrivateRoutes;
