
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Share2, BarChart3, Settings, Inbox } from 'lucide-react';
import CreditApplicationForm from './CreditApplicationForm';
import CreditRequestManager from '../credit-requests/CreditRequestManager';
import CreditRequestForm from '../credit-requests/CreditRequestForm';
import FormAnalytics from './FormAnalytics';
import FormSharing from './FormSharing';
import FormSettings from './FormSettings';

const CreditFormModule = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Formulário de Pedido de Crédito</h1>
          <p className="text-muted-foreground">
            Gerencie pedidos de crédito, análises e compartilhamento
          </p>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<CreditFormDashboard />} />
        <Route path="/form" element={<CreditApplicationForm />} />
        <Route path="/requests" element={<CreditRequestManager />} />
        <Route path="/analytics" element={<FormAnalytics />} />
        <Route path="/sharing" element={<FormSharing />} />
        <Route path="/settings" element={<FormSettings />} />
      </Routes>
    </div>
  );
};

const CreditFormDashboard = () => {
  return (
    <Tabs defaultValue="requests" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="requests" className="flex items-center gap-2">
          <Inbox className="h-4 w-4" />
          Pedidos
        </TabsTrigger>
        <TabsTrigger value="form" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Formulário
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Análises
        </TabsTrigger>
        <TabsTrigger value="sharing" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Compartilhamento
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Configurações
        </TabsTrigger>
      </TabsList>

      <TabsContent value="requests">
        <CreditRequestManager />
      </TabsContent>

      <TabsContent value="form">
        <CreditRequestForm />
      </TabsContent>

      <TabsContent value="analytics">
        <FormAnalytics />
      </TabsContent>

      <TabsContent value="sharing">
        <FormSharing />
      </TabsContent>

      <TabsContent value="settings">
        <FormSettings />
      </TabsContent>
    </Tabs>
  );
};

export default CreditFormModule;
