
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

  // Definir navegação baseada no papel do usuário
  const getNavigation = () => {
    if (user?.role === 'gestor') {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'all' },
        { name: 'Gestão de Clientes', href: '/clientes', icon: Users, permission: 'all' },
        { name: 'Gestão de Empréstimos', href: '/emprestimos', icon: CreditCard, permission: 'all' },
        { name: 'Simulador de Crédito', href: '/credit-simulator', icon: Calculator, permission: 'all' },
        { name: 'Formulário de Crédito', href: '/credit-form', icon: FormInput, permission: 'all' },
        { name: 'Pagamentos e Cobranças', href: '/cobrancas', icon: Phone, permission: 'all' },
        { name: 'Caixa e Tesouraria', href: '/caixa', icon: Wallet, permission: 'all' },
        { name: 'Gestão de Agentes', href: '/agentes', icon: UserCheck, permission: 'all' },
        { name: 'Auditoria', href: '/audit', icon: ShieldCheck, permission: 'all' },
        { name: 'Relatórios', href: '/reports', icon: BarChart3, permission: 'all' },
        { name: 'Relatório BM', href: '/bank-report', icon: Building2, permission: 'all' },
        { name: 'Administração', href: '/admin', icon: Settings, permission: 'all' },
        { name: 'Configurações', href: '/settings', icon: Settings, permission: 'all' },
      ];
    } else if (user?.role === 'agente') {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'clientes' },
        { name: 'Meus Clientes', href: '/clientes', icon: Users, permission: 'clientes' },
        { name: 'Empréstimos', href: '/emprestimos', icon: CreditCard, permission: 'emprestimos' },
        { name: 'Simulador de Crédito', href: '/credit-simulator', icon: Calculator, permission: 'emprestimos' },
        { name: 'Formulário de Crédito', href: '/credit-form', icon: FormInput, permission: 'emprestimos' },
        { name: 'Cobranças', href: '/cobrancas', icon: Phone, permission: 'cobrancas' },
        { name: 'Pagamentos', href: '/pagamentos', icon: DollarSign, permission: 'pagamentos' },
      ];
    } else if (user?.role === 'cliente') {
      return [
        { name: 'Minha Conta', href: '/conta', icon: Users, permission: 'conta' },
        { name: 'Histórico', href: '/historico', icon: FileText, permission: 'historico' },
        { name: 'Meus Pedidos', href: '/pedidos', icon: FormInput, permission: 'pedidos' },
        { name: 'Solicitar Crédito', href: '/credit-form', icon: Calculator, permission: 'pedidos' },
      ];
    }
    return [];
  };

  const navigation = getNavigation();

  return (
    <div className="w-64 bg-gray-800 text-white border-r border-gray-700">
      <div className="p-6">
        <h1 className="text-xl font-bold">BOCHEL MICROCREDITO</h1>
        <p className="text-gray-300 text-sm">Sistema de Gestão</p>
        {user && (
          <div className="mt-2 text-xs text-gray-400">
            {user.name} - {user.role === 'gestor' ? 'Gestor' : user.role === 'agente' ? 'Agente' : 'Cliente'}
          </div>
        )}
      </div>
      
      <nav className="mt-6">
        {navigation.map((item) => {
          if (!hasPermission(item.permission)) return null;
          
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-6 py-3 text-sm font-medium transition-colors',
                isActive 
                  ? 'bg-gray-700 text-white border-r-2 border-primary' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
