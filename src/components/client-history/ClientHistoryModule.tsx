
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, CreditCard, Receipt, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Loan {
  id: string;
  amount: number;
  total_amount: number;
  remaining_amount: number;
  interest_rate: number;
  term: number;
  status: string;
  created_at: string;
}

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  loan_id: string;
}

const ClientHistoryModule = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Get client record
      const { data: client } = await supabase.from('clients').select('id').eq('user_id', user.id).single();
      if (!client) { setLoading(false); return; }

      // Get loans
      const { data: loanData } = await supabase.from('loans').select('*').eq('client_id', client.id).order('created_at', { ascending: false });
      setLoans(loanData || []);

      // Get payments for those loans
      if (loanData && loanData.length > 0) {
        const loanIds = loanData.map(l => l.id);
        const { data: paymentData } = await supabase.from('payments').select('*').in('loan_id', loanIds).order('payment_date', { ascending: false });
        setPayments(paymentData || []);
      }
    } catch (e) {
      console.error('Error loading history:', e);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (v: number) => v.toLocaleString('pt-MZ', { minimumFractionDigits: 0 });

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      active: { label: 'Ativo', cls: 'bg-green-100 text-green-800' },
      paid: { label: 'Quitado', cls: 'bg-blue-100 text-blue-800' },
      overdue: { label: 'Atrasado', cls: 'bg-red-100 text-red-800' },
      defaulted: { label: 'Inadimplente', cls: 'bg-red-200 text-red-900' },
    };
    const s = map[status] || { label: status, cls: 'bg-gray-100 text-gray-800' };
    return <Badge className={s.cls}>{s.label}</Badge>;
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-MZ');

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[40vh]">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Histórico</h1>
        <p className="text-sm text-muted-foreground">Empréstimos e pagamentos</p>
      </div>

      <Tabs defaultValue="loans" className="space-y-6">
        <TabsList>
          <TabsTrigger value="loans" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Empréstimos
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Pagamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="loans" className="space-y-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="h-5 w-5 text-[#1b5e20]" />
                Empréstimos
              </CardTitle>
              <CardDescription>{loans.length} empréstimo(s) encontrado(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {loans.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum empréstimo encontrado</p>
              ) : (
                <div className="space-y-4">
                  {loans.map(loan => {
                    const paid = (loan.total_amount || loan.amount) - (loan.remaining_amount || 0);
                    const total = loan.total_amount || loan.amount;
                    const progress = total > 0 ? Math.min((paid / total) * 100, 100) : 0;

                    return (
                      <div key={loan.id} className="border rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{fmt(loan.amount)} MZN</p>
                            <p className="text-xs text-muted-foreground">{formatDate(loan.created_at)} • {loan.term} meses • {loan.interest_rate}% juros</p>
                          </div>
                          {getStatusBadge(loan.status)}
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Total c/ Juros</p>
                            <p className="font-medium">{fmt(total)} MZN</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Pago</p>
                            <p className="font-medium text-green-700">{fmt(Math.max(paid, 0))} MZN</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Restante</p>
                            <p className="font-medium text-orange-700">{fmt(loan.remaining_amount || 0)} MZN</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-[#1b5e20] h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Receipt className="h-5 w-5 text-[#1b5e20]" />
                Pagamentos
              </CardTitle>
              <CardDescription>{payments.length} pagamento(s) encontrado(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum pagamento encontrado</p>
              ) : (
                <div className="space-y-3">
                  {payments.map(payment => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-xl">
                      <div>
                        <p className="font-medium">Pagamento</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(payment.payment_date)} • {payment.payment_method || 'Não especificado'}
                        </p>
                      </div>
                      <p className="font-semibold text-green-700">{fmt(payment.amount)} MZN</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientHistoryModule;
