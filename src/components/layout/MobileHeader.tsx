import { useState, useRef } from 'react';
import { Bell, Camera, LogOut, Eye, EyeOff, Key } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { useClientAccess } from '../../hooks/useClientAccess';
import { useNavigate } from 'react-router-dom';
import { ChangePasswordDialog } from '../auth/ChangePasswordDialog';

export default function MobileHeader() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { unreadCount } = useNotifications(user?.id);
    const { currentLoan } = useClientAccess();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showBalance, setShowBalance] = useState(false);

    // Calculate dynamic balance values
    const remainingAmount = currentLoan?.remaining_amount || 0;
    const totalAmount = currentLoan?.total_amount || 0;
    const paidPercentage = totalAmount > 0
        ? Math.round(((totalAmount - remainingAmount) / totalAmount) * 100)
        : 0;


    // Profile photo from localStorage
    const storageKey = `profile_photo_${user?.id || 'default'}`;
    const [profilePhoto, setProfilePhoto] = useState<string | null>(() => {
        try { return localStorage.getItem(storageKey); } catch { return null; }
    });

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string;
            setProfilePhoto(dataUrl);
            try { localStorage.setItem(storageKey, dataUrl); } catch { }
        };
        reader.readAsDataURL(file);
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
                        {/* Profile photo */}
                        <div className="relative" onClick={() => fileInputRef.current?.click()}>
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
                            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#d37c22] flex items-center justify-center border-2 border-[#0b3a20]">
                                <Camera className="h-2.5 w-2.5 text-white" />
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                        </div>

                        <div>
                            <p className="text-white/60 text-[10px] font-medium uppercase tracking-wider">Olá,</p>
                            <p className="text-white font-bold text-sm leading-tight">{user?.name || 'Cliente'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Notification bell */}
                        <button
                            onClick={() => navigate('/notifications')}
                            className="relative w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                            <Bell className="h-4 w-4 text-white" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-[#d37c22] text-[9px] font-bold text-white flex items-center justify-center px-1">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>
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
