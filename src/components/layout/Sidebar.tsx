
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
  FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Administração', href: '/admin', icon: Settings },
  { name: 'Crédito e Risco', href: '/credit', icon: CreditCard },
  { name: 'Jurídico', href: '/legal', icon: Scale },
  { name: 'Operações', href: '/operations', icon: FileText },
  { name: 'Marketing', href: '/marketing', icon: TrendingUp },
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
      
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-blue-800 p-3 rounded">
          <div className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            <div>
              <p className="text-xs font-medium">Compliance</p>
              <p className="text-xs text-blue-200">Anti-lavagem ativo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
