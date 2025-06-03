
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Scale, 
  FileText, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Download,
  Eye,
  Search,
  MessageSquare,
  Phone
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '@/hooks/use-toast';

const LegalDashboard = () => {
  const { toast } = useToast();
  const [showAMLPolicy, setShowAMLPolicy] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleShowAMLPolicy = () => {
    setShowAMLPolicy(true);
    toast({
      title: "Política AML Carregada",
      description: "Política Anti-Lavagem de Dinheiro conforme Lei de Moçambique foi carregada.",
    });
  };

  const handleDownloadPolicy = (policyName: string) => {
    toast({
      title: "Download Iniciado",
      description: `Download de ${policyName} foi iniciado.`,
    });
  };

  const handleViewPolicy = (policyName: string) => {
    toast({
      title: "Visualizando Política",
      description: `Abrindo visualização de ${policyName}.`,
    });
  };

  const handleEditContract = (contractName: string) => {
    toast({
      title: "Editor de Contrato",
      description: `Abrindo editor para ${contractName}.`,
    });
  };

  const handleUseTemplate = (templateName: string) => {
    toast({
      title: "Modelo Aplicado",
      description: `Modelo ${templateName} foi aplicado com sucesso.`,
    });
  };

  const handleRenewLicense = (licenseName: string) => {
    toast({
      title: "Renovação Iniciada",
      description: `Processo de renovação para ${licenseName} foi iniciado.`,
    });
  };

  const handleGenerateReport = (reportType: string) => {
    toast({
      title: "Relatório Gerado",
      description: `Relatório de ${reportType} foi gerado com sucesso.`,
    });
  };

  const handleAMLVerification = (clientName: string, status: string) => {
    toast({
      title: "Verificação AML",
      description: `Cliente ${clientName} - Status: ${status}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Departamento Jurídico</h1>
        <div className="space-x-2">
          <Button onClick={handleShowAMLPolicy}>
            <Shield className="mr-2 h-4 w-4" />
            Política Anti-Lavagem (Lei MZ)
          </Button>
          <Button onClick={() => handleGenerateReport('Compliance')}>
            <Download className="mr-2 h-4 w-4" />
            Relatório Compliance
          </Button>
        </div>
      </div>

      {showAMLPolicy && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Política Anti-Lavagem de Dinheiro - Lei de Moçambique</CardTitle>
            <CardDescription className="text-blue-600">
              Conforme Lei nº 14/2013 e Decreto nº 10/2014
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">1. Identificação de Clientes (KYC)</h4>
                <p>Todos os clientes devem fornecer documento de identificação válido, comprovativo de residência e declaração de rendimentos conforme Artigo 15º da Lei nº 14/2013.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2. Transações Suspeitas</h4>
                <p>Operações acima de MZN 50,000 ou com padrões anómalos devem ser reportadas ao Gabinete de Informação Financeira (GIF) no prazo de 3 dias úteis.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3. Conservação de Registos</h4>
                <p>Todos os registos de transações e identificação devem ser conservados por período mínimo de 5 anos conforme Artigo 23º.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">4. Formação de Pessoal</h4>
                <p>Colaboradores devem receber formação anual sobre prevenção de lavagem de dinheiro e financiamento ao terrorismo.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">5. Sanções</h4>
                <p>Multas de 50 a 500 salários mínimos para pessoas colectivas e prisão de 2 a 8 anos para pessoas singulares.</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowAMLPolicy(false)}
                className="mt-4"
              >
                Fechar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                    <Button size="sm" variant="outline" onClick={() => handleViewPolicy('Política AML')}>
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button size="sm" onClick={() => handleDownloadPolicy('Política AML')}>
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
                    <Button size="sm" variant="outline" onClick={() => handleViewPolicy('Prevenção Terrorismo')}>
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button size="sm" onClick={() => handleDownloadPolicy('Prevenção Terrorismo')}>
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
                    <Button size="sm" variant="outline" onClick={() => handleViewPolicy('Código de Conduta')}>
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button size="sm" onClick={() => handleDownloadPolicy('Código de Conduta')}>
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
                    <Button size="sm" variant="outline" onClick={() => handleEditContract('Contrato de Empréstimo')}>Editar</Button>
                    <Button size="sm" onClick={() => handleUseTemplate('Contrato de Empréstimo')}>Usar Modelo</Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Termo de Garantia/Penhor</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Contrato para formalização de garantias e penhores
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditContract('Termo de Garantia')}>Editar</Button>
                    <Button size="sm" onClick={() => handleUseTemplate('Termo de Garantia')}>Usar Modelo</Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Termo de Responsabilidade</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Documento para formalização de fiadores
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditContract('Termo de Responsabilidade')}>Editar</Button>
                    <Button size="sm" onClick={() => handleUseTemplate('Termo de Responsabilidade')}>Usar Modelo</Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Termos e Condições Gerais</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Condições gerais de uso dos serviços
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditContract('Termos e Condições')}>Editar</Button>
                    <Button size="sm" onClick={() => handleUseTemplate('Termos e Condições')}>Usar Modelo</Button>
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
                  <div className="flex items-center space-x-2">
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm">
                      Renovar em 90 dias
                    </span>
                    <Button size="sm" onClick={() => handleRenewLicense('Licença do Banco de Moçambique')}>
                      Renovar
                    </Button>
                  </div>
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
              <div className="mb-4">
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Buscar cliente para verificação AML..." 
                    className="flex-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Verificações Recentes</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="text-sm">Ana Silva - Verificação completa</span>
                      <div className="flex space-x-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <Button size="sm" variant="outline" onClick={() => handleAMLVerification('Ana Silva', 'Aprovada')}>
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                      <span className="text-sm">João Mussa - Documentação pendente</span>
                      <div className="flex space-x-1">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <Button size="sm" variant="outline" onClick={() => handleAMLVerification('João Mussa', 'Pendente')}>
                          Resolver
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Relatórios Obrigatórios</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleGenerateReport('AML Mensal')}>
                      <FileText className="mr-2 h-4 w-4" />
                      Relatório Mensal AML
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleGenerateReport('Operações Suspeitas')}>
                      <FileText className="mr-2 h-4 w-4" />
                      Operações Suspeitas
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleGenerateReport('Relatório GIF')}>
                      <FileText className="mr-2 h-4 w-4" />
                      Relatório para GIF
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
