import React, { createContext, useState, useEffect, ReactNode } from 'react';
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

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
    loginWithRoleValidation: (email: string, password: string, expectedRole: 'gestor' | 'agente' | 'cliente') => Promise<{ success: boolean; message: string }>;
    register: (data: { name: string; email: string; password: string; role: 'gestor' | 'agente' | 'cliente' }) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;
    hasPermission: (permission: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper: race a promise against a timeout
const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T | null> =>
    Promise.race([promise, new Promise<null>(resolve => setTimeout(() => resolve(null), ms))]);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        let resolved = false;
        const markResolved = () => { resolved = true; };

        // Safety timeout
        const safetyTimeout = setTimeout(() => {
            if (mounted && !resolved) {
                console.warn('Auth initialization timed out, proceeding without auth.');
                setLoading(false);
                markResolved();
            }
        }, 8000);

        const setUserFromSession = (authUser: any, role: 'gestor' | 'agente' | 'cliente', name?: string) => {
            if (!mounted) return;
            setUser({
                id: authUser.id,
                name: name || authUser.user_metadata?.name || authUser.email || '',
                email: authUser.email || '',
                role,
                permissions: rolePermissions[role] || [],
            });
            setIsAuthenticated(true);
            setLoading(false);
            markResolved();
        };

        const loadUserProfile = async (authUser: any) => {
            try {
                // Use individual timeouts on each query to prevent hanging
                const profilePromise = supabase
                    .from('profiles')
                    .select('name, email')
                    .eq('user_id', authUser.id)
                    .maybeSingle();

                const rolePromise = supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', authUser.id)
                    .maybeSingle();

                // Race both queries against a 4s timeout
                const [profileResult, roleResult] = await Promise.all([
                    withTimeout(profilePromise, 4000),
                    withTimeout(rolePromise, 4000),
                ]);

                const profile = profileResult?.data;
                const roleData = roleResult?.data;

                // Determine role: from DB > from user_metadata > default
                const role = (roleData?.role || authUser.user_metadata?.role || 'cliente') as 'gestor' | 'agente' | 'cliente';
                const name = profile?.name || authUser.user_metadata?.name || authUser.email || '';

                setUserFromSession(authUser, role, name);
            } catch (error) {
                console.error("Error loading profile, using session metadata:", error);
                // Fallback: use metadata from the auth session itself
                const metaRole = (authUser.user_metadata?.role || 'cliente') as 'gestor' | 'agente' | 'cliente';
                setUserFromSession(authUser, metaRole);
            }
        };

        const initializeSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user && mounted) {
                    await loadUserProfile(session.user);
                } else if (mounted) {
                    setUser(null);
                    setIsAuthenticated(false);
                    setLoading(false);
                    markResolved();
                }
            } catch (error) {
                console.error("Error checking session:", error);
                if (mounted) {
                    setLoading(false);
                    markResolved();
                }
            }
        };

        initializeSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'INITIAL_SESSION') return;

            if (event === 'SIGNED_OUT') {
                if (mounted) {
                    setUser(null);
                    setIsAuthenticated(false);
                    setLoading(false);
                    markResolved();
                }
                return;
            }

            if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user && mounted) {
                await loadUserProfile(session.user);
            }
        });

        return () => {
            mounted = false;
            clearTimeout(safetyTimeout);
            subscription.unsubscribe();
        };
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setLoading(false);
            return { success: false, message: error.message === 'Invalid login credentials' ? 'Email ou senha incorretos.' : error.message };
        }
        return { success: true, message: 'Login realizado com sucesso!' };
    };

    const loginWithRoleValidation = async (email: string, password: string, expectedRole: 'gestor' | 'agente' | 'cliente') => {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setLoading(false);
            return { success: false, message: 'Credenciais inválidas.' };
        }

        // Check role from DB, then fallback to metadata
        let userRole: string | undefined;

        try {
            const roleResult = await withTimeout(
                supabase.from('user_roles').select('role').eq('user_id', data.user.id).maybeSingle(),
                5000
            );
            userRole = roleResult?.data?.role;
            console.log('[Auth] DB role query result:', roleResult?.data, 'role:', userRole);
        } catch (e) {
            console.warn('[Auth] Role query failed:', e);
        }

        // Fallback to user_metadata if DB query returned nothing
        if (!userRole) {
            userRole = data.user.user_metadata?.role;
            console.log('[Auth] Fallback to metadata role:', userRole);
        }

        console.log('[Auth] Expected role:', expectedRole, '| Found role:', userRole);

        if (userRole !== expectedRole) {
            await supabase.auth.signOut();
            setLoading(false);
            const msg = !userRole
                ? 'Não foi possível verificar o papel do utilizador. Tente novamente.'
                : 'Credenciais inválidas para este painel.';
            return { success: false, message: msg };
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

    const value = {
        isAuthenticated,
        user,
        loading,
        login,
        loginWithRoleValidation,
        register,
        logout,
        hasPermission,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
