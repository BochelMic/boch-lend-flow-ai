import { Link, useLocation } from 'react-router-dom';
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

  const getNavigation = () => {
    const chatItem = { name: 'Chat Interno', href: '/chat', icon: MessageCircle, permission: 'chat', highlight: true };
    
    if (user?.role === 'gestor') {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'all' },
        { name: 'Usuários', href: '/usuarios', icon: UserPlus, permission: 'all' },
        { name: 'Pedidos', href: '/credit-requests', icon: FormInput, permission: 'all' },
        { name: 'Clientes', href: '/clientes', icon: Users, permission: 'all' },
        { name: 'Empréstimos', href: '/emprestimos', icon: CreditCard, permission: 'all' },
        { name: 'Simulador', href: '/credit-simulator', icon: Calculator, permission: 'all' },
        { name: 'Crédito', href: '/credit-form', icon: FormInput, permission: 'all' },
        { name: 'Cobranças', href: '/cobrancas', icon: Phone, permission: 'all' },
        { name: 'Agentes', href: '/agentes', icon: UserCheck, permission: 'all' },
        { name: 'Relatórios', href: '/reports', icon: BarChart3, permission: 'all' },
        chatItem,
        { name: 'Subsistemas', href: '/subsistemas', icon: Shield, permission: 'all' },
        { name: 'Configurações', href: '/settings', icon: Settings, permission: 'all' },
      ];
    } else if (user?.role === 'agente') {
      return [
        { name: 'Dashboard', href: '/dashboard-agente', icon: LayoutDashboard, permission: 'clientes' },
        { name: 'Pedidos', href: '/credit-requests', icon: FormInput, permission: 'clientes' },
        { name: 'Novo Pedido', href: '/credit-form', icon: FormInput, permission: 'emprestimos' },
        { name: 'Clientes', href: '/clientes', icon: Users, permission: 'clientes' },
        { name: 'Empréstimos', href: '/emprestimos', icon: CreditCard, permission: 'emprestimos' },
        { name: 'Cobranças', href: '/cobrancas', icon: Phone, permission: 'cobrancas' },
        chatItem,
      ];
    } else if (user?.role === 'cliente') {
      return [
        { name: 'Minha Conta', href: '/dashboard-cliente', icon: LayoutDashboard, permission: 'conta' },
        { name: 'Histórico', href: '/historico', icon: FileText, permission: 'historico' },
        { name: 'Meus Pedidos', href: '/pedidos', icon: FormInput, permission: 'pedidos' },
        { name: 'Novo Crédito', href: '/credit-form', icon: Calculator, permission: 'pedidos' },
        chatItem,
      ];
    }
    return [];
  };

  const navigation = getNavigation();
  const isCollapsed = state === 'collapsed';

  const roleColors: Record<string, string> = {
    gestor: 'bg-primary/20 text-primary',
    agente: 'bg-accent/20 text-accent',
    cliente: 'bg-secondary/20 text-secondary-foreground',
  };

  return (
    <Sidebar collapsible="icon">
      {/* Header */}
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-medium"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <span className="text-sm font-black text-white">B</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <h1 className="text-sm font-black text-sidebar-foreground tracking-tight leading-none">BOCHEL</h1>
              <p className="text-[10px] text-sidebar-foreground/50 leading-none mt-0.5">Microcrédito</p>
            </div>
          )}
        </div>

        {/* User chip */}
        {user && !isCollapsed && (
          <div className={`mt-2 flex items-center gap-2 px-2 py-1.5 rounded-lg ${roleColors[user.role] || 'bg-muted'}`}>
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] font-bold uppercase">{user.name[0]}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold truncate leading-none">{user.name}</p>
              <p className="text-[9px] opacity-70 leading-none mt-0.5 capitalize">{user.role}</p>
            </div>
          </div>
        )}
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="px-1 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className={`${isCollapsed ? 'sr-only' : 'text-[9px] uppercase tracking-widest font-semibold text-sidebar-foreground/40 px-2 mb-1'}`}>
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
                      className={`h-8 md:h-9 rounded-lg transition-all duration-150 ${
                        isChat && !isActive
                          ? 'text-primary hover:bg-primary/10'
                          : ''
                      }`}
                    >
                      <Link to={item.href} className="flex items-center gap-2.5">
                        <item.icon className={`h-4 w-4 flex-shrink-0 ${isChat && !isActive ? 'text-primary' : ''}`} />
                        <span className={`${isCollapsed ? 'sr-only' : ''} text-xs md:text-sm`}>{item.name}</span>
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
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              tooltip={isCollapsed ? 'Sair' : undefined}
              className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-lg"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <span className={`${isCollapsed ? 'sr-only' : ''} text-xs md:text-sm`}>Terminar sessão</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
