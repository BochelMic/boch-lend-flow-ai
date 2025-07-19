import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AlertCircle, CheckCircle, Phone } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface SMSVerificationProps {
  phoneNumber: string;
  onVerified: () => void;
  onBack: () => void;
}

const SMSVerification: React.FC<SMSVerificationProps> = ({ phoneNumber, onVerified, onBack }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { toast } = useToast();

  // Simular envio de SMS (em produção, seria integrado com serviço de SMS)
  const sendSMS = async () => {
    setIsLoading(true);
    
    // Simular delay de envio
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Código específico para o número 845828205
    const simulatedCode = phoneNumber === '845828205' ? '845828' : '123456';
    
    toast({
      title: "SMS Enviado",
      description: `Código enviado para ${phoneNumber}: ${simulatedCode}`,
    });
    
    setIsLoading(false);
    
    // Iniciar cooldown para reenvio
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerification = () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Código Inválido",
        description: "O código deve conter 6 dígitos.",
        variant: "destructive",
      });
      return;
    }

    // Simular verificação (em produção seria validado no backend)
    const expectedCode = phoneNumber === '845828205' ? '845828' : '123456';
    
    if (verificationCode === expectedCode) {
      toast({
        title: "Verificação Concluída",
        description: "Código verificado com sucesso!",
      });
      onVerified();
    } else {
      toast({
        title: "Código Incorreto",
        description: "Verifique o código e tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Enviar SMS automaticamente ao carregar o componente
  React.useEffect(() => {
    sendSMS();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-6">
      <Card className="w-full max-w-md border-0 shadow-large">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
            <Phone className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Verificação SMS</CardTitle>
          <CardDescription>
            Enviamos um código de 6 dígitos para o número <br />
            <strong>{phoneNumber}</strong>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="code">Código de Verificação</Label>
            <Input
              id="code"
              type="text"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-2xl tracking-widest"
              maxLength={6}
            />
          </div>

          <Button 
            onClick={handleVerification}
            className="w-full bg-gradient-primary hover:opacity-90"
            disabled={verificationCode.length !== 6}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Verificar Código
          </Button>

          <div className="space-y-3">
            <Button 
              onClick={sendSMS}
              variant="outline" 
              className="w-full"
              disabled={resendCooldown > 0 || isLoading}
            >
              {isLoading ? (
                "Enviando..."
              ) : resendCooldown > 0 ? (
                `Reenviar em ${resendCooldown}s`
              ) : (
                "Reenviar Código"
              )}
            </Button>

            <Button 
              onClick={onBack}
              variant="ghost" 
              className="w-full"
            >
              Voltar ao Login
            </Button>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Demonstração:</p>
                <p>Para o número <strong>845828205</strong> use: <strong>845828</strong></p>
                <p>Para outros números use: <strong>123456</strong></p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SMSVerification;