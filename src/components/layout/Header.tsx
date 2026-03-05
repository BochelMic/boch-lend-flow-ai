import React, { useState } from 'react';
import { Bell, User, LogOut, ChevronDown, MessageCircle, AlertTriangle, Check, Trash2, CheckCheck, Eye, EyeOff, Key } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { useClientAccess } from '../../hooks/useClientAccess';
import { SidebarTrigger } from '../ui/sidebar';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { ChangePasswordDialog } from '../auth/ChangePasswordDialog';
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
  const navigate = useNavigate();
  const role = roleLabel[user?.role ?? ''] ?? { label: user?.role ?? '', color: 'bg-muted text-muted-foreground border-border' };
  const { notifications, unreadCount, unreadChat, unreadAlerts, markAllRead, markOneRead, clearAll } = useNotifications(user?.id);
  const { currentLoan } = useClientAccess();
  const [showBalance, setShowBalance] = useState(false);

  const remainingAmount = currentLoan?.remaining_amount || 0;

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diffMin < 1) return 'agora';
    if (diffMin < 60) return `${diffMin}m atrás`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h atrás`;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const handleNotifClick = (notif: typeof notifications[0]) => {
    markOneRead(notif.id);
    if (notif.link_url) {
      if (notif.link_url.startsWith('http')) {
        window.open(notif.link_url, '_blank');
      } else {
        navigate(notif.link_url);
      }
    } else if (notif.type === 'chat' || notif.type === 'alert') {
      const prefix = user?.role === 'cliente' ? '' : `/${user?.role}`;
      navigate(`${prefix}/chat`);
    }
  };

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200/60 bg-white/95 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-3.5 gap-2">
        {/* Left */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <SidebarTrigger className="flex-shrink-0 h-9 w-9 text-gray-400 hover:text-[#0b3a20] hover:bg-gray-100 rounded-xl transition-colors" />
          <div className="hidden sm:block min-w-0">
            <p className="text-[11px] text-gray-400 font-medium">Bem-vindo(a),</p>
            <h2 className="text-sm font-bold text-gray-800 truncate leading-tight">
              {user?.name || 'Utilizador'}
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

          {/* Client Balance Toggle (Desktop) */}
          {user?.role === 'cliente' && (
            <div className="hidden md:flex items-center gap-2 bg-secondary/10 px-3 py-1.5 rounded-lg border border-secondary/20 mr-2">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-secondary/70 leading-none">Saldo Devedor</span>
                {showBalance ? (
                  <span className="text-sm font-black text-secondary leading-none mt-0.5">{remainingAmount.toLocaleString()} MZN</span>
                ) : (
                  <span className="text-sm font-black text-secondary leading-none mt-0.5">••••••</span>
                )}
              </div>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-1 rounded-md hover:bg-secondary/20 transition-colors text-secondary/70 ml-1"
                title={showBalance ? "Ocultar Saldo" : "Mostrar Saldo"}
              >
                {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          )}

          {/* ── Notifications Bell ── */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:h-9 md:w-9 relative text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-primary text-[9px] font-black text-primary-foreground flex items-center justify-center px-1 shadow-primary animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-80 border-border/50 bg-card/95 backdrop-blur-xl shadow-large p-0 overflow-hidden"
            >
              {/* Header do dropdown */}
              <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground">Notificações</p>
                  {unreadCount > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      {unreadCount} não {unreadCount === 1 ? 'lida' : 'lidas'}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Tudo em dia</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {/* Contadores por tipo */}
                  {unreadChat > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                      <MessageCircle className="h-3 w-3" />
                      {unreadChat}
                    </span>
                  )}
                  {unreadAlerts > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-warning/15 text-warning">
                      <AlertTriangle className="h-3 w-3" />
                      {unreadAlerts}
                    </span>
                  )}
                </div>
              </div>

              {/* Lista */}
              <ScrollArea className="max-h-72">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center">
                    <Bell className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">Sem notificações</p>
                  </div>
                ) : (
                  <div className="py-1">
                    {notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => handleNotifClick(notif)}
                        className={cn(
                          'w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-muted/50 transition-colors border-b border-border/20 last:border-0',
                          !notif.read && 'bg-primary/5'
                        )}
                      >
                        {/* Ícone */}
                        <div className={cn(
                          'mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                          notif.type === 'alert' ? 'bg-warning/15' : 'bg-primary/15'
                        )}>
                          {notif.type === 'alert'
                            ? <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                            : <MessageCircle className="h-3.5 w-3.5 text-primary" />
                          }
                        </div>

                        {/* Conteúdo */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={cn(
                              'text-xs font-semibold truncate',
                              !notif.read ? 'text-foreground' : 'text-muted-foreground'
                            )}>
                              {notif.title}
                            </p>
                            <span className="text-[10px] text-muted-foreground/60 flex-shrink-0">
                              {formatTime(notif.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{notif.body}</p>
                        </div>

                        {/* Dot não lida */}
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="border-t border-border/50 px-3 py-2 flex items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                    onClick={markAllRead}
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Marcar lidas
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={clearAll}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Limpar
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

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
              <ChangePasswordDialog>
                <DropdownMenuItem className="text-sm gap-2 cursor-pointer mx-1 mb-1 rounded-md" onSelect={(e) => e.preventDefault()}>
                  <Key className="h-4 w-4" />
                  Alterar Senha
                </DropdownMenuItem>
              </ChangePasswordDialog>
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
