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

  const roleConfig: Record<string, { color: string; dot: string }> = {
    gestor: { color: 'text-primary', dot: 'bg-primary' },
    agente: { color: 'text-accent', dot: 'bg-accent' },
    cliente: { color: 'text-secondary', dot: 'bg-secondary' },
  };

  const rc = roleConfig[user?.role ?? ''] ?? { color: 'text-muted-foreground', dot: 'bg-muted-foreground' };

  return (
    <Sidebar collapsible="icon">
      {/* Header */}
      <SidebarHeader className="border-b border-sidebar-border/60 p-3 bg-sidebar">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-primary"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <span className="text-sm font-black text-white tracking-tighter">B</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <h1 className="text-sm font-black text-sidebar-foreground tracking-tight leading-none">BOCHEL</h1>
              <p className="text-[10px] text-sidebar-foreground/40 leading-none mt-0.5 font-medium">Microcrédito</p>
            </div>
          )}
        </div>

        {/* User chip */}
        {user && !isCollapsed && (
          <div className="mt-2.5 flex items-center gap-2 px-2.5 py-2 rounded-xl bg-sidebar-accent border border-sidebar-border/40">
            <div className="relative flex-shrink-0">
              <div className="w-6 h-6 rounded-lg bg-gradient-primary flex items-center justify-center shadow-soft">
                <span className="text-[10px] font-black text-white uppercase">{user.name[0]}</span>
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-sidebar-background ${rc.dot}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold truncate leading-none text-sidebar-foreground">{user.name}</p>
              <p className={`text-[9px] leading-none mt-0.5 capitalize font-medium ${rc.color}`}>{user.role}</p>
            </div>
          </div>
        )}
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="px-2 py-3 bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className={`${isCollapsed ? 'sr-only' : 'text-[9px] uppercase tracking-widest font-bold text-sidebar-foreground/30 px-2 mb-1'}`}>
            Navegação
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
                      className={`h-9 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-primary/15 text-primary font-semibold shadow-soft'
                          : isChat
                          ? 'text-primary/80 hover:bg-primary/10 hover:text-primary'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      }`}
                    >
                      <Link to={item.href} className="flex items-center gap-2.5">
                        <item.icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-primary' : isChat ? 'text-primary/70' : ''}`} />
                        <span className={`${isCollapsed ? 'sr-only' : ''} text-xs font-medium`}>{item.name}</span>
                        {isActive && !isCollapsed && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
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
      <SidebarFooter className="border-t border-sidebar-border/60 p-2 bg-sidebar">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              tooltip={isCollapsed ? 'Sair' : undefined}
              className="h-9 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all rounded-xl"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <span className={`${isCollapsed ? 'sr-only' : ''} text-xs font-medium`}>Terminar sessão</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
