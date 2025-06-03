
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Users, 
  FileText, 
  Calculator, 
  Settings, 
  BarChart3,
  Download,
  Plus,
  Edit,
  Trash
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const AdminDashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const handleExportReports = () => {
    toast({
      title: "Relatórios exportados",
      description: "Os relatórios foram exportados com sucesso.",
    });
  };

  const handleGenerateReport = (type: string) => {
    toast({
      title: "Relatório gerado",
      description: `Relatório de ${type} foi gerado com sucesso.`,
    });
  };

  const handleAccessModule = (module: string) => {
    toast({
      title: `Acesso ao ${module}`,
      description: `Redirecionando para o módulo de ${module}...`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Administração</h1>
        <Button onClick={handleExportReports}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatórios
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="hr">Recursos Humanos</TabsTrigger>
          <TabsTrigger value="accounting">Contabilidade</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Recursos Humanos
                </CardTitle>
                <CardDescription>
                  Gestão de funcionários e contratos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">• Contratos de trabalho</p>
                  <p className="text-sm">• Manual do funcionário</p>
                  <p className="text-sm">• Regulamento interno</p>
                  <p className="text-sm">• Avaliações de desempenho</p>
                </div>
                <Button 
                  className="w-full mt-4" 
                  variant="outline"
                  onClick={() => handleAccessModule('Recursos Humanos')}
                >
                  Acessar RH
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="mr-2 h-5 w-5" />
                  Contabilidade
                </CardTitle>
                <CardDescription>
                  Livro caixa e demonstrações financeiras
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">• Livro caixa diário</p>
                  <p className="text-sm">• Balancetes mensais</p>
                  <p className="text-sm">• Demonstração de resultados</p>
                  <p className="text-sm">• Controle fiscal</p>
                </div>
                <Button 
                  className="w-full mt-4" 
                  variant="outline"
                  onClick={() => handleAccessModule('Contabilidade')}
                >
                  Ver Contabilidade
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Documentação
                </CardTitle>
                <CardDescription>
                  Certidões e registos da empresa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">• Certidão de registo</p>
                  <p className="text-sm">• NUIT da empresa</p>
                  <p className="text-sm">• Licenças operacionais</p>
                  <p className="text-sm">• Políticas internas</p>
                </div>
                <Button 
                  className="w-full mt-4" 
                  variant="outline"
                  onClick={() => handleAccessModule('Documentação')}
                >
                  Documentos
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hr" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Funcionários</CardTitle>
              <CardDescription>
                Lista de funcionários e suas informações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={() => handleAccessModule('Novo Funcionário')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Funcionário
                </Button>
                <div className="border rounded-lg p-4">
                  <p className="font-medium">Lista de funcionários será exibida aqui</p>
                  <p className="text-sm text-gray-600">Funcionalidade em desenvolvimento</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Livro Caixa</CardTitle>
              <CardDescription>
                Registro diário de entradas e saídas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={() => handleAccessModule('Nova Transação')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Transação
                </Button>
                <div className="border rounded-lg p-4">
                  <p className="font-medium">Transações do livro caixa</p>
                  <p className="text-sm text-gray-600">Funcionalidade em desenvolvimento</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Administrativos</CardTitle>
              <CardDescription>
                Relatórios mensais e anuais para gestão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Relatório Mensal</h3>
                  <p className="text-sm text-gray-600 mb-3">Balanço geral das operações</p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleGenerateReport('Mensal')}
                  >
                    Gerar
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Controle de Custos</h3>
                  <p className="text-sm text-gray-600 mb-3">Análise de despesas operacionais</p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleGenerateReport('Custos')}
                  >
                    Gerar
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Auditoria Interna</h3>
                  <p className="text-sm text-gray-600 mb-3">Verificação de conformidade</p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleGenerateReport('Auditoria')}
                  >
                    Gerar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const AdminModule = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/*" element={<AdminDashboard />} />
    </Routes>
  );
};

export default AdminModule;
