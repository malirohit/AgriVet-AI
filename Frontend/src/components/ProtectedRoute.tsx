import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode; role?: 'farmer' | 'doctor' }) => {

  const { user, isAuthenticated , isLoading } = useAuth();

  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login"  state={{ from: location }} replace />;

  if (role && user?.role !== role) return <Navigate to="/" replace />;

  return <>{children}</>;

};

export default ProtectedRoute;
