import React from 'react';
import { Bell, User, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../hooks/useAuth';
import { SidebarTrigger } from '../ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 bg-card shadow-sm border-b border-border">
      <div className="flex items-center justify-between px-3 md:px-6 py-3 md:py-4 gap-2">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <SidebarTrigger className="flex-shrink-0" />
          <div className="min-w-0">
            <h2 className="text-sm md:text-lg font-semibold text-foreground truncate">
              Sistema de Gestão de Microcrédito
            </h2>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Taxa: 25%/mês | Política AML ativa
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
            <Bell className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1 md:gap-2 h-8 md:h-10 px-2 md:px-3">
                <User className="h-4 w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline text-sm truncate max-w-[100px] md:max-w-none">{user?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
