
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, DollarSign, Calendar, Percent } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CreditSimulatorModule = () => {
  const { toast } = useToast();
  const [simulationData, setSimulationData] = useState({
    amount: '',
    term: '',
    interestRate: '',
    clientType: ''
  });
  const [result, setResult] = useState(null);

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
    const rate = parseFloat(simulationData.interestRate) / 100 / 12;
    
    const monthlyPayment = amount * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    const totalAmount = monthlyPayment * term;
    const totalInterest = totalAmount - amount;

    setResult({
      monthlyPayment: monthlyPayment.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      totalInterest: totalInterest.toFixed(2)
    });

    toast({
      title: "Simulação concluída",
      description: "Resultado da simulação calculado com sucesso"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Calculator className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Simulador de Crédito</h1>
          <p className="text-gray-600">Simule condições de crédito para clientes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados da Simulação</CardTitle>
            <CardDescription>
              Insira os dados para simular o crédito
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
                  <span className="font-medium">Prestação Mensal</span>
                </div>
                <span className="text-lg font-bold text-blue-600">MZN {result.monthlyPayment}</span>
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CreditSimulatorModule;
