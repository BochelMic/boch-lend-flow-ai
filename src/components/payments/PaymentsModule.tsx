
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Plus, Filter, Wallet, Receipt, DollarSign, Download, Printer, Loader2, Calendar, MapPin, Phone, Mail, User, Clock, CheckCircle, Info, TrendingDown, Check, ArrowUpRight, ChevronRight, RefreshCw } from 'lucide-react';
import { calculateSmartSettlement } from '@/utils/creditUtils';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateReceiptHTML, downloadDocumentAsPdf } from '../../utils/exportUtils';
import { notifyEvent } from '@/utils/notifyEvent';
import { cn } from '@/lib/utils';

interface Payment {
  id: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  loan_client_name?: string;
  client_data?: any;
}

interface ActiveLoan {
  id: string;
  client_name: string;
  user_id: string | null;
  client_data?: any;
  remaining_amount: number;
  total_amount: number;
  installments: number;
  is_installment: boolean;
  credit_option: string;
  remaining_installments: number;
  amortization_plan?: any[];
}

const PaymentsModule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayTotal, setTodayTotal] = useState(0);
  const [companySettings, setCompanySettings] = useState<any>(null);

  // Success Dialog State
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [lastSavedPayment, setLastSavedPayment] = useState<Payment | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    loanId: '', amount: '', method: 'cash', date: new Date().toISOString().split('T')[0], notes: ''
  });

  useEffect(() => {
    loadPayments();
    loadActiveLoans();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await supabase.from('system_settings').select('*').limit(1).single();
      if (data) setCompanySettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadPayments = async () => {
    try {
      let query = supabase
        .from('payments')
        .select('*, loans!inner(agent_id, clients(*))')
        .order('created_at', { ascending: false })
        .limit(50);

      if (user?.role === 'agente') {
        query = query.eq('loans.agent_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mapped = (data || []).map((p: any) => ({
        ...p,
        loan_client_name: p.loans?.clients?.name || 'Desconhecido',
        client_data: p.loans?.clients || null,
      }));
      setPayments(mapped);

      // Calcular total de hoje
      const today = new Date().toISOString().split('T')[0];
      const todayPayments = mapped.filter((p: Payment) => p.payment_date === today);
      setTodayTotal(todayPayments.reduce((sum: number, p: Payment) => sum + Number(p.amount), 0));
    } catch (error: any) {
      console.error('Error loading payments:', error?.message || error);
      toast({ title: 'Erro de Conexão', description: 'Não foi possível carregar o histórico de pagamentos.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadActiveLoans = async () => {
    try {
      let query = supabase
        .from('loans')
        .select(`
          id, 
          agent_id,
          remaining_amount, 
          total_amount, 
          installments, 
          is_installment, 
          credit_option, 
          remaining_installments, 
          amortization_plan,
          clients(*)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (user?.role === 'agente') {
        query = query.eq('agent_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mapped = (data || []).map((l: any) => ({
        id: l.id,
        client_name: l.clients?.name || 'Desconhecido',
        user_id: l.clients?.user_id || null,
        client_data: l.clients || null,
        remaining_amount: Number(l.remaining_amount),
        total_amount: Number(l.total_amount),
        installments: l.installments,
        is_installment: l.is_installment || false,
        credit_option: l.credit_option || '?',
        remaining_installments: l.remaining_installments,
        amortization_plan: l.amortization_plan,
      }));
      setActiveLoans(mapped);
    } catch (error: any) {
      console.error('Error loading active loans:', error?.message || error);
      toast({ title: 'Erro de Dados', description: 'Ocorreu um problema ao carregar os empréstimos activos.', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.loanId || !formData.amount) {
      toast({ title: 'Erro', description: 'Selecione o empréstimo e valor.', variant: 'destructive' });
      return;
    }

    const amount = parseFloat(formData.amount);
    const selectedLoan = activeLoans.find(l => l.id === formData.loanId);

    try {
      // Inserir pagamento
      const paymentData: any = {
        loan_id: formData.loanId,
        amount,
        payment_date: formData.date,
        payment_method: formData.method,
        notes: formData.notes || null,
      };

      // Process payment with atomic RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc('receive_payment_with_wallet', {
        p_loan_id: formData.loanId,
        p_amount: amount,
        p_payment_method: formData.method,
        p_payment_date: formData.date,
        p_notes: formData.notes || null,
        p_received_by: user?.id || null,
        p_installment_number: null // Desambiguação explícita para RPC
      });

      if (rpcError) throw rpcError;

      const newRemaining = rpcData.remaining_amount;
      const newStatus = rpcData.status;
      const isFullyPaid = newStatus === 'paid';

      // Prepare payment object for the receipt (using locally available data for the immediate UI)
      const savedPaymentObj: Payment = {
        id: 'RPC-UPDATE', // The RPC doesn't return the payment ID, but we reload below anyway
        loan_id: formData.loanId,
        amount,
        payment_date: formData.date,
        payment_method: formData.method,
        notes: formData.notes || null,
        created_at: new Date().toISOString(),
        loan_client_name: selectedLoan?.client_name || 'Desconhecido',
        client_data: selectedLoan?.client_data || null,
      };

      // ----------------------------------------------------
      // NOTIFICATIONS
      // ----------------------------------------------------
      if (selectedLoan?.user_id) {
        // 1. Notify Client about Payment
        await notifyEvent('PAYMENT_RECEIVED', {
          userId: selectedLoan.user_id,
          amount: amount,
          remainingAmount: newRemaining,
          fromUserId: user?.id || null
        });

        // 2. Notify Client and Admins about Full Payment (if applicable)
        if (isFullyPaid) {
          await notifyEvent('LOAN_PAID_OFF', {
            userId: selectedLoan.user_id,
            clientName: selectedLoan.client_name,
            amount: selectedLoan.amount
          });
        }
      }

      toast({ title: 'Sucesso', description: 'Pagamento registrado com sucesso!' });
      setFormData({ loanId: '', amount: '', method: 'cash', date: new Date().toISOString().split('T')[0], notes: '' });

      // Assinar para recarregar as tabelas e mostrar o alerta com botão do recibo
      loadPayments();
      loadActiveLoans();

      setLastSavedPayment(savedPaymentObj);
      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error('Error registering payment:', error?.message || error || 'Unknown Error');
      const errorMsg = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
      toast({
        title: 'Falha no Registro',
        description: `Não foi possível salvar o pagamento: ${errorMsg.slice(0, 100)}`,
        variant: 'destructive'
      });
    }
  };

  const selectedLoan = activeLoans.find(l => l.id === formData.loanId);
  const monthlyPayment = selectedLoan ? Math.round(selectedLoan.total_amount / selectedLoan.installments) : 0;

  const getMethodLabel = (method: string | null) => {
    const methods: Record<string, string> = { cash: 'Dinheiro', transfer: 'Transferência', mpesa: 'M-Pesa', check: 'Cheque' };
    return methods[method || 'cash'] || method || 'N/A';
  };

  const handlePrintReceipt = (payment: Payment) => {
    const cData = payment.client_data || {};
    const html = generateReceiptHTML({
      number: 'REC-' + payment.id.substring(0, 8).toUpperCase(),
      date: new Date(payment.payment_date).toLocaleDateString('pt-MZ'),
      clientName: payment.loan_client_name || 'Cliente',
      clientEmail: cData.email,
      clientPhone: cData.phone,
      clientDocument: cData.id_number || (cData.document_type ? `${cData.document_type}: ${cData.document_number}` : undefined),
      clientNuit: cData.nuit,
      clientAddress: cData.address || [cData.neighborhood, cData.district, cData.province].filter(Boolean).join(', ') || undefined,
      amount: Number(payment.amount),
      paymentMethod: payment.payment_method || 'cash',
      description: payment.notes || 'Pagamento de prestação de microcrédito',
      companyName: companySettings?.company_name || 'BOCHEL MICROCREDITO',
      companyEmail: companySettings?.email,
      companyPhone: companySettings?.phone,
      companyNuit: companySettings?.nuit,
      companyAddress: companySettings?.address,
    });
    downloadDocumentAsPdf(html, `Recibo_${(payment.loan_client_name || 'Pagamento').replace(/\s+/g, '_')}_${payment.id.slice(0, 6)}`);
    toast({ title: 'Recibo Gerado', description: 'O recibo está sendo baixado em PDF.' });
  };

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-[#1a3a5c]">Gestão de Recebimentos</h1>
          <p className="text-sm md:text-base text-gray-500 font-medium">Controlo financeiro e fluxos de caixa em tempo real</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-[#1a3a5c] text-white px-4 py-2 rounded-full font-bold shadow-lg">
            <Calendar className="h-4 w-4 mr-2" /> {new Date().toLocaleDateString('pt-MZ')}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { icon: DollarSign, label: 'Hoje', val: todayTotal, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { icon: Clock, label: 'Activos', val: activeLoans.length, color: 'text-amber-600', bg: 'bg-amber-50', suffix: '' },
          { icon: ArrowUpRight, label: 'Entradas', val: payments.length, color: 'text-blue-600', bg: 'bg-blue-50', suffix: '' },
          { icon: CheckCircle, label: 'Recebido', val: payments.reduce((sum, p) => sum + Number(p.amount), 0), color: 'text-[#1a3a5c]', bg: 'bg-slate-100' },
        ].map((stat, i) => (
          <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-all overflow-hidden bg-white/50 backdrop-blur-sm border-t-2 border-t-slate-100">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1">{stat.label}</p>
                <p className={cn("text-lg md:text-2xl font-black", stat.color)}>
                  {stat.suffix === '' ? stat.val : `${stat.val.toLocaleString()} MT`}
                </p>
              </div>
              <div className={cn("p-3 rounded-2xl shadow-inner", stat.bg)}>
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className={cn("grid grid-cols-1 gap-4 md:gap-6", user?.role !== 'agente' ? "lg:grid-cols-2" : "grid-cols-1")}>
        {/* Registrar Pagamento - Hiddent for Agents */}
        {user?.role !== 'agente' && (
          <Card className="xl:col-span-5 border-0 shadow-2xl rounded-3xl overflow-hidden xl:sticky xl:top-8 bg-white border-l-4 border-l-[#1a3a5c]">
            <CardHeader className="bg-[#1a3a5c] p-6 text-white pb-8">
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-[#d37c22] text-white border-0 font-bold uppercase text-[9px]">Nova Transação</Badge>
                <Receipt className="h-6 w-6 opacity-30" />
              </div>
              <CardTitle className="text-xl md:text-2xl font-bold">Registar Recebimento</CardTitle>
              <CardDescription className="text-blue-100/70 text-xs">Insira os dados do valor que deu entrada na caixa</CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 -mt-4 bg-white rounded-t-3xl relative z-10 space-y-5">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#1a3a5c]">Empréstimo Activado *</label>
                  <Select value={formData.loanId} onValueChange={(v) => {
                    const loan = activeLoans.find(l => l.id === v);
                    setFormData({ ...formData, loanId: v, amount: '' });
                  }}>
                    <SelectTrigger className="h-14 border-gray-200 rounded-2xl bg-gray-50/50 shadow-inner focus:ring-2 ring-[#d37c22]/20">
                      <SelectValue placeholder="Selecione o Cliente..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 shadow-2xl">
                      {activeLoans.map(loan => (
                        <SelectItem key={loan.id} value={loan.id} className="rounded-xl py-3 px-4 focus:bg-amber-50">
                          <div className="flex flex-col items-start gap-1">
                            <span className="font-bold text-gray-800">{loan.client_name}</span>
                            <span className="text-[10px] text-gray-500">Saldo Actual: <strong className="text-red-500">MZN {loan.remaining_amount.toLocaleString()}</strong></span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedLoan && (
                  <div className="animate-in slide-in-from-top-2 duration-300 space-y-3">
                    {/* Smart Settlement Suggestion */}
                    {(() => {
                      const smartVal = calculateSmartSettlement(selectedLoan);
                      const discount = selectedLoan.remaining_amount - smartVal;

                      if (discount > 10) { // Only show if there's a meaningful discount
                        return (
                          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-2">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">💡 Liquidação Inteligente</span>
                              <Badge className="bg-amber-500 text-white text-[9px] border-0">DESCONTO DE JUROS</Badge>
                            </div>
                            <p className="text-xs text-amber-900 mb-3 font-medium">
                              O cliente pode encerrar a dívida hoje pagando apenas o capital + juro do mês atual.
                              <strong> Economia de MZN {discount.toLocaleString()}</strong>.
                            </p>
                            <Button
                              type="button"
                              className="w-full h-10 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-md border-0"
                              onClick={() => setFormData({
                                ...formData,
                                amount: String(smartVal),
                                notes: `Liquidação antecipada inteligente (Desconto de MZN ${discount.toLocaleString()} em juros futuros).`
                              })}
                            >
                              Usar Valor de Liquidação (MZN {smartVal.toLocaleString()})
                            </Button>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-2 border-dashed border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all group active:scale-[0.98]"
                      onClick={() => setFormData({ ...formData, amount: String(selectedLoan.remaining_amount), notes: 'Liquidação total do saldo devedor (valor integral).' })}
                    >
                      <div className="p-1.5 bg-emerald-500 text-white rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                        <DollarSign className="h-4 w-4" />
                      </div>
                      Liquidar Saldo Total Nominal (MZN {selectedLoan.remaining_amount.toLocaleString()})
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#1a3a5c]">Valor MT *</label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        className="h-14 border-gray-200 rounded-2xl bg-gray-50/50 shadow-inner pl-12 font-black text-xl text-[#2e7d32]"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      />
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#1a3a5c]">Data Entrada</label>
                    <Input
                      type="date"
                      className="h-14 border-gray-200 rounded-2xl bg-gray-50/50 shadow-inner font-bold"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#1a3a5c]">Metodo Pago</label>
                    <Select value={formData.method} onValueChange={(v) => setFormData({ ...formData, method: v })}>
                      <SelectTrigger className="h-12 border-gray-200 rounded-xl bg-gray-50/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="cash">💵 Dinheiro / Mão</SelectItem>
                        <SelectItem value="transfer">🏛️ T. Bancária</SelectItem>
                        <SelectItem value="mpesa">📱 M-Pesa</SelectItem>
                        <SelectItem value="check">📄 Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#1a3a5c]">Referência</label>
                    <Input
                      className="h-12 border-gray-200 rounded-xl bg-gray-50/50 italic placeholder:text-gray-300"
                      placeholder="Nº Talão, Parcela..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !formData.loanId || !formData.amount}
                  className="w-full h-16 bg-gradient-to-r from-[#1a3a5c] to-[#2a5a8c] hover:from-[#122a44] hover:to-[#1a3a5c] text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
                >
                  {loading ? (
                    <><RefreshCw className="h-6 w-6 animate-spin" /> Processando...</>
                  ) : (
                    <><span className="text-xl">Confirmar Recebimento</span><ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Info & History - RIGHT (7/12) */}
        <div className="xl:col-span-7 space-y-8">
          {/* Detailed Amortization Table */}
          {selectedLoan && selectedLoan.is_installment ? (
            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white animate-in slide-in-from-right-10 duration-500">
              <CardHeader className="bg-gray-50/80 p-6 border-b border-gray-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-black text-[#1a3a5c] uppercase tracking-widest flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#d37c22]" /> Plano Alvo
                  </CardTitle>
                  <CardDescription className="text-[9px] text-gray-500 mt-0.5 font-medium">Use os valores para amortizar</CardDescription>
                </div>
                <Badge variant="outline" className="text-gray-400 font-bold h-6 text-[8px]">Interactive List</Badge>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto scrollbar-thin">
                <div className="max-h-[500px]">
                  <table className="w-full text-left text-sm min-w-[500px]">
                    <thead className="bg-gray-100 text-gray-500 sticky top-0 z-20">
                      <tr>
                        <th className="px-6 py-4 font-black text-[10px] uppercase">Parcela</th>
                        <th className="px-6 py-4 font-black text-[10px] uppercase">Data / Estado</th>
                        <th className="px-6 py-4 font-black text-[10px] uppercase text-right">Amortizar</th>
                        <th className="px-6 py-4 font-black text-[10px] uppercase text-center">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedLoan.amortization_plan?.map((row: any) => {
                        const totalPaidInstallments = (selectedLoan.installments - selectedLoan.remaining_installments);
                        const isPaid = totalPaidInstallments >= row.installmentNumber;
                        const isCurrent = (totalPaidInstallments + 1) === row.installmentNumber;

                        return (
                          <tr key={row.installmentNumber} className={cn(
                            "group transition-all duration-300",
                            isCurrent ? 'bg-amber-50/50' : '',
                            isPaid ? 'bg-gray-50/30 grayscale-[0.8]' : 'hover:bg-blue-50/30'
                          )}>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <span className={cn(
                                  "flex items-center justify-center h-8 w-8 rounded-full text-xs font-black shadow-inner",
                                  isPaid ? "bg-gray-200 text-gray-400" : (isCurrent ? "bg-amber-500 text-white" : "bg-[#1a3a5c] text-white")
                                )}>
                                  {row.installmentNumber}
                                </span>
                                <span className="font-bold text-gray-800 text-xs tracking-tighter uppercase">{selectedLoan.credit_option === 'A' ? 'Semana' : 'Mes'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-700 text-xs">{new Date(row.date).toLocaleDateString('pt-MZ')}</span>
                                {isPaid ? (
                                  <span className="text-[9px] text-green-600 font-black uppercase tracking-tighter flex items-center gap-1 mt-0.5"><CheckCircle className="h-3 w-3" /> Liquidada</span>
                                ) : (
                                  <span className={cn("text-[9px] font-black uppercase tracking-tighter mt-0.5", isCurrent ? 'text-amber-500' : 'text-gray-400')}>{isCurrent ? '⚡ Vencendo Agora' : 'Aguardando'}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex flex-col items-end">
                                <span className="font-black text-gray-900">MZN {Number(row.total || 0).toLocaleString()}</span>
                                <span className="text-[9px] text-gray-400 font-medium">Sugerido para hoje</span>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-center">
                              {!isPaid ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setFormData({
                                    ...formData,
                                    amount: String(row.total),
                                    notes: `Pagam. Parcela ${row.installmentNumber} - Ref: ${new Date(row.date).toLocaleDateString()}`
                                  })}
                                  className="h-10 px-4 rounded-xl text-[10px] text-[#1a3a5c] border-[#1a3a5c]/20 hover:bg-[#1a3a5c] hover:text-white font-black shadow-sm transition-all active:scale-90"
                                >
                                  Usar Valor
                                </Button>
                              ) : (
                                <div className="h-8 w-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner"><Check className="h-4 w-4" /></div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : selectedLoan ? (
            <div className="bg-[#1a3a5c]/5 p-12 rounded-3xl border-2 border-dashed border-[#1a3a5c]/10 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-500">
              <div className="p-4 bg-white rounded-2xl shadow-xl"><DollarSign className="h-12 w-12 text-[#1a3a5c]" /></div>
              <div>
                <h3 className="text-xl font-bold text-[#1a3a5c]">Crédito em Pagamento Único</h3>
                <p className="max-w-[400px] text-gray-500 text-sm mt-1">Este empréstimo (Opção B - Curta) não possui parcelamento fracionado. Receba o valor total de amortização.</p>
              </div>
              <Button variant="outline" className="rounded-xl font-bold" onClick={() => setFormData({ ...formData, amount: String(selectedLoan.remaining_amount) })}>Preencher Saldo Total</Button>
            </div>
          ) : (
            <div className="bg-gray-50/50 p-16 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center opacity-50 grayscale">
              <Receipt className="h-16 w-16 text-gray-200 mb-4" />
              <h3 className="text-lg font-bold text-gray-400">Nenhum Empréstimo Selecionado</h3>
              <p className="text-xs text-gray-300">Selecione um cliente ao lado para ver o detalhamento</p>
            </div>
          )}

          {/* Histórico Recente V2 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black text-[#1a3a5c] uppercase tracking-widest flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4" /> Fluxo de Caixa Recente
              </h3>
              <span className="text-[10px] font-bold text-gray-400">Últimas 10 Entradas</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {loading ? (
                <div className="py-20 text-center text-gray-300">Carregando fluxo...</div>
              ) : payments.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl text-gray-300 italic font-medium">Sem transacções registadas</div>
              ) : (
                payments.slice(0, 10).map((payment) => (
                  <Card key={payment.id} className="border-0 shadow-sm hover:shadow-lg transition-all rounded-3xl group cursor-default">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center shadow-inner group-hover:bg-[#1a3a5c] transition-colors">
                          <Receipt className="h-6 w-6 text-slate-400 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <p className="font-black text-gray-800 text-sm group-hover:text-[#1a3a5c] transition-colors">{payment.loan_client_name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[8px] h-4 border-gray-100 px-1 bg-gray-50 text-gray-500 font-bold uppercase">{getMethodLabel(payment.payment_method)}</Badge>
                            <span className="text-[10px] text-gray-400 font-bold">• {new Date(payment.payment_date).toLocaleDateString('pt-MZ')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-black text-base text-[#2e7d32]">+{Number(payment.amount).toLocaleString()} MT</p>
                          <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest leading-none mt-1">Confirmado</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-12 w-12 p-0 text-gray-300 hover:text-[#d37c22] hover:bg-orange-50 rounded-2xl transition-all"
                          onClick={() => handlePrintReceipt(payment)}
                        >
                          <Printer className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success / Receipt Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md rounded-3xl border-0 shadow-2xl p-0 overflow-hidden">
          <div className="bg-[#2e7d32] p-12 flex flex-col items-center justify-center text-white relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="mx-auto w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/30 animate-in zoom-in spin-in duration-500">
              <Check className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-black mb-2">Transação Concluída!</h2>
            <p className="text-white/70 text-sm font-medium">Recibo gerado digitalmente</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="text-center space-y-1">
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Valor Recebido</p>
              <p className="text-5xl font-black text-[#1a3a5c]">
                {lastSavedPayment ? Number(lastSavedPayment.amount).toLocaleString() : 0} <span className="text-xl">MT</span>
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200 space-y-3">
              <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold">Cliente:</span> <span className="font-black text-gray-800">{lastSavedPayment?.loan_client_name}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold">Data:</span> <span className="font-black text-gray-800">{lastSavedPayment && new Date(lastSavedPayment.payment_date).toLocaleDateString('pt-MZ')}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold">Metodo:</span> <span className="font-black text-gray-800 uppercase">{lastSavedPayment?.payment_method}</span></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-12 sm:h-14 rounded-2xl font-bold border-gray-200 text-gray-500 order-2 sm:order-1"
                onClick={() => setShowSuccessDialog(false)}
              >
                Fechar
              </Button>
              <Button
                className="h-14 rounded-2xl font-bold bg-[#1a3a5c] text-white hover:bg-[#0d1e30] gap-2 shadow-xl shadow-blue-500/20"
                onClick={() => {
                  if (lastSavedPayment) {
                    handlePrintReceipt(lastSavedPayment);
                    setShowSuccessDialog(false);
                  }
                }}
              >
                <Printer className="h-5 w-5" /> Recibo PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsModule;
