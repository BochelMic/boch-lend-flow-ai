import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
import RegisterForm from './RegisterForm';
import SMSVerification from './SMSVerification';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [showSMSVerification, setShowSMSVerification] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Primeiro, validar as credenciais
    const result = login(email, password);
    
    if (result.success) {
      // Se as credenciais estão corretas, solicitar verificação SMS
      setPhoneNumber('845828205'); // Número solicitado pelo usuário
      setShowSMSVerification(true);
    } else {
      toast({
        title: "Erro no login",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleSMSVerified = () => {
    setShowSMSVerification(false);
    toast({
      title: "Login realizado com sucesso!",
      description: "Bem-vindo ao sistema BOCHEL!",
    });
  };

  if (showSMSVerification) {
    return (
      <SMSVerification 
        phoneNumber={phoneNumber}
        onVerified={handleSMSVerified}
        onBack={() => setShowSMSVerification(false)}
      />
    );
  }

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
              Entrar com SMS
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

          <div className="bg-muted/50 p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              <strong>Acesso de demonstração:</strong><br />
              Email: gestor@bochel.com<br />
              Senha: gestor123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;