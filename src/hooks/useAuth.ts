
import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'credit' | 'legal' | 'operations' | 'marketing';
  permissions: string[];
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Simulação de autenticação - em produção usar Supabase
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = (email: string, password: string) => {
    // Simulação de login - em produção usar Supabase
    const mockUser: User = {
      id: '1',
      name: 'Administrador',
      email: email,
      role: 'admin',
      permissions: ['all']
    };
    
    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(mockUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  return {
    isAuthenticated,
    user,
    login,
    logout
  };
};
