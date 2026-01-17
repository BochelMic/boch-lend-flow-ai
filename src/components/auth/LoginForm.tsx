import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/use-toast';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle py-6 px-3 sm:px-6">
      <Card className="w-full max-w-sm md:max-w-md border-0 shadow-large">
        <CardHeader className="space-y-1 text-center p-4 md:p-6">
          <div className="mx-auto w-12 h-12 md:w-14 md:h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-2 md:mb-3">
            <span className="text-xl md:text-2xl font-bold text-white">B</span>
          </div>
          <CardTitle className="text-xl md:text-2xl font-bold text-primary">
            BOCHEL MICROCRÉDITO
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs md:text-sm">
            Sistema de Gestão de Microcrédito
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 p-4 md:p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 md:h-11 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10 md:h-11 text-sm"
              />
            </div>
            <Button type="submit" className="w-full h-10 md:h-11 bg-gradient-primary hover:opacity-90 text-sm md:text-base font-semibold">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;