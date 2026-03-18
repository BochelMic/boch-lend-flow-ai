

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Calculator, TrendingUp, AlertCircle, CheckCircle,
  Table as TableIcon, Calendar, Percent, Info
} from 'lucide-react';
import {
  simulateCredit,
  getAvailableOptions,
  getInstallmentLimits,
  CreditOption,
  SimulationResult
} from '@/utils/creditUtils';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CreditSimulatorModuleProps {
  className?: string;
  onApply?: (data: any) => void;
}

const CreditSimulatorModule = ({ className, onApply }: CreditSimulatorModuleProps) => {
  const [amount, setAmount] = useState('5000');
  const [days, setDays] = useState('30');
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentMonths, setInstallmentMonths] = useState('1');
  const [result, setResult] = useState<SimulationResult | null>(null);

  // Auto-calculate simulation whenever inputs change
  useEffect(() => {
    handleSimulate();
  }, [amount, days, isInstallment, installmentMonths]);

  const maxInstallments = getInstallmentLimits(Number(amount));

  const handleSimulate = () => {
    const numAmount = Number(amount);
    const numDays = Number(days);
    const numMonths = Number(installmentMonths);

    if (numAmount > 0 && numDays > 0) {
      // simulateCredit now auto-determines the option (A/B/C)
      const sim = simulateCredit(numAmount, numDays, undefined, isInstallment, numMonths);
      setResult(sim);
    } else {
      setResult(null);
    }
  };

  const resetSimulation = () => {
    setAmount('5000');
    setDays('30');
    setIsInstallment(false);
    setInstallmentMonths('1');
    setResult(null);
  };

  return (
    <div className={cn("w-full space-y-6 overflow-x-hidden", className)}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#1a3a5c]">Simulador de Crédito</h1>
          <p className="text-muted-foreground font-medium">
            Análise inteligente baseada no montante e prazo solicitados
          </p>
        </div>
        <Button variant="outline" onClick={resetSimulation} className="border-[#1a3a5c] text-[#1a3a5c] hover:bg-blue-50">
          Reiniciar
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-start">
        {/* Formulário de Simulação (Left Column) */}
        <div className="w-full lg:w-[300px] shrink-0 space-y-4">
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="bg-[#1a3a5c] p-4 text-white">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="h-5 w-5" /> Configurar Crédito
              </CardTitle>
            </div>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="amount" className="font-bold text-gray-700">Montante Solicitado (MZN)</Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-12 text-lg font-bold border-2 focus-visible:ring-[#1a3a5c]"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">MT</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="days" className="font-bold text-gray-700">Prazo de Pagamento (Dias)</Label>
                <Select value={days} onValueChange={setDays}>
                  <SelectTrigger className="border-2 font-medium">
                    <SelectValue placeholder="Selecione os dias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="15">15 dias</SelectItem>
                    <SelectItem value="21">21 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Analysis Badge replaced Tier Selection */}
              {result && (
                <div className="p-4 rounded-xl bg-blue-50/50 border-2 border-dashed border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold text-[#1a3a5c] text-xs uppercase tracking-wider">Perfil Identificado</Label>
                    <Badge className="bg-[#1a3a5c] text-white">Opção {result.option}</Badge>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                    {result.option === 'A' && "Crédito Geral: Aplicável para valores até 4.000 MT com juros de 30%."}
                    {result.option === 'B' && "Plano Especial: Juros reduzidos de 20% para pagamentos em até 15 dias."}
                    {result.option === 'C' && "Vencimento Fixo: Plano padrão para montantes 5.000+ MT com juros de 30%."}
                  </p>
                  {result.option === 'B' && (
                    <div className="bg-orange-50 p-2 rounded-lg border border-orange-100 mt-2">
                      <p className="text-[10px] text-orange-700 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        <strong>Atenção:</strong> Se passar de 15 dias, os juros saltam para 30%.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Installments Toggle */}
              {maxInstallments > 1 && (
                <div className="pt-4 border-t space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="font-bold text-gray-700">Pagamento Parcelado</Label>
                      <p className="text-xs text-muted-foreground">
                        {result?.option === 'A' ? 'Dividir em prestações semanais' : 'Dividir em prestações mensais'}
                      </p>
                    </div>
                    <Switch
                      checked={isInstallment}
                      onCheckedChange={setIsInstallment}
                    />
                  </div>

                  {isInstallment && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <Label htmlFor="months" className="text-xs font-bold text-gray-500 uppercase">
                        Número de {result?.option === 'A' ? 'Semanas' : 'Prestações'}
                      </Label>
                      <Select value={installmentMonths} onValueChange={setInstallmentMonths}>
                        <SelectTrigger className="font-bold border-2 h-12">
                          <SelectValue placeholder={result?.option === 'A' ? 'Semanas' : 'Meses'} />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(maxInstallments)].map((_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1} {result?.option === 'A' ? (i === 0 ? 'Semana' : 'Semanas') : (i === 0 ? 'Mês' : 'Meses')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-amber-600 font-medium flex gap-1 items-center bg-amber-50 p-2 rounded-lg">
                        <Info className="h-3 w-3" />
                        {result?.option === 'A'
                          ? "Pagamentos semanais recomendados para facilitar a quitação dentro dos 30 dias."
                          : "Prestações mensais fixas com juros de 30%."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resultados e Amortização (Right Column) */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          {result ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
                <Card className="border-0 shadow-md bg-white border-l-4 border-l-[#1a3a5c]">
                  <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-4">
                    <div className="p-2 bg-blue-50 rounded-full text-[#1a3a5c] flex-shrink-0">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight leading-none mb-1 truncate">Total a Pagar</p>
                      <p className="text-base md:text-lg font-black text-[#1a3a5c] truncate">MT {result.totalToPay.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-white border-l-4 border-l-[#d37c22]">
                  <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-4">
                    <div className="p-2 bg-orange-50 rounded-full text-[#d37c22] flex-shrink-0">
                      <Percent className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight leading-none mb-1 truncate">Juros Totais</p>
                      <p className="text-base md:text-lg font-black text-[#d37c22] truncate">MT {result.totalInterest.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-white border-l-4 border-l-green-600">
                  <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-4">
                    <div className="p-2 bg-green-50 rounded-full text-green-600 flex-shrink-0">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight leading-none mb-1 truncate">
                        {isInstallment
                          ? (result.option === 'A' ? 'Semanal' : 'Mensal')
                          : 'Vencimento'}
                      </p>
                      <p className="text-base md:text-lg font-black text-green-600 truncate">
                        MT {isInstallment
                          ? result.installments[0].total.toLocaleString()
                          : result.totalToPay.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Amortization Table */}
              <Card className="border-0 shadow-xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TableIcon className="h-5 w-5 text-[#1a3a5c]" />
                        Cronograma Financeiro
                      </CardTitle>
                      <CardDescription>Visualização detalhada do seu compromisso</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-[#1a3a5c] text-white border-0 font-bold px-3 py-1">
                      PLANO {result.option}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-16 font-bold text-[#1a3a5c]">Nº</TableHead>
                        <TableHead className="font-bold text-[#1a3a5c]">
                          {result.option === 'A' ? 'Semana/Data' : 'Mês/Data'}
                        </TableHead>
                        <TableHead className="font-bold text-[#1a3a5c]">Capital</TableHead>
                        <TableHead className="font-bold text-[#1a3a5c]">
                          Juros ({result.option === 'B' && Number(days) <= 15 ? '20%' : '30%'})
                        </TableHead>
                        <TableHead className="text-right font-bold text-[#1a3a5c]">Total Parcela</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.installments.map((row) => (
                        <TableRow key={row.installmentNumber} className="hover:bg-blue-50/30 transition-colors">
                          <TableCell className="font-bold">{row.installmentNumber}ª</TableCell>
                          <TableCell className="text-xs font-medium text-gray-500">
                            {new Date(row.date).toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </TableCell>
                          <TableCell className="font-medium">MT {row.principal.toLocaleString()}</TableCell>
                          <TableCell className="font-medium text-orange-600">+ MT {row.interest.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-black text-green-700">MT {row.total.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <div className="bg-[#1a3a5c] p-6 flex flex-col items-center">
                  <div className="flex items-center gap-2 text-white/70 text-[10px] mb-4 text-center max-w-sm">
                    <Info className="h-3 w-3 shrink-0" />
                    <span>
                      {isInstallment
                        ? (result.option === 'A'
                          ? "A Opção A permite flexibilidade semanal para quitação do capital e juros fixos de 30%."
                          : "Prestações fixas mensais. Nestes valores parcelados você poderá pagar o exacto valor, acima ou o total do valor disponível.")
                        : "Pagamento único em regime de juro fixo para o período selecionado."}
                    </span>
                  </div>
                  <Button
                    className="w-full h-14 bg-[#d37c22] hover:bg-[#b0661a] text-white font-bold text-lg shadow-2xl transition-transform active:scale-[0.98]"
                    onClick={() => {
                      if (onApply) {
                        onApply({
                          amount: Number(amount),
                          days: Number(days),
                          option: result.option,
                          isInstallment,
                          installments: Number(installmentMonths),
                          totalToPay: result.totalToPay
                        });
                      }
                    }}
                  >
                    Solicitar Crédito Agora
                  </Button>
                </div>
              </Card>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-24 text-center bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
              <Calculator className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-400">Pronto para Simular</h3>
              <p className="text-gray-400 max-w-xs mx-auto text-sm">
                Ajuste o montante e o prazo para que nossa análise inteligente determine o melhor plano para você.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Guia de Opções (SEO & Clarity) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pb-12">
        <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-all duration-300 border-t-2 border-t-transparent hover:border-t-[#1a3a5c]">
          <CardHeader className="p-4 pb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#1a3a5c] mb-2 font-black">A</div>
            <CardTitle className="text-sm font-bold">Opção A: Micro</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Para valores entre <strong>500 MT e 4.000 MT</strong>. Juros estáveis de <strong>30%</strong> para até 30 dias. Simples e rápido.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white border-t-4 border-t-[#d37c22] hover:scale-[1.02] transition-transform">
          <CardHeader className="p-4 pb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-[#d37c22] mb-2 font-black">B</div>
            <CardTitle className="text-sm font-bold">Opção B: Express</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Para créditos de <strong>5.000 MT+</strong>. Apenas <strong>20% de juros</strong> se liquidado em 15 dias!
              <span className="block mt-1 text-orange-700 font-bold italic text-[9px] uppercase tracking-tighter">* Após 15 dias, juros saltam para 30%.</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-all duration-300 border-t-2 border-t-transparent hover:border-t-green-600">
          <CardHeader className="p-4 pb-2">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-700 mb-2 font-black">C</div>
            <CardTitle className="text-sm font-bold">Opção C: Standard</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Para créditos de <strong>5.000 MT+</strong> com prazo de 16 a 30 dias. Juros fixos de <strong>30%</strong> no período.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-[#1a3a5c] text-white hover:shadow-lg transition-all duration-300">
          <CardHeader className="p-4 pb-2">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-2 font-black">
              <TrendingUp className="h-5 w-5" />
            </div>
            <CardTitle className="text-sm font-bold">Parcelamento</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-white/70 leading-relaxed">
              Pague em até <strong>6 meses</strong> para valores acima de <strong>50.000 MT</strong>. Amortização mensal com prestações fixas.
            </p>
          </CardContent>
        </Card>
      </div>
    </div >
  );
};

export default CreditSimulatorModule;
