import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user } = useAuth(); // or isAuthenticated / token

  // not logged in → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // logged in → show nested routes
  return <Outlet />;
};

export default ProtectedRoute;
