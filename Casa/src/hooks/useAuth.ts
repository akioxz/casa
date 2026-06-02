import { useAuthStore } from '../store/authStore';

/**
 * Reusable hook to consume global authentication state and triggers.
 * Coordinates role status and details of the authenticated user session.
 */
export const useAuth = () => {
  const {
    session,
    user,
    role,
    isLoading,
    isSubmitting,
    isMockMode,
    signIn,
    signUp,
    signOut,
  } = useAuthStore();

  const isAuthenticated = !!session;
  const isAdmin = role === 'admin';
  const isCustomer = role === 'user';

  return {
    session,
    user,
    role,
    isLoading,
    isSubmitting,
    isMockMode,
    isAuthenticated,
    isAdmin,
    isCustomer,
    signIn,
    signUp,
    signOut,
  };
};

export default useAuth;
