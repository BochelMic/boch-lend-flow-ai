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
      <div className="flex items-center justify-between px-2 py-2 md:px-4 md:py-3 gap-1">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <SidebarTrigger className="flex-shrink-0 h-8 w-8" />
          <div className="min-w-0">
            <h2 className="text-xs md:text-base font-semibold text-foreground truncate">
              Gestão Microcrédito
            </h2>
            <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">
              Taxa: 25%/mês
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-0.5 md:gap-2 flex-shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7 md:h-9 md:w-9">
            <Bell className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1 h-7 md:h-9 px-1.5 md:px-2">
                <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden md:inline text-xs truncate max-w-[80px]">{user?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={logout} className="text-sm">
                <LogOut className="mr-2 h-3.5 w-3.5" />
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
