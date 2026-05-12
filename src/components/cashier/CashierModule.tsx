import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Wallet, TrendingUp, TrendingDown, ArrowUpDown, Loader2, RefreshCw,
  Search, Users, CreditCard, DollarSign, Calendar, ChevronRight, Percent, PiggyBank
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProfitData {
  totalCapitalDeployed: number;
  totalExpectedReturn: number;
  totalExpectedProfit: number;
  totalPaid: number;
  profitRealized: number;
  profitPending: number;
  loans: { client_name: string; capital: number; interest: number; total: number; paid: number; profitEarned: number; status: string }[];
}

interface Transaction {
  id: string;
  type: 'payment' | 'disbursement' | 'injection';
  amount: number;
  description: string;
  client_name: string | null;
  loan_amount: number | null;
  payment_method: string | null;
  date: string;
  time: string;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const CashierModule = () => {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [profit, setProfit] = useState<ProfitData>({ totalCapitalDeployed: 0, totalExpectedReturn: 0, totalExpectedProfit: 0, totalPaid: 0, profitRealized: 0, profitPending: 0, loans: [] });

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear().toString());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Wallet balance
      const { data: wallet } = await supabase.from('company_wallet').select('balance').single();
      setBalance(Number(wallet?.balance) || 0);

      // 2. Payments with client names (ENTRIES)
      const { data: payments } = await supabase
        .from('payments')
        .select('id, amount, payment_date, payment_method, notes, created_at, loan_id')
        .order('created_at', { ascending: false });

      // Get loan → client mapping
      const { data: loans } = await supabase
        .from('loans')
        .select('id, client_id, amount, total_amount, interest_rate, remaining_amount, status, created_at');

      const { data: clients } = await supabase
        .from('clients')
        .select('id, name');

      const clientMap = new Map((clients || []).map(c => [c.id, c.name]));
      const loanMap = new Map((loans || []).map(l => [l.id, { client_id: l.client_id, amount: Number(l.amount) }]));

      // 3. Wallet ledger for injections and disbursements
      const { data: ledger } = await supabase
        .from('wallet_ledger')
        .select('id, amount, transaction_type, description, created_at, reference_id')
        .order('created_at', { ascending: false });

      // Build unified transaction list
      const txList: Transaction[] = [];

