import { useState, useRef, useEffect } from 'react';
import { Bell, Camera, LogOut, Eye, EyeOff, Key, Loader2, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { useClientAccess } from '../../hooks/useClientAccess';
import { useNavigate } from 'react-router-dom';
import { ChangePasswordDialog } from '../auth/ChangePasswordDialog';
import { ClientProfileDialog } from '../profile/ClientProfileDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { AlertTriangle, MessageCircle, CheckCheck, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileHeader() {
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const { notifications, unreadCount, unreadChat, unreadAlerts, markAllRead, markOneRead, clearAll } = useNotifications(user?.id);
    const { currentLoan } = useClientAccess();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showBalance, setShowBalance] = useState(false);

    // Calculate dynamic balance values
    const remainingAmount = currentLoan?.remaining_amount || 0;
    const totalAmount = currentLoan?.total_amount || 0;
    const paidPercentage = totalAmount > 0
        ? Math.round(((totalAmount - remainingAmount) / totalAmount) * 100)
        : 0;


    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const profilePhoto = user?.avatar_url;

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

        // Determine the role prefix for internal navigation
        const rolePrefix = user?.role === 'cliente' ? '' : `/${user?.role}`;

        if (notif.link_url) {
            if (notif.link_url.startsWith('http')) {
                window.open(notif.link_url, '_blank');
            } else {
                // Ensure internal links have the correct role prefix if they don't have it
                const finalUrl = notif.link_url.startsWith('/')
                    ? (notif.link_url.startsWith(rolePrefix) ? notif.link_url : `${rolePrefix}${notif.link_url}`)
                    : `${rolePrefix}/${notif.link_url}`;

                console.log(`[MobileHeader] Navigating to: ${finalUrl}`);
                navigate(finalUrl);
            }
        } else if (notif.type === 'chat' || notif.type === 'alert') {
            navigate(`${rolePrefix}/chat`);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        // Validate size (e.g., max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: 'Erro', description: 'A imagem deve ter no máximo 5MB', variant: 'destructive' });
            return;
        }

        setIsUploading(true);
        try {
            const ext = file.name.split('.').pop();
            const path = `${user.id}/${Date.now()}.${ext}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(path, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(path);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('user_id', user.id);

            if (updateError) throw updateError;

            if (refreshUser) await refreshUser();
            toast({ title: 'Sucesso', description: 'Foto de perfil atualizada!' });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            toast({ title: 'Erro', description: 'Não foi possível atualizar a foto.', variant: 'destructive' });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="md:hidden">
            {/* Top bar with profile and actions */}
            <div
                className="relative overflow-hidden"
            >
                {/* Background image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80)' }}
                />
                {/* Dark green overlay */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(11,58,32,0.92) 0%, rgba(20,90,50,0.88) 60%, rgba(26,107,60,0.85) 100%)' }} />

                {/* Top row: greeting + actions */}
                <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
                    <div className="flex items-center gap-3">
                        {user?.role === 'cliente' ? (
                            <ClientProfileDialog>
                                <button className="flex items-center gap-3 text-left focus:outline-none">
                                    {/* Profile photo */}
                                    <div className="relative group" onClick={(e) => { e.preventDefault(); e.stopPropagation(); fileInputRef.current?.click(); }}>
                                        {profilePhoto ? (
                                            <img
                                                src={profilePhoto}
                                                alt={user?.name || ''}
                                                className="w-11 h-11 rounded-full object-cover border-2 border-white/30 shadow-lg"
                                            />
                                        ) : (
                                            <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-white/30 shadow-lg" style={{ background: '#d37c22' }}>
                                                {user?.name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#d37c22] flex items-center justify-center border-2 border-[#0b3a20] transition-transform group-active:scale-95">
                                            {isUploading ? <Loader2 className="h-2.5 w-2.5 text-white animate-spin" /> : <Camera className="h-2.5 w-2.5 text-white" />}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-white/60 text-[10px] font-medium uppercase tracking-wider flex items-center gap-1">Ver Perfil <User className="w-3 h-3" /></p>
                                        <p className="text-white font-bold text-sm leading-tight">{user?.name || 'Cliente'}</p>
                                    </div>
                                </button>
                            </ClientProfileDialog>
                        ) : (
                            <div className="flex items-center gap-3 text-left">
                                {/* Profile photo */}
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    {profilePhoto ? (
                                        <img
                                            src={profilePhoto}
                                            alt={user?.name || ''}
                                            className="w-11 h-11 rounded-full object-cover border-2 border-white/30 shadow-lg"
                                        />
                                    ) : (
                                        <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-white/30 shadow-lg" style={{ background: '#d37c22' }}>
                                            {user?.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#d37c22] flex items-center justify-center border-2 border-[#0b3a20] transition-transform group-active:scale-95">
                                        {isUploading ? <Loader2 className="h-2.5 w-2.5 text-white animate-spin" /> : <Camera className="h-2.5 w-2.5 text-white" />}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-white/60 text-[10px] font-medium uppercase tracking-wider">Olá,</p>
                                    <p className="text-white font-bold text-sm leading-tight">{user?.name || 'Gestor'}</p>
                                </div>
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" disabled={isUploading} onChange={handlePhotoUpload} />
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Notification bell */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="relative w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                                >
                                    <Bell className="h-4 w-4 text-white" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-[#d37c22] text-[9px] font-bold text-white flex items-center justify-center px-1">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="end"
                                className="w-80 sm:w-[350px] border-border/50 bg-white/95 backdrop-blur-xl shadow-2xl p-0 overflow-hidden mt-2"
                            >
                                <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between bg-white">
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">Notificações</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                                            {unreadCount} pendentes
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {unreadChat > 0 && (
                                            <Badge className="bg-blue-100 text-blue-600 border-0 hover:bg-blue-100 h-5 px-1.5 text-[10px]">
                                                {unreadChat} <MessageCircle className="h-2.5 w-2.5 ml-0.5" />
                                            </Badge>
                                        )}
                                        {unreadAlerts > 0 && (
                                            <Badge className="bg-orange-100 text-[#d37c22] border-0 hover:bg-orange-100 h-5 px-1.5 text-[10px]">
                                                {unreadAlerts} <AlertTriangle className="h-2.5 w-2.5 ml-0.5" />
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <ScrollArea className="h-[400px] max-h-[60vh] overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="py-10 text-center">
                                            <Bell className="h-8 w-8 mx-auto text-gray-200 mb-2" />
                                            <p className="text-xs text-gray-400">Nenhuma notificação</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-50">
                                            {notifications.map((notif) => (
                                                <button
                                                    key={notif.id}
                                                    onClick={() => handleNotifClick(notif)}
                                                    className={cn(
                                                        'w-full text-left px-4 py-3.5 flex items-start gap-3 active:bg-gray-100 transition-colors',
                                                        !notif.read ? 'bg-orange-50/30' : 'bg-white'
                                                    )}
                                                >
                                                    <div className={cn(
                                                        'mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
                                                        notif.type === 'alert' ? 'bg-orange-100' : 'bg-blue-100'
                                                    )}>
                                                        {notif.type === 'alert'
                                                            ? <AlertTriangle className="h-4 w-4 text-[#d37c22]" />
                                                            : <MessageCircle className="h-4 w-4 text-blue-600" />
                                                        }
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-1 mb-0.5">
                                                            <p className={cn(
                                                                'text-xs font-bold leading-tight break-words',
                                                                !notif.read ? 'text-gray-900' : 'text-gray-500'
                                                            )}>
                                                                {notif.title}
                                                            </p>
                                                            <span className="text-[9px] text-gray-400 font-medium shrink-0">
                                                                {formatTime(notif.timestamp)}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-gray-500 leading-normal break-words">{notif.body}</p>
                                                    </div>

                                                    {!notif.read && (
                                                        <div className="w-2 h-2 rounded-full bg-[#d37c22] flex-shrink-0 mt-2 shadow-[0_0_8px_#d37c22]" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>

                                {notifications.length > 0 && (
                                    <div className="border-t border-border/50 p-2 flex items-center justify-between bg-gray-50/50">
                                        <button
                                            className="text-[10px] font-bold text-[#d37c22] flex items-center gap-1 px-3 py-1.5 rounded-lg active:bg-[#d37c22]/10 transition-colors"
                                            onClick={markAllRead}
                                        >
                                            <CheckCheck className="h-3 w-3" />
                                            Lidas
                                        </button>
                                        <button
                                            className="text-[10px] font-bold text-red-500 flex items-center gap-1 px-3 py-1.5 rounded-lg active:bg-red-50 transition-colors"
                                            onClick={clearAll}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                            Limpar
                                        </button>
                                    </div>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {/* Change Password */}
                        <ChangePasswordDialog>
                            <button
                                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                                title="Alterar Senha"
                            >
                                <Key className="h-4 w-4 text-white" />
                            </button>
                        </ChangePasswordDialog>
                        {/* Logout */}
                        <button
                            onClick={logout}
                            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-500/30 transition-colors"
                            title="Sair"
                        >
                            <LogOut className="h-4 w-4 text-white" />
                        </button>
                    </div>
                </div>

                {/* Debt summary card - Only for Clients */}
                {user?.role === 'cliente' && (
                    <div className="relative z-10 mx-4 mb-4 mt-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">Saldo Devedor</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    {showBalance ? (
                                        <p className="text-white text-2xl font-black tracking-tight">{remainingAmount.toLocaleString()} <span className="text-sm font-semibold text-white/60">MZN</span></p>
                                    ) : (
                                        <p className="text-white text-2xl font-black tracking-tight">••••••</p>
                                    )}
                                    <button
                                        onClick={() => setShowBalance(!showBalance)}
                                        className="p-1 rounded-full hover:bg-white/10 transition-colors"
                                    >
                                        {showBalance ? (
                                            <EyeOff className="h-4 w-4 text-white/50" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-white/50" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">Status</p>
                                <p className="text-[#d37c22] text-sm font-bold mt-0.5">
                                    {currentLoan ? (currentLoan.status === 'active' ? 'Ativo' : 'Pendente') : 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px]">
                                <span className="text-white/40 font-medium">Progresso de pagamento</span>
                                <span className="text-[#d37c22] font-bold">{paidPercentage}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${paidPercentage}%`, background: 'linear-gradient(90deg, #d37c22, #e8943a)' }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick action pills - Only for Clients */}
                {user?.role === 'cliente' && (
                    <div className="relative z-10 flex items-center gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => navigate('/credit-form')}
                            className="flex-shrink-0 px-4 py-2 rounded-full text-white text-xs font-bold shadow-lg"
                            style={{ background: '#d37c22' }}
                        >
                            + Novo Crédito
                        </button>
                        <button
                            onClick={() => navigate('/historico')}
                            className="flex-shrink-0 px-4 py-2 rounded-full bg-white/10 text-white/80 text-xs font-medium border border-white/15 hover:bg-white/15 transition-colors"
                        >
                            Histórico
                        </button>
                        <button
                            onClick={() => navigate('/pedidos')}
                            className="flex-shrink-0 px-4 py-2 rounded-full bg-white/10 text-white/80 text-xs font-medium border border-white/15 hover:bg-white/15 transition-colors"
                        >
                            Meus Pedidos
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
