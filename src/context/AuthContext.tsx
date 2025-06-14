import React, { createContext, useContext, useState, useEffect } from 'react';
import useAuthAPI from '../hooks/use-auth';
import socket from '../utils/Socket';

interface AuthContextProps {
  isAuthenticated: boolean | null;
  ChangeAuth: (state: boolean) => void;
  user: any;
}

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: null,
  ChangeAuth: () => {},
  user: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getCurrentUser } = useAuthAPI();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Failed to fetch user', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [getCurrentUser]);
  useEffect(() => {
    if (!isLoading) {
      setIsAuthenticated(!!user);
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      socket.connect();

      socket.on('connect', () => {
        console.log('🔌 Socket connected:', socket.id);
        socket.emit('user_connected', user.id);
      });

      return () => {
        socket.off('connect');
        socket.disconnect();
        console.log('Socket disconnected');
      };
    }
  }, [isAuthenticated, user?.id]);

  // Manual auth state change
  const ChangeAuth = (state: boolean) => {
    console.log('Auth state changed:', state);
    setIsAuthenticated(state);
    if (state && user?.id) {
      socket.connect();
      socket.emit('user_connected', user.id);
    } else {
      socket.disconnect();
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, ChangeAuth, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
