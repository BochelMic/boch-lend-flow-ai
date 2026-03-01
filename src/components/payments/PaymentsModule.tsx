
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Receipt, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Payment {
  id: string;
  loan_id: string;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  loan_client_name?: string;
}

interface ActiveLoan {
  id: string;
  client_name: string;
  remaining_amount: number;
  total_amount: number;
  installments: number;
}

const PaymentsModule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayTotal, setTodayTotal] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    loanId: '', amount: '', method: 'cash', date: new Date().toISOString().split('T')[0], notes: ''
  });

  useEffect(() => {
    loadPayments();
    loadActiveLoans();
  }, []);

  const loadPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*, loans(clients(name))')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const mapped = (data || []).map((p: any) => ({
        ...p,
        loan_client_name: p.loans?.clients?.name || 'Desconhecido',
      }));
      setPayments(mapped);

      // Calcular total de hoje
      const today = new Date().toISOString().split('T')[0];
      const todayPayments = mapped.filter((p: Payment) => p.payment_date === today);
      setTodayTotal(todayPayments.reduce((sum: number, p: Payment) => sum + Number(p.amount), 0));
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveLoans = async () => {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('id, remaining_amount, total_amount, installments, clients(name)')
        .eq('status', 'active');

      if (error) throw error;

      const mapped = (data || []).map((l: any) => ({
        id: l.id,
        client_name: l.clients?.name || 'Desconhecido',
        remaining_amount: Number(l.remaining_amount),
        total_amount: Number(l.total_amount),
        installments: l.installments,
      }));
      setActiveLoans(mapped);
    } catch (error) {
      console.error('Error loading active loans:', error);
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

      if (user) {
        paymentData.received_by = user.id;
      }

      const { error: payError } = await supabase.from('payments').insert(paymentData);
      if (payError) throw payError;

      // Atualizar saldo do empréstimo
      if (selectedLoan) {
        const newRemaining = Math.max(0, selectedLoan.remaining_amount - amount);
        const updateData: any = { remaining_amount: newRemaining };
        if (newRemaining <= 0) {
          updateData.status = 'completed';
        }
        await supabase.from('loans').update(updateData).eq('id', formData.loanId);
      }

      toast({ title: 'Sucesso', description: 'Pagamento registrado com sucesso!' });
      setFormData({ loanId: '', amount: '', method: 'cash', date: new Date().toISOString().split('T')[0], notes: '' });
      loadPayments();
      loadActiveLoans();
    } catch (error: any) {
      console.error('Error registering payment:', error);
      toast({ title: 'Erro', description: error.message || 'Erro ao registrar pagamento.', variant: 'destructive' });
    }
  };

  const selectedLoan = activeLoans.find(l => l.id === formData.loanId);
  const monthlyPayment = selectedLoan ? Math.round(selectedLoan.total_amount / selectedLoan.installments) : 0;

  const getMethodLabel = (method: string | null) => {
    const methods: Record<string, string> = { cash: 'Dinheiro', transfer: 'Transferência', mpesa: 'M-Pesa', check: 'Cheque' };
    return methods[method || 'cash'] || method || 'N/A';
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-3xl font-bold tracking-tight">Pagamentos</h1>
        <p className="text-sm text-muted-foreground">Registre e acompanhe pagamentos dos clientes</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Recebido Hoje</p>
                <p className="text-sm md:text-lg font-semibold">{todayTotal.toLocaleString()} MZN</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Empréstimos Ativos</p>
                <p className="text-sm md:text-lg font-semibold">{activeLoans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Pagamentos</p>
                <p className="text-sm md:text-lg font-semibold">{payments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Recebido</p>
                <p className="text-sm md:text-lg font-semibold">
                  {payments.reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString()} MZN
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Registrar Pagamento */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Registrar Pagamento</CardTitle>
            <CardDescription className="text-xs md:text-sm">Registre um pagamento recebido</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium">Empréstimo *</label>
                <Select value={formData.loanId} onValueChange={(v) => setFormData({ ...formData, loanId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar empréstimo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeLoans.map(loan => (
                      <SelectItem key={loan.id} value={loan.id}>
                        {loan.client_name} — Saldo: {loan.remaining_amount.toLocaleString()} MZN
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Valor (MZN) *</label>
                <Input
                  type="number"
                  placeholder={monthlyPayment > 0 ? String(monthlyPayment) : '0.00'}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Forma de Pagamento</label>
                <Select value={formData.method} onValueChange={(v) => setFormData({ ...formData, method: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="transfer">Transferência</SelectItem>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                    <SelectItem value="check">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Observações</label>
                <Input
                  placeholder="Observações..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {selectedLoan && (
                <div className="border-t pt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-muted-foreground text-xs">Saldo Devedor</p>
                    <p className="font-semibold">{selectedLoan.remaining_amount.toLocaleString()} MZN</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-muted-foreground text-xs">Prestação Mensal</p>
                    <p className="font-semibold">{monthlyPayment.toLocaleString()} MZN</p>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full">
                Registrar Pagamento
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Histórico */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Últimos Pagamentos</CardTitle>
            <CardDescription className="text-xs md:text-sm">Pagamentos registrados recentemente</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="space-y-3">
              {loading ? (
                <p className="text-center text-muted-foreground py-4">Carregando...</p>
              ) : payments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum pagamento registrado</p>
              ) : (
                payments.slice(0, 10).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{payment.loan_client_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getMethodLabel(payment.payment_method)} • {payment.payment_date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{Number(payment.amount).toLocaleString()} MZN</p>
                      <Badge className="bg-green-100 text-green-800 text-xs">Pago</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentsModule;
