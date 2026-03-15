import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Landmark, Smartphone, MessageCircle, AlertCircle, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const ClientPaymentsModule = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [activeLoan, setActiveLoan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (user) {
            loadActiveLoan();
        }
    }, [user]);

    const loadActiveLoan = async () => {
        try {
            const { data: clientData } = await supabase
                .from('clients')
                .select('id')
                .eq('user_id', user?.id)
                .limit(1)
                .single();

            if (clientData) {
                const { data: loanData, error } = await supabase
                    .from('loans')
                    .select('*, clients(*)')
                    .eq('client_id', clientData.id)
                    .in('status', ['active', 'overdue'])
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (loanData && !error) {
                    setActiveLoan(loanData);
                }
            }
        } catch (error) {
            console.error('Error loading loan:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedStates({ ...copiedStates, [id]: true });
        toast({
            title: "Copiado!",
            description: "Número copiado para a área de transferência.",
        });
        setTimeout(() => {
            setCopiedStates((prev) => ({ ...prev, [id]: false }));
        }, 2000);
    };

    const banks = [
        { name: 'BCI', account: '000800000215226910113', icon: <Landmark className="h-5 w-5 text-blue-700" /> },
        { name: 'MOZA', account: '003400004126983810129', icon: <Landmark className="h-5 w-5 text-orange-600" /> },
        { name: 'BIM', account: '000100000035411644657', icon: <Landmark className="h-5 w-5 text-red-600" /> },
    ];

    const mobileMoney = [
        { name: 'M-PESA', account: '845828205', icon: <Smartphone className="h-5 w-5 text-[#E63B2E]" /> },
        { name: 'E-MOLA', account: '861887302', icon: <Smartphone className="h-5 w-5 text-yellow-500" /> },
    ];

    const CopyButton = ({ text, id }: { text: string; id: string }) => (
        <button
            onClick={() => copyToClipboard(text, id)}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-700"
            aria-label="Copiar"
        >
            {copiedStates[id] ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </button>
    );

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1a3a5c]">Fazer Pagamento</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Pague as suas prestações através dos nossos canais oficiais
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a3a5c]"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Left Column - Loan Status */}
                    <div className="md:col-span-1 space-y-4">
                        <Card className="border-0 shadow-md bg-gradient-to-br from-[#1a3a5c] to-[#0f2a4a] text-white">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-medium text-blue-100 flex items-center justify-between">
                                    Resumo do Empréstimo
                                    {activeLoan && (
                                        <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                                            {activeLoan.status === 'overdue' ? 'Em Atraso' : 'Activo'}
                                        </Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {activeLoan ? (
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-blue-200 text-sm">Saldo Devedor Actual</p>
                                            <h2 className="text-3xl font-bold">MZN {Number(activeLoan.remaining_amount).toLocaleString()}</h2>
                                        </div>

                                        <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <p className="text-blue-200">Valor Total</p>
                                                <p className="font-semibold">MZN {Number(activeLoan.total_amount).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-blue-200">Prestações</p>
                                                <p className="font-semibold">{activeLoan.installments}x {activeLoan.is_installment ? `(${activeLoan.installments - activeLoan.remaining_installments + 1}ª parcela)` : ''}</p>
                                            </div>
                                        </div>

                                        {activeLoan.is_installment && (
                                            <div className="pt-3 border-t border-white/10">
                                                <p className="text-blue-200 text-xs mb-1">Próxima Parcela (Estimada)</p>
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-xl font-bold">
                                                        MZN {(activeLoan.amortization_plan?.find((p: any) => p.installmentNumber === (activeLoan.installments - activeLoan.remaining_installments + 1))?.total || Math.round(activeLoan.total_amount / activeLoan.installments)).toLocaleString()}
                                                    </h3>
                                                    <Badge className="bg-amber-500/20 text-amber-200 border-amber-500/30">Opção {activeLoan.credit_option}</Badge>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="py-4 text-center">
                                        <AlertCircle className="h-10 w-10 mx-auto text-blue-200 mb-2 opacity-50" />
                                        <p className="text-blue-100 font-medium">Não tem nenhum empréstimo activo neste momento.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-900 shadow-sm">
                            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-bold mb-1 uppercase tracking-wider text-[11px] text-amber-700">Importante</p>
                                <p>O seu limite de crédito depende do seu bom histórico de pagamentos. Pague a tempo para obter melhores condições no futuro.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Payment Methods */}
                    <div className="md:col-span-2 space-y-4">
                        <Card className="border-0 shadow-md">
                            <CardHeader className="pb-3 border-b border-gray-100">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-[#1a3a5c]" />
                                    Contas Bancárias
                                </CardTitle>
                                <CardDescription>Transferência via Banco ou Internet Banking</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-center border border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Titular da Conta</p>
                                    <p className="font-bold text-[#1a3a5c]">Armindo Dique Bochiwe</p>
                                </div>

                                {banks.map((bank) => (
                                    <div key={bank.name} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors bg-white">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                                                {bank.icon}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">{bank.name}</p>
                                                <p className="text-sm font-mono text-gray-600 font-medium tracking-wide">{bank.account}</p>
                                            </div>
                                        </div>
                                        <CopyButton text={bank.account} id={bank.name} />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-md">
                            <CardHeader className="pb-3 border-b border-gray-100">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Smartphone className="h-5 w-5 text-[#1a3a5c]" />
                                    Conta Móvel
                                </CardTitle>
                                <CardDescription>Pagamento via carteira móvel</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-center border border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Titular da Conta</p>
                                    <p className="font-bold text-[#1a3a5c]">Armindo Dique Bochiwe</p>
                                </div>

                                {mobileMoney.map((mobile) => (
                                    <div key={mobile.name} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors bg-white">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                                                {mobile.icon}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">{mobile.name}</p>
                                                <p className="text-lg font-mono text-gray-800 font-bold tracking-wider">{mobile.account}</p>
                                            </div>
                                        </div>
                                        <CopyButton text={mobile.account} id={mobile.name} />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Notification Instructions */}
                        <Card className="border-2 border-green-100 bg-green-50/50 shadow-sm overflow-hidden">
                            <div className="bg-green-600 text-white p-3 text-center sm:text-left sm:flex items-center justify-between">
                                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 sm:mb-0">
                                    <Check className="h-5 w-5" />
                                    <span className="font-bold">Já efectuou o pagamento?</span>
                                </div>
                            </div>
                            <CardContent className="p-4 sm:p-5">
                                <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                                    Para que o seu pagamento seja processado rapidamente e o seu saldo actualizado, é <strong>obrigatório enviar o comprovativo</strong> de pagamento à nossa equipa.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white shadow-md font-medium h-11"
                                        onClick={() => window.open('https://wa.me/258861887302?text=Olá, acabei de efectuar o pagamento da minha prestação. Segue o comprovativo:', '_blank')}
                                    >
                                        <MessageCircle className="mr-2 h-4 w-4" />
                                        Enviar por WhatsApp
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-[#1a3a5c] text-[#1a3a5c] hover:bg-[#1a3a5c] hover:text-white transition-colors h-11"
                                        onClick={() => navigate('/chat')}
                                    >
                                        <MessageCircle className="mr-2 h-4 w-4" />
                                        Chat Interno
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientPaymentsModule;
