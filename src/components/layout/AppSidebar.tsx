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
    const chatItem = { name: 'Chat', href: '/chat', icon: MessageCircle, permission: 'chat' };
    
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
        chatItem,
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

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-2 md:p-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-xs md:text-sm font-bold text-white">B</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <h1 className="text-xs md:text-sm font-bold text-sidebar-foreground">BOCHEL</h1>
              <p className="text-[10px] md:text-xs text-sidebar-foreground/70">Microcrédito</p>
            </div>
          )}
        </div>
        {user && !isCollapsed && (
          <div className="mt-1 text-[10px] md:text-xs text-sidebar-foreground/60 truncate">
            {user.name} - {user.role === 'gestor' ? 'Gestor' : user.role === 'agente' ? 'Agente' : 'Cliente'}
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="p-1 md:p-2">
          <SidebarGroupLabel className={isCollapsed ? 'sr-only' : 'text-[10px] md:text-xs'}>
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                if (item.permission !== 'chat' && !hasPermission(item.permission)) return null;
                
                const isActive = currentPath.startsWith(item.href);
                
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={isCollapsed ? item.name : undefined}
                      className="h-8 md:h-9"
                    >
                      <Link to={item.href} className="flex items-center gap-2 md:gap-3">
                        <item.icon className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
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
    </Sidebar>
  );
}
