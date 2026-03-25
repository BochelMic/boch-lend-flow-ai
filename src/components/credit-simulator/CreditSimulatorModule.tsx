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
  Table as TableIcon, Calendar, Percent, Info, ChevronRight
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
  const [frequency, setFrequency] = useState<'daily' | '2-days' | '3-days' | 'weekly' | 'monthly'>('monthly');
  const [customAmortizations, setCustomAmortizations] = useState<number[]>([]);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const SIMULATOR_STORAGE_KEY = 'bochel_simulator_draft';
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(SIMULATOR_STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.amount) setAmount(data.amount);
        if (data.days) setDays(data.days);
        if (data.isInstallment !== undefined) setIsInstallment(data.isInstallment);
        if (data.installmentMonths) setInstallmentMonths(data.installmentMonths);
        if (data.frequency) setFrequency(data.frequency);
        if (data.customAmortizations) setCustomAmortizations(data.customAmortizations);
      } catch (e) {
        console.error('Error loading simulator draft:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Sync frequency with option
  useEffect(() => {
    const numAmount = Number(amount);
    if (numAmount <= 4000) {
      if (frequency === 'monthly') setFrequency('weekly');
    } else {
      setFrequency('monthly');
    }
  }, [amount]);

  // Auto-calculate simulation whenever inputs change
  useEffect(() => {
    handleSimulate();
    // Save to localStorage whenever inputs change
    if (isLoaded) {
      const data = {
        amount,
        days,
        isInstallment,
        installmentMonths,
        frequency,
        customAmortizations
      };
      localStorage.setItem(SIMULATOR_STORAGE_KEY, JSON.stringify(data));
    }
  }, [amount, days, isInstallment, installmentMonths, frequency, customAmortizations, isLoaded]);

  const maxInstallments = getInstallmentLimits(Number(amount));

  const handleSimulate = () => {
    const numAmount = Number(amount);
    const numDays = Number(days);
    const numMonths = Number(installmentMonths);

    if (numAmount > 0) {
      const sim = simulateCredit(
        numAmount,
        numDays,
        undefined,
        isInstallment,
        numMonths,
        frequency,
        customAmortizations.length > 0 ? customAmortizations : undefined
      );
      setResult(sim);
    } else {
      setResult(null);
    }
  };

  const updateCustomAmortization = (index: number, val: string) => {
    const totalPrincipal = Number(amount);
    let newVal = Number(val);
    if (isNaN(newVal)) newVal = 0;

    const numMonths = Number(installmentMonths);
    const newAmorts = [...customAmortizations];

    // Initialize with current values if empty
    if (newAmorts.length === 0 && result) {
      result.installments.forEach((row, i) => {
        newAmorts[i] = row.principal;
      });
    }

    // 1. Calculate what was paid *before* this installment
    let paidBefore = 0;
    for (let i = 0; i < index; i++) {
      paidBefore += newAmorts[i] || 0;
    }

    // 2. Cap the new value to available balance
    const available = totalPrincipal - paidBefore;
    const finalVal = Math.max(0, Math.min(newVal, available));
    newAmorts[index] = finalVal;

    // 3. Redistribute the remainder among subsequent months
    const totalPaidNow = paidBefore + finalVal;
    const remainingToDistribute = totalPrincipal - totalPaidNow;
    const remainingMonths = numMonths - 1 - index;

    if (remainingMonths > 0) {
      const share = remainingToDistribute / remainingMonths;
      for (let i = index + 1; i < numMonths; i++) {
        newAmorts[i] = share;
      }
    }

    setCustomAmortizations(newAmorts);
  };

  const resetSimulation = () => {
    setAmount('5000');
    setDays('30');
    setIsInstallment(false);
    setInstallmentMonths('1');
    setFrequency('monthly');
    setCustomAmortizations([]);
    setResult(null);
    localStorage.removeItem(SIMULATOR_STORAGE_KEY);
  };

  return (
    <div className={cn("w-full space-y-6 overflow-x-hidden px-4 sm:px-6 md:px-0", className)}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#1a3a5c]">Simulador de Crédito</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Análise inteligente baseada no montante e parcelamento desejado
          </p>
        </div>
        <Button
          variant="outline"
          onClick={resetSimulation}
          className="w-full sm:w-auto border-[#1a3a5c] text-[#1a3a5c] hover:bg-blue-50 h-10 px-6 font-bold"
        >
          Reiniciar
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-5 items-start">
        {/* Formulário de Simulação (Left Column) */}
        <div className="w-full md:w-[300px] shrink-0 space-y-4">
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
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setCustomAmortizations([]); // Reset custom when amount changes
                    }}
                    className="pl-12 text-lg font-bold border-2 focus-visible:ring-[#1a3a5c]"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">MT</span>
                </div>
              </div>

              {!isInstallment && (
                <div className="space-y-2 animate-in fade-in duration-300">
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
              )}

              {/* Analysis Badge replaced Tier Selection */}
              {result && (
                <div className="p-4 rounded-xl bg-blue-50/50 border-2 border-dashed border-blue-200 space-y-2 text-[#1a3a5c]">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold text-xs uppercase tracking-wider">Perfil Identificado</Label>
                    <Badge className="bg-[#1a3a5c] text-white">Opção {result.option}</Badge>
                  </div>
                  <p className="text-[11px] leading-relaxed font-medium">
                    {result.option === 'A' && "Crédito Geral: Aplicável para valores até 4.000 MT com juros de 30%."}
                    {result.option === 'B' && "Plano Especial: Juros reduzidos de 20% para pagamentos em até 15 dias."}
                    {result.option === 'C' && "Vencimento Fixo: Plano padrão para montantes 5.000+ MT com juros de 30%."}
                  </p>
                </div>
              )}

              {/* Installments Toggle */}
              <div className="pt-4 border-t space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-bold text-gray-700">Pagamento Parcelado</Label>
                    <p className="text-xs text-muted-foreground">
                      {Number(amount) <= 4000 ? 'Dividir em prestações curtas' : 'Dividir em prestações mensais'}
                    </p>
                  </div>
                  <Switch
                    checked={isInstallment}
                    onCheckedChange={(val) => {
                      setIsInstallment(val);
                      if (!val) setCustomAmortizations([]);
                    }}
                  />
                </div>

                {isInstallment && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                    {Number(amount) <= 4000 ? (
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-500 uppercase">Frequência</Label>
                        <Select value={frequency} onValueChange={(val: any) => setFrequency(val)}>
                          <SelectTrigger className="font-medium border-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Diário</SelectItem>
                            <SelectItem value="2-days">A cada 2 dias</SelectItem>
                            <SelectItem value="3-days">A cada 3 dias</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : null}

                    <div className="space-y-2">
                      <Label htmlFor="months" className="text-xs font-bold text-gray-500 uppercase">
                        Número de {frequency === 'monthly' ? 'Parcelas' : 'Prestações'}
                      </Label>
                      <Select value={installmentMonths} onValueChange={setInstallmentMonths}>
                        <SelectTrigger className="font-bold border-2 h-12">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(maxInstallments)].map((_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1} {frequency === 'monthly' ? (i === 0 ? 'Mês' : 'Meses') : (i === 0 ? 'Vez' : 'Vezes')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 flex gap-2">
                      <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-[10px] text-amber-800 font-bold uppercase">Ajuda Inteligente</p>
                        <p className="text-[10px] text-amber-700 font-medium leading-tight">
                          {frequency === 'monthly'
                            ? "Estamos usando o sistema de Amortização Price. O juro é calculado sobre o que sobra da dívida. Você pode editar os valores na tabela ao lado para pagar mais rápido e economizar juros!"
                            : "Na Opção A, você pode parcelar o valor total (Capital + 30%) com flexibilidade total dentro de 30 dias."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resultados e Amortização (Right Column) */}
        <div className="flex-1 min-w-0 w-full space-y-6">
          {result ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
                <Card className="border-0 shadow-md bg-white border-l-4 border-l-[#1a3a5c]">
                  <CardContent className="p-2 md:p-4 flex items-center gap-2">
                    <div className="p-1.5 md:p-2 bg-blue-50 rounded-full text-[#1a3a5c] flex-shrink-0">
                      <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight leading-none mb-0.5 truncate">Total a Pagar</p>
                      <p className="text-sm md:text-lg font-black text-[#1a3a5c] truncate">MT {Math.round(result.totalToPay).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-white border-l-4 border-l-[#d37c22]">
                  <CardContent className="p-2 md:p-4 flex items-center gap-2">
                    <div className="p-1.5 md:p-2 bg-orange-50 rounded-full text-[#d37c22] flex-shrink-0">
                      <Percent className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight leading-none mb-0.5 truncate">Juros Totais</p>
                      <p className="text-sm md:text-lg font-black text-[#d37c22] truncate">MT {Math.round(result.totalInterest).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md bg-white border-l-4 border-l-green-600 col-span-2 sm:col-span-1">
                  <CardContent className="p-2 md:p-4 flex items-center gap-2">
                    <div className="p-1.5 md:p-2 bg-green-50 rounded-full text-green-600 flex-shrink-0">
                      <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight leading-none mb-0.5 truncate">
                        {isInstallment ? '1ª Parcela' : 'Vencimento'}
                      </p>
                      <p className="text-sm md:text-lg font-black text-green-600 truncate">
                        MT {Math.round(result.installments[0].total).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Amortization Table */}
              <Card className="border-0 shadow-xl overflow-hidden">
                <CardHeader className="bg-gray-50/50 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TableIcon className="h-5 w-5 text-[#1a3a5c]" />
                        Cronograma
                      </CardTitle>
                      <CardDescription className="text-xs">Edite o capital para antecipar pagamentos</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase sm:hidden flex items-center gap-1">
                        <ChevronRight className="h-3 w-3" /> Deslize para ver
                      </span>
                      <Badge variant="outline" className="bg-[#1a3a5c] text-white border-0 font-bold px-3 py-1 ml-auto">
                        {result.option}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-bold text-[#1a3a5c] text-[10px] sm:text-xs px-1 sm:px-2 w-8 sm:w-10">Nº</TableHead>
                        <TableHead className="font-bold text-[#1a3a5c] text-[10px] sm:text-xs px-1 sm:px-2">Data</TableHead>
                        <TableHead className="font-bold text-[#1a3a5c] text-[10px] sm:text-xs px-1 sm:px-2">Saldo</TableHead>
                        <TableHead className="font-bold text-[#1a3a5c] text-[10px] sm:text-xs px-1 sm:px-2">Capital</TableHead>
                        <TableHead className="font-bold text-[#1a3a5c] text-[10px] sm:text-xs px-1 sm:px-2">Juros</TableHead>
                        <TableHead className="text-right font-bold text-[#1a3a5c] text-[10px] sm:text-xs px-1 sm:px-2">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.installments.map((row, idx) => (
                        <TableRow key={idx} className="hover:bg-blue-50/30 transition-colors">
                          <TableCell className="font-bold px-1 sm:px-2 text-[10px] sm:text-xs">{idx + 1}ª</TableCell>
                          <TableCell className="text-[10px] sm:text-xs font-medium text-gray-500 whitespace-nowrap px-1 sm:px-2">
                            {new Date(row.date).toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit' })}
                          </TableCell>
                          <TableCell className="text-[10px] sm:text-xs font-bold text-gray-400 px-1 sm:px-2">
                            {Math.round(row.balanceBefore).toLocaleString()}
                          </TableCell>
                          <TableCell className="px-1 sm:px-2">
                            <div className="relative group">
                              <Input
                                type="number"
                                value={Math.round(row.principal)}
                                onChange={(e) => updateCustomAmortization(idx, e.target.value)}
                                disabled={idx === result.installments.length - 1}
                                className={cn(
                                  "h-6 sm:h-7 py-0 px-1 text-[10px] sm:text-xs font-bold border-transparent bg-transparent hover:border-gray-200 focus:bg-white focus:border-[#1a3a5c] transition-all",
                                  idx === result.installments.length - 1 && "opacity-60 cursor-not-allowed"
                                )}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-orange-600 text-[10px] sm:text-xs px-1 sm:px-2">
                            {Math.round(row.interest).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-black text-green-700 text-[10px] sm:text-xs px-1 sm:px-2 whitespace-nowrap">
                            {Math.round(row.total).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <div className="bg-[#1a3a5c] p-6 flex flex-col items-center">
                  <div className="flex items-center gap-2 text-white/70 text-[10px] mb-4 text-center max-w-md">
                    <Info className="h-3 w-3 shrink-0" />
                    <span>
                      {isInstallment
                        ? "O valor dos juros é recalculado automaticamente se você aumentar o capital amortizado. Quanto mais você amortiza hoje, menos juros paga amanhã."
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
                          frequency,
                          totalToPay: result.totalToPay,
                          amortizationPlan: result.installments
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
                Ajuste o montante e o parcelamento para ver sua economia de juros em tempo real.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Guia de Opções (SEO & Clarity) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pb-8">
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
    </div>
  );
};

export default CreditSimulatorModule;
