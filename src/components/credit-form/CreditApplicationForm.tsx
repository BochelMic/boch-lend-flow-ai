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
import { Upload, CheckCircle, Send, User, MapPin, Briefcase, CreditCard } from 'lucide-react';

const creditFormSchema = z.object({
  // Dados Pessoais
  fullName: z.string().min(2, 'Nome completo é obrigatório'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  documentType: z.string().min(1, 'Tipo de documento é obrigatório'),
  documentNumber: z.string().min(5, 'Número do documento é obrigatório'),
  documentIssueDate: z.string().min(1, 'Data de emissão é obrigatória'),
  documentExpiryDate: z.string().min(1, 'Data de validade é obrigatória'),
  nuit: z.string().optional(),
  gender: z.string().min(1, 'Sexo é obrigatório'),
  phone: z.string().min(9, 'Telefone/WhatsApp é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),

  // Endereço
  neighborhood: z.string().min(2, 'Bairro é obrigatório'),
  district: z.string().min(2, 'Distrito é obrigatório'),
  province: z.string().min(2, 'Província é obrigatória'),
  residenceType: z.string().min(1, 'Tipo de residência é obrigatório'),

  // Dados Profissionais
  occupation: z.string().min(1, 'Ocupação principal é obrigatória'),
  companyName: z.string().min(2, 'Nome da empresa/atividade é obrigatório'),
  workDuration: z.string().min(1, 'Tempo de trabalho é obrigatório'),
  monthlyIncome: z.string().min(1, 'Rendimento mensal é obrigatório'),

  // Informações do Crédito
  requestedAmount: z.string().min(1, 'Valor solicitado é obrigatório'),
  creditPurpose: z.string().min(5, 'Finalidade do crédito é obrigatória'),
  receiveDate: z.string().min(1, 'Data para receber é obrigatória'),
  paymentTermType: z.string().min(1, 'Tipo de prazo é obrigatório'),
  paymentTerm: z.string().min(1, 'Prazo para pagamento é obrigatório'),
  guaranteeType: z.string().min(1, 'Tipo de garantia é obrigatório'),
  guaranteeMode: z.string().min(1, 'Modo de garantia é obrigatório'),
  observations: z.string().optional(),
  
  truthDeclaration: z.boolean().refine(val => val === true, {
    message: 'Deve concordar com a declaração de veracidade'
  }),
});

type CreditFormData = z.infer<typeof creditFormSchema>;

interface CreditApplicationFormProps {
  isPublicAccess?: boolean;
}

const CreditApplicationForm = ({ isPublicAccess = false }: CreditApplicationFormProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const form = useForm<CreditFormData>({
    resolver: zodResolver(creditFormSchema),
    defaultValues: {
      fullName: '',
      birthDate: '',
      documentType: '',
      documentNumber: '',
      documentIssueDate: '',
      documentExpiryDate: '',
      nuit: '',
      gender: '',
      phone: '',
      email: '',
      neighborhood: '',
      district: '',
      province: '',
      residenceType: '',
      occupation: '',
      companyName: '',
      workDuration: '',
      monthlyIncome: '',
      requestedAmount: '',
      creditPurpose: '',
      receiveDate: '',
      paymentTermType: '',
      paymentTerm: '',
      guaranteeType: '',
      guaranteeMode: '',
      observations: '',
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

  const generateRequestNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CR${year}${month}${day}${random}`;
  };

  const onSubmit = async (data: CreditFormData) => {
    setIsLoading(true);
    
    const requestData = {
      ...data,
      requestDate: new Date().toISOString(),
      requestNumber: generateRequestNumber(),
    };
    
    console.log('Submitting credit application:', requestData);
    console.log('Uploaded files:', uploadedFiles);

    try {
      // Simular análise automática dos dados
      await analyzeApplication(requestData);
      
      // Simular envio de email de notificação
      await sendEmailNotification(requestData);
      
      // Simular integração com WhatsApp Business API
      await sendWhatsAppNotification(requestData);

      setIsSubmitted(true);
      toast({
        title: "Pedido enviado com sucesso",
        description: `Pedido Nº ${requestData.requestNumber} - Será analisado em menos de 24h úteis.`,
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

  const analyzeApplication = async (data: any) => {
    const analysisResult = {
      riskScore: Math.floor(Math.random() * 100),
      recommendation: Math.random() > 0.5 ? 'APROVADO' : 'ANÁLISE_MANUAL',
      factors: ['Histórico de crédito', 'Renda declarada', 'Finalidade do crédito']
    };
    
    console.log('Análise automática:', analysisResult);
    return analysisResult;
  };

  const sendEmailNotification = async (data: any) => {
    console.log('Enviando notificação por email para administradores...');
    console.log('Dados do pedido:', data);
  };

  const sendWhatsAppNotification = async (data: any) => {
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
                <br />Taxa de juro: 30% por mês (pode variar conforme o valor).
                <br />Entraremos em contacto através do telefone fornecido.
              </AlertDescription>
            </Alert>
            {isPublicAccess && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Próximos Passos:</strong><br/>
                  • Nossa equipe analisará seu pedido<br/>
                  • Você receberá uma chamada telefônica em até 24h<br/>
                  • Mantenha seus documentos organizados para agilizar o processo
                </p>
              </div>
            )}
            {!isPublicAccess && (
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
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>Pedido de Crédito</CardTitle>
        <CardDescription>
          Preencha todos os campos obrigatórios para solicitar seu crédito. Taxa de juro: 30% por mês (pode variar conforme o valor).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* DADOS PESSOAIS */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b pb-2">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">DADOS PESSOAIS</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  name="documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Documento *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bi">Bilhete de Identidade (BI)</SelectItem>
                          <SelectItem value="passaporte">Passaporte</SelectItem>
                          <SelectItem value="cedula">Cédula Pessoal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="documentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do Documento *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 123456789BA123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="documentIssueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Emissão *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="documentExpiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Validade *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nuit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NUIT (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Número único de identificação" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sexo *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone/WhatsApp *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: +244 912 345 678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="exemplo@email.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* ENDEREÇO */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b pb-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">ENDEREÇO</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro *</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distrito *</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o distrito" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Província *</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite a província" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="residenceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Residência *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="casa_propria">Casa Própria</SelectItem>
                          <SelectItem value="arrendada">Arrendada</SelectItem>
                          <SelectItem value="casa_familiar">Casa Familiar</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* DADOS PROFISSIONAIS / FONTE DE RENDA */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b pb-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">💼 DADOS PROFISSIONAIS / FONTE DE RENDA</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ocupação Principal *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a ocupação" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="empregado_formal">Empregado Formal</SelectItem>
                          <SelectItem value="conta_propria">Trabalhador por Conta Própria</SelectItem>
                          <SelectItem value="informal">Informal</SelectItem>
                          <SelectItem value="aposentado">Aposentado</SelectItem>
                          <SelectItem value="estudante">Estudante</SelectItem>
                          <SelectItem value="desempregado">Desempregado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa ou Atividade *</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome da empresa/atividade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tempo de Trabalho *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 2 anos e 6 meses" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="monthlyIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rendimento Mensal Médio/Estimativa *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 150000 AOA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* INFORMAÇÕES DO CRÉDITO */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b pb-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">💳 INFORMAÇÕES DO CRÉDITO</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="requestedAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Solicitado (AOA) *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 500000" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="receiveDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data para Receber o Empréstimo *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentTermType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prazo de Pagamento *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="semanas">Em Semanas</SelectItem>
                          <SelectItem value="meses">Em Meses</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentTerm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade de Tempo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 12" type="number" {...field} />
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
                      <FormLabel>Garantia *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a garantia" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bem_movel">Bem Móvel</SelectItem>
                          <SelectItem value="bem_imovel">Bem Imóvel</SelectItem>
                          <SelectItem value="fiador">Fiador</SelectItem>
                          <SelectItem value="salario">Salário</SelectItem>
                          <SelectItem value="sem_garantia">Sem Garantia</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guaranteeMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Concordância por Modo de Garantia *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o modo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="antecipado">Antecipado</SelectItem>
                          <SelectItem value="postecipado">Postecipado</SelectItem>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a finalidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="negocio">Negócio</SelectItem>
                        <SelectItem value="consumo">Consumo</SelectItem>
                        <SelectItem value="saude">Saúde</SelectItem>
                        <SelectItem value="educacao">Educação</SelectItem>
                        <SelectItem value="emergencia">Emergência</SelectItem>
                        <SelectItem value="construcao">Construção/Reforma</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações (opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Informações adicionais sobre o pedido"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Upload de Documentos */}
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
                      Declaro que todas as informações fornecidas são verdadeiras e concordo com os termos e condições do pedido de crédito. Taxa de juro: 30% por mês (pode variar conforme o valor).
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