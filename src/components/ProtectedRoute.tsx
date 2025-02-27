import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  if (!session) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
} 