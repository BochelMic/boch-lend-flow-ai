import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'gestor' | 'agente' | 'cliente';
  permissions: string[];
}

const rolePermissions: Record<string, string[]> = {
  gestor: ['all'],
  agente: ['clientes', 'emprestimos', 'cobrancas', 'pagamentos'],
  cliente: ['conta', 'historico', 'pedidos'],
};

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch profile and role
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('user_id', session.user.id)
          .single();

        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        const role = (roleData?.role || 'cliente') as 'gestor' | 'agente' | 'cliente';

        setUser({
          id: session.user.id,
          name: profile?.name || session.user.email || '',
          email: profile?.email || session.user.email || '',
          role,
          permissions: rolePermissions[role] || [],
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('user_id', session.user.id)
          .single();

        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        const role = (roleData?.role || 'cliente') as 'gestor' | 'agente' | 'cliente';

        setUser({
          id: session.user.id,
          name: profile?.name || session.user.email || '',
          email: profile?.email || session.user.email || '',
          role,
          permissions: rolePermissions[role] || [],
        });
        setIsAuthenticated(true);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { success: false, message: error.message === 'Invalid login credentials' ? 'Email ou senha incorretos.' : error.message };
    }
    return { success: true, message: 'Login realizado com sucesso!' };
  };

  const register = async (data: { name: string; email: string; password: string; role: 'gestor' | 'agente' | 'cliente' }) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name, role: data.role },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return { success: false, message: 'Já existe um usuário com este email.' };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Usuário cadastrado com sucesso!' };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes('all') || user.permissions.includes(permission);
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
    hasPermission,
  };
};
