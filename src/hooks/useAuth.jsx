// Hook: get current authenticated user and helper data from Redux store
import { useSelector } from 'react-redux';

export default function useAuth() {
  const user = useSelector((state) => state.auth?.user || null);
  const isAuthenticated = Boolean(user);
  return { user, isAuthenticated };
}
