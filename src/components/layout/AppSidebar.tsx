import { Link, useLocation } from 'react-router-dom';
import { useState, useRef } from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  Calculator,
  BarChart3,
  Phone,
  FormInput,
  UserCheck,
  FileText,
  MessageCircle,
  UserPlus,
  LogOut,
  Shield,
  Camera,
  PenLine,
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '../ui/sidebar';

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, hasPermission, logout } = useAuth();
  const currentPath = location.pathname;
  const isCollapsed = state === 'collapsed';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile photo state (stored in localStorage per user)
  const storageKey = `profile_photo_${user?.id || 'default'}`;
  const [profilePhoto, setProfilePhoto] = useState<string | null>(() => {
    try {
      return localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setProfilePhoto(dataUrl);
      try { localStorage.setItem(storageKey, dataUrl); } catch { /* quota exceeded */ }
    };
    reader.readAsDataURL(file);
  };

  const getNavigation = () => {
    const prefix = user?.role === 'gestor' ? '/gestor' : user?.role === 'agente' ? '/agente' : '';
    const chatItem = { name: 'Chat Interno', href: `${prefix}/chat`, icon: MessageCircle, permission: 'chat', highlight: true };

    if (user?.role === 'gestor') {
      return [
        { name: 'Dashboard', href: '/gestor/dashboard', icon: LayoutDashboard, permission: 'all' },
        { name: 'Usuários', href: '/gestor/usuarios', icon: UserPlus, permission: 'all' },
        { name: 'Pedidos', href: '/gestor/credit-requests', icon: FormInput, permission: 'all' },
        { name: 'Clientes', href: '/gestor/clientes', icon: Users, permission: 'all' },
        { name: 'Empréstimos', href: '/gestor/emprestimos', icon: CreditCard, permission: 'all' },
        { name: 'Simulador', href: '/gestor/credit-simulator', icon: Calculator, permission: 'all' },
        { name: 'Crédito', href: '/gestor/credit-form', icon: FormInput, permission: 'all' },
        { name: 'Cobranças', href: '/gestor/cobrancas', icon: Phone, permission: 'all' },
        { name: 'Agentes', href: '/gestor/agentes', icon: UserCheck, permission: 'all' },
        { name: 'Relatórios', href: '/gestor/reports', icon: BarChart3, permission: 'all' },
        { name: 'Contratos', href: '/gestor/contratos', icon: PenLine, permission: 'all' },
        chatItem,
        { name: 'Subsistemas', href: '/gestor/subsistemas', icon: Shield, permission: 'all' },
        { name: 'Configurações', href: '/gestor/settings', icon: Settings, permission: 'all' },
      ];
    } else if (user?.role === 'agente') {
      return [
        { name: 'Dashboard', href: '/agente/dashboard', icon: LayoutDashboard, permission: 'clientes' },
        { name: 'Pedidos', href: '/agente/credit-requests', icon: FormInput, permission: 'clientes' },
        { name: 'Novo Pedido', href: '/agente/credit-form', icon: FormInput, permission: 'emprestimos' },
        { name: 'Clientes', href: '/agente/clientes', icon: Users, permission: 'clientes' },
        { name: 'Empréstimos', href: '/agente/emprestimos', icon: CreditCard, permission: 'emprestimos' },
        { name: 'Cobranças', href: '/agente/cobrancas', icon: Phone, permission: 'cobrancas' },
        { name: 'Contratos', href: '/agente/contratos', icon: PenLine, permission: 'clientes' },
        chatItem,
      ];
    } else if (user?.role === 'cliente') {
      return [
        { name: 'Minha Conta', href: '/dashboard-cliente', icon: LayoutDashboard, permission: 'conta' },
        { name: 'Histórico', href: '/historico', icon: FileText, permission: 'historico' },
        { name: 'Meus Pedidos', href: '/pedidos', icon: FormInput, permission: 'pedidos' },
        { name: 'Novo Crédito', href: '/credit-form', icon: Calculator, permission: 'pedidos' },
        { name: 'Contratos', href: '/contratos', icon: PenLine, permission: 'pedidos' },
        chatItem,
      ];
    }
    return [];
  };

  const navigation = getNavigation();

  return (
    <Sidebar collapsible="icon">
      {/* Header with logo */}
      <SidebarHeader className="border-b border-gray-200/80 p-4" style={{ background: 'linear-gradient(180deg, #f8faf8 0%, #ffffff 100%)' }}>
        <div className="flex items-center gap-2.5">
          {isCollapsed ? (
            <img src="/logo-bochel.png?v=3" alt="B" className="w-9 h-9 object-contain flex-shrink-0" />
          ) : (
            <img src="/logo-bochel.png?v=3" alt="Bochel Microcrédito" className="h-14 object-contain" />
          )}
        </div>

        {/* Profile photo + user info */}
        {user && !isCollapsed && (
          <div className="mt-4 flex flex-col items-center text-center">
            <div
              className="relative group cursor-pointer mb-2"
              onClick={() => fileInputRef.current?.click()}
            >
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#0b3a20]/20 shadow-md group-hover:border-[#d37c22] transition-colors"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md group-hover:shadow-lg transition-shadow"
                  style={{ background: 'linear-gradient(135deg, #0b3a20, #1a6b3c)' }}
                >
                  {user.name[0]?.toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-5 w-5 text-white" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>
            <p className="text-sm font-bold text-gray-800 leading-tight">{user.name}</p>
            <span
              className="mt-1 text-[10px] font-semibold uppercase tracking-wider px-3 py-0.5 rounded-full text-white"
              style={{ backgroundColor: user.role === 'gestor' ? '#0b3a20' : user.role === 'agente' ? '#2563eb' : '#d37c22' }}
            >
              {user.role === 'gestor' ? 'Gestor' : user.role === 'agente' ? 'Agente' : 'Cliente'}
            </span>
          </div>
        )}

        {/* Collapsed: just show avatar */}
        {user && isCollapsed && (
          <div className="mt-2 flex justify-center">
            {profilePhoto ? (
              <img src={profilePhoto} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-[#0b3a20]/20" />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #0b3a20, #1a6b3c)' }}
              >
                {user.name[0]?.toUpperCase()}
              </div>
            )}
          </div>
        )}
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-2 py-3" style={{ background: '#ffffff' }}>
        <SidebarGroup>
          <SidebarGroupLabel className={`${isCollapsed ? 'sr-only' : 'text-[9px] uppercase tracking-widest font-bold text-gray-400 px-3 mb-1.5'}`}>
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navigation.map((item) => {
                if (item.permission !== 'chat' && !hasPermission(item.permission)) return null;

                const isActive = currentPath.startsWith(item.href);
                const isChat = (item as any).highlight;

                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={isCollapsed ? item.name : undefined}
                      className={`h-10 rounded-xl transition-all duration-200 ${isActive
                        ? 'text-white font-semibold shadow-md'
                        : isChat
                          ? 'text-[#0b3a20]/70 hover:bg-[#0b3a20]/5 hover:text-[#0b3a20]'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      style={isActive ? { background: 'linear-gradient(135deg, #0b3a20, #145a32)' } : undefined}
                    >
                      <Link to={item.href} className="flex items-center gap-3">
                        <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-white' : isChat ? 'text-[#0b3a20]/60' : 'text-gray-400'}`} />
                        <span className={`${isCollapsed ? 'sr-only' : ''} text-[13px] font-medium`}>{item.name}</span>
                        {isActive && !isCollapsed && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-gray-200/80 p-2" style={{ background: '#ffffff' }}>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              tooltip={isCollapsed ? 'Sair' : undefined}
              className="h-10 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-xl"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <span className={`${isCollapsed ? 'sr-only' : ''} text-[13px] font-medium`}>Terminar sessão</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
