import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { Upload, CheckCircle, Send } from 'lucide-react';

const creditFormSchema = z.object({
  fullName: z.string().min(2, 'Nome completo é obrigatório'),
  documentNumber: z.string().min(5, 'Número do documento é obrigatório'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  phone: z.string().min(9, 'Telefone de contacto é obrigatório'),
  address: z.string().min(10, 'Endereço residencial é obrigatório'),
  profession: z.string().min(2, 'Profissão ou fonte de rendimento é obrigatória'),
  requestedAmount: z.string().min(1, 'Montante solicitado é obrigatório'),
  paymentTerm: z.string().min(1, 'Prazo para pagamento é obrigatório'),
  creditPurpose: z.string().min(5, 'Finalidade do crédito é obrigatória'),
  guaranteeType: z.string().optional(),
  truthDeclaration: z.boolean().refine(val => val === true, {
    message: 'Deve concordar com a declaração de veracidade'
  }),
});

type CreditFormData = z.infer<typeof creditFormSchema>;

const CreditApplicationForm = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const form = useForm<CreditFormData>({
    resolver: zodResolver(creditFormSchema),
    defaultValues: {
      fullName: '',
      documentNumber: '',
      birthDate: '',
      phone: '',
      address: '',
      profession: '',
      requestedAmount: '',
      paymentTerm: '',
      creditPurpose: '',
      guaranteeType: '',
      truthDeclaration: false,
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    toast({
      title: "Documento carregado",
      description: `${files.length} documento(s) adicionado(s)`,
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreditFormData) => {
    setIsLoading(true);
    console.log('Submitting credit application:', data);
    console.log('Uploaded files:', uploadedFiles);

    try {
      // Simular análise automática dos dados
      await analyzeApplication(data);
      
      // Simular envio de email de notificação
      await sendEmailNotification(data);
      
      // Simular integração com WhatsApp Business API
      await sendWhatsAppNotification(data);

      setIsSubmitted(true);
      toast({
        title: "Pedido enviado com sucesso",
        description: "Seu pedido será analisado em menos de 24h úteis.",
      });
    } catch (error) {
      toast({
        title: "Erro ao enviar pedido",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeApplication = async (data: CreditFormData) => {
    // Simular análise automática
    const analysisResult = {
      riskScore: Math.floor(Math.random() * 100),
      recommendation: Math.random() > 0.5 ? 'APROVADO' : 'ANÁLISE_MANUAL',
      factors: ['Histórico de crédito', 'Renda declarada', 'Finalidade do crédito']
    };
    
    console.log('Análise automática:', analysisResult);
    return analysisResult;
  };

  const sendEmailNotification = async (data: CreditFormData) => {
    // Simular envio de email
    console.log('Enviando notificação por email para administradores...');
    console.log('Dados do pedido:', data);
  };

  const sendWhatsAppNotification = async (data: CreditFormData) => {
    // Simular integração com WhatsApp Business API
    console.log('Enviando notificação via WhatsApp Business API...');
    console.log('Novo pedido de crédito recebido para:', data.fullName);
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-green-700">Pedido Enviado com Sucesso!</h2>
            <Alert>
              <AlertDescription className="text-center">
                <strong>Obrigado!</strong> Seu pedido será analisado em menos de 24h úteis.
                Entraremos em contacto através do telefone fornecido.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => {
                setIsSubmitted(false);
                form.reset();
                setUploadedFiles([]);
              }}
              variant="outline"
            >
              Fazer Novo Pedido
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Pedido de Crédito</CardTitle>
        <CardDescription>
          Preencha todos os campos obrigatórios para solicitar seu crédito
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="documentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do BI/Documento *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 123456789BA123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone de Contacto *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: +244 912 345 678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço Residencial *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Digite seu endereço completo (rua, bairro, município, província)"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profession"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profissão ou Fonte de Rendimento *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Funcionário público, Comerciante, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="requestedAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montante Solicitado (AOA) *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 500000" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentTerm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prazo para Pagamento *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o prazo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="6">6 meses</SelectItem>
                        <SelectItem value="12">12 meses</SelectItem>
                        <SelectItem value="18">18 meses</SelectItem>
                        <SelectItem value="24">24 meses</SelectItem>
                        <SelectItem value="36">36 meses</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="creditPurpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Finalidade do Crédito *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva para que será usado o crédito"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guaranteeType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Garantia (opcional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de garantia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fiador">Fiador</SelectItem>
                      <SelectItem value="bem_movel">Bem Móvel</SelectItem>
                      <SelectItem value="bem_imovel">Bem Imóvel</SelectItem>
                      <SelectItem value="deposito">Depósito</SelectItem>
                      <SelectItem value="sem_garantia">Sem Garantia</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <label className="text-sm font-medium">Upload de Documentos (opcional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    Arraste arquivos aqui ou clique para selecionar
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    Selecionar Arquivos
                  </Button>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Documentos carregados:</p>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="truthDeclaration"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Declaração de Veracidade *
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Declaro que todas as informações fornecidas são verdadeiras e concordo com os termos e condições do pedido de crédito.
                    </p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>Enviando...</>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Pedido
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreditApplicationForm;
