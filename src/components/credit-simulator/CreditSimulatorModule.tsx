
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, DollarSign, Calendar, Percent, FileText, Download, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CreditSimulatorModule = () => {
  const { toast } = useToast();
  const [simulationData, setSimulationData] = useState({
    amount: '',
    term: '',
    interestRate: '',
    clientType: '',
    paymentFrequency: 'monthly'
  });
  const [result, setResult] = useState(null);
  const [amortizationTable, setAmortizationTable] = useState([]);

  const calculateFixedInstallment = (principal, annualRate, termMonths, frequency = 'monthly') => {
    let periodsPerYear, totalPeriods;
    
    switch (frequency) {
      case 'weekly':
        periodsPerYear = 52;
        totalPeriods = termMonths * 4.33;
        break;
      case 'biweekly':
        periodsPerYear = 26;
        totalPeriods = termMonths * 2.17;
        break;
      case 'monthly':
      default:
        periodsPerYear = 12;
        totalPeriods = termMonths;
        break;
    }

    const periodRate = annualRate / 100 / periodsPerYear;
    
    if (periodRate === 0) return principal / totalPeriods;
    
    return principal * (periodRate * Math.pow(1 + periodRate, totalPeriods)) / (Math.pow(1 + periodRate, totalPeriods) - 1);
  };

  const generateAmortizationTable = (principal, annualRate, termMonths, frequency = 'monthly') => {
    let periodsPerYear, totalPeriods, periodLabel;
    
    switch (frequency) {
      case 'weekly':
        periodsPerYear = 52;
        totalPeriods = Math.round(termMonths * 4.33);
        periodLabel = 'Semana';
        break;
      case 'biweekly':
        periodsPerYear = 26;
        totalPeriods = Math.round(termMonths * 2.17);
        periodLabel = 'Quinzena';
        break;
      case 'monthly':
      default:
        periodsPerYear = 12;
        totalPeriods = termMonths;
        periodLabel = 'Mês';
        break;
    }

    const periodRate = annualRate / 100 / periodsPerYear;
    const payment = calculateFixedInstallment(principal, annualRate, termMonths, frequency);
    const table = [];
    let balance = principal;
    let totalInterest = 0;

    for (let period = 1; period <= totalPeriods; period++) {
      const interest = balance * periodRate;
      const principalPayment = payment - interest;
      balance = Math.max(0, balance - principalPayment);
      totalInterest += interest;

      table.push({
        period,
        periodLabel,
        payment: payment,
        interest: interest,
        principal: principalPayment,
        balance: balance,
        cumulativeInterest: totalInterest
      });
    }

    return table;
  };

  const handleSimulation = () => {
    if (!simulationData.amount || !simulationData.term || !simulationData.interestRate) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(simulationData.amount);
    const term = parseInt(simulationData.term);
    const rate = parseFloat(simulationData.interestRate);
    
    const payment = calculateFixedInstallment(amount, rate, term, simulationData.paymentFrequency);
    const table = generateAmortizationTable(amount, rate, term, simulationData.paymentFrequency);
    const totalAmount = payment * table.length;
    const totalInterest = totalAmount - amount;

    setResult({
      payment: payment.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      effectiveRate: ((totalInterest / amount) * 100).toFixed(2)
    });

    setAmortizationTable(table);

    toast({
      title: "Simulação concluída",
      description: "Resultado da simulação calculado com sucesso"
    });
  };

  const handleExportTable = () => {
    if (amortizationTable.length === 0) {
      toast({
        title: "Erro",
        description: "Faça uma simulação primeiro",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Exportando...",
      description: "Tabela de amortização sendo exportada para Excel"
    });
  };

  const getClientTypeRate = (baseRate, clientType) => {
    const adjustments = {
      'individual': 0,
      'business': -1,
      'micro': 2,
      'rural': 1,
      'group': -0.5
    };
    
    return baseRate + (adjustments[clientType] || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Calculator className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Simulador de Crédito</h1>
          <p className="text-gray-600">Simule condições de crédito com parcelas fixas</p>
        </div>
      </div>

      <Tabs defaultValue="simulator" className="space-y-4">
        <TabsList>
          <TabsTrigger value="simulator">Simulador</TabsTrigger>
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
          <TabsTrigger value="analysis">Análise</TabsTrigger>
        </TabsList>

        <TabsContent value="simulator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados da Simulação</CardTitle>
                <CardDescription>
                  Configure os parâmetros do empréstimo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor do Empréstimo (MZN)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Ex: 100000"
                    value={simulationData.amount}
                    onChange={(e) => setSimulationData({ ...simulationData, amount: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="term">Prazo (meses)</Label>
                    <Input
                      id="term"
                      type="number"
                      placeholder="Ex: 12"
                      value={simulationData.term}
                      onChange={(e) => setSimulationData({ ...simulationData, term: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate">Taxa de Juros (% ao ano)</Label>
                    <Input
                      id="rate"
                      type="number"
                      step="0.1"
                      placeholder="Ex: 15.5"
                      value={simulationData.interestRate}
                      onChange={(e) => setSimulationData({ ...simulationData, interestRate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientType">Tipo de Cliente</Label>
                  <Select onValueChange={(value) => setSimulationData({ ...simulationData, clientType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Pessoa Física</SelectItem>
                      <SelectItem value="business">Pessoa Jurídica</SelectItem>
                      <SelectItem value="micro">Microempresa</SelectItem>
                      <SelectItem value="rural">Crédito Rural</SelectItem>
                      <SelectItem value="group">Grupo Solidário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequência de Pagamento</Label>
                  <Select 
                    value={simulationData.paymentFrequency}
                    onValueChange={(value) => setSimulationData({ ...simulationData, paymentFrequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="biweekly">Quinzenal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSimulation} className="w-full">
                  <Calculator className="mr-2 h-4 w-4" />
                  Simular Crédito
                </Button>
              </CardContent>
            </Card>

            {result && (
              <Card>
                <CardHeader>
                  <CardTitle>Resultado da Simulação</CardTitle>
                  <CardDescription>
                    Condições calculadas para o empréstimo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-medium">
                        {simulationData.paymentFrequency === 'weekly' ? 'Prestação Semanal' :
                         simulationData.paymentFrequency === 'biweekly' ? 'Prestação Quinzenal' :
                         'Prestação Mensal'}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">MZN {result.payment}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium">Valor Total</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">MZN {result.totalAmount}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center">
                      <Percent className="h-5 w-5 text-orange-600 mr-2" />
                      <span className="font-medium">Total de Juros</span>
                    </div>
                    <span className="text-lg font-bold text-orange-600">MZN {result.totalInterest}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                      <span className="font-medium">Taxa Efetiva</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">{result.effectiveRate}%</span>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleExportTable} className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      Exportar
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <FileText className="mr-2 h-4 w-4" />
                      Relatório
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {amortizationTable.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tabela de Amortização</CardTitle>
                <CardDescription>
                  Cronograma detalhado de pagamentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b">
                        <th className="text-left p-2">{amortizationTable[0]?.periodLabel}</th>
                        <th className="text-left p-2">Prestação</th>
                        <th className="text-left p-2">Juros</th>
                        <th className="text-left p-2">Amortização</th>
                        <th className="text-left p-2">Saldo Devedor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {amortizationTable.map((row, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">{row.period}</td>
                          <td className="p-2">{row.payment.toFixed(2)}</td>
                          <td className="p-2 text-orange-600">{row.interest.toFixed(2)}</td>
                          <td className="p-2 text-blue-600">{row.principal.toFixed(2)}</td>
                          <td className="p-2 font-medium">{row.balance.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Comparação de Cenários</CardTitle>
              <CardDescription>
                Compare diferentes condições de empréstimo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Funcionalidade de comparação em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Viabilidade</CardTitle>
              <CardDescription>
                Análise detalhada da capacidade de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Funcionalidade de análise em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreditSimulatorModule;
