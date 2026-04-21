import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { User, History, CreditCard, CheckCircle, AlertTriangle, Camera, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '../../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { toast } from 'sonner';

export interface ClientProfileDialogProps {
    children?: React.ReactNode;
    clientData?: {
        id: string;
        name: string;
        email?: string;
        phone?: string;
    };
}

export const ClientProfileDialog = ({ children, clientData }: ClientProfileDialogProps) => {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [stats, setStats] = useState({
        totalLoans: 0,
        paidLoans: 0,
        activeDebt: 0,
        totalBorrowed: 0,
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Local state for when viewing OTHER users' profiles
    const [clientAvatarUrl, setClientAvatarUrl] = useState<string | null>(null);

    // Current effective avatar
    const avatarUrl = clientData ? clientAvatarUrl : user?.avatar_url;

    useEffect(() => {
        if (open) {
            fetchStats();
            if (clientData) fetchClientAvatar();
        }
    }, [open, user?.id, clientData?.id]);

    const fetchClientAvatar = async () => {
        try {
            if (!clientData?.id) return;

            // First get user_id from client
            const { data: client } = await supabase
                .from('clients')
                .select('user_id')
                .eq('id', clientData.id)
                .single();

            if (client?.user_id) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('avatar_url')
                    .eq('user_id', client.user_id)
                    .single();

                if (profile?.avatar_url) {
                    setClientAvatarUrl(profile.avatar_url);
                }
            }
        } catch (error) {
            console.error('Error fetching client avatar:', error);
        }
    };

    const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            const file = event.target.files?.[0];
            if (!file || !user?.id) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 1. Upload to bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 3. Update profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('user_id', user.id);

            if (updateError) throw updateError;

            toast.success('Foto de perfil atualizada!');
            if (refreshUser) await refreshUser();
        } catch (error: any) {
            toast.error('Erro ao carregar foto: ' + error.message);
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            let targetClientId = clientData?.id;

            // Se não foi passado um cliente específico, busca o id do cliente logado
            if (!targetClientId && user?.id) {
                const { data: clients } = await supabase
                    .from('clients')
                    .select('id')
                    .eq('user_id', user?.id)
                    .single();

                if (clients) {
                    targetClientId = clients.id;
                }
            }

            if (targetClientId) {
                const { data: loans } = await supabase
                    .from('loans')
                    .select('status, amount, remaining_amount')
                    .eq('client_id', targetClientId);

                let total = 0;
                let paid = 0;
                let debt = 0;
                let borrowed = 0;

                loans?.forEach((loan) => {
                    total++;
                    borrowed += Number(loan.amount) || 0;
                    if (loan.status === 'completed') {
                        paid++;
                    } else if (loan.status === 'active' || loan.status === 'overdue') {
                        debt++;
                    }
                });

                setStats({
                    totalLoans: total,
                    paidLoans: paid,
                    activeDebt: debt,
                    totalBorrowed: borrowed,
                });
            }
        } catch (error) {
            console.error('Erro ao buscar estatísticas do cliente:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoToHistory = () => {
        setOpen(false);
        if (clientData && user?.role !== 'cliente') {
            const prefix = user?.role === 'gestor' ? '/gestor' : '/agente';
            navigate(`${prefix}/emprestimos`);
        } else {
            navigate('/historico');
        }
    };

    const displayName = clientData?.name || user?.name || 'Cliente';
    const displayEmail = clientData?.email || user?.email || '';
    const initial = displayName?.[0]?.toUpperCase() || 'U';

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <DropdownMenuItem className="text-sm gap-2 cursor-pointer mx-1 mb-1 rounded-md" onSelect={(e) => {
                        e.preventDefault();
                        setOpen(true);
                    }}>
                        <User className="h-4 w-4" />
                        Meu Perfil e Resumo
                    </DropdownMenuItem>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white border border-gray-100 shadow-2xl rounded-2xl p-0 overflow-hidden">
                <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 p-6 border-b border-gray-100 flex items-center gap-4">
                    <div className="relative group">
                        <div className="h-20 w-20 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg border-4 border-white flex-shrink-0 overflow-hidden">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold text-white uppercase">{initial}</span>
                            )}
                        </div>
                        {!clientData && (
                            <label className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md cursor-pointer border border-gray-100 hover:bg-gray-50 transition-colors">
                                {uploading ? <Loader2 className="h-4 w-4 animate-spin text-secondary" /> : <Camera className="h-4 w-4 text-secondary" />}
                                <input type="file" className="hidden" accept="image/*" onChange={handleUploadAvatar} disabled={uploading} />
                            </label>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
                        {displayEmail && <p className="text-sm text-gray-500">{displayEmail}</p>}
                        {clientData?.phone && <p className="text-sm text-gray-500">{clientData.phone}</p>}
                        <p className="text-xs font-semibold text-secondary mt-1 bg-secondary/10 inline-block px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {clientData ? 'Perfil do Cliente' : 'Meu Perfil'}
                        </p>
                    </div>
                </div>

                <div className="p-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Resumo de Empréstimos</h3>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-3 border-gray-200 border-t-secondary rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                                <CreditCard className="h-6 w-6 text-blue-500 mb-2" />
                                <span className="text-2xl font-black text-gray-900">{stats.totalLoans}</span>
                                <span className="text-xs font-medium text-gray-500 uppercase">Total Pedidos</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                                <CheckCircle className="h-6 w-6 text-success mb-2" />
                                <span className="text-2xl font-black text-success">{stats.paidLoans}</span>
                                <span className="text-xs font-medium text-gray-500 uppercase">Pagos</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center text-center col-span-2">
                                <AlertTriangle className="h-6 w-6 text-warning mb-2" />
                                <span className="text-2xl font-black text-warning">{stats.activeDebt}</span>
                                <span className="text-xs font-medium text-gray-500 uppercase">Em Dívida / Ativos</span>
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={handleGoToHistory}
                        className="w-full h-12 text-base font-bold text-white shadow-lg hover:shadow-xl transition-all"
                        style={{ backgroundColor: '#0b3a20' }}
                    >
                        <History className="h-5 w-5 mr-2" />
                        Ver Histórico Completo
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

