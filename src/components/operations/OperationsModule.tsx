
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  AlertCircle,
  Download,
  FileText,
  Calendar,
  Search,
  Filter,
  BarChart3,
  PieChart,
  Receipt,
  FileX
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel, exportToWord, ReportData } from '../../utils/exportUtils';
import DocumentGenerator from '../documents/DocumentGenerator';

const OperationsDashboard = () => {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  const handleExportReport = async (reportType: string, format: 'excel' | 'word') => {
    // Dados de exemplo para demonstração
    const reportData: ReportData = {
      title: `Relatório de ${reportType}`,
      headers: ['Data', 'Cliente', 'Valor', 'Status', 'Observações'],
      data: [
        ['15/03/2024', 'João Silva', 'MZN 25,000', 'Ativo', 'Pagamento em dia'],
        ['14/03/2024', 'Maria Santos', 'MZN 15,000', 'Pendente', 'Aguardando documentação'],
        ['13/03/2024', 'Carlos Mussa', 'MZN 30,000', 'Aprovado', 'Liberado para pagamento']
      ],
      summary: {
        'Total de Registros': 3,
        'Valor Total': 'MZN 70,000',
        'Status Ativo': 1,
        'Status Pendente': 1,
        'Status Aprovado': 1
      }
    };

    try {
      let success = false;
      const filename = `relatorio-${reportType.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      
      if (format === 'excel') {
        success = exportToExcel(reportData, filename);
      } else {
        const content = `
          ${reportData.title}
          
          Data de Geração: ${new Date().toLocaleDateString()}
          
          Dados:
          ${reportData.data.map(row => row.join(' | ')).join('\n')}
          
          Resumo:
          ${Object.entries(reportData.summary || {}).map(([key, value]) => `${key}: ${value}`).join('\n')}
        `;
        success = exportToWord(content, filename);
      }

      if (success) {
        toast({
          title: "Exportação Realizada",
          description: `Relatório de ${reportType} exportado em ${format.toUpperCase()} com sucesso.`,
        });
      } else {
        toast({
          title: "Erro na Exportação",
          description: "Não foi possível exportar o relatório. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: "Erro na Exportação",
        description: "Ocorreu um erro durante a exportação.",
        variant: "destructive"
      });
    }
  };

  const handleOperationAction = (action: string, clientName?: string) => {
    switch (action) {
      case 'process_payment':
        toast({
          title: "Processando Pagamento",
          description: `Processando pagamento para ${clientName || 'cliente selecionado'}.`,
        });
        break;
      case 'update_status':
        toast({
          title: "Status Atualizado",
          description: `Status do cliente ${clientName || 'selecionado'} foi atualizado.`,
        });
        break;
      case 'send_notification':
        toast({
          title: "Notificação Enviada",
          description: `Notificação enviada para ${clientName || 'cliente selecionado'}.`,
        });
        break;
      case 'generate_statement':
        toast({
          title: "Extrato Gerado",
          description: `Extrato gerado para ${clientName || 'cliente selecionado'}.`,
        });
        break;
      default:
        toast({
          title: "Ação Executada",
          description: `Ação ${action} executada com sucesso.`,
        });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Operações</h1>
        <div className="flex space-x-2">
          <Button onClick={() => handleExportReport('Operações', 'excel')}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
          <Button variant="outline" onClick={() => handleExportReport('Operações', 'word')}>
            <FileText className="mr-2 h-4 w-4" />
            Exportar Word
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="monitoring">Monitorização</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Operações Hoje</p>
                    <p className="text-2xl font-bold">47</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Clientes Ativos</p>
                    <p className="text-2xl font-bold">1,234</p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Volume Hoje</p>
                    <p className="text-2xl font-bold">MZN 2.4M</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Alertas</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Centro de Comando Operacional</CardTitle>
              <CardDescription>
                Ferramentas principais para gestão operacional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  className="h-20 flex-col"
                  onClick={() => handleOperationAction('process_payment')}
                >
                  <DollarSign className="mb-2 h-6 w-6" />
                  <span className="text-sm">Processar Pagamentos</span>
                </Button>
                
                <Button 
                  className="h-20 flex-col"
                  variant="outline"
                  onClick={() => handleOperationAction('update_status')}
                >
                  <Users className="mb-2 h-6 w-6" />
                  <span className="text-sm">Atualizar Status</span>
                </Button>
                
                <Button 
                  className="h-20 flex-col"
                  variant="outline"
                  onClick={() => handleOperationAction('send_notification')}
                >
                  <FileText className="mb-2 h-6 w-6" />
                  <span className="text-sm">Enviar Notificações</span>
                </Button>
                
                <Button 
                  className="h-20 flex-col"
                  variant="outline"
                  onClick={() => handleOperationAction('generate_statement')}
                >
                  <BarChart3 className="mb-2 h-6 w-6" />
                  <span className="text-sm">Gerar Extratos</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <DocumentGenerator />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monitorização em Tempo Real</CardTitle>
              <CardDescription>
                Acompanhe as operações em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Buscar operação, cliente ou ID..." 
                    className="flex-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button variant="outline">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <div>
                      <span className="font-medium">João Silva - Pagamento Processado</span>
                      <p className="text-sm text-gray-600">MZN 5,250 - 14:32</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleOperationAction('view_details', 'João Silva')}>
                      Ver Detalhes
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <div>
                      <span className="font-medium">Maria Santos - Novo Empréstimo</span>
                      <p className="text-sm text-gray-600">MZN 15,000 - 14:28</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleOperationAction('view_details', 'Maria Santos')}>
                      Ver Detalhes
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                    <div>
                      <span className="font-medium">Carlos Mussa - Pagamento Atrasado</span>
                      <p className="text-sm text-gray-600">MZN 3,100 - 5 dias</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleOperationAction('send_reminder', 'Carlos Mussa')}>
                      Enviar Lembrete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Operacionais</CardTitle>
              <CardDescription>
                Gere relatórios detalhados das operações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="startDate">Data Início</Label>
                    <Input 
                      id="startDate"
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="endDate">Data Fim</Label>
                    <Input 
                      id="endDate"
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Relatório de Pagamentos</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Histórico completo de pagamentos processados
                    </p>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => handleExportReport('Pagamentos', 'excel')}>
                        <Download className="mr-1 h-3 w-3" />
                        Excel
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleExportReport('Pagamentos', 'word')}>
                        <FileText className="mr-1 h-3 w-3" />
                        Word
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Relatório de Empréstimos</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Status e performance dos empréstimos ativos
                    </p>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => handleExportReport('Empréstimos', 'excel')}>
                        <Download className="mr-1 h-3 w-3" />
                        Excel
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleExportReport('Empréstimos', 'word')}>
                        <FileText className="mr-1 h-3 w-3" />
                        Word
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Relatório de Performance</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Métricas de performance operacional
                    </p>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => handleExportReport('Performance', 'excel')}>
                        <Download className="mr-1 h-3 w-3" />
                        Excel
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleExportReport('Performance', 'word')}>
                        <FileText className="mr-1 h-3 w-3" />
                        Word
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Relatório de Compliance</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Conformidade e auditoria operacional
                    </p>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => handleExportReport('Compliance', 'excel')}>
                        <Download className="mr-1 h-3 w-3" />
                        Excel
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleExportReport('Compliance', 'word')}>
                        <FileText className="mr-1 h-3 w-3" />
                        Word
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const OperationsModule = () => {
  return (
    <Routes>
      <Route path="/" element={<OperationsDashboard />} />
      <Route path="/*" element={<OperationsDashboard />} />
    </Routes>
  );
};

export default OperationsModule;
