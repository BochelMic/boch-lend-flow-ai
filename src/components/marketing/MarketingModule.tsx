
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  TrendingUp, 
  Target, 
  Users, 
  BarChart3,
  Megaphone,
  Eye,
  DollarSign
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const MarketingDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Marketing</h1>
        <Button>
          <Megaphone className="mr-2 h-4 w-4" />
          Nova Campanha
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="partnerships">Parcerias</TabsTrigger>
          <TabsTrigger value="materials">Materiais</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Novos Clientes</p>
                    <p className="text-2xl font-bold">47</p>
                    <p className="text-sm text-green-600">+12% vs mês anterior</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                    <p className="text-2xl font-bold">23%</p>
                    <p className="text-sm text-green-600">+3% vs mês anterior</p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Custo por Aquisição</p>
                    <p className="text-2xl font-bold">MZN 150</p>
                    <p className="text-sm text-red-600">+5% vs mês anterior</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">ROI Campanhas</p>
                    <p className="text-2xl font-bold">280%</p>
                    <p className="text-sm text-green-600">+15% vs mês anterior</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Plano de Marketing</CardTitle>
              <CardDescription>
                Estratégias e análise SWOT para crescimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 text-green-600">Forças (Strengths)</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Taxa competitiva de 25% a.m.</li>
                    <li>• Processo de aprovação rápido</li>
                    <li>• Experiência no mercado local</li>
                    <li>• Sistema de compliance robusto</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-blue-600">Oportunidades (Opportunities)</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Crescimento do microcrédito em Moçambique</li>
                    <li>• Digitalização de serviços financeiros</li>
                    <li>• Parcerias com associações locais</li>
                    <li>• Expansão para novas regiões</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-yellow-600">Fraquezas (Weaknesses)</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Limitação de capital para crescimento</li>
                    <li>• Dependência de agentes locais</li>
                    <li>• Necessidade de maior presença digital</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-red-600">Ameaças (Threats)</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Concorrência de grandes bancos</li>
                    <li>• Mudanças na regulamentação</li>
                    <li>• Instabilidade econômica</li>
                    <li>• Aumento da inadimplência</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campanhas Ativas</CardTitle>
              <CardDescription>
                Acompanhamento de campanhas de marketing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Campanha Rádio Local</h3>
                    <p className="text-sm text-gray-600">Spots na Rádio Moçambique • Período: 01-31/03</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">MZN 25,000</p>
                    <p className="text-sm text-green-600">47 novos clientes</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Detalhes
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Facebook Ads</h3>
                    <p className="text-sm text-gray-600">Segmentação: Empreendedores 25-45 anos</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">MZN 8,000</p>
                    <p className="text-sm text-green-600">23 leads qualificados</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Detalhes
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Flyers e Banners</h3>
                    <p className="text-sm text-gray-600">Distribuição em mercados locais</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">MZN 3,500</p>
                    <p className="text-sm text-blue-600">15 consultas</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nova Campanha</CardTitle>
              <CardDescription>
                Criar nova campanha de marketing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="campaignName">Nome da Campanha</Label>
                    <Input id="campaignName" placeholder="Ex: Campanha Primavera" />
                  </div>
                  <div>
                    <Label htmlFor="budget">Orçamento (MZN)</Label>
                    <Input id="budget" placeholder="Ex: 15000" type="number" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" placeholder="Descreva os objetivos da campanha..." />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="startDate">Data de Início</Label>
                    <Input id="startDate" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="endDate">Data de Fim</Label>
                    <Input id="endDate" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="channel">Canal</Label>
                    <select className="w-full p-2 border rounded">
                      <option>Rádio</option>
                      <option>Facebook</option>
                      <option>Material Impresso</option>
                      <option>Parcerias</option>
                    </select>
                  </div>
                </div>

                <Button className="w-full">Criar Campanha</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partnerships" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Parcerias Estratégicas</CardTitle>
              <CardDescription>
                Contratos e colaborações com parceiros locais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Associação de Comerciantes da Baixa</h3>
                    <p className="text-sm text-gray-600">Parceria para divulgação e indicação de clientes</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
                    Ativa
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Rádio Moçambique</h3>
                    <p className="text-sm text-gray-600">Contrato para spots publicitários</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
                    Renovar
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">União das Cooperativas</h3>
                    <p className="text-sm text-gray-600">Parceria para crédito produtivo</p>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm">
                    Negociação
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Materiais Publicitários</CardTitle>
              <CardDescription>
                Biblioteca de materiais de marketing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Flyers</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Material para distribuição física
                  </p>
                  <div className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full">
                      Ver Modelos
                    </Button>
                    <Button size="sm" className="w-full">
                      Criar Novo
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Banners</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Material para eventos e pontos de venda
                  </p>
                  <div className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full">
                      Ver Modelos
                    </Button>
                    <Button size="sm" className="w-full">
                      Criar Novo
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Scripts para Rádio</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Roteiros para spots publicitários
                  </p>
                  <div className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full">
                      Ver Scripts
                    </Button>
                    <Button size="sm" className="w-full">
                      Criar Novo
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

const MarketingModule = () => {
  return (
    <Routes>
      <Route path="/" element={<MarketingDashboard />} />
      <Route path="/*" element={<MarketingDashboard />} />
    </Routes>
  );
};

export default MarketingModule;
