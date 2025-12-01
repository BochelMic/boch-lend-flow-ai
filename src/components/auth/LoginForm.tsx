import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
import RegisterForm from './RegisterForm';
import { clearAllTestData } from '../../utils/clearData';
import { loadSampleData, clearSampleData } from '../../utils/sampleData';
import { Trash2, Download, X } from 'lucide-react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = login(email, password);
    if (result.success) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando...",
      });
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('⚠️ Tem certeza que deseja apagar TODOS os dados de teste? Esta ação não pode ser desfeita e você precisará criar novos usuários.')) {
      clearAllTestData();
      toast({
        title: "Dados apagados",
        description: "Todos os dados de teste foram removidos.",
      });
      window.location.reload();
    }
  };

  const handleLoadSampleData = () => {
    const result = loadSampleData();
    if (result.success) {
      toast({
        title: "Sucesso",
        description: result.message,
      });
      window.location.reload();
    } else {
      toast({
        title: "Aviso",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleClearSampleData = () => {
    if (window.confirm('Deseja remover todos os dados de exemplo (clientes, empréstimos, pagamentos)?')) {
      const result = clearSampleData();
      toast({
        title: "Sucesso",
        description: result.message,
      });
      window.location.reload();
    }
  };

  if (showRegister) {
    return <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-0 shadow-large">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">B</span>
          </div>
          <CardTitle className="text-3xl font-bold text-primary">
            BOCHEL MICROCRÉDITO
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sistema de Gestão de Microcrédito
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>
            <Button type="submit" className="w-full h-12 bg-gradient-primary hover:opacity-90 text-lg font-semibold">
              Entrar
            </Button>
          </form>
          
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Ou</span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => setShowRegister(true)}
              className="w-full h-12"
            >
              Criar Nova Conta
            </Button>
          </div>

          <div className="mt-4 pt-4 border-t border-border space-y-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadSampleData}
                className="flex-1 text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Carregar dados exemplo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSampleData}
                className="flex-1 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Apagar dados exemplo
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAllData}
              className="w-full text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3 w-3 mr-2" />
              Apagar TUDO (reset completo)
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;