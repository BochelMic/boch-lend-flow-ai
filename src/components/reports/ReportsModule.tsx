
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, FileText, Download, Calendar, TrendingUp, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ReportsModule = () => {
  const { toast } = useToast();

  const handleGenerateReport = (reportType: string) => {
    toast({
      title: "Gerando relatório",
      description: `Relatório de ${reportType} sendo processado...`
    });
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
                  onClick={() => handleGenerateReport(report.type)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
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