      // Add payments (entries from clients)
      (payments || []).forEach(p => {
        const loan = loanMap.get(p.loan_id);
        const clientName = loan ? clientMap.get(loan.client_id) : null;
        const dt = new Date(p.created_at);
        txList.push({
          id: `pay-${p.id}`,
          type: 'payment',
          amount: Number(p.amount),
          description: p.notes || 'Pagamento de empréstimo',
          client_name: clientName || 'Cliente desconhecido',
          loan_amount: loan?.amount || null,
          payment_method: p.payment_method || 'Dinheiro',
          date: dt.toISOString().split('T')[0],
          time: dt.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }),
        });
      });

      // Add ledger entries (injections & disbursements)
      (ledger || []).forEach(l => {
        const dt = new Date(l.created_at);
        const isDisb = l.transaction_type === 'disbursement';
        const isInj = l.transaction_type === 'injection';

        // For disbursements, try to find the client name from the referenced loan
        let clientName: string | null = null;
        let loanAmt: number | null = null;
        if (l.reference_id) {
          const loan = loanMap.get(l.reference_id);
          if (loan) {
            clientName = clientMap.get(loan.client_id) || null;
            loanAmt = loan.amount;
          }
        }

        // Skip repayments from ledger (we already have payments table for those)
        if (l.transaction_type === 'repayment') return;

        txList.push({
          id: `ldg-${l.id}`,
          type: isDisb ? 'disbursement' : 'injection',
          amount: Math.abs(Number(l.amount)),
          description: l.description || (isDisb ? 'Desembolso de empréstimo' : 'Injecção de capital'),
          client_name: clientName,
          loan_amount: loanAmt,
          payment_method: null,
          date: dt.toISOString().split('T')[0],
          time: dt.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }),
        });
      });

      // Sort by date descending
      txList.sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());
      setTransactions(txList);

      // Calculate profits from loans
      const allLoans = loans || [];
      const allPayments = payments || [];
      let totalCapital = 0, totalReturn = 0, totalProfit = 0, totalPaidAll = 0, profitRealized = 0;
      const loanProfits = allLoans.map(loan => {
        const capital = Number(loan.amount) || 0;
        const total = Number(loan.total_amount) || capital;
        const interest = total - capital;
        const loanPayments = allPayments.filter(p => p.loan_id === loan.id);
        const paid = loanPayments.reduce((s, p) => s + Number(p.amount), 0);
        // Interest proportion: each payment contains (interest/total) proportion of profit
        const interestRatio = total > 0 ? interest / total : 0;
        const earned = paid * interestRatio;
        totalCapital += capital;
        totalReturn += total;
        totalProfit += interest;
        totalPaidAll += paid;
        profitRealized += earned;
        return {
          client_name: clientMap.get(loan.client_id) || 'Desconhecido',
          capital, interest, total, paid, profitEarned: earned,
          status: loan.status || 'active',
        };
      });
      setProfit({
        totalCapitalDeployed: totalCapital,
        totalExpectedReturn: totalReturn,
        totalExpectedProfit: totalProfit,
        totalPaid: totalPaidAll,
        profitRealized,
        profitPending: totalProfit - profitRealized,
        loans: loanProfits.sort((a, b) => b.interest - a.interest),
      });
    } catch (err) {
      console.error('CashierModule load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Filter by selected month/year
  const filtered = useMemo(() => {
    const month = parseInt(selectedMonth);
    const year = parseInt(selectedYear);
    return transactions.filter(tx => {
      const d = new Date(tx.date);
      const matchMonth = d.getMonth() === month && d.getFullYear() === year;
      const matchSearch = !searchTerm ||
        (tx.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchMonth && matchSearch;
    });
  }, [transactions, selectedMonth, selectedYear, searchTerm]);

  // Monthly KPIs
  const monthEntries = filtered.filter(t => t.type === 'payment' || t.type === 'injection');
  const monthExits = filtered.filter(t => t.type === 'disbursement');
  const monthInTotal = monthEntries.reduce((s, t) => s + t.amount, 0);
  const monthOutTotal = monthExits.reduce((s, t) => s + t.amount, 0);
  const monthPaymentsCount = filtered.filter(t => t.type === 'payment').length;
  const monthClientsUnique = new Set(filtered.filter(t => t.client_name).map(t => t.client_name)).size;

  // Available years
  const years = useMemo(() => {
    const yrs = new Set(transactions.map(t => new Date(t.date).getFullYear()));
    yrs.add(now.getFullYear());
    return Array.from(yrs).sort((a, b) => b - a);
  }, [transactions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1b5e20]" />
      </div>
    );
  }

  const TypeIcon = ({ type }: { type: string }) => {
    if (type === 'payment') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (type === 'disbursement') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Wallet className="h-4 w-4 text-blue-600" />;
  };

  const typeColor = (type: string) => {
    if (type === 'payment') return 'bg-green-100';
    if (type === 'disbursement') return 'bg-red-100';
    return 'bg-blue-100';
  };

  const typeLabel = (type: string) => {
    if (type === 'payment') return 'Pagamento';
    if (type === 'disbursement') return 'Desembolso';
    return 'Injecção';
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Caixa</h1>
          <p className="text-muted-foreground text-sm">Visualização do fluxo financeiro em tempo real</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Atualizar
        </Button>
      </div>

      {/* Main Balance Card */}
      <Card className="bg-gradient-to-br from-[#0b3a20] to-[#145a32] text-white border-0 shadow-lg">
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">Saldo Disponível</p>
              <p className="text-3xl md:text-4xl font-black tracking-tight">
                {balance.toLocaleString()} <span className="text-lg font-semibold text-white/70">MT</span>
              </p>
              <p className="text-white/50 text-[10px] mt-1">Actualizado em tempo real</p>
            </div>
            <div className="flex gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center min-w-[100px]">
                <TrendingUp className="h-4 w-4 mx-auto mb-1 text-green-300" />
                <p className="text-[10px] text-white/60 uppercase">Este mês</p>
                <p className="font-bold text-green-300 text-sm">+{monthInTotal.toLocaleString()} MT</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center min-w-[100px]">
                <TrendingDown className="h-4 w-4 mx-auto mb-1 text-red-300" />
                <p className="text-[10px] text-white/60 uppercase">Saídas</p>
                <p className="font-bold text-red-300 text-sm">-{monthOutTotal.toLocaleString()} MT</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase">Entradas do Mês</p>
                <p className="text-lg font-bold text-green-600">{monthInTotal.toLocaleString()} MT</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase">Saídas do Mês</p>
                <p className="text-lg font-bold text-red-600">{monthOutTotal.toLocaleString()} MT</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase">Pagamentos</p>
                <p className="text-lg font-bold">{monthPaymentsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase">Clientes Activos</p>
                <p className="text-lg font-bold">{monthClientsUnique}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profit Section */}
      <Card className="border-t-4 border-t-emerald-500">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-emerald-600" />
            <div>
              <CardTitle className="text-lg">Lucros da Empresa</CardTitle>
              <CardDescription>Receita de juros (30%) sobre empréstimos activos</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Profit KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <p className="text-[10px] text-emerald-600/70 uppercase font-semibold mb-1">Capital Emprestado</p>
              <p className="text-lg font-black text-gray-900">{profit.totalCapitalDeployed.toLocaleString()} MT</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-[10px] text-green-600/70 uppercase font-semibold mb-1">Lucro Esperado</p>
              <p className="text-lg font-black text-green-700">{profit.totalExpectedProfit.toLocaleString()} MT</p>
              <p className="text-[9px] text-green-500 mt-0.5">30% de juros total</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-[10px] text-blue-600/70 uppercase font-semibold mb-1">Lucro Recebido</p>
              <p className="text-lg font-black text-blue-700">{Math.round(profit.profitRealized).toLocaleString()} MT</p>
              <p className="text-[9px] text-blue-500 mt-0.5">Já cobrado</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <p className="text-[10px] text-amber-600/70 uppercase font-semibold mb-1">Lucro Pendente</p>
              <p className="text-lg font-black text-amber-700">{Math.round(profit.profitPending).toLocaleString()} MT</p>
              <p className="text-[9px] text-amber-500 mt-0.5">A receber</p>
            </div>
          </div>

          {/* Profit progress bar */}
          {profit.totalExpectedProfit > 0 && (
            <div className="mb-5">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Taxa de realização de lucro</span>
                <span className="font-bold text-emerald-700">{Math.round((profit.profitRealized / profit.totalExpectedProfit) * 100)}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500" style={{ width: `${Math.min((profit.profitRealized / profit.totalExpectedProfit) * 100, 100)}%` }} />
              </div>
            </div>
          )}

          {/* Per-loan profit breakdown */}
          <h4 className="text-sm font-semibold mb-3 text-gray-700">Lucro por Empréstimo</h4>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="px-3 py-2.5 text-left">Cliente</th>
                  <th className="px-3 py-2.5 text-right">Capital</th>
                  <th className="px-3 py-2.5 text-right">Juros (30%)</th>
                  <th className="px-3 py-2.5 text-right">Pago</th>
                  <th className="px-3 py-2.5 text-right">Lucro Ganho</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {profit.loans.map((loan, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${loan.status === 'active' ? 'bg-green-500' : loan.status === 'completed' ? 'bg-blue-500' : 'bg-gray-400'}`} />
                        <span className="font-medium truncate max-w-[160px]">{loan.client_name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right text-gray-600">{loan.capital.toLocaleString()} MT</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-emerald-700">{loan.interest.toLocaleString()} MT</td>
                    <td className="px-3 py-2.5 text-right text-gray-600">{loan.paid.toLocaleString()} MT</td>
                    <td className="px-3 py-2.5 text-right font-bold text-green-700">{Math.round(loan.profitEarned).toLocaleString()} MT</td>
                  </tr>
                ))}
                {profit.loans.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-6 text-muted-foreground text-sm">Nenhum empréstimo registado.</td></tr>
                )}
              </tbody>
              {profit.loans.length > 0 && (
                <tfoot className="bg-gray-50 font-bold text-xs">
                  <tr>
                    <td className="px-3 py-2.5">Total</td>
                    <td className="px-3 py-2.5 text-right">{profit.totalCapitalDeployed.toLocaleString()} MT</td>
                    <td className="px-3 py-2.5 text-right text-emerald-700">{profit.totalExpectedProfit.toLocaleString()} MT</td>
                    <td className="px-3 py-2.5 text-right">{profit.totalPaid.toLocaleString()} MT</td>
                    <td className="px-3 py-2.5 text-right text-green-700">{Math.round(profit.profitRealized).toLocaleString()} MT</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Transacções</CardTitle>
              <CardDescription>Todas as movimentações financeiras registadas no sistema</CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[130px]">
                  <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[90px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {years.map(y => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar por nome do cliente ou descrição..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {/* Monthly Summary Bar */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 mb-4 text-sm">
            <span className="font-medium text-gray-700">
              {MONTHS[parseInt(selectedMonth)]} {selectedYear}
            </span>
            <div className="flex gap-4">
              <span className="text-green-600 font-bold">+{monthInTotal.toLocaleString()} MT</span>
              <span className="text-red-600 font-bold">-{monthOutTotal.toLocaleString()} MT</span>
              <span className={`font-bold ${monthInTotal - monthOutTotal >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                = {(monthInTotal - monthOutTotal).toLocaleString()} MT
              </span>
            </div>
          </div>

          {/* Transaction List */}
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <ArrowUpDown className="h-10 w-10 mx-auto text-gray-200 mb-3" />
              <p className="text-muted-foreground text-sm">Nenhuma transacção em {MONTHS[parseInt(selectedMonth)]} {selectedYear}.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
              {filtered.map(tx => {
                const isEntry = tx.type !== 'disbursement';
                return (
                  <div key={tx.id} className="flex items-center justify-between p-3 border rounded-xl hover:bg-gray-50/80 transition-colors group">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`p-2.5 rounded-xl shrink-0 ${typeColor(tx.type)} transition-transform group-hover:scale-105`}>
                        <TypeIcon type={tx.type} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          {tx.client_name ? (
                            <p className="font-semibold text-sm truncate">{tx.client_name}</p>
                          ) : (
                            <p className="font-semibold text-sm truncate text-gray-600">{tx.description}</p>
                          )}
                          <Badge variant="outline" className="text-[9px] h-4 shrink-0 capitalize">{typeLabel(tx.type)}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span>{new Date(tx.date).toLocaleDateString('pt-MZ')}</span>
                          <span>•</span>
                          <span>{tx.time}</span>
                          {tx.payment_method && (
                            <>
                              <span>•</span>
                              <span className="capitalize">{tx.payment_method}</span>
                            </>
                          )}
                          {tx.client_name && tx.type === 'payment' && tx.loan_amount && (
                            <>
                              <span>•</span>
                              <span className="text-gray-400">Emp. {tx.loan_amount.toLocaleString()} MT</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className={`font-bold text-sm shrink-0 ml-3 tabular-nums ${isEntry ? 'text-green-600' : 'text-red-600'}`}>
                      {isEntry ? '+' : '-'}{tx.amount.toLocaleString()} MT
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer with totals */}
          {filtered.length > 0 && (
            <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
              <span>{filtered.length} transacções em {MONTHS[parseInt(selectedMonth)]}</span>
              <span className="font-bold text-gray-900">
                Resultado: {(monthInTotal - monthOutTotal).toLocaleString()} MT
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CashierModule;
