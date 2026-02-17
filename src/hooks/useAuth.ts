import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'gestor' | 'agente' | 'cliente';
  permissions: string[];
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'gestor' | 'agente' | 'cliente';
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Criar usuário gestor padrão se não existir nenhum usuário
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.length === 0) {
      const defaultUsers = [
        {
          id: '1',
          name: 'Administrador',
          email: 'admin@bochel.com',
          password: 'admin123',
          role: 'gestor',
          permissions: ['all']
        },
        {
          id: '2',
          name: 'Agente de Campo',
          email: 'agente@bochel.com',
          password: 'agente123',
          role: 'agente',
          permissions: ['clientes', 'emprestimos', 'cobrancas', 'pagamentos']
        },
        {
          id: '3',
          name: 'Cliente Exemplo',
          email: 'cliente@bochel.com',
          password: 'cliente123',
          role: 'cliente',
          permissions: ['conta', 'historico', 'pedidos']
        }
      ];
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    }

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
      
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      // Forçar reload para garantir que o estado seja atualizado corretamente
      window.location.reload();
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

    // Definir permissões baseadas no papel
    let permissions: string[] = [];
    switch (data.role) {
      case 'gestor':
        permissions = ['all'];
        break;
      case 'agente':
        permissions = ['clientes', 'emprestimos', 'cobrancas', 'pagamentos'];
        break;
      case 'cliente':
        permissions = ['conta', 'historico', 'pedidos'];
        break;
    }

    // Criar novo usuário
    const newUser = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      permissions: permissions
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
    // Redirecionar para a página de login
    window.location.href = '/';
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes('all') || user.permissions.includes(permission);
  };

  return {
    isAuthenticated,
    user,
    login,
    register,
    logout,
    hasPermission
  };
};
