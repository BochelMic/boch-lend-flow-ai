
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calculator, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const CreditSimulatorModule = () => {
  const [amount, setAmount] = useState('');
  const [term, setTerm] = useState('');
  const [interestRate] = useState(2.5); // Taxa fixa de exemplo
  const [simulation, setSimulation] = useState(null);

  const calculateSimulation = () => {
    const principal = parseFloat(amount);
    const months = parseInt(term);
    const monthlyRate = interestRate / 100 / 12;

    if (principal && months) {
      const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                            (Math.pow(1 + monthlyRate, months) - 1);
      
      const totalAmount = monthlyPayment * months;
      const totalInterest = totalAmount - principal;

      setSimulation({
        monthlyPayment: monthlyPayment.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        totalInterest: totalInterest.toFixed(2),
        principal: principal.toFixed(2),
        term: months,
        rate: interestRate
      });
    }
  };

  const resetSimulation = () => {
    setAmount('');
    setTerm('');
    setSimulation(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Simulador de Crédito</h1>
          <p className="text-muted-foreground">
            Simule seu empréstimo e veja as condições de pagamento
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de Simulação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Dados da Simulação
            </CardTitle>
            <CardDescription>
              Preencha os dados para simular seu crédito
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Montante Solicitado (AOA)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Ex: 500000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="term">Prazo de Pagamento</Label>
              <Select value={term} onValueChange={setTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o prazo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 meses</SelectItem>
                  <SelectItem value="12">12 meses</SelectItem>
                  <SelectItem value="18">18 meses</SelectItem>
                  <SelectItem value="24">24 meses</SelectItem>
                  <SelectItem value="36">36 meses</SelectItem>
                  <SelectItem value="48">48 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Taxa de Juros (mensal)</Label>
              <div className="p-3 bg-muted rounded-md">
                <span className="text-lg font-semibold">{interestRate}%</span>
                <span className="text-sm text-muted-foreground ml-2">ao mês</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={calculateSimulation} 
                className="flex-1"
                disabled={!amount || !term}
              >
                Simular
              </Button>
              <Button variant="outline" onClick={resetSimulation}>
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultados da Simulação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resultado da Simulação
            </CardTitle>
            <CardDescription>
              Detalhes do seu empréstimo simulado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {simulation ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Valor Solicitado</Label>
                    <div className="text-2xl font-bold text-blue-600">
                      {parseFloat(simulation.principal).toLocaleString()} AOA
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Prestação Mensal</Label>
                    <div className="text-2xl font-bold text-green-600">
                      {parseFloat(simulation.monthlyPayment).toLocaleString()} AOA
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Total de Juros</Label>
                    <div className="text-lg font-semibold text-orange-600">
                      {parseFloat(simulation.totalInterest).toLocaleString()} AOA
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Total a Pagar</Label>
                    <div className="text-lg font-semibold">
                      {parseFloat(simulation.totalAmount).toLocaleString()} AOA
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Resumo do Empréstimo</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Prazo: {simulation.term} meses</li>
                    <li>• Taxa: {simulation.rate}% ao mês</li>
                    <li>• Primeira prestação: Em 30 dias</li>
                    <li>• Modalidade: Crédito pessoal</li>
                  </ul>
                </div>

                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-800">
                    Simulação realizada com sucesso! Você pode solicitar este crédito.
                  </span>
                </div>

                <Button className="w-full" size="lg">
                  Solicitar Este Crédito
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma simulação realizada</h3>
                <p className="text-muted-foreground">
                  Preencha os dados ao lado para simular seu crédito
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Aprovação Rápida</h3>
                <p className="text-sm text-muted-foreground">Análise em até 24h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Sem Burocracia</h3>
                <p className="text-sm text-muted-foreground">Processo 100% digital</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold">Taxas Competitivas</h3>
                <p className="text-sm text-muted-foreground">Melhores condições do mercado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreditSimulatorModule;
