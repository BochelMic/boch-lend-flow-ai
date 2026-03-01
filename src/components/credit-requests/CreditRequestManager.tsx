import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  CheckCircle, XCircle, Clock, User, DollarSign, Calendar,
  MessageSquare, Phone, MapPin, ChevronLeft, Briefcase,
  Shield, Home, FileText, Image as ImageIcon, ExternalLink, Mail
} from 'lucide-react';

export interface CreditRequest {
  id: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_address: string | null;
  amount: number;
  purpose: string | null;
  term: number;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_message: string | null;
  agent_id: string | null;
  user_id: string | null;
  // All detail fields
  birth_date?: string | null;
  gender?: string | null;
  document_type?: string | null;
  document_number?: string | null;
  document_issue_date?: string | null;
  document_expiry_date?: string | null;
  nuit?: string | null;
  neighborhood?: string | null;
  district?: string | null;
  province?: string | null;
  residence_type?: string | null;
  occupation?: string | null;
  company_name?: string | null;
  work_duration?: string | null;
  monthly_income?: string | null;
  credit_purpose?: string | null;
  receive_date?: string | null;
  guarantee_type?: string | null;
  guarantee_mode?: string | null;
  observations?: string | null;
  doc_front_url?: string | null;
  doc_back_url?: string | null;
}

const LABELS: Record<string, string> = {
  bi: 'Bilhete de Identidade', passaporte: 'Passaporte', cedula: 'Cédula',
  masculino: 'Masculino', feminino: 'Feminino',
  casa_propria: 'Casa Própria', arrendada: 'Arrendada', casa_familiar: 'Casa Familiar',
  empregado_formal: 'Empregado Formal', conta_propria: 'Conta Própria', informal: 'Informal',
  aposentado: 'Aposentado', estudante: 'Estudante', desempregado: 'Desempregado',
  negocio: 'Negócio', consumo: 'Consumo', saude: 'Saúde', educacao: 'Educação',
  emergencia: 'Emergência', construcao: 'Construção/Reforma', outros: 'Outros',
  bem_movel: 'Bem Móvel', bem_imovel: 'Bem Imóvel', fiador: 'Fiador',
  salario: 'Salário', sem_garantia: 'Sem Garantia',
  antecipado: 'Antecipado', postecipado: 'Postecipado',
};
const label = (v: string | null | undefined) => (v && LABELS[v]) || v || '-';

