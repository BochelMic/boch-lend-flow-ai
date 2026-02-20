import React from 'react';
import { Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../hooks/useAuth';
import { SidebarTrigger } from '../ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const roleLabel: Record<string, { label: string; color: string }> = {
  gestor: { label: 'Gestor', color: 'bg-primary/15 text-primary border-primary/25' },
  agente: { label: 'Agente', color: 'bg-accent/15 text-accent border-accent/25' },
  cliente: { label: 'Cliente', color: 'bg-secondary/15 text-secondary border-secondary/25' },
};

const Header = () => {
  const { user, logout } = useAuth();
  const role = roleLabel[user?.role ?? ''] ?? { label: user?.role ?? '', color: 'bg-muted text-muted-foreground border-border' };

  return (
    <header className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-xl shadow-soft">
      <div className="flex items-center justify-between px-3 py-2.5 md:px-5 md:py-3 gap-2">
        {/* Left */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <SidebarTrigger className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors" />
          <div className="hidden sm:block min-w-0">
            <p className="text-[10px] text-muted-foreground/60 leading-none uppercase tracking-widest font-medium">Bochel Microcrédito</p>
            <h2 className="text-sm md:text-base font-bold text-foreground truncate leading-tight mt-0.5">
              Sistema de Gestão
            </h2>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
          {/* Role badge */}
          <Badge
            variant="outline"
            className={`hidden sm:flex text-[10px] px-2 py-0.5 font-semibold border uppercase tracking-wide ${role.color}`}
          >
            {role.label}
          </Badge>

          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 md:h-9 md:w-9 relative text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary shadow-primary" />
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-8 md:h-9 px-2 md:px-3 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-primary">
                  <span className="text-xs font-bold text-white">{user?.name?.[0]?.toUpperCase()}</span>
                </div>
                <span className="hidden md:inline text-sm font-medium truncate max-w-[100px]">
                  {user?.name}
                </span>
                <ChevronDown className="hidden md:block h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 border-border/50 bg-card/95 backdrop-blur-xl shadow-large">
              <div className="px-3 py-2.5">
                <p className="text-sm font-bold text-foreground truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem onClick={logout} className="text-sm text-destructive focus:text-destructive focus:bg-destructive/10 gap-2 cursor-pointer mx-1 mb-1 rounded-md">
                <LogOut className="h-4 w-4" />
                Terminar sessão
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
