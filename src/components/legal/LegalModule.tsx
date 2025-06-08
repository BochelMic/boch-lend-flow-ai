
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  Scale, 
  FileText, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Download,
  Eye,
  Edit,
  Users,
  Building,
  Settings
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '@/hooks/use-toast';

const LegalDashboard = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [complianceChecks, setComplianceChecks] = useState([
    { id: 1, item: "Verificação de identidade", status: "Concluído", date: "15/03/2024" },
    { id: 2, item: "Análise de origem de fundos", status: "Pendente", date: "14/03/2024" },
    { id: 3, item: "Verificação de sanções", status: "Concluído", date: "13/03/2024" }
  ]);

  const handleComplianceAction = (action: string, clientName?: string) => {
    const actions = {
      'verify_identity': () => toast({
        title: "Verificação de Identidade",
        description: `Iniciando verificação de identidade para ${clientName || 'cliente selecionado'}.`,
      }),
      'check_sanctions': () => toast({
        title: "Verificação de Sanções",
        description: `Consultando listas de sanções para ${clientName || 'cliente selecionado'}.`,
      }),
      'analyze_funds': () => toast({
        title: "Análise de Fundos",
        description: `Analisando origem dos fundos para ${clientName || 'cliente selecionado'}.`,
      }),
      'generate_report': () => toast({
        title: "Relatório de Compliance",
        description: "Gerando relatório de conformidade regulatória.",
      }),
      'generate_detailed_report': () => toast({
        title: "Relatório Detalhado",
        description: "Gerando relatório detalhado de compliance.",
      })
    };

    const actionFunction = actions[action as keyof typeof actions];
    if (actionFunction) {
      actionFunction();
    } else {
      toast({
        title: "Ação de Compliance",
        description: `Executando ação: ${action}`,
      });
    }
  };

  const handleContractAction = (action: string, contractName: string) => {
    const actions = {
      'edit': () => toast({
        title: "Editando Contrato",
        description: `Abrindo editor para ${contractName}.`,
      }),
      'use': () => toast({
        title: "Usando Template",
        description: `Aplicando template ${contractName} ao novo contrato.`,
      }),
      'download': () => toast({
        title: "Download Iniciado",
        description: `Baixando ${contractName}.`,
      })
    };

    const actionFunction = actions[action as keyof typeof actions];
    if (actionFunction) {
      actionFunction();
    }
  };

  const handleLicenseAction = (licenseName: string) => {
    toast({
      title: "Renovação de Licença",
      description: `Processando renovação de ${licenseName}.`,
    });
  };

  const handleDocumentAction = (action: string, docName: string) => {
    const actions = {
      'view': () => toast({
        title: "Visualizando Documento",
        description: `Abrindo ${docName} para visualização.`,
      }),
      'download': () => toast({
        title: "Download do Documento",
        description: `Baixando ${docName}.`,
      }),
      'generate': () => toast({
        title: "Gerando Relatório",
        description: `Gerando relatório de ${docName}.`,
      })
    };

    const actionFunction = actions[action as keyof typeof actions];
    if (actionFunction) {
      actionFunction();
    }
  };

  const handleAMLAction = (action: string, clientName?: string) => {
    const actions = {
      'verify': () => toast({
        title: "Verificação AML",
        description: `Verificação anti-lavagem para ${clientName} foi processada.`,
      }),
      'resolve': () => toast({
        title: "Resolvendo Pendência",
        description: `Processando documentação pendente para ${clientName}.`,
      }),
      'search': () => toast({
        title: "Busca AML",
        description: `Buscando informações para: ${searchTerm}`,
      })
    };

    const actionFunction = actions[action as keyof typeof actions];
    if (actionFunction) {
      actionFunction();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Jurídico e Compliance</h1>
        <Button onClick={() => handleComplianceAction('generate_report')}>
          <FileText className="mr-2 h-4 w-4" />
          Relatório Compliance
        </Button>
      </div>

      <Tabs defaultValue="compliance" className="w-full">
        <TabsList>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
          <TabsTrigger value="regulations">Regulamentações</TabsTrigger>
          <TabsTrigger value="documentation">Documentação</TabsTrigger>
          <TabsTrigger value="aml">Anti-Lavagem</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Verificações Pendentes</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Compliance OK</p>
                    <p className="text-2xl font-bold">15</p>
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
                    <p className="text-2xl font-bold">2</p>
                  </div>
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Centro de Comando Compliance</CardTitle>
              <CardDescription>
                Ferramentas de verificação e controle de conformidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  className="h-20 flex-col"
                  onClick={() => handleComplianceAction('verify_identity', 'Cliente Atual')}
                >
                  <Eye className="mb-2 h-6 w-6" />
                  <span className="text-sm">Verificar Identidade</span>
                </Button>
                
                <Button 
                  className="h-20 flex-col"
                  variant="outline"
                  onClick={() => handleComplianceAction('check_sanctions', 'Cliente Atual')}
                >
                  <Search className="mb-2 h-6 w-6" />
                  <span className="text-sm">Consultar Sanções</span>
                </Button>
                
                <Button 
                  className="h-20 flex-col"
                  variant="outline"
                  onClick={() => handleComplianceAction('analyze_funds', 'Cliente Atual')}
                >
                  <Settings className="mb-2 h-6 w-6" />
                  <span className="text-sm">Analisar Fundos</span>
                </Button>
                
                <Button 
                  className="h-20 flex-col"
                  variant="outline"
                  onClick={() => handleComplianceAction('generate_detailed_report')}
                >
                  <FileText className="mb-2 h-6 w-6" />
                  <span className="text-sm">Relatório Detalhado</span>
                </Button>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-4">Verificações Recentes</h3>
                <div className="space-y-2">
                  {complianceChecks.map((check) => (
                    <div key={check.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{check.item}</p>
                        <p className="text-sm text-gray-600">{check.date}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        check.status === 'Concluído' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {check.status}
                      </span>
                    </div>
                  ))}
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
                {[
                  { name: 'Contrato de Empréstimo Padrão', desc: 'Modelo base para concessão de crédito com taxa de 25% a.m.' },
                  { name: 'Termo de Garantia/Penhor', desc: 'Contrato para formalização de garantias e penhores' },
                  { name: 'Termo de Responsabilidade', desc: 'Documento para formalização de fiadores' },
                  { name: 'Termos e Condições Gerais', desc: 'Condições gerais de uso dos serviços' }
                ].map((contract) => (
                  <div key={contract.name} className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">{contract.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{contract.desc}</p>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleContractAction('edit', contract.name)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleContractAction('use', contract.name)}
                      >
                        Usar Modelo
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regulations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Licenças e Autorizações</CardTitle>
              <CardDescription>
                Controle de licenças e conformidade regulamentar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Licença do Banco de Moçambique', validity: '31/12/2024', status: 'warning', action: 'Renovar em 90 dias' },
                  { name: 'Estatuto Social', validity: '15/01/2024', status: 'valid', action: 'Válido' },
                  { name: 'Certificado de Registo Comercial', validity: '30/06/2025', status: 'valid', action: 'Válido' }
                ].map((license) => (
                  <div key={license.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{license.name}</h3>
                      <p className="text-sm text-gray-600">
                        {license.status === 'valid' ? 'Última atualização' : 'Válida até'}: {license.validity}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded text-sm ${
                        license.status === 'valid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {license.action}
                      </span>
                      {license.status === 'warning' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleLicenseAction(license.name)}
                        >
                          Renovar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentação Legal</CardTitle>
              <CardDescription>
                Gestão de documentos e políticas da empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Políticas Internas</h3>
                  <div className="space-y-2">
                    {['Política de Crédito', 'Manual de Procedimentos'].map((doc) => (
                      <div key={doc} className="flex justify-between items-center p-3 bg-blue-50 rounded">
                        <span className="text-sm">{doc}</span>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDocumentAction('view', doc)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDocumentAction('download', doc)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Documentos Regulamentares</h3>
                  <div className="space-y-2">
                    {['Regulamento Interno', 'Código de Conduta', 'Política de Privacidade'].map((doc) => (
                      <Button 
                        key={doc}
                        variant="outline" 
                        className="w-full justify-start" 
                        onClick={() => handleDocumentAction('generate', doc)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        {doc}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aml" className="space-y-6">
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-800">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Política de Prevenção à Lavagem de Dinheiro
              </CardTitle>
              <CardDescription className="text-amber-700">
                Conforme Lei nº 14/2013 de Moçambique
              </CardDescription>
            </CardHeader>
            <CardContent className="text-amber-800">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Obrigações Principais:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Identificação e verificação da identidade dos clientes</li>
                    <li>Manutenção de registros de transações por no mínimo 5 anos</li>
                    <li>Comunicação de operações suspeitas ao GCIFP</li>
                    <li>Implementação de políticas de conhecimento do cliente (KYC)</li>
                    <li>Formação regular dos funcionários sobre AML/CFT</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Limites de Comunicação:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Transações em dinheiro superiores a MZN 1.000.000</li>
                    <li>Operações suspeitas independentemente do valor</li>
                    <li>Tentativas de transações fracionadas</li>
                  </ul>
                </div>
                <div className="flex space-x-2 mt-4">
                  <Button 
                    size="sm" 
                    onClick={() => handleComplianceAction('verify_identity')}
                  >
                    Verificar Identidade
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleComplianceAction('check_sanctions')}
                  >
                    Consultar Sanções
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleComplianceAction('analyze_funds')}
                  >
                    Analisar Fundos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

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
                  <Button 
                    variant="outline"
                    onClick={() => handleAMLAction('search')}
                  >
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
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleAMLAction('verify', 'Ana Silva')}
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                      <span className="text-sm">João Mussa - Documentação pendente</span>
                      <div className="flex space-x-1">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleAMLAction('resolve', 'João Mussa')}
                        >
                          Resolver
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Relatórios Obrigatórios</h3>
                  <div className="space-y-2">
                    {['AML Mensal', 'Operações Suspeitas', 'Relatório GIF'].map((report) => (
                      <Button 
                        key={report}
                        variant="outline" 
                        className="w-full justify-start" 
                        onClick={() => handleDocumentAction('generate', report)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        {report === 'AML Mensal' ? 'Relatório Mensal AML' : 
                         report === 'Operações Suspeitas' ? 'Operações Suspeitas' : 
                         'Relatório para GIF'}
                      </Button>
                    ))}
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
