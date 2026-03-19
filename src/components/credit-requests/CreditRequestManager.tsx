import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { notifyEvent } from '@/utils/notifyEvent';
import { supabase } from '@/integrations/supabase/client';
import {
  CheckCircle, XCircle, Clock, User, DollarSign, Calendar,
  MessageSquare, Phone, MapPin, ChevronLeft, Briefcase,
  Shield, Home, FileText, Image as ImageIcon, ExternalLink, Mail, Printer, Download,
  Wallet, Loader2
} from 'lucide-react';
import { generateCreditRequestPdf } from '../../utils/creditRequestPdf';

interface AmortizationRow {
  installmentNumber: number;
  date: string;
  principal: number;
  interest: number;
  total: number;
}

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
  guarantee_photos?: string[] | null;
  credit_option?: 'A' | 'B' | 'C' | null;
  is_installment?: boolean | null;
  installment_months?: number | null;
  amortization_plan?: AmortizationRow[] | null;
  interest_rate_at_request?: number | null;
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

  const [companySettings, setCompanySettings] = useState<Record<string, unknown> | null>(null);
  const [contractStatus, setContractStatus] = useState<string | null>(null);
  const [loanAlreadyExists, setLoanAlreadyExists] = useState(false);

  useEffect(() => { load(); }, []);

  // Check contract status and existing loan when viewing an approved request
  useEffect(() => {
    if (selected && selected.status === 'approved') {
      console.log("[GUARD] Request selected for sub-check:", selected.id, "Client Name:", selected.client_name);

      (async () => {
        setLoading(true);
        try {
          if (!selected.user_id) {
            console.warn("[GUARD] Request has no user_id.");
            setContractStatus(null);
            setLoanAlreadyExists(false);
            return;
          }

          // 1. Check for ANY contract for THIS specific request
          const { data: contracts } = await supabase.from('contracts')
            .select('id, status')
            .eq('credit_request_id', selected.id)
            .limit(1);

          const contract = contracts?.[0];
          console.log("[GUARD] Contract Check (request_id):", contract ? `FOUND (${contract.status})` : "NONE");
          setContractStatus(contract ? contract.status : null);

          // 3. PROACTIVE FIX: If request is approved but user_id is missing, try to link it NOW
          if (selected.status === 'approved' && !selected.user_id) {
            console.log("[GUARD] Orphaned approved request detected. Attempting auto-link...");
            let foundUserId = null;

            // Try phone
            if (selected.client_phone) {
              const { data: pMatch } = await supabase.from('clients').select('user_id').eq('phone', selected.client_phone).not('user_id', 'is', null).limit(1);
              if (pMatch?.[0]?.user_id) foundUserId = pMatch[0].user_id;
            }
            // Try email
            if (!foundUserId && selected.client_email) {
              const { data: eMatch } = await supabase.from('clients').select('user_id').eq('email', selected.client_email).not('user_id', 'is', null).limit(1);
              if (eMatch?.[0]?.user_id) foundUserId = eMatch[0].user_id;
            }

            if (foundUserId) {
              console.log("[GUARD] Auto-link Success:", foundUserId);
              await supabase.from('credit_requests').update({ user_id: foundUserId }).eq('id', selected.id);
              // Also check if contract exists for this user
              const { data: existingContract } = await supabase.from('contracts').select('id').eq('credit_request_id', selected.id).limit(1);
              if (!existingContract || existingContract.length === 0) {
                console.log("[GUARD] Creating missing contract for auto-linked user...");
                await supabase.from('contracts').insert({
                  credit_request_id: selected.id,
                  client_id: foundUserId,
                  client_name: selected.client_name,
                  status: 'pending',
                  contract_url: '/contrato-bochel.pdf'
                });
              }
              load(); // Refresh list to reflect the fix
            }
          }

          // 4. Check for existing DISBURSEMENT in ledger for THIS specific request
          const { data: ledgerEntries } = await supabase.from('wallet_ledger')
            .select('id')
            .eq('reference_id', selected.id)
            .eq('transaction_type', 'disbursement')
            .limit(1);

          const loanExists = !!(ledgerEntries && ledgerEntries.length > 0);
          console.log("[GUARD] Request Disbursed Check (ledger):", loanExists ? "YES" : "NO");
          setLoanAlreadyExists(loanExists);
        } catch (err) {
          console.error('[GUARD] Critical error in sub-checks:', err);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setContractStatus(null);
      setLoanAlreadyExists(false);
    }
  }, [selected]);

  const [injecting, setInjecting] = useState(false);
  const [acting, setActing] = useState(false);

  const load = async () => {
    try {
      const [requestsRes, settingsRes] = await Promise.all([
        supabase.from('credit_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('system_settings').select('company_name, email, phone, nuit, address').limit(1).single()
      ]);
      if (requestsRes.error) throw requestsRes.error;
      setRequests(requestsRes.data || []);
      if (settingsRes.data) setCompanySettings(settingsRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleInjectLoan = async (request: CreditRequest) => {
    if (!request.user_id) {
      toast({ title: 'Erro', description: 'Este pedido não tem um utilizador associado.', variant: 'destructive' });
      return;
    }
    setInjecting(true);
    try {
      // 1. Find or create client record
      let clientId: string | null = null;
      console.log('[INJECT] Step 1: Looking for client with user_id:', request.user_id);

      const { data: existingClient, error: clientLookupErr } = await supabase
        .from('clients').select('id').eq('user_id', request.user_id).limit(1);

      if (clientLookupErr) {
        console.error('[INJECT] Error looking up client by user_id:', clientLookupErr);
        throw new Error(`Erro ao buscar cliente: ${clientLookupErr.message}`);
      }

      const fullAddress = [request.neighborhood, request.district, request.province, request.client_address]
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i)
        .join(', ');

      if (existingClient && existingClient.length > 0) {
        clientId = existingClient[0].id;
        console.log('[INJECT] Found existing client by user_id:', clientId);
        // Sync address and other info to ensure receipts are complete
        await supabase.from('clients').update({
          address: fullAddress,
          id_number: request.document_number,
          user_id: request.user_id
        }).eq('id', clientId);
      } else {
        if (request.client_phone) {
          const { data: byPhone, error: phoneErr } = await supabase
            .from('clients').select('id').eq('phone', request.client_phone).limit(1);
          if (phoneErr) console.warn('[INJECT] Error looking up by phone:', phoneErr);
          if (byPhone && byPhone.length > 0) {
            clientId = byPhone[0].id;
            console.log('[INJECT] Found client by phone:', clientId);
          }
        }
        if (!clientId && request.client_name) {
          const { data: byName, error: nameErr } = await supabase
            .from('clients').select('id').ilike('name', request.client_name).limit(1);
          if (nameErr) console.warn('[INJECT] Error looking up by name:', nameErr);
          if (byName && byName.length > 0) {
            clientId = byName[0].id;
            console.log('[INJECT] Found client by name:', clientId);
          }
        }
        if (!clientId) {
          console.log('[INJECT] Creating new client...');
          const { data: newClient, error: clientErr } = await supabase.from('clients').insert({
            name: request.client_name,
            phone: request.client_phone,
            email: request.client_email,
            address: fullAddress,
            id_number: request.document_number,
            user_id: request.user_id,
            agent_id: request.agent_id,
            status: 'active',
          }).select('id').single();
          if (clientErr) {
            console.error('[INJECT] Error creating client:', clientErr);
            throw new Error(`Erro ao criar cliente: ${clientErr.message}`);
          }
          clientId = newClient.id;
          console.log('[INJECT] Created new client:', clientId);
        } else {
          await supabase.from('clients').update({
            user_id: request.user_id,
            address: fullAddress,
            id_number: request.document_number
          }).eq('id', clientId);
        }
      }

      console.log('[INJECT] Verifying critical IDs before proceeding...');
      if (!clientId) {
        console.error('[INJECT] Critical Error: Client ID not found after all attempts.');
        throw new Error('Falha catastrófica: ID do cliente não encontrado.');
      }

      if (!request.id) {
        console.error('[INJECT] Critical Error: Request ID is missing.');
        throw new Error('Falha catastrófica: ID do pedido não encontrado.');
      }

      // 2. Check for existing active loan
      console.log('[INJECT] Step 2: Checking for existing active loans for client:', clientId);
      const { data: existingLoan, error: loanCheckErr } = await supabase.from('loans').select('id')
        .eq('client_id', clientId).eq('amount', request.amount)
        .neq('status', 'paid').neq('status', 'completed').limit(1);

      if (loanCheckErr) {
        console.error('[INJECT] Error checking existing loans:', loanCheckErr);
        throw new Error(`Erro ao verificar empréstimos existentes: ${loanCheckErr.message}`);
      }

      if (existingLoan && existingLoan.length > 0) {
        console.warn('[INJECT] ⚠️ Duplicate loan found! Existing loan ID:', existingLoan[0].id, 'for client:', clientId, 'amount:', request.amount);
        toast({ title: '⚠️ Empréstimo já existe', description: `Já existe um empréstimo activo (ID: ${existingLoan[0].id.substring(0, 8)}) para ${request.client_name} com o valor MZN ${request.amount.toLocaleString()}. Não é possível criar duplicado.`, variant: 'destructive' });
        setInjecting(false);
        return;
      }

      // 3. Create loan (Atomic RPC)
      console.log('[INJECT] Step 3: Calling disburse_loan_with_wallet RPC for client:', clientId, 'amount:', request.amount);

      const startDate = new Date();
      const endDate = new Date();

      const installments = request.installment_months || 1;
      const isInstallment = request.is_installment || false;
      const option = request.credit_option || 'A';

      if (isInstallment && installments > 1) {
        if (option === 'A') {
          // 4 weeks
          endDate.setDate(endDate.getDate() + (installments * 7));
        } else {
          // N months
          endDate.setDate(endDate.getDate() + (installments * 30));
        }
      } else {
        // Single payment: Padrão 30 dias (ou o que estiver no "term" se usado)
        endDate.setDate(endDate.getDate() + 30);
      }

      const interestRate = 30;
      const { data: rpcData, error: rpcErr } = await supabase.rpc('disburse_loan_with_wallet', {
        p_request_id: request.id,
        p_user_id: request.user_id,
        p_client_id: clientId,
        p_amount: Number(request.amount),
        p_interest_rate: Number(request.interest_rate_at_request || 30),
        p_installments: Number(request.installment_months || 1),
        p_total_amount: Number(request.amortization_plan
          ? request.amortization_plan.reduce((acc: number, row: AmortizationRow) => acc + (Number(row.total) || 0), 0)
          : request.amount * 1.3),
        p_agent_id: request.agent_id || null,
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString(),
        p_credit_option: request.credit_option || 'A',
        p_is_installment: request.is_installment || false,
        p_amortization_plan: request.amortization_plan || null
      });

      if (rpcErr) {
        console.error('[INJECT] RPC Error:', rpcErr);
        throw new Error(`Erro ao injectar saldo (RPC): ${rpcErr.message}`);
      }

      console.log('[INJECT] Step 4: Loan created and balance updated atomically!');

      console.log('[INJECT] Step 5: Sending notification...');

      // 4. Notify client and agent
      await notifyEvent('LOAN_INJECTED', {
        userId: request.user_id,
        amount: request.amount,
        fromUserId: user?.id || null,
      });

      if (request.agent_id) {
        await notifyEvent('AGENT_REQUEST_UPDATE', {
          agentUserId: request.agent_id,
          action: 'approved',
          clientName: request.client_name,
          amount: request.amount,
          fromUserId: user?.id || null,
        });
      }

      console.log('[INJECT] ✅ All steps completed successfully!');
      toast({
        title: '✅ Saldo Injectado!',
        description: `MZN ${request.amount.toLocaleString()} creditados a ${request.client_name}. Prazo total: ${isInstallment ? `${installments} ${option === 'A' ? 'Semanas' : 'Meses'}` : '30 dias'}.`
      });
      setSelected(null);
      load();
    } catch (e: unknown) {
      console.error('[INJECT] ❌ FULL ERROR:', e);
      const errorMsg = e instanceof Error ? e.message : 'Erro inesperado';
      toast({ title: 'Erro ao injectar saldo', description: errorMsg, variant: 'destructive' });
    } finally {
      setInjecting(false);
    }
  };

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    if (action === 'rejected' && !reviewMsg.trim()) {
      toast({ title: 'Erro', description: 'Mensagem obrigatória para rejeitar.', variant: 'destructive' });
      return;
    }

    console.log(`[ACTION] Starting ${action} for request ${id}`);
    setActing(true);
    try {
      console.log('[ACTION] Step 1: Updating credit_requests table...');
      const { error } = await supabase.from('credit_requests').update({
        status: action,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id || null,
        review_message: reviewMsg || (action === 'approved' ? 'Aprovado' : ''),
      }).eq('id', id);
      if (error) {
        console.error('[ACTION] FAILED at Step 1 (Update request):', error);
        throw error;
      }
      console.log('[ACTION] ✅ Step 1 Success: Request updated.');

      console.log('[ACTION] Step 2: Main updates successful. Closing UI...');
      toast({ title: action === 'approved' ? 'Pedido Aprovado e Contrato Gerado' : 'Pedido Rejeitado' });

      // Close UI instantly while notifications run in background
      const savedReviewMsg = reviewMsg;
      const selectedReq: CreditRequest = { ...selected };
      setSelected(null);
      setReviewMsg('');
      load();

      // Background logic (Contract creation & notifications)
      (async () => {
        try {
          if (action === 'approved') {
            console.log('[ACTION] BG Step: Creating contract record...');

            let targetUserId = selectedReq.user_id;

            // Improved Fallback: If user_id is missing on request, try to find it via phone, email or name in clients table
            if (!targetUserId) {
              console.warn('[ACTION] BG Warning: request.user_id is missing. Trying to find in clients table...');

              // Try phone first (most unique)
              if (selectedReq.client_phone) {
                const { data: phoneMatch } = await supabase.from('clients')
                  .select('user_id')
                  .eq('phone', selectedReq.client_phone)
                  .not('user_id', 'is', null)
                  .limit(1);
                if (phoneMatch?.[0]?.user_id) targetUserId = phoneMatch[0].user_id;
              }

              // Try email second
              if (!targetUserId && selectedReq.client_email) {
                const { data: emailMatch } = await supabase.from('clients')
                  .select('user_id')
                  .eq('email', selectedReq.client_email)
                  .not('user_id', 'is', null)
                  .limit(1);
                if (emailMatch?.[0]?.user_id) targetUserId = emailMatch[0].user_id;
              }

              // Try name last (least robust)
              if (!targetUserId) {
                const { data: nameMatch } = await supabase.from('clients')
                  .select('user_id')
                  .ilike('name', selectedReq.client_name)
                  .not('user_id', 'is', null)
                  .limit(1);
                if (nameMatch?.[0]?.user_id) targetUserId = nameMatch[0].user_id;
              }

              if (targetUserId) {
                console.log('[ACTION] BG Success: Found user_id from clients table:', targetUserId);
                // CRITICAL: Link the request to the user so they can see it in their history!
                await supabase.from('credit_requests').update({ user_id: targetUserId }).eq('id', selectedReq.id);
              }
            }

            if (!targetUserId) {
              console.error('[ACTION] BG Abort: Cannot create contract because client has no linked user account (user_id is null).');
              return;
            }

            // Find existing signed contract to reuse signature
            const { data: prevContracts } = await supabase.from('contracts')
              .select('signature_url')
              .eq('client_id', targetUserId)
              .eq('status', 'signed')
              .not('signature_url', 'is', null)
              .limit(1);

            const reuseSig = prevContracts?.[0]?.signature_url || null;

            const { error: contractErr } = await supabase.from('contracts').insert({
              credit_request_id: selectedReq.id,
              client_id: targetUserId,
              client_name: selectedReq.client_name,
              status: 'pending',
              signature_url: reuseSig,
              contract_url: '/contrato-bochel.pdf'
            });
            if (contractErr) console.error('[ACTION] BG Error creating contract:', contractErr);
            else console.log('[ACTION] ✅ BG Success: Contract created.');
          }

          console.log('[ACTION] Step 3 (BG): Starting notifications...');
          if (selectedReq.user_id) {
            await notifyEvent(action === 'approved' ? 'CREDIT_APPROVED' : 'CREDIT_REJECTED', {
              userId: selectedReq.user_id,
              amount: selectedReq.amount,
              rejectReason: savedReviewMsg,
              fromUserId: user?.id || null,
            });
          }

          if (selectedReq.agent_id) {
            await notifyEvent('AGENT_REQUEST_UPDATE', {
              agentUserId: selectedReq.agent_id,
              action: action,
              clientName: selectedReq.client_name,
              amount: selectedReq.amount,
              fromUserId: user?.id || null,
            });
          }
          console.log('[ACTION] ✅ BG Step 3 Success: Notifications processed.');
        } catch (bgErr) {
          console.warn('[ACTION] ⚠️ BG Step 3 Warning: Notifications failed (non-blocking)', bgErr);
        }
      })();
      console.log('[ACTION] Flow complete.');
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'Erro inesperado';
      toast({ title: 'Erro', description: errorMsg, variant: 'destructive' });
    } finally {
      setActing(false);
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

  const InfoRow = ({ icon: Icon, title, value }: { icon: React.ElementType; title: string; value: string | null | undefined }) => {
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

    const handleExportPdf = async (request: CreditRequest) => {
      toast({ title: 'A gerar PDF...', description: 'Aguarde enquanto o documento e preparado.' });
      try {
        await generateCreditRequestPdf({
          id: 'PED-' + request.id.substring(0, 8).toUpperCase(),
          date: new Date(request.created_at).toLocaleDateString('pt-MZ'),
          status: request.status,
          clientName: request.client_name,
          birthDate: request.birth_date || undefined,
          gender: label(request.gender) || undefined,
          documentType: label(request.document_type) || undefined,
          documentNumber: request.document_number || undefined,
          nuit: request.nuit || undefined,
          phone: request.client_phone || undefined,
          email: request.client_email || undefined,
          neighborhood: request.neighborhood || undefined,
          district: request.district || undefined,
          province: request.province || undefined,
          residenceType: label(request.residence_type) || undefined,
          occupation: label(request.occupation) || undefined,
          companyName: request.company_name || undefined,
          workDuration: request.work_duration || undefined,
          monthlyIncome: request.monthly_income || undefined,
          amount: request.amount,
          purpose: label(request.credit_purpose || request.purpose) || undefined,
          receiveDate: request.receive_date || undefined,
          guaranteeType: label(request.guarantee_type) || undefined,
          guaranteeMode: label(request.guarantee_mode) || undefined,
          observations: request.observations || undefined,
          docFrontUrl: request.doc_front_url || undefined,
          docBackUrl: request.doc_back_url || undefined,
          guaranteePhotos: request.guarantee_photos || undefined,
          creditOption: request.credit_option || undefined,
          isInstallment: request.is_installment || undefined,
          installmentMonths: request.installment_months || undefined,
          amortizationPlan: request.amortization_plan || undefined,
          company: {
            name: companySettings?.company_name || 'BOCHEL MICROCREDITO',
            email: companySettings?.email || undefined,
            phone: companySettings?.phone || undefined,
            nuit: companySettings?.nuit || undefined,
            address: companySettings?.address || 'Maputo, Mocambique',
          }
        });
        toast({ title: 'PDF Baixado!', description: 'O documento foi salvo com sucesso.' });
      } catch (err) {
        console.error('PDF generation error:', err);
        toast({ title: 'Erro', description: 'Falha ao gerar o PDF.', variant: 'destructive' });
      }
    };

    return (
      <div className="container mx-auto p-4 md:p-6 space-y-4 max-w-4xl">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => { setSelected(null); setReviewMsg(''); }}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>

          <Button onClick={() => handleExportPdf(r)} variant="outline" className="gap-2 text-[#0b3a20] border-[#0b3a20] hover:bg-[#0b3a20] hover:text-white transition-colors">
            <Download className="h-4 w-4" /> Baixar PDF
          </Button>
        </div>

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
                <p className="font-bold text-blue-700">
                  {r.is_installment
                    ? `${r.installment_months} ${r.credit_option === 'A' ? 'Semanas' : 'Meses'}`
                    : '30 dias'}
                </p>
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
                <InfoRow
                  icon={Calendar}
                  title="Tipo de Plano"
                  value={r.is_installment ? `Parcelado (${r.installment_months} ${r.credit_option === 'A' ? 'Semanas' : 'Meses'})` : 'Pagamento Único (30 dias)'}
                />
                {r.credit_option && (
                  <div className="flex items-start gap-2.5 bg-orange-50 rounded-lg p-3 border border-orange-100">
                    <Shield className="h-4 w-4 mt-0.5 text-orange-600 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-orange-600 uppercase tracking-wide">Opção Escolhida</p>
                      <p className="text-sm font-bold text-orange-800">Candidato à Opção {r.credit_option}</p>
                    </div>
                  </div>
                )}
                {!r.user_id && (
                  <div className="flex items-start gap-2.5 bg-red-50 rounded-lg p-3 border border-red-100">
                    <AlertTriangle className="h-4 w-4 mt-0.5 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-red-600 uppercase tracking-wide">Utilizador Não Vinculado</p>
                      <p className="text-xs font-semibold text-red-800">Este pedido foi feito sem login. O contrato só poderá ser gerado após o cliente registar-se com o mesmo Telefone/Email.</p>
                    </div>
                  </div>
                )}
              </div>

              {r.is_installment && r.amortization_plan && r.amortization_plan.length > 0 && (
                <div className="mt-4 border rounded-xl overflow-hidden shadow-sm bg-white">
                  <div className="bg-gray-50 p-2.5 border-b flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-bold text-gray-700 uppercase">Plano de Amortização Simulado</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50/50 text-gray-500">
                        <tr>
                          <th className="px-4 py-2 font-medium">#</th>
                          <th className="px-4 py-2 font-medium">Vencimento</th>
                          <th className="px-4 py-2 font-medium text-right">Amortização</th>
                          <th className="px-4 py-2 font-medium text-right">Juros</th>
                          <th className="px-4 py-2 font-medium text-right font-bold text-gray-900">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {r.amortization_plan.map((row: AmortizationRow) => (
                          <tr key={row.installmentNumber} className="hover:bg-gray-50/50">
                            <td className="px-4 py-2">{row.installmentNumber}</td>
                            <td className="px-4 py-2">{new Date(row.date).toLocaleDateString('pt-MZ')}</td>
                            <td className="px-4 py-2 text-right">MT {Number(row.principal || 0).toLocaleString()}</td>
                            <td className="px-4 py-2 text-right">MT {Number(row.interest || 0).toLocaleString()}</td>
                            <td className="px-4 py-2 text-right font-bold text-[#1b5e20]">MT {Number(row.total || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-green-50/30">
                        <tr>
                          <td colSpan={4} className="px-4 py-2 text-right font-medium text-gray-600">Total a Pagar Estimado:</td>
                          <td className="px-4 py-2 text-right font-black text-[#1b5e20] text-sm">
                            MT {r.amortization_plan.reduce((sum: number, row: AmortizationRow) => sum + Number(row.total || 0), 0).toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
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

            {/* Guarantee Photos */}
            {r.guarantee_photos && r.guarantee_photos.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-[#1a3a5c] mb-3 flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Fotos dos Bens de Garantia</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {r.guarantee_photos.map((photo, idx) => (
                    <div key={idx} className="border rounded-xl overflow-hidden aspect-square">
                      <div className="bg-gray-100 px-3 py-1.5 flex items-center justify-between">
                        <span className="text-[10px] font-medium text-gray-600">Garantia {idx + 1}</span>
                        <a href={photo} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-blue-600 flex items-center gap-0.5 hover:underline">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <img src={photo} alt={`Garantia ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
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

            {/* Admin Actions — Pending */}
            {isGestor && r.status === 'pending' && (
              <div className="border-t pt-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mensagem de Revisão</label>
                  <Textarea value={reviewMsg} onChange={e => setReviewMsg(e.target.value)} placeholder="Mensagem (obrigatória para rejeitar)..." rows={3} />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleAction(r.id, 'approved')}
                    disabled={acting}
                    className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-bold shadow-md"
                  >
                    {acting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    Aprovar
                  </Button>
                  <Button
                    onClick={() => handleAction(r.id, 'rejected')}
                    variant="destructive"
                    disabled={acting}
                    className="flex-1 h-12 font-bold shadow-md"
                  >
                    {acting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                    Rejeitar
                  </Button>
                </div>
              </div>
            )}

            {/* Info: Contract pending signature */}
            {isGestor && r.status === 'approved' && contractStatus === 'pending' && (
              <div className="border-t pt-5">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center space-y-3">
                  <Clock className="h-8 w-8 text-amber-600 mx-auto animate-pulse" />
                  <div className="space-y-1">
                    <h3 className="font-bold text-amber-800 text-lg">Aguardando Assinatura</h3>
                    <p className="text-sm text-amber-700 leading-relaxed">
                      O contrato foi gerado com sucesso, mas o cliente ainda não assinou digitalmente.
                      <br />O botão de injecção será libertado assim que for assinado.
                    </p>
                  </div>
                  <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100 font-bold" onClick={() => load()}>
                    <RefreshCw className="h-4 w-4 mr-2" /> Actualizar Estado
                  </Button>
                </div>
              </div>
            )}

            {/* Info: Loan already injected */}
            {isGestor && r.status === 'approved' && contractStatus === 'signed' && loanAlreadyExists && (
              <div className="border-t pt-5">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center space-y-2">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                  <h3 className="font-bold text-green-800">Saldo Já Injectado</h3>
                  <p className="text-sm text-gray-600">O empréstimo de MZN {(Number(r.amount) * 1.3).toLocaleString()} (com 30% juros) já foi creditado na conta deste cliente.</p>
                </div>
              </div>
            )}

            {/* Admin Actions — Approved: Inject Loan (only after contract is signed AND no loan exists yet) */}
            {isGestor && r.status === 'approved' && contractStatus === 'signed' && !loanAlreadyExists && (
              <div className="border-t pt-5 space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-green-800">Injectar Saldo ao Cliente</h3>
                      <p className="text-xs text-green-600">Aprovar crédito e gerar dívida na conta do cliente</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 text-center">
                    <div className="bg-white rounded-lg p-2 border border-green-100 shadow-sm">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Opção / Parcelas</p>
                      <p className="font-bold text-gray-800">
                        {r.credit_option || 'B'} / {r.is_installment ? `${r.installment_months}x` : 'Fixo'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-green-100 shadow-sm">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Juros Estimados</p>
                      <p className="font-bold text-orange-600">
                        MZN {(
                          (r.amortization_plan ? r.amortization_plan.reduce((acc: number, row: AmortizationRow) => acc + row.total, 0) : r.amount * 1.3)
                          - r.amount
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-green-100 shadow-sm">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Dívida a Receber</p>
                      <p className="font-black text-green-700">
                        MZN {(r.amortization_plan ? r.amortization_plan.reduce((acc: number, row: AmortizationRow) => acc + row.total, 0) : r.amount * 1.3).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-green-100 shadow-sm">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Prazo / Mora</p>
                      <p className="font-bold text-blue-700">{r.is_installment ? 'Mensal' : '30d'} / 1.5%<span className="text-[10px]">dia</span></p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleInjectLoan(r)}
                    disabled={injecting}
                    className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-base shadow-lg"
                  >
                    {injecting ? (
                      <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> A Processar...</>
                    ) : (
                      <><Wallet className="h-5 w-5 mr-2" /> Injectar MZN {Number(r.amount).toLocaleString()}</>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div >
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