const CreditRequestManager = () => {
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [selected, setSelected] = useState<CreditRequest | null>(null);
  const [reviewMsg, setReviewMsg] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data, error } = await supabase.from('credit_requests').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setRequests(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    if (action === 'rejected' && !reviewMsg.trim()) {
      toast({ title: 'Erro', description: 'Mensagem obrigatória para rejeitar.', variant: 'destructive' });
      return;
    }
    try {
      const { error } = await supabase.from('credit_requests').update({
        status: action,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id || null,
        review_message: reviewMsg || (action === 'approved' ? 'Aprovado' : ''),
      }).eq('id', id);
      if (error) throw error;
      toast({ title: action === 'approved' ? 'Pedido Aprovado' : 'Pedido Rejeitado' });
      setSelected(null); setReviewMsg(''); load();
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  const statusBadge = (s: string) => {
    const m: Record<string, { l: string; c: string; i: React.ReactNode }> = {
      pending: { l: 'Pendente', c: 'bg-amber-100 text-amber-800', i: <Clock className="w-3 h-3" /> },
      approved: { l: 'Aprovado', c: 'bg-green-100 text-green-800', i: <CheckCircle className="w-3 h-3" /> },
      rejected: { l: 'Rejeitado', c: 'bg-red-100 text-red-800', i: <XCircle className="w-3 h-3" /> },
    };
    const x = m[s] || { l: s, c: 'bg-gray-100', i: null };
    return <Badge className={x.c}><span className="flex items-center gap-1">{x.i}{x.l}</span></Badge>;
  };

  const filtered = requests.filter(r => filter === 'all' || r.status === filter);
  const isGestor = user?.role === 'gestor';

  const InfoRow = ({ icon: Icon, title, value }: { icon: any; title: string; value: string | null | undefined }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-2.5 bg-gray-50 rounded-lg p-3">
        <Icon className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
        <div><p className="text-[10px] text-gray-400 uppercase tracking-wide">{title}</p><p className="text-sm font-medium text-gray-800">{value}</p></div>
      </div>
    );
  };

  // Detail View
  if (selected) {
    const r = selected;
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-4 max-w-4xl">
        <Button variant="ghost" onClick={() => { setSelected(null); setReviewMsg(''); }}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1a3a5c] text-white flex items-center justify-center text-lg font-bold">
                  {r.client_name[0]?.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{r.client_name}</h2>
                  <p className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              {statusBadge(r.status)}
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <DollarSign className="h-5 w-5 mx-auto mb-1 text-green-600" />
                <p className="text-[10px] text-gray-500">Valor Solicitado</p>
                <p className="font-bold text-green-700">MZN {Number(r.amount).toLocaleString()}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <Calendar className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                <p className="text-[10px] text-gray-500">Prazo</p>
                <p className="font-bold text-blue-700">30 dias</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <Phone className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                <p className="text-[10px] text-gray-500">Telefone</p>
                <p className="font-bold text-purple-700 text-sm">{r.client_phone || '-'}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-3 text-center">
                <Mail className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                <p className="text-[10px] text-gray-500">Email</p>
                <p className="font-bold text-orange-700 text-xs truncate">{r.client_email || '-'}</p>
              </div>
            </div>

            {/* Section: Dados Pessoais */}
            <div>
              <h3 className="text-sm font-bold text-[#1a3a5c] mb-3 flex items-center gap-2"><User className="h-4 w-4" /> Dados Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                <InfoRow icon={User} title="Nome Completo" value={r.client_name} />
                <InfoRow icon={Calendar} title="Data de Nascimento" value={r.birth_date} />
                <InfoRow icon={User} title="Sexo" value={label(r.gender)} />
                <InfoRow icon={FileText} title="Tipo de Documento" value={label(r.document_type)} />
                <InfoRow icon={FileText} title="Nº Documento" value={r.document_number} />
                <InfoRow icon={Calendar} title="Emissão" value={r.document_issue_date} />
                <InfoRow icon={Calendar} title="Validade" value={r.document_expiry_date} />
                <InfoRow icon={FileText} title="NUIT" value={r.nuit} />
                <InfoRow icon={Phone} title="Telefone" value={r.client_phone} />
                <InfoRow icon={Mail} title="Email" value={r.client_email} />
              </div>
            </div>

            {/* Section: Endereço */}
            <div>
              <h3 className="text-sm font-bold text-[#1a3a5c] mb-3 flex items-center gap-2"><MapPin className="h-4 w-4" /> Endereço</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                <InfoRow icon={MapPin} title="Bairro" value={r.neighborhood} />
                <InfoRow icon={MapPin} title="Distrito" value={r.district} />
                <InfoRow icon={MapPin} title="Província" value={r.province} />
                <InfoRow icon={Home} title="Tipo de Residência" value={label(r.residence_type)} />
              </div>
            </div>

            {/* Section: Profissional */}
            <div>
              <h3 className="text-sm font-bold text-[#1a3a5c] mb-3 flex items-center gap-2"><Briefcase className="h-4 w-4" /> Dados Profissionais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <InfoRow icon={Briefcase} title="Ocupação" value={label(r.occupation)} />
                <InfoRow icon={Briefcase} title="Empresa/Atividade" value={r.company_name} />
                <InfoRow icon={Clock} title="Tempo de Trabalho" value={r.work_duration} />
                <InfoRow icon={DollarSign} title="Rendimento Mensal" value={r.monthly_income ? `MZN ${Number(r.monthly_income).toLocaleString()}` : null} />
              </div>
            </div>

            {/* Section: Crédito */}
            <div>
              <h3 className="text-sm font-bold text-[#1a3a5c] mb-3 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Informações do Crédito</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                <InfoRow icon={DollarSign} title="Valor Solicitado" value={`MZN ${Number(r.amount).toLocaleString()}`} />
                <InfoRow icon={Briefcase} title="Finalidade" value={label(r.credit_purpose || r.purpose)} />
                <InfoRow icon={Calendar} title="Data para Receber" value={r.receive_date} />
                <InfoRow icon={Shield} title="Garantia" value={label(r.guarantee_type)} />
                <InfoRow icon={Shield} title="Modo de Garantia" value={label(r.guarantee_mode)} />
                <InfoRow icon={Calendar} title="Prazo" value="30 dias (1 mês)" />
              </div>
              {r.observations && (
                <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-[10px] text-amber-600 uppercase mb-1">Observações</p>
                  <p className="text-sm text-amber-900">{r.observations}</p>
                </div>
              )}
            </div>

            {/* Document Images */}
            {(r.doc_front_url || r.doc_back_url) && (
              <div>
                <h3 className="text-sm font-bold text-[#1a3a5c] mb-3 flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Documentos do Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {r.doc_front_url && (
                    <div className="border rounded-xl overflow-hidden">
                      <div className="bg-gray-100 px-3 py-1.5 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">📋 Frente do BI</span>
                        <a href={r.doc_front_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-blue-600 flex items-center gap-0.5 hover:underline">Abrir <ExternalLink className="h-3 w-3" /></a>
                      </div>
                      <img src={r.doc_front_url} alt="Frente" className="w-full max-h-[250px] object-contain bg-white p-2" />
                    </div>
                  )}
                  {r.doc_back_url && (
                    <div className="border rounded-xl overflow-hidden">
                      <div className="bg-gray-100 px-3 py-1.5 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-600">📋 Verso do BI</span>
                        <a href={r.doc_back_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-blue-600 flex items-center gap-0.5 hover:underline">Abrir <ExternalLink className="h-3 w-3" /></a>
                      </div>
                      <img src={r.doc_back_url} alt="Verso" className="w-full max-h-[250px] object-contain bg-white p-2" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Previous review */}
            {r.review_message && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2"><MessageSquare className="h-4 w-4 text-gray-500" /><span className="font-medium text-sm">Mensagem da Revisão</span></div>
                <p className="text-sm">{r.review_message}</p>
                {r.reviewed_at && <p className="text-xs text-gray-400 mt-1">Em {new Date(r.reviewed_at).toLocaleDateString('pt-MZ')}</p>}
              </div>
            )}

            {/* Admin Actions */}
            {isGestor && r.status === 'pending' && (
              <div className="border-t pt-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mensagem de Revisão</label>
                  <Textarea value={reviewMsg} onChange={e => setReviewMsg(e.target.value)} placeholder="Mensagem (obrigatória para rejeitar)..." rows={3} />
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => handleAction(r.id, 'approved')} className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-bold shadow-md">
                    <CheckCircle className="w-4 h-4 mr-2" /> Aprovar
                  </Button>
                  <Button onClick={() => handleAction(r.id, 'rejected')} variant="destructive" className="flex-1 h-12 font-bold shadow-md">
                    <XCircle className="w-4 h-4 mr-2" /> Rejeitar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // List View
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pedidos de Crédito</h1>
        <p className="text-sm text-muted-foreground">{isGestor ? 'Aprovar e rejeitar pedidos' : 'Visualizar pedidos'}</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {([
          { key: 'all' as const, label: 'Todos', count: requests.length, color: 'bg-gray-100 text-gray-800' },
          { key: 'pending' as const, label: 'Pendentes', count: requests.filter(r => r.status === 'pending').length, color: 'bg-amber-100 text-amber-800' },
          { key: 'approved' as const, label: 'Aprovados', count: requests.filter(r => r.status === 'approved').length, color: 'bg-green-100 text-green-800' },
          { key: 'rejected' as const, label: 'Rejeitados', count: requests.filter(r => r.status === 'rejected').length, color: 'bg-red-100 text-red-800' },
        ]).map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`rounded-xl p-3 text-center transition-all ${filter === f.key ? 'ring-2 ring-[#1a3a5c] shadow-md' : 'hover:shadow-sm'} ${f.color}`}>
            <p className="text-2xl font-bold">{f.count}</p>
            <p className="text-[10px] font-medium">{f.label}</p>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : filtered.length === 0 ? (
        <Card className="border-0 shadow-md"><CardContent className="py-12 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>Nenhum pedido</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <Card key={r.id} className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelected(r)}>
              <CardContent className="p-4 md:p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1a3a5c] text-white flex items-center justify-center font-bold">{r.client_name[0]?.toUpperCase()}</div>
                    <div>
                      <p className="font-semibold">{r.client_name}</p>
                      <p className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString('pt-MZ')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {statusBadge(r.status)}
                    <p className="text-lg font-bold text-green-700 mt-1">MZN {Number(r.amount).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  {r.client_phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{r.client_phone}</span>}
                  {(r.credit_purpose || r.purpose) && <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{label(r.credit_purpose || r.purpose)}</span>}
                  {r.guarantee_type && <span className="flex items-center gap-1"><Shield className="h-3 w-3" />{label(r.guarantee_type)}</span>}
                  {r.monthly_income && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />MZN {Number(r.monthly_income).toLocaleString()}/mês</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreditRequestManager;