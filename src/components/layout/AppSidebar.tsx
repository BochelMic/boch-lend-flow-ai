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
  useSidebar,
} from '../ui/sidebar';

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, hasPermission } = useAuth();
  const currentPath = location.pathname;

  const getNavigation = () => {
    if (user?.role === 'gestor') {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'all' },
        { name: 'Pedidos', href: '/credit-requests', icon: FormInput, permission: 'all' },
        { name: 'Clientes', href: '/clientes', icon: Users, permission: 'all' },
        { name: 'Empréstimos', href: '/emprestimos', icon: CreditCard, permission: 'all' },
        { name: 'Simulador', href: '/credit-simulator', icon: Calculator, permission: 'all' },
        { name: 'Crédito', href: '/credit-form', icon: FormInput, permission: 'all' },
        { name: 'Cobranças', href: '/cobrancas', icon: Phone, permission: 'all' },
        { name: 'Agentes', href: '/agentes', icon: UserCheck, permission: 'all' },
        { name: 'Relatórios', href: '/reports', icon: BarChart3, permission: 'all' },
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
      ];
    } else if (user?.role === 'cliente') {
      return [
        { name: 'Conta', href: '/conta', icon: Users, permission: 'conta' },
        { name: 'Histórico', href: '/historico', icon: FileText, permission: 'historico' },
        { name: 'Pedidos', href: '/pedidos', icon: FormInput, permission: 'pedidos' },
        { name: 'Novo Crédito', href: '/credit-form', icon: Calculator, permission: 'pedidos' },
      ];
    }
    return [];
  };

  const navigation = getNavigation();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-white">B</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <h1 className="text-sm font-bold text-sidebar-foreground">BOCHEL</h1>
              <p className="text-xs text-sidebar-foreground/70">Microcrédito</p>
            </div>
          )}
        </div>
        {user && !isCollapsed && (
          <div className="mt-2 text-xs text-sidebar-foreground/60 truncate">
            {user.name} - {user.role === 'gestor' ? 'Gestor' : user.role === 'agente' ? 'Agente' : 'Cliente'}
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? 'sr-only' : ''}>
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                if (!hasPermission(item.permission)) return null;
                
                const isActive = currentPath.startsWith(item.href);
                
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={isCollapsed ? item.name : undefined}
                    >
                      <Link to={item.href} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span className={isCollapsed ? 'sr-only' : ''}>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
