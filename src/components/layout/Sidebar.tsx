
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
  UserCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Administração', href: '/admin', icon: Settings },
  { name: 'Recursos Humanos', href: '/hr', icon: UserCheck },
  { name: 'Crédito e Risco', href: '/credit', icon: CreditCard },
  { name: 'Simulador de Crédito', href: '/credit-simulator', icon: Calculator },
  { name: 'Formulário de Crédito', href: '/credit-form', icon: FormInput },
  { name: 'Saldo Disponível', href: '/balance', icon: ArrowUpDown },
  { name: 'Despesas', href: '/expenses', icon: Receipt },
  { name: 'Cobrança', href: '/collection', icon: Phone },
  { name: 'Jurídico', href: '/legal', icon: Scale },
  { name: 'Operações', href: '/operations', icon: FileText },
  { name: 'Marketing', href: '/marketing', icon: TrendingUp },
  { name: 'Notificações', href: '/notifications', icon: Bell },
  { name: 'Auditoria', href: '/audit', icon: ShieldCheck },
  { name: 'Caixa', href: '/cashflow', icon: Wallet },
  { name: 'Relatórios', href: '/reports', icon: BarChart3 },
  { name: 'Relatório BM', href: '/bank-report', icon: Building2 },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 bg-blue-900 text-white">
      <div className="p-6">
        <h1 className="text-xl font-bold">BOCHEL MICROCREDITO</h1>
        <p className="text-blue-200 text-sm">Sistema de Gestão</p>
      </div>
      
      <nav className="mt-6">
        {navigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-6 py-3 text-sm font-medium transition-colors',
                isActive 
                  ? 'bg-blue-800 text-white border-r-2 border-blue-300' 
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
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
