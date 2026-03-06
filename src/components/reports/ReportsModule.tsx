import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, FileText, Download, Calendar, TrendingUp, Users, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exportToExcel, downloadDocument } from '@/utils/exportUtils';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ReportsModule = () => {
  const { toast } = useToast();
  // Filter Dialog State
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportFilters, setReportFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'all'
  });

  const [inssDialogOpen, setInssDialogOpen] = useState(false);
  const [inssData, setInssData] = useState({
    mesReferencia: new Date().toISOString().substr(0, 7),
    nomeEmpresa: '',
    nuit: '',
    totalFuncionarios: 0,
    totalRemuneracao: 0,
    totalContribuicao: 0
  });

  const canGenerateINSS = () => {
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 8);

    return currentDay >= 20 || currentDate <= nextMonth;
  };

  const generateRealReport = async () => {
    if (!selectedReportType) return;
    setIsGenerating(true);

    try {
      if (selectedReportType === 'carteira') {
        let query = supabase.from('loans').select('*, clients!inner(name, id_number, phone)');
        if (reportFilters.status !== 'all') {
          query = query.eq('status', reportFilters.status);
        }
        if (reportFilters.startDate) {
          query = query.gte('created_at', reportFilters.startDate);
        }
        if (reportFilters.endDate) {
          query = query.lte('created_at', reportFilters.endDate);
        }

        const { data, error } = await query;
        if (error) throw error;

        let totalCreditos = 0;
        let totalPago = 0;
        let totalDevedor = 0;
        let clientesEmAtraso = 0;

        const rows = (data || []).map((l: any) => {
          totalCreditos += Number(l.amount);
          totalDevedor += Number(l.remaining_amount);
          totalPago += Number(l.total_amount) - Number(l.remaining_amount);
          if (l.status === 'overdue') clientesEmAtraso++;

          return [
            l.clients?.name || 'N/A',
            l.amount?.toLocaleString() || '0',
            (Number(l.total_amount) - Number(l.remaining_amount)).toLocaleString(),
            l.remaining_amount?.toLocaleString() || '0',
            l.status === 'active' ? 'Ativo' : l.status === 'completed' ? 'Quitado' : l.status === 'overdue' ? 'Em Atraso' : 'Pendente',
            new Date(l.created_at).toLocaleDateString('pt-BR')
          ];
        });

        const reportData = {
          title: 'Relatório de Carteira de Crédito',
          headers: ['Cliente', 'Valor Crédito', 'Valor Pago', 'Saldo Devedor', 'Status', 'Data Emissão'],
          data: rows,
          summary: {
            'Total Original': totalCreditos.toLocaleString(),
            'Total Pago Acumulado': totalPago.toLocaleString(),
            'Saldo Devedor Total': totalDevedor.toLocaleString(),
            'Registos em Atraso': clientesEmAtraso.toString()
          }
        };
        exportToExcel(reportData, 'Relatorio_Carteira_Credito');
        toast({ title: "Relatório de Carteira gerado", description: "Dados exportados com sucesso." });

      } else if (selectedReportType === 'inadimplencia') {
        let query = supabase.from('loans').select('*, clients!inner(name, id_number, phone)').eq('status', 'overdue');
        if (reportFilters.startDate) query = query.gte('created_at', reportFilters.startDate);
        if (reportFilters.endDate) query = query.lte('created_at', reportFilters.endDate);

        const { data, error } = await query;
        if (error) throw error;

        let totalAtraso = 0;
        const rows = (data || []).map((l: any) => {
          totalAtraso += Number(l.remaining_amount);
          const end = l.end_date ? new Date(l.end_date) : new Date();
          const p = Math.max(0, Math.ceil((new Date().getTime() - end.getTime()) / (1000 * 3600 * 24)));

          return [
            l.clients?.name || 'N/A',
            l.clients?.phone || 'N/A',
            l.amount?.toLocaleString() || '0',
            p.toString(),
            l.remaining_amount?.toLocaleString() || '0',
            new Date(l.created_at).toLocaleDateString('pt-BR')
          ];
        });

        const reportData = {
          title: 'Relatório de Inadimplência',
          headers: ['Cliente', 'Contacto', 'Valor Original', 'Dias Atraso', 'Valor Devido', 'Data Emissão'],
          data: rows,
          summary: {
            'Total em Atraso': totalAtraso.toLocaleString(),
            'Clientes Inadimplentes': rows.length.toString(),
          }
        };
        exportToExcel(reportData, 'Relatorio_Inadimplencia');
        toast({ title: "Relatório de Inadimplência gerado", description: "Exportado com sucesso." });

      } else if (selectedReportType === 'clientes') {
        let query = supabase.from('clients').select('id, user_id, name, id_number, phone, status, created_at, loans(amount, remaining_amount, status)');
        if (reportFilters.status !== 'all') {
          query = query.eq('status', reportFilters.status);
        }
        if (reportFilters.startDate) query = query.gte('created_at', reportFilters.startDate);
        if (reportFilters.endDate) query = query.lte('created_at', reportFilters.endDate);

        const { data: clientsData, error } = await query;
        if (error) throw error;

        // Fetch credit requests to get all the extra user info (nuit, address, etc)
        const { data: requestsData } = await supabase.from('credit_requests').select('*');

        let ativos = 0;
        const rows = (clientsData || []).map((c: any) => {
          if (c.status === 'active') ativos++;
          const ls = c.loans || [];
          const tempAtivo = ls.some((x: any) => x.status === 'active' || x.status === 'overdue') ? 'Sim' : 'Não';
          const totalEmp = ls.reduce((acc: number, x: any) => acc + Number(x.amount || 0), 0);
          const deve = ls.reduce((acc: number, x: any) => acc + Number(x.remaining_amount || 0), 0);

          // Find matching credit request to pull full profile data
          const req = (requestsData || []).find((r: any) =>
            (c.user_id && r.user_id === c.user_id) ||
            (r.client_phone === c.phone) ||
            (r.client_name === c.name)
          ) || {};

          return [
            c.name || 'N/A',
            req.document_type || 'N/A',
            c.id_number || req.document_number || 'N/A',
            req.nuit || 'N/A',
            c.phone || 'N/A',
            req.gender || 'N/A',
            req.birth_date ? new Date(req.birth_date).toLocaleDateString('pt-BR') : 'N/A',
            req.province || 'N/A',
            req.district || 'N/A',
            req.neighborhood || 'N/A',
            req.occupation || 'N/A',
            req.company_name || 'N/A',
            req.monthly_income?.toLocaleString() || 'N/A',
            tempAtivo,
            totalEmp.toLocaleString(),
            deve.toLocaleString(),
            c.status === 'active' ? 'Ativo' : 'Pendente'
          ];
        });

        const reportData = {
          title: 'Relatório Completo de Clientes',
          headers: [
            'Nome', 'Tipo Doc', 'Nº Documento', 'NUIT', 'Telefone', 'Género', 'Data Nasc.',
            'Província', 'Distrito', 'Bairro', 'Ocupação', 'Empresa/Local', 'Renda (MZN)',
            'Crédito Ativo?', 'Total Historico', 'Dívida Atual', 'Status'
          ],
          data: rows,
          summary: {
            'Total de Clientes Registados': rows.length.toString(),
            'Clientes Ativos': ativos.toString(),
          }
        };
        exportToExcel(reportData, 'Relatorio_Clientes_Completo');
        toast({ title: "Relatório de Clientes gerado", description: "Exportado com sucesso." });

      } else if (selectedReportType === 'financeiro') {
        toast({ title: "Relatório Financeiro", description: "O módulo financeiro está a ser calculado na carteira." });
      }

      setFilterDialogOpen(false);
    } catch (error: any) {
      console.error('Erro ao gerar relatório', error);
      toast({ title: 'Erro ao gerar relatório', description: error.message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenFilterDialog = (reportType: string) => {
    setSelectedReportType(reportType);
    setReportFilters({ startDate: '', endDate: '', status: 'all' });
    setFilterDialogOpen(true);
  };

  const handleDownloadReport = (reportType: string) => {
    console.log('Baixando relatório do tipo:', reportType);

    const reportHTML = generateReportHTML(reportType);
    const success = downloadDocument(reportHTML, `Relatorio_${reportType}_${new Date().toISOString().split('T')[0]}`);

    if (success) {
      toast({
        title: "Download iniciado",
        description: `Relatório de ${reportType} sendo baixado...`
      });
    }
  };

  const generateReportHTML = (reportType: string) => {
    const currentDate = new Date().toLocaleDateString('pt-BR');

    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>Relatório ${reportType}</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
              .header { text-align: center; margin-bottom: 30px; }
              .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
              .subtitle { font-size: 16px; color: #666; }
              .content { margin: 20px 0; }
              .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
          </style>
      </head>
      <body>
          <div class="header">
              <div class="title">BOCHEL MICROCRÉDITO</div>
              <div class="subtitle">Relatório de ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}</div>
          </div>
          
          <div class="content">
              <p>Este relatório foi gerado automaticamente pelo sistema de gestão.</p>
              <p>Para informações detalhadas, consulte o arquivo Excel correspondente.</p>
          </div>
          
          <div class="footer">
              <p>Documento gerado em ${currentDate}</p>
          </div>
      </body>
      </html>
    `;
  };

  const handleGenerateINSS = () => {
    if (!canGenerateINSS()) {
      toast({
        title: "Período inválido",
        description: "Declarações de INSS só podem ser geradas entre os dias 20 do mês atual e 8 do mês seguinte.",
        variant: "destructive"
      });
      return;
    }

    if (!inssData.nomeEmpresa || !inssData.nuit) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const inssContent = generateINSSDeclaration(inssData);
    const success = downloadDocument(inssContent, `Declaracao_INSS_${inssData.mesReferencia.replace('-', '_')}`);

    if (success) {
      toast({
        title: "Declaração INSS gerada",
        description: "Declaração de INSS foi gerada e baixada com sucesso."
      });
      setInssDialogOpen(false);
    }
  };

  const generateINSSDeclaration = (data: typeof inssData) => {
    const currentDate = new Date().toLocaleDateString('pt-BR');

    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>Declaração INSS - ${data.mesReferencia}</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
              .company-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
              .document-title { font-size: 20px; margin: 20px 0; }
              .info-section { margin: 20px 0; }
              .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              .info-table th, .info-table td { padding: 12px; border: 1px solid #ddd; text-align: left; }
              .info-table th { background-color: #f5f5f5; font-weight: bold; }
              .total-row { font-weight: bold; background-color: #e8f4f8; }
              .signature-section { margin-top: 50px; }
              .signature-line { border-top: 1px solid #000; width: 300px; margin: 50px auto 10px; text-align: center; }
              .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
          </style>
      </head>
      <body>
          <div class="header">
              <div class="company-name">${data.nomeEmpresa}</div>
              <div>NUIT: ${data.nuit}</div>
              <div class="document-title">DECLARAÇÃO DE CONTRIBUIÇÕES PARA O INSS</div>
              <div>Mês de Referência: ${new Date(data.mesReferencia + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}</div>
          </div>
          
          <div class="info-section">
              <h3>RESUMO DAS CONTRIBUIÇÕES</h3>
              <table class="info-table">
                  <thead>
                      <tr>
                          <th>Descrição</th>
                          <th>Quantidade</th>
                          <th>Valor (MZN)</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr>
                          <td>Total de Funcionários</td>
                          <td>${data.totalFuncionarios}</td>
                          <td>-</td>
                      </tr>
                      <tr>
                          <td>Total de Remunerações</td>
                          <td>-</td>
                          <td>${data.totalRemuneracao.toLocaleString()}</td>
                      </tr>
                      <tr class="total-row">
                          <td>Total de Contribuições (7%)</td>
                          <td>-</td>
                          <td>${data.totalContribuicao.toLocaleString()}</td>
                      </tr>
                  </tbody>
              </table>
          </div>

          <div class="info-section">
              <p><strong>DECLARAÇÃO:</strong></p>
              <p>Declaramos para os devidos efeitos que as informações constantes nesta declaração correspondem à verdade dos factos relativos às contribuições devidas ao Instituto Nacional de Segurança Social (INSS) referentes ao mês de ${new Date(data.mesReferencia + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}.</p>
              
              <p>As contribuições foram calculadas sobre as remunerações pagas aos funcionários da empresa, conforme previsto na legislação em vigor.</p>
          </div>

          <div class="signature-section">
              <div class="signature-line">
                  <div>Assinatura do Responsável</div>
              </div>
              <div style="text-align: center; margin-top: 10px;">
                  <div>Nome: _________________________________</div>
                  <div style="margin-top: 10px;">Cargo: _________________________________</div>
              </div>
          </div>
          
          <div class="footer">
              <p>Documento gerado automaticamente pelo sistema em ${currentDate}</p>
              <p>Este documento deve ser apresentado ao INSS dentro do prazo legal</p>
          </div>
      </body>
      </html>
    `;
  };

  const reports = [
    {
      title: "Relatório de Carteira",
      description: "Análise completa da carteira de crédito",
      icon: BarChart3,
      type: "carteira"
    },
    {
      title: "Relatório de Inadimplência",
      description: "Análise de clientes em atraso",
      icon: TrendingUp,
      type: "inadimplencia"
    },
    {
      title: "Relatório de Clientes",
      description: "Informações detalhadas dos clientes",
      icon: Users,
      type: "clientes"
    },
    {
      title: "Relatório Financeiro",
      description: "Demonstrativos financeiros",
      icon: FileText,
      type: "financeiro"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <BarChart3 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Gere relatórios detalhados do sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <Card key={report.type}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <report.icon className="h-6 w-6 text-blue-600" />
                <CardTitle>{report.title}</CardTitle>
              </div>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleOpenFilterDialog(report.type)}
                  className="flex-1"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Declaração INSS Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-green-600" />
              <CardTitle>Declaração INSS</CardTitle>
            </div>
            <CardDescription>
              Gerar declaração de contribuições para o INSS
              {!canGenerateINSS() && (
                <span className="block text-red-500 text-sm mt-1">
                  Disponível apenas entre os dias 20 e 8 do mês seguinte
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={inssDialogOpen} onOpenChange={setInssDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="w-full"
                  disabled={!canGenerateINSS()}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Gerar Declaração INSS
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Declaração INSS</DialogTitle>
                  <DialogDescription>
                    Preencha os dados para gerar a declaração de contribuições do INSS
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="mesReferencia">Mês de Referência</Label>
                    <Input
                      id="mesReferencia"
                      type="month"
                      value={inssData.mesReferencia}
                      onChange={(e) => setInssData({ ...inssData, mesReferencia: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
                    <Input
                      id="nomeEmpresa"
                      value={inssData.nomeEmpresa}
                      onChange={(e) => setInssData({ ...inssData, nomeEmpresa: e.target.value })}
                      placeholder="Digite o nome da empresa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nuit">NUIT</Label>
                    <Input
                      id="nuit"
                      value={inssData.nuit}
                      onChange={(e) => setInssData({ ...inssData, nuit: e.target.value })}
                      placeholder="Digite o NUIT da empresa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalFuncionarios">Total de Funcionários</Label>
                    <Input
                      id="totalFuncionarios"
                      type="number"
                      value={inssData.totalFuncionarios}
                      onChange={(e) => setInssData({ ...inssData, totalFuncionarios: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalRemuneracao">Total de Remunerações (MZN)</Label>
                    <Input
                      id="totalRemuneracao"
                      type="number"
                      value={inssData.totalRemuneracao}
                      onChange={(e) => {
                        const remuneracao = Number(e.target.value);
                        setInssData({
                          ...inssData,
                          totalRemuneracao: remuneracao,
                          totalContribuicao: remuneracao * 0.07
                        });
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalContribuicao">Total de Contribuições (7%)</Label>
                    <Input
                      id="totalContribuicao"
                      type="number"
                      value={inssData.totalContribuicao}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                  <Button onClick={handleGenerateINSS} className="w-full">
                    Gerar Declaração
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Relatórios Agendados</CardTitle>
          <CardDescription>
            Configure relatórios para geração automática
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Agendar Relatório
          </Button>
        </CardContent>
      </Card>

      {/* Extracted Filter Dialog for all Excel Reports */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gerar Relatório</DialogTitle>
            <DialogDescription>
              Filtre os dados por período para um relatório mais limpo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={reportFilters.startDate}
                  onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">Data Final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={reportFilters.endDate}
                  onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value })}
                />
              </div>
            </div>

            {(selectedReportType === 'carteira' || selectedReportType === 'clientes') && (
              <div>
                <Label>Status</Label>
                <Select value={reportFilters.status} onValueChange={(v) => setReportFilters({ ...reportFilters, status: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    {selectedReportType === 'carteira' && <SelectItem value="overdue">Em Atraso</SelectItem>}
                    {selectedReportType === 'carteira' && <SelectItem value="completed">Quitados</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button onClick={generateRealReport} className="w-full" disabled={isGenerating}>
              {isGenerating ? 'A gerar...' : 'Baixar Relatório (Excel)'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsModule;
