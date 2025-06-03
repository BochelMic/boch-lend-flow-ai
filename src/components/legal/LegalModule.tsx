
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Scale, 
  FileText, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Download,
  Eye
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const LegalDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Departamento Jurídico</h1>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Relatório Compliance
        </Button>
      </div>

      <Tabs defaultValue="compliance" className="w-full">
        <TabsList>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
          <TabsTrigger value="licensing">Licenças</TabsTrigger>
          <TabsTrigger value="aml">Anti-Lavagem</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status Compliance</p>
                    <p className="text-2xl font-bold text-green-600">Conforme</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Alertas Ativos</p>
                    <p className="text-2xl font-bold text-yellow-600">2</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Verificações AML</p>
                    <p className="text-2xl font-bold">156</p>
                  </div>
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Políticas de Compliance</CardTitle>
              <CardDescription>
                Políticas contra lavagem de dinheiro e financiamento ao terrorismo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Política Anti-Lavagem de Dinheiro (AML)</h3>
                    <p className="text-sm text-gray-600">Última atualização: 15/03/2024</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Prevenção ao Financiamento do Terrorismo</h3>
                    <p className="text-sm text-gray-600">Última atualização: 10/03/2024</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Código de Conduta Ética</h3>
                    <p className="text-sm text-gray-600">Última atualização: 01/03/2024</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Modelos de Contratos</CardTitle>
              <CardDescription>
                Contratos padronizados para operações de microcrédito
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Contrato de Empréstimo Padrão</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Modelo base para concessão de crédito com taxa de 25% a.m.
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">Editar</Button>
                    <Button size="sm">Usar Modelo</Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Termo de Garantia/Penhor</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Contrato para formalização de garantias e penhores
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">Editar</Button>
                    <Button size="sm">Usar Modelo</Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Termo de Responsabilidade</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Documento para formalização de fiadores
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">Editar</Button>
                    <Button size="sm">Usar Modelo</Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Termos e Condições Gerais</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Condições gerais de uso dos serviços
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">Editar</Button>
                    <Button size="sm">Usar Modelo</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="licensing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Licenças e Autorizações</CardTitle>
              <CardDescription>
                Controle de licenças e conformidade regulamentar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Licença do Banco de Moçambique</h3>
                    <p className="text-sm text-gray-600">Válida até: 31/12/2024</p>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm">
                    Renovar em 90 dias
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Estatuto Social</h3>
                    <p className="text-sm text-gray-600">Última atualização: 15/01/2024</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
                    Válido
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Certificado de Registo Comercial</h3>
                    <p className="text-sm text-gray-600">Válido até: 30/06/2025</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
                    Válido
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aml" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sistema Anti-Lavagem de Dinheiro</CardTitle>
              <CardDescription>
                Monitorização e prevenção de atividades suspeitas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Verificações Recentes</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="text-sm">Ana Silva - Verificação completa</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                      <span className="text-sm">João Mussa - Documentação pendente</span>
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Relatórios Obrigatórios</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Relatório Mensal AML
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Operações Suspeitas
                    </Button>
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

const LegalModule = () => {
  return (
    <Routes>
      <Route path="/" element={<LegalDashboard />} />
      <Route path="/*" element={<LegalDashboard />} />
    </Routes>
  );
};

export default LegalModule;
