import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, FileText, Download, Calendar, TrendingUp, Users, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exportToExcel, downloadDocument } from '@/utils/exportUtils';

const ReportsModule = () => {
  const { toast } = useToast();
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

  const generateCarteiraReport = () => {
    const reportData = {
      title: 'Relatório de Carteira de Crédito',
      headers: ['Cliente', 'Valor Crédito', 'Valor Pago', 'Saldo Devedor', 'Status'],
      data: [
        ['João Silva', '50000', '15000', '35000', 'Em Dia'],
        ['Maria Santos', '30000', '30000', '0', 'Quitado'],
        ['Carlos Pereira', '75000', '20000', '55000', 'Atraso'],
        ['Ana Costa', '40000', '10000', '30000', 'Em Dia']
      ],
      summary: {
        'Total de Créditos': '195000',
        'Total Pago': '75000',
        'Saldo Devedor Total': '120000',
        'Taxa de Inadimplência': '27.3%'
      }
    };

    const success = exportToExcel(reportData, 'Relatorio_Carteira_Credito');
    if (success) {
      toast({
        title: "Relatório de Carteira gerado",
        description: "Análise completa da carteira de crédito exportada com sucesso."
      });
    }
  };

  const generateInadimplenciaReport = () => {
    const reportData = {
      title: 'Relatório de Inadimplência',
      headers: ['Cliente', 'Valor Original', 'Dias Atraso', 'Valor Devido', 'Última Cobrança'],
      data: [
        ['Carlos Pereira', '75000', '45', '58500', '15/11/2024'],
        ['Pedro Oliveira', '25000', '30', '26250', '20/11/2024'],
        ['Luiza Fernandes', '60000', '15', '61800', '25/11/2024']
      ],
      summary: {
        'Total em Atraso': '146550',
        'Clientes Inadimplentes': '3',
        'Média de Dias em Atraso': '30',
        'Taxa de Inadimplência': '15.2%'
      }
    };

    const success = exportToExcel(reportData, 'Relatorio_Inadimplencia');
    if (success) {
      toast({
        title: "Relatório de Inadimplência gerado",
        description: "Análise de clientes em atraso exportada com sucesso."
      });
    }
  };

  const generateClientesReport = () => {
    const reportData = {
      title: 'Relatório de Clientes',
      headers: ['Nome', 'NUIT', 'Telefone', 'Crédito Ativo', 'Score', 'Status'],
      data: [
        ['João Silva', '123456789', '84123456', 'Sim', '85', 'Ativo'],
        ['Maria Santos', '987654321', '85987654', 'Não', '92', 'Ativo'],
        ['Carlos Pereira', '456789123', '86456789', 'Sim', '65', 'Inadimplente'],
        ['Ana Costa', '789123456', '87789123', 'Sim', '78', 'Ativo']
      ],
      summary: {
        'Total de Clientes': '4',
        'Clientes Ativos': '4',
        'Com Crédito Ativo': '3',
        'Score Médio': '80'
      }
    };

    const success = exportToExcel(reportData, 'Relatorio_Clientes');
    if (success) {
      toast({
        title: "Relatório de Clientes gerado",
        description: "Informações detalhadas dos clientes exportadas com sucesso."
      });
    }
  };

  const generateFinanceiroReport = () => {
    const reportData = {
      title: 'Relatório Financeiro',
      headers: ['Mês', 'Receitas', 'Despesas', 'Resultado', 'Margem (%)'],
      data: [
        ['Janeiro', '150000', '80000', '70000', '46.7'],
        ['Fevereiro', '180000', '95000', '85000', '47.2'],
        ['Março', '165000', '88000', '77000', '46.7'],
        ['Abril', '200000', '110000', '90000', '45.0']
      ],
      summary: {
        'Receita Total': '695000',
        'Despesa Total': '373000',
        'Resultado Líquido': '322000',
        'Margem Média': '46.4%'
      }
    };

    const success = exportToExcel(reportData, 'Relatorio_Financeiro');
    if (success) {
      toast({
        title: "Relatório Financeiro gerado",
        description: "Demonstrativos financeiros exportados com sucesso."
      });
    }
  };

  const handleGenerateReport = (reportType: string) => {
    console.log('Gerando relatório do tipo:', reportType);
    
    switch (reportType) {
      case 'carteira':
        generateCarteiraReport();
        break;
      case 'inadimplencia':
        generateInadimplenciaReport();
        break;
      case 'clientes':
        generateClientesReport();
        break;
      case 'financeiro':
        generateFinanceiroReport();
        break;
      default:
        toast({
          title: "Tipo de relatório não reconhecido",
          description: "Por favor, selecione um tipo válido de relatório.",
          variant: "destructive"
        });
    }
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
                  onClick={() => handleGenerateReport(report.type)}
                  className="flex-1"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Gerar
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleDownloadReport(report.type)}
                >
                  <Download className="h-4 w-4" />
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
                      onChange={(e) => setInssData({...inssData, mesReferencia: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
                    <Input
                      id="nomeEmpresa"
                      value={inssData.nomeEmpresa}
                      onChange={(e) => setInssData({...inssData, nomeEmpresa: e.target.value})}
                      placeholder="Digite o nome da empresa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nuit">NUIT</Label>
                    <Input
                      id="nuit"
                      value={inssData.nuit}
                      onChange={(e) => setInssData({...inssData, nuit: e.target.value})}
                      placeholder="Digite o NUIT da empresa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalFuncionarios">Total de Funcionários</Label>
                    <Input
                      id="totalFuncionarios"
                      type="number"
                      value={inssData.totalFuncionarios}
                      onChange={(e) => setInssData({...inssData, totalFuncionarios: Number(e.target.value)})}
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
    </div>
  );
};

export default ReportsModule;
