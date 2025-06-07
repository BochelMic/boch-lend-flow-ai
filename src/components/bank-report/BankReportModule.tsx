
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, FileText, Download, Send, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const BankReportModule = () => {
  const { toast } = useToast();
  const [reportPeriod, setReportPeriod] = useState('');
  const [reportType, setReportType] = useState('');

  const handleGenerateReport = () => {
    if (!reportPeriod || !reportType) {
      toast({
        title: "Erro",
        description: "Selecione o período e tipo de relatório",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Gerando relatório BM",
      description: "Relatório para o Banco de Moçambique sendo processado..."
    });
  };

  const handleSubmitReport = () => {
    toast({
      title: "Enviando relatório",
      description: "Relatório sendo enviado ao Banco de Moçambique..."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Building2 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatório Banco de Moçambique</h1>
          <p className="text-gray-600">Relatórios regulamentares para o Banco Central</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuração do Relatório</CardTitle>
            <CardDescription>
              Configure os parâmetros para o relatório regulamentar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="period">Período de Referência</Label>
              <Select onValueChange={setReportPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-01">Janeiro 2024</SelectItem>
                  <SelectItem value="2024-02">Fevereiro 2024</SelectItem>
                  <SelectItem value="2024-03">Março 2024</SelectItem>
                  <SelectItem value="2024-04">Abril 2024</SelectItem>
                  <SelectItem value="2024-05">Maio 2024</SelectItem>
                  <SelectItem value="2024-06">Junho 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportType">Tipo de Relatório</Label>
              <Select onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit-portfolio">Carteira de Crédito</SelectItem>
                  <SelectItem value="financial">Demonstrações Financeiras</SelectItem>
                  <SelectItem value="compliance">Relatório de Compliance</SelectItem>
                  <SelectItem value="risk">Relatório de Risco</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleGenerateReport} className="flex-1">
                <FileText className="mr-2 h-4 w-4" />
                Gerar Relatório
              </Button>
              <Button variant="outline" onClick={handleGenerateReport}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Envio para BM</CardTitle>
            <CardDescription>
              Envie o relatório diretamente para o Banco de Moçambique
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Atenção:</strong> Certifique-se de que todos os dados estão corretos antes do envio.
              </p>
            </div>

            <Button onClick={handleSubmitReport} className="w-full">
              <Send className="mr-2 h-4 w-4" />
              Enviar para Banco de Moçambique
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Envios</CardTitle>
          <CardDescription>
            Relatórios enviados anteriormente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Carteira de Crédito - Maio 2024</p>
                <p className="text-sm text-gray-500">Enviado em 05/06/2024</p>
              </div>
              <span className="text-green-600 text-sm font-medium">Aceito</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Demonstrações Financeiras - Abril 2024</p>
                <p className="text-sm text-gray-500">Enviado em 05/05/2024</p>
              </div>
              <span className="text-green-600 text-sm font-medium">Aceito</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BankReportModule;
