import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FullScreenCenter from './FullScreenCenter';
import Spinner from './Spinner';

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <FullScreenCenter>
        <Spinner />
      </FullScreenCenter>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
