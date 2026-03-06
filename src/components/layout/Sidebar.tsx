
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Scale,
  Settings,
  TrendingUp,
  Shield,
  FileText,
  Calculator,
  Building2,
  BarChart3,
  Receipt,
  Phone,
  ShieldCheck,
  Bell,
  Wallet,
  ArrowUpDown,
  FormInput,
  UserCheck,
  DollarSign,
  Briefcase,
  Globe,
  HelpCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const location = useLocation();
  const { user, hasPermission } = useAuth();

  // Definir navegação baseada no papel do usuário - simplificada
  const getNavigation = () => {
    if (user?.role === 'gestor') {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'all' },
        { name: 'Pedidos', href: '/credit-requests', icon: FormInput, permission: 'all' },
        { name: 'Clientes', href: '/clientes', icon: Users, permission: 'all' },
        { name: 'Empréstimos', href: '/emprestimos', icon: CreditCard, permission: 'all' },
        { name: 'Simulador', href: '/credit-simulator', icon: Calculator, permission: 'all' },
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

  return (
    <div className="w-full md:w-64 bg-card border-r border-border">
      <div className="p-4 md:p-6">
        <h1 className="text-lg md:text-xl font-bold text-foreground">BOCHEL</h1>
        <p className="text-muted-foreground text-xs md:text-sm">Microcrédito</p>
        {user && (
          <div className="mt-2 text-xs text-muted-foreground">
            {user.name} - {user.role === 'gestor' ? 'Gestor' : user.role === 'agente' ? 'Agente' : 'Cliente'}
          </div>
        )}
      </div>

      <nav className="mt-2 md:mt-6">
        {navigation.map((item) => {
          if (!hasPermission(item.permission)) return null;

          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-4 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary border-r-2 border-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <item.icon className="mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden md:inline">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
