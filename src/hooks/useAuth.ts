
import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'credit' | 'legal' | 'operations' | 'marketing';
  permissions: string[];
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'credit' | 'legal' | 'operations' | 'marketing';
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = (email: string, password: string) => {
    // Verificar se o usuário existe no localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (user) {
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      return { success: true, message: 'Login realizado com sucesso!' };
    }
    
    return { success: false, message: 'Email ou senha incorretos.' };
  };

  const register = (data: RegisterData) => {
    // Verificar se já existe um usuário com o mesmo email
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find((u: any) => u.email === data.email);
    
    if (existingUser) {
      return { success: false, message: 'Já existe um usuário com este email.' };
    }

    // Criar novo usuário
    const newUser = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      permissions: data.role === 'admin' ? ['all'] : [data.role]
    };

    // Salvar no localStorage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    return { success: true, message: 'Usuário cadastrado com sucesso!' };
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
    register,
    logout
  };
};
