
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Users, 
  FileText, 
  Calculator, 
  Settings, 
  BarChart3,
  Download
} from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Administração</h1>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatórios
        </Button>
      </div>

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
            <Button className="w-full mt-4" variant="outline">
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
            <Button className="w-full mt-4" variant="outline">
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
            <Button className="w-full mt-4" variant="outline">
              Documentos
            </Button>
          </CardContent>
        </Card>
      </div>

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
              <Button size="sm" className="w-full">Gerar</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Controle de Custos</h3>
              <p className="text-sm text-gray-600 mb-3">Análise de despesas operacionais</p>
              <Button size="sm" className="w-full">Gerar</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Auditoria Interna</h3>
              <p className="text-sm text-gray-600 mb-3">Verificação de conformidade</p>
              <Button size="sm" className="w-full">Gerar</Button>
            </div>
          </div>
        </CardContent>
      </Card>
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
