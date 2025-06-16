import { AuthProvider } from '../contexts/authContext';
const ContextWrapper = ({ children }: { children: React.ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default ContextWrapper;
