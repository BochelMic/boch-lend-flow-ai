
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Plus, Search, FileText, Calculator, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Loan {
  id: string;
  client_id: string;
  client_name?: string;
  amount: number;
  interest_rate: number;
  installments: number;
  total_amount: number;
  remaining_amount: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

interface Client {
  id: string;
  name: string;
}

const LoansModule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  // Form state
  const [formData, setFormData] = useState({
    clientId: '', amount: '', interestRate: '25', term: '12', grace: '0'
  });

  // Calculator state
  const [calcData, setCalcData] = useState({ amount: '', rate: '', term: '' });
  const [calcResult, setCalcResult] = useState<{ monthly: number; total: number; interest: number } | null>(null);

  useEffect(() => {
    loadLoans();
    loadClients();
  }, []);

  const isAgent = user?.role === 'agente';

  const loadLoans = async () => {
    try {
      let query = supabase
        .from('loans')
        .select('*, clients(name, agent_id)')
        .order('created_at', { ascending: false });

      // Agents only see loans for their own clients
      if (isAgent) {
        query = query.eq('clients.agent_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mapped = (data || []).map((l: any) => {
        let total = Number(l.total_amount);
        let remaining = Number(l.remaining_amount);
        let status = l.status;

        if (l.end_date && remaining > 0) {
          const end = new Date(l.end_date);
          const today = new Date();
          const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays < 0 && status !== 'completed') {
            status = 'overdue';
            const lateDays = Math.abs(diffDays);
            const penalty = remaining * (0.015 * lateDays); // 1.5% penalty per day of delay
            total += penalty;
            remaining += penalty;
          }
        }

        return {
          ...l,
          total_amount: total,
          remaining_amount: remaining,
          status,
          client_name: l.clients?.name || 'Cliente desconhecido',
        };
      });
      setLoans(mapped);
    } catch (error) {
      console.error('Error loading loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const { data } = await supabase.from('clients').select('id, name').eq('status', 'active');
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const calculateLoan = (amount: number, rate: number, months: number) => {
    const totalInterest = amount * (rate / 100) * (months / 12);
    const total = amount + totalInterest;
    const monthly = total / months;
    return { monthly: Math.round(monthly), total: Math.round(total), interest: Math.round(totalInterest) };
  };

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.amount) {
      toast({ title: 'Erro', description: 'Preencha cliente e valor.', variant: 'destructive' });
      return;
    }

    const amount = parseFloat(formData.amount);
    const rate = parseFloat(formData.interestRate);
    const months = parseInt(formData.term);
    const calc = calculateLoan(amount, rate, months);

    try {
      const loanData: any = {
        client_id: formData.clientId,
        amount,
        interest_rate: rate,
        total_amount: calc.total,
        remaining_amount: calc.total,
        installments: months,
        status: 'active',
        start_date: new Date().toISOString().split('T')[0],
      };

      if (user?.role === 'agente') {
        loanData.agent_id = user.id;
      }

      const { error } = await supabase.from('loans').insert(loanData);
      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Empréstimo criado com sucesso!' });
      setFormData({ clientId: '', amount: '', interestRate: '25', term: '12', grace: '0' });
      setActiveTab('active');
      loadLoans();
    } catch (error: any) {
      console.error('Error creating loan:', error);
      toast({ title: 'Erro', description: error.message || 'Erro ao criar empréstimo.', variant: 'destructive' });
    }
  };

  const handleCalculate = () => {
    const a = parseFloat(calcData.amount);
    const r = parseFloat(calcData.rate);
    const t = parseInt(calcData.term);
    if (!a || !r || !t) return;
    setCalcResult(calculateLoan(a, r, t));
  };

  const formCalc = formData.amount && formData.interestRate && formData.term
    ? calculateLoan(parseFloat(formData.amount), parseFloat(formData.interestRate), parseInt(formData.term))
    : null;

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = (loan.client_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || loan.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight">
            {isAgent ? 'Empréstimos dos Meus Clientes' : 'Gestão de Empréstimos'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAgent ? 'Acompanhe os empréstimos dos seus clientes' : 'Gerencie contratos e acompanhe pagamentos'}
          </p>
        </div>
        {!isAgent && (
          <Button onClick={() => setActiveTab('create')}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Empréstimo
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
        {isAgent ? (
          <TabsList className="w-full grid grid-cols-1">
            <TabsTrigger value="active" className="text-xs md:text-sm">Empréstimos</TabsTrigger>
          </TabsList>
        ) : (
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="active" className="text-xs md:text-sm">Empréstimos</TabsTrigger>
            <TabsTrigger value="create" className="text-xs md:text-sm">Criar</TabsTrigger>
            <TabsTrigger value="calculator" className="text-xs md:text-sm">Calculadora</TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <CreditCard className="h-4 w-4 md:h-5 md:w-5" />
                  Contratos ({filteredLoans.length})
                </CardTitle>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    <Input
                      placeholder="Pesquisar por cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-48 md:w-64"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-32 md:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="completed">Quitado</SelectItem>
                      <SelectItem value="overdue">Em Atraso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Carregando...</div>
                ) : filteredLoans.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="mx-auto h-12 w-12 opacity-50 mb-2" />
                    <p>Nenhum empréstimo encontrado</p>
                  </div>
                ) : (
                  filteredLoans.map((loan) => (
                    <div key={loan.id} className="border rounded-lg p-3 md:p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{loan.client_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Taxa: {loan.interest_rate}% | Prazo: {loan.installments} meses
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${loan.status === 'active' ? 'bg-green-100 text-green-800' :
                            loan.status === 'overdue' ? 'bg-red-100 text-red-800' :
                              loan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                            {loan.status === 'active' ? 'Ativo' :
                              loan.status === 'overdue' ? 'Em Atraso' :
                                loan.status === 'completed' ? 'Quitado' : 'Pendente'}
                          </span>
                          {loan.status === 'overdue' && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Valor Original</p>
                          <p className="font-medium">{Number(loan.amount).toLocaleString()} MZN</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total com Juros</p>
                          <p className="font-medium">{Number(loan.total_amount).toLocaleString()} MZN</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Saldo Devedor</p>
                          <p className="font-medium">{Number(loan.remaining_amount).toLocaleString()} MZN</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Progresso</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${Math.max(0, ((Number(loan.total_amount) - Number(loan.remaining_amount)) / Number(loan.total_amount)) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Actions - only for gestor */}
                      {!isAgent && (loan.status === 'active' || loan.status === 'overdue') && (
                        <div className="pt-3 mt-3 border-t border-gray-100 flex justify-end">
                          <Button
                            size="sm"
                            className="bg-[#1b5e20] hover:bg-[#124016] text-white font-semibold"
                            onClick={async () => {
                              try {
                                const { error } = await supabase
                                  .from('loans')
                                  .update({ status: 'completed', remaining_amount: 0 })
                                  .eq('id', loan.id);
                                if (error) throw error;
                                toast({ title: 'Empréstimo liquidado e marcado como Pago!' });
                                loadLoans();
                              } catch (e: any) {
                                toast({ title: 'Erro', description: e.message, variant: 'destructive' });
                              }
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" /> Marcar como Pago
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg">Criar Novo Empréstimo</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Preencha os dados do contrato de empréstimo
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <form className="space-y-4" onSubmit={handleCreateLoan}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cliente *</Label>
                    <Select value={formData.clientId} onValueChange={(v) => setFormData({ ...formData, clientId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Valor do Empréstimo (MZN) *</Label>
                    <Input
                      type="number"
                      placeholder="50000"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Taxa de Juros (%)</Label>
                    <Input
                      type="number"
                      value={formData.interestRate}
                      onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prazo (meses)</Label>
                    <Input
                      type="number"
                      value={formData.term}
                      onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    />
                  </div>
                </div>

                {formCalc && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Cálculo Automático</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-muted-foreground">Prestação Mensal</p>
                        <p className="text-lg font-semibold">{formCalc.monthly.toLocaleString()} MZN</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-muted-foreground">Total a Pagar</p>
                        <p className="text-lg font-semibold">{formCalc.total.toLocaleString()} MZN</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-muted-foreground">Total de Juros</p>
                        <p className="text-lg font-semibold">{formCalc.interest.toLocaleString()} MZN</p>
                      </div>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full">
                  Criar Contrato de Empréstimo
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg">Calculadora de Empréstimos</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Calcule prestações e simule diferentes cenários
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Valor (MZN)</Label>
                    <Input
                      type="number"
                      placeholder="50000"
                      value={calcData.amount}
                      onChange={(e) => setCalcData({ ...calcData, amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Taxa de Juros (% anual)</Label>
                    <Input
                      type="number"
                      placeholder="25"
                      value={calcData.rate}
                      onChange={(e) => setCalcData({ ...calcData, rate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prazo (meses)</Label>
                    <Input
                      type="number"
                      placeholder="12"
                      value={calcData.term}
                      onChange={(e) => setCalcData({ ...calcData, term: e.target.value })}
                    />
                  </div>
                  <Button className="w-full" onClick={handleCalculate}>Calcular</Button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Resultado da Simulação</h3>
                  {calcResult ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Prestação Mensal:</span>
                        <span className="font-semibold">{calcResult.monthly.toLocaleString()} MZN</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total a Pagar:</span>
                        <span className="font-semibold">{calcResult.total.toLocaleString()} MZN</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total de Juros:</span>
                        <span className="font-semibold">{calcResult.interest.toLocaleString()} MZN</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Preencha os dados e clique em Calcular</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoansModule;
