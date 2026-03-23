import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  CheckCircle, Send, User, MapPin, Briefcase, CreditCard,
  ChevronRight, ChevronLeft, Upload, X, Loader2, AlertTriangle, Clock, Ban, DollarSign,
  Table as TableIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { notifyEvent } from '@/utils/notifyEvent';
import { cn } from '@/lib/utils';
import {
  simulateCredit,
  getAvailableOptions,
  getInstallmentLimits,
  CreditOption,
  SimulationResult
} from '@/utils/creditUtils';

interface CreditApplicationFormProps {
  isPublicAccess?: boolean;
  initialData?: any;
}

const FULL_STEPS = [
  { id: 1, title: 'Dados Pessoais', icon: User, color: '#1b5e20' },
  { id: 2, title: 'Endereço', icon: MapPin, color: '#2e7d32' },
  { id: 3, title: 'Profissional', icon: Briefcase, color: '#388e3c' },
  { id: 4, title: 'Crédito', icon: CreditCard, color: '#43a047' },
];

const sanitizePath = (name: string) => {
  return name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
};

// Compress image before upload to prevent "Failed to fetch" from large files
// Compress image before upload to prevent "Failed to fetch" from large files
const compressImage = (file: File, maxWidth = 1024, quality = 0.6): Promise<File> => {
  return new Promise((resolve) => {
    // If not an image, return as-is
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    // If it's already an image and relatively small (< 500KB), return as-is
    if (file.size < 500_000) {
      resolve(file);
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    // Use createImageBitmap if available (more memory efficient for large S22 Ultra images)
    if ('createImageBitmap' in window) {
      createImageBitmap(file)
        .then((bitmap) => {
          const canvas = document.createElement('canvas');
          let { width, height } = bitmap;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            bitmap.close();
            resolve(file);
            return;
          }

          ctx.drawImage(bitmap, 0, 0, width, height);
          bitmap.close(); // Immediate cleanup

          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
            URL.revokeObjectURL(objectUrl);
          }, 'image/jpeg', quality);
        })
        .catch(() => {
          // Fallback to Image() if bitmap fails
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let w = img.width;
            let h = img.height;
            if (w > maxWidth) {
              h = (h * maxWidth) / w;
              w = maxWidth;
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, w, h);
            canvas.toBlob((blob) => {
              if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg' }));
              else resolve(file);
              URL.revokeObjectURL(objectUrl);
              img.src = ""; // Clear memory safely
            }, 'image/jpeg', quality);
          };
          img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(file);
          };
          img.src = objectUrl;
        });
    } else {
      // Legacy fallback
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          else resolve(file);
          img.src = ""; // Clear memory safely
        }, 'image/jpeg', quality);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };
      img.src = objectUrl;
    }
  });
};

const CreditApplicationForm = ({ isPublicAccess = false, initialData }: CreditApplicationFormProps) => {
  // Initial form state constant
  const initialFormState = {
    fullName: '', birthDate: '', documentType: '', documentNumber: '',
    documentIssueDate: '', documentExpiryDate: '', nuit: '', gender: '',
    phone: '', email: '',
    neighborhood: '', district: '', province: '', residenceType: '',
    occupation: '', companyName: '', workDuration: '', monthlyIncome: '',
    requestedAmount: '', creditPurpose: '', receiveDate: '',
    guaranteeType: '', guaranteeMode: '',
    observations: '', truthDeclaration: false,
    docFrontUrl: '', docBackUrl: '',
    guaranteePhotos: [] as string[],
    is_installment: false,
    installmentMonths: 1,
    amortizationPlan: null as any,
    term: 30, // Default term in days
  };

  const [currentStep, setCurrentStep] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('bochel_credit_form_step');
        const step = saved ? parseInt(saved, 10) : 1;
        // Safety: Bound step to [1, 4]
        return (step >= 1 && step <= 4) ? step : 1;
      }
    } catch (e) {
      console.warn("Storage access denied:", e);
    }
    return 1;
  });
  const [stepDirection, setStepDirection] = useState<'forward' | 'back'>('forward');
  const [animating, setAnimating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [docFront, setDocFront] = useState<File | null>(null);
  const [docBack, setDocBack] = useState<File | null>(null);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [uploadingGuarantee, setUploadingGuarantee] = useState(false);
  const { user } = useAuth();

  // Prevent checkUserStatus from re-running on auth token refresh
  const hasCheckedRef = useRef(false);

  // Business rules state
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [hasExistingData, setHasExistingData] = useState(false);
  const [isSimplifiedForm, setIsSimplifiedForm] = useState(false);

  // Form data with localStorage persistence
  const [form, setForm] = useState(() => {
    let baseState = initialFormState;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bochel_credit_form_data');
      if (saved) {
        try {
          baseState = { ...initialFormState, ...JSON.parse(saved) };
        } catch (e) {
          console.error("Error parsing form data:", e);
          localStorage.removeItem('bochel_credit_form_data');
        }
      }
    }

    // Override with initialData from simulation / navigation if available
    if (initialData) {
      return {
        ...baseState,
        fullName: initialData.fullName || baseState.fullName,
        email: initialData.email || baseState.email,
        phone: initialData.phone || baseState.phone,
        requestedAmount: initialData.amount?.toString() || baseState.requestedAmount,
        creditOption: initialData.option || (initialData.creditOption as CreditOption) || baseState.creditOption,
        isInstallment: initialData.isInstallment !== undefined ? initialData.isInstallment : baseState.isInstallment,
        installmentMonths: initialData.installments || initialData.installmentMonths || baseState.installmentMonths,
        term: initialData.days || initialData.term || baseState.term,
        amortizationPlan: initialData.amortizationPlan || baseState.amortizationPlan,
      };
    }

    return baseState;
  });

  // Calculate Amortization Plan automatically - Intelligent Selection
  useEffect(() => {
    const amount = parseFloat(form.requestedAmount);

    // GUARDIAN FIX: If the user inputs match the imported simulation exactly, 
    // keep the highly-customized schedule from the Simulator instead of strictly recalculating it.
    if (
      initialData?.amortizationPlan &&
      amount === Number(initialData.amount) &&
      form.isInstallment === initialData.isInstallment &&
      Number(form.installmentMonths) === Number(initialData.installments || initialData.installmentMonths)
    ) {
      setForm(prev => {
        // Only update if it's different to avoid infinite loops
        if (JSON.stringify(prev.amortizationPlan) !== JSON.stringify(initialData.amortizationPlan)) {
          return {
            ...prev,
            creditOption: initialData.option,
            amortizationPlan: initialData.amortizationPlan
          };
        }
        return prev;
      });
      return;
    }

    // Use days from simulation if available, default to 30
    const days = initialData?.days || 30;

    if (amount > 0) {
      // simulateCredit now handles auto-selection internally
      const sim = simulateCredit(amount, days, undefined, form.isInstallment, form.installmentMonths);

      setForm(prev => ({
        ...prev,
        creditOption: sim.option,
        amortizationPlan: sim.installments
      }));
    }
  }, [form.requestedAmount, form.isInstallment, form.installmentMonths, initialData]);

  // Save form data to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem('bochel_credit_form_data', JSON.stringify(form));
    } catch (e) {
      // Might fail if storage is full or restricted
      console.warn("Could not save form data:", e);
    }
  }, [form]);

  // Save current step to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem('bochel_credit_form_step', currentStep.toString());
    } catch (e) {
      console.warn("Could not save step:", e);
    }
  }, [currentStep]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check existing credit requests on mount (only once)
  useEffect(() => {
    if (!user?.id || isPublicAccess) {
      setCheckingStatus(false);
      return;
    }
    // Only run once — prevents re-check on TOKEN_REFRESHED events
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;
    checkUserStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const checkUserStatus = async () => {
    try {
      // Run independent queries in PARALLEL — reduces load time from ~5s to ~1s
      const [pendingRes, approvedRes, clientRes, previousRes] = await Promise.all([
        supabase.from('credit_requests').select('id').eq('user_id', user!.id).eq('status', 'pending').limit(1),
        supabase.from('credit_requests').select('id').eq('user_id', user!.id).eq('status', 'approved').limit(1),
        supabase.from('clients').select('id').eq('user_id', user!.id).limit(1),
        supabase.from('credit_requests').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(1),
      ]);

      console.log("[GUARD] Checking user status for user:", user!.id);

      // 1. Block if pending OR approved (not yet injected) request exists
      if (pendingRes.data?.length || approvedRes.data?.length) {
        console.log("[GUARD] Found pending or approved request. Blocking.");
        setIsBlocked(true);
        setBlockReason(pendingRes.data?.length
          ? 'Já tem um pedido de crédito pendente em análise. Aguarde a decisão antes de fazer um novo pedido.'
          : 'Já tem um pedido aprovado aguardando desembolso. Por favor, aguarde o processamento ou contacte o suporte.');
        setCheckingStatus(false);
        return;
      }

      const clientId: string | null = clientRes.data?.[0]?.id ?? null;

      // 2. Block if any ACTIVE (unpaid) loan exists
      if (clientId) {
        console.log("[GUARD] Client ID found:", clientId, ". Checking active loans...");
        const { data: activeLoans } = await supabase
          .from('loans')
          .select('id, status')
          .eq('client_id', clientId)
          .not('status', 'in', '(paid,completed)')
          .limit(1);

        if (activeLoans && activeLoans.length > 0) {
          console.log("[GUARD] Found active loan:", activeLoans[0].id, "Status:", activeLoans[0].status);
          setIsBlocked(true);
          setBlockReason('Já tem um crédito activo. Deve quitar a dívida antes de solicitar novo crédito.');
          setCheckingStatus(false);
          return;
        }
      }

      // 3. Pre-fill from previous request (simplified form)
      if (previousRes.data && previousRes.data.length > 0) {
        const prev = previousRes.data[0];
        setHasExistingData(true);
        setIsSimplifiedForm(true);
        setForm(f => ({
          ...f,
          fullName: prev.client_name || '',
          birthDate: prev.birth_date || '',
          documentType: prev.document_type || '',
          documentNumber: prev.document_number || '',
          documentIssueDate: prev.document_issue_date || '',
          documentExpiryDate: prev.document_expiry_date || '',
          nuit: prev.nuit || '',
          gender: prev.gender || '',
          phone: prev.client_phone || '',
          email: prev.client_email || '',
          neighborhood: prev.neighborhood || '',
          district: prev.district || '',
          province: prev.province || '',
          residenceType: prev.residence_type || '',
          occupation: prev.occupation || '',
          companyName: prev.company_name || '',
          workDuration: prev.work_duration || '',
          monthlyIncome: prev.monthly_income || '',
          guaranteeType: prev.guarantee_type || '',
          guaranteeMode: prev.guarantee_mode || '',
          guaranteePhotos: prev.guarantee_photos || [],
        }));
      }
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const updateField = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  };

  // Add data attributes to help the auto-scroller find errors faster
  const FieldError = ({ field }: { field: string }) => {
    if (!errors[field]) return null;
    return (
      <div
        className="text-red-500 text-xs mt-1.5 flex items-center font-medium animate-in slide-in-from-top-1"
        data-error={field}
      >
        <AlertTriangle className="h-3.5 w-3.5 mr-1" />
        {errors[field]}
      </div>
    );
  };

  // Validation — simplified form only validates credit fields
  const validateSimplified = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.occupation) newErrors.occupation = 'Selecione a ocupação';
    if (!String(form.companyName || '').trim()) newErrors.companyName = 'Nome da empresa é obrigatório';
    if (!String(form.monthlyIncome || '').trim()) newErrors.monthlyIncome = 'Rendimento é obrigatório';
    if (!String(form.requestedAmount || '').trim()) newErrors.requestedAmount = 'Valor é obrigatório';
    if (!form.creditPurpose) newErrors.creditPurpose = 'Selecione a finalidade';
    if (!form.receiveDate) newErrors.receiveDate = 'Data é obrigatória';
    if (!form.guaranteeType) newErrors.guaranteeType = 'Selecione a garantia';
    if (!form.guaranteeMode) newErrors.guaranteeMode = 'Selecione o modo';
    if (!form.truthDeclaration) newErrors.truthDeclaration = 'Deve concordar';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!String(form.fullName || '').trim()) newErrors.fullName = 'Nome é obrigatório';
      if (!form.birthDate) newErrors.birthDate = 'Data de nascimento é obrigatória';
      if (!form.documentType) newErrors.documentType = 'Selecione o tipo de documento';
      if (!String(form.documentNumber || '').trim()) newErrors.documentNumber = 'Número é obrigatório';
      if (!form.gender) newErrors.gender = 'Selecione o sexo';
      if (!String(form.phone || '').trim()) newErrors.phone = 'Telefone é obrigatório';
    } else if (step === 2) {
      if (!String(form.neighborhood || '').trim()) newErrors.neighborhood = 'Bairro é obrigatório';
      if (!String(form.district || '').trim()) newErrors.district = 'Distrito é obrigatório';
      if (!String(form.province || '').trim()) newErrors.province = 'Província é obrigatória';
      if (!form.residenceType) newErrors.residenceType = 'Selecione o tipo';
    } else if (step === 3) {
      if (!form.occupation) newErrors.occupation = 'Selecione a ocupação';
      if (!String(form.companyName || '').trim()) newErrors.companyName = 'Nome da empresa é obrigatório';
      if (!String(form.workDuration || '').trim()) newErrors.workDuration = 'Tempo de trabalho é obrigatório';
      if (!String(form.monthlyIncome || '').trim()) newErrors.monthlyIncome = 'Rendimento é obrigatório';
    } else if (step === 4) {
      if (!String(form.requestedAmount || '').trim()) newErrors.requestedAmount = 'Valor é obrigatório';
      if (!form.creditPurpose) newErrors.creditPurpose = 'Selecione a finalidade';
      if (!form.receiveDate) newErrors.receiveDate = 'Data é obrigatória';
      if (!form.guaranteeType) newErrors.guaranteeType = 'Selecione a garantia';
      if (!form.guaranteeMode) newErrors.guaranteeMode = 'Selecione o modo';
      if (!form.truthDeclaration) newErrors.truthDeclaration = 'Deve concordar';

      // Document requirements for first-time clients
      if (!isSimplifiedForm) {
        if (!form.docFrontUrl) newErrors.docFront = 'Foto da frente é obrigatória';
        if (!form.docBackUrl) newErrors.docBack = 'Foto do verso é obrigatória';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const totalSteps = isSimplifiedForm ? 1 : 4;

  const goToStep = (next: number, direction: 'forward' | 'back') => {
    if (animating) return;
    setStepDirection(direction);
    setAnimating(true);
    // Short delay so CSS animation fires before content swap
    setTimeout(() => {
      setCurrentStep(next);
      setAnimating(false);
    }, 180);
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      goToStep(Math.min(currentStep + 1, 4), 'forward');
    } else {
      // Find the first error element on the page and scroll to it
      setTimeout(() => {
        const firstErrorEl = document.querySelector('.text-red-500, [data-error]');
        if (firstErrorEl) {
          try {
            firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } catch (e) {
            // Fallback for browsers with limited scroll support
            if (firstErrorEl.scrollIntoView) firstErrorEl.scrollIntoView(true);
          }
        }
      }, 50);
    }
  };
  const prevStep = () => goToStep(Math.max(currentStep - 1, 1), 'back');

  const uploadDocImage = async (file: File, side: string): Promise<string | null> => {
    try {
      // Compress image before upload
      const compressed = await compressImage(file);
      const userId = user?.id || 'guest';
      const cleanSide = sanitizePath(side);
      const timestamp = Date.now();
      const path = `${userId}/${cleanSide}_${timestamp}.jpg`;

      // Log for debugging (only in console)
      console.log(`[Upload] Resilient upload trial: ${path}, Type: ${compressed.type}, Size: ${compressed.size}`);

      // Added explicit timeout via Promise.race
      const uploadPromise = supabase.storage.from('chat-files').upload(path, compressed, {
        contentType: compressed.type || 'image/jpeg',
        upsert: true,
        cacheControl: '3600'
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 20000)
      );

      const { data: uploadData, error } = await Promise.race([uploadPromise, timeoutPromise]) as any;

      if (error) {
        console.warn(`Upload ${side} failed:`, error.message, error);

        let errorMsg = "Não foi possível enviar a foto.";
        if (error.message === 'TIMEOUT') {
          errorMsg = "O envio demorou muito tempo. Verifique sua conexão e tente novamente.";
        } else if (error.message.includes('Payload too large') || (compressed.size > 5 * 1024 * 1024)) {
          errorMsg = "A foto é demasiado grande (>5MB). Tente tirar outra foto ou reduzir o tamanho.";
        } else if (error.message.includes('storage/quota-exceeded')) {
          errorMsg = "Limite de armazenamento atingido.";
        } else if (error.message === 'Failed to fetch') {
          errorMsg = "Erro de rede (CORS ou SSL). Tente usar um navegador moderno (Chrome/Safari).";
        } else {
          errorMsg = `Erro servidor: ${error.message}`;
        }

        toast({
          title: "Erro no upload",
          description: errorMsg,
          variant: "destructive"
        });
        return null;
      }

      // Ensure we get a valid URL
      const { data } = supabase.storage.from('chat-files').getPublicUrl(path);
      if (!data?.publicUrl) {
        throw new Error("Não foi possível gerar a URL pública");
      }

      return data.publicUrl;
    } catch (err) {
      console.warn(`Upload ${side} error:`, err);
      return null;
    }
  };

  const handleDocFrontUpload = async (file: File) => {
    setUploadingFront(true);
    const url = await uploadDocImage(file, 'frente');
    if (url) {
      updateField('docFrontUrl', url);
      setDocFront(file);
    }
    setUploadingFront(false);
  };

  const handleDocBackUpload = async (file: File) => {
    setUploadingBack(true);
    const url = await uploadDocImage(file, 'verso');
    if (url) {
      updateField('docBackUrl', url);
      setDocBack(file);
    }
    setUploadingBack(false);
  };

  const handleGuaranteePhotoUpload = async (file: File) => {
    if (form.guaranteePhotos.length >= 4) {
      toast({ title: "Limite atingido", description: "Pode enviar no máximo 4 fotos.", variant: "destructive" });
      return;
    }
    setUploadingGuarantee(true);
    const url = await uploadDocImage(file, `garantia_${form.guaranteePhotos.length + 1}`);
    if (url) {
      updateField('guaranteePhotos', [...form.guaranteePhotos, url]);
    }
    setUploadingGuarantee(false);
  };

  const removeGuaranteePhoto = (index: number) => {
    const newPhotos = [...form.guaranteePhotos];
    newPhotos.splice(index, 1);
    updateField('guaranteePhotos', newPhotos);
  };

  const handleSubmit = async () => {
    const triggerValidationScroll = () => {
      setTimeout(() => {
        const firstErrorEl = document.querySelector('.text-red-500, [data-error]');
        if (firstErrorEl) {
          try {
            firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } catch (e) {
            // Fallback for browsers with limited scroll support
            if (firstErrorEl.scrollIntoView) firstErrorEl.scrollIntoView(true);
          }
        }
      }, 50);
    };

    if (isSimplifiedForm) {
      if (!validateSimplified()) {
        triggerValidationScroll();
        return;
      }
    } else {
      if (!validateStep(4)) {
        triggerValidationScroll();
        return;
      }
    }
    setIsLoading(true);

    try {
      const address = `${form.neighborhood}, ${form.district}, ${form.province}`;
      let resolvedAgentId = user?.role === 'agente' ? user.id : null;
      let resolvedUserId = user?.id || null;

      // Se The User IS an Agente or Gestor submitting ON BEHALF of the client,
      // the request's user_id cannot be the agent's ID. We let it be null so the backend
      // gracefully binds it to the correct client via phone/email on approval.
      if (user?.role === 'agente' || user?.role === 'gestor') {
        resolvedUserId = null;
      }

      // 1. Try to create/update client record and resolve agent_id
      if (user) {
        try {
          const clientData: any = {
            user_id: user.role === 'cliente' ? user.id : undefined,
            name: form.fullName,
            email: form.email || (user.role === 'cliente' ? user.email : null),
            phone: form.phone || null,
            address,
            id_number: form.documentNumber || null,
            status: 'active',
            updated_at: new Date().toISOString()
          };

          // ALWAYS look up in 'clients' table to resolve agent_id and link record
          let existingClientRecord: any = null;

          // Priority 1: Search by user_id if logged in
          if (user.role === 'cliente') {
            const { data: byUser } = await supabase
              .from('clients')
              .select('id, user_id, agent_id')
              .eq('user_id', user.id)
              .maybeSingle();
            if (byUser) existingClientRecord = byUser;
          }

          // Priority 2: Search by email/phone if not found yet
          if (!existingClientRecord) {
            const { data: byContact } = await supabase
              .from('clients')
              .select('id, user_id, agent_id')
              .or(`email.eq.${form.email},phone.eq.${form.phone}`)
              .maybeSingle();
            if (byContact) existingClientRecord = byContact;
          }

          if (existingClientRecord) {
            if (existingClientRecord.user_id) resolvedUserId = existingClientRecord.user_id;

            // LINKAGE: If record has no user_id but we are a logged-in client, link it
            if (!existingClientRecord.user_id && user.role === 'cliente') {
              clientData.user_id = user.id;
              resolvedUserId = user.id;
            }

            // Only overwrite resolvedAgentId if the client already has an agent associated
            if (existingClientRecord.agent_id) resolvedAgentId = existingClientRecord.agent_id;
          }

          if (existingClientRecord) {
            // Non-blocking update (silent fail on RLS/403)
            supabase.from('clients').update(clientData).eq('id', existingClientRecord.id)
              .then(({ error }) => {
                if (error) console.warn("[Sync] Clients update failed (likely RLS):", error.message);
              });
          } else if (user.role === 'cliente') {
            // Non-blocking insert only if it's the client themselves (silent fail on RLS/403)
            supabase.from('clients').insert(clientData)
              .then(({ error }) => {
                if (error) console.warn("[Sync] Clients insert failed (likely RLS):", error.message);
              });
          }
        } catch (e) {
          console.warn("Non-critical error syncing client record", e);
        }
      }

      // Submit credit request with retry
      const requestData = {
        client_name: form.fullName,
        client_email: form.email || null,
        client_phone: form.phone,
        client_address: address,
        amount: parseFloat(form.requestedAmount),
        purpose: form.creditPurpose,
        term: 1,
        status: 'pending',
        user_id: resolvedUserId,
        agent_id: resolvedAgentId,
        birth_date: form.birthDate || null,
        gender: form.gender || null,
        document_type: form.documentType || null,
        document_number: form.documentNumber || null,
        document_issue_date: form.documentIssueDate || null,
        document_expiry_date: form.documentExpiryDate || null,
        nuit: form.nuit || null,
        neighborhood: form.neighborhood || null,
        district: form.district || null,
        province: form.province || null,
        residence_type: form.residenceType || null,
        occupation: form.occupation || null,
        company_name: form.companyName || null,
        work_duration: form.workDuration || null,
        monthly_income: form.monthlyIncome || null,
        credit_purpose: form.creditPurpose || null,
        receive_date: form.receiveDate || null,
        guarantee_type: form.guaranteeType || null,
        guarantee_mode: form.guaranteeMode || null,
        observations: form.observations || null,
        doc_front_url: form.docFrontUrl || null,
        doc_back_url: form.docBackUrl || null,
        guarantee_photos: form.guaranteePhotos || [],
        credit_option: form.creditOption,
        is_installment: form.isInstallment,
        installment_months: form.installmentMonths,
        amortization_plan: form.amortizationPlan,
        term: form.term || 30,
        interest_rate_at_request: form.creditOption === 'B'
          ? (form.isInstallment || form.term > 15 ? 30 : 20)
          : 30
      };

      // 2. Submit credit request with resilience
      let lastError: any = null;
      const MAX_ATTEMPTS = 2;

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
          console.log(`[Submit] Attempt ${attempt}/${MAX_ATTEMPTS} to insert credit_request`);

          // Use a Promise.race for simple timeout (15s)
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT')), 15000)
          );

          const insertPromise = supabase.from('credit_requests').insert(requestData);

          const { error } = await Promise.race([insertPromise, timeoutPromise]) as any;

          if (error) throw error;

          lastError = null;
          console.log(`[Submit] ✅ Successfully inserted credit_request on attempt ${attempt}`);
          break;
        } catch (err: any) {
          lastError = err;
          console.warn(`[Submit] ⚠️ Attempt ${attempt} failed:`, err.message || err);

          if (attempt < MAX_ATTEMPTS) {
            // Quick delay before retry
            await new Promise(r => setTimeout(r, 1500 * attempt));
          }
        }
      }

      if (lastError) throw lastError;

      // Clear localStorage after successful submission
      localStorage.removeItem('bochel_credit_form_data');
      localStorage.removeItem('bochel_credit_form_step');

      // 4. Send notifications using the new helper
      try {
        await notifyEvent('NEW_CREDIT_REQUEST', {
          clientName: form.fullName,
          amount: parseFloat(form.requestedAmount),
          fromUserId: user?.id || null,
          agentUserId: resolvedAgentId,
        });
      } catch (notifyErr) {
        console.warn('Notification error (non-blocking):', notifyErr);
      }

      setIsSubmitted(true);
      toast({ title: "Pedido enviado com sucesso!", description: "Será analisado em menos de 24h úteis." });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('[Submit] ❌ Terminal Error:', error);
      let message = 'Tente novamente.';

      if (error?.message === 'TIMEOUT') {
        message = 'A conexão está muito lenta. Por favor, verifique sua internet e tente clicar em enviar novamente.';
      } else if (error?.message?.includes('Failed to fetch')) {
        message = 'Erro de conexão (Supabase offline ou sem internet). Tente novamente em alguns instantes.';
      } else if (error?.message) {
        message = error.message;
      }

      toast({
        title: "Erro ao enviar",
        description: message,
        variant: "destructive",
        duration: 8000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (checkingStatus) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-[#1b5e20]" />
          <p className="text-sm text-gray-500">A verificar o seu perfil...</p>
        </div>
      </div>
    );
  }

  // Blocked state
  if (isBlocked) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-lg w-full border-0 shadow-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500" />
          <CardContent className="p-8 text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
              <Ban className="h-10 w-10 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Pedido Não Disponível</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{blockReason}</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 text-left">
              <p className="font-semibold mb-2">📋 Regras:</p>
              <ul className="space-y-1">
                <li>• Só é permitido <strong>1 pedido activo</strong> de cada vez</li>
                <li>• Se rejeitado, pode tentar novamente</li>
                <li>• Se aprovado, deve quitar a dívida antes de pedir novamente</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-lg w-full border-0 shadow-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#1b5e20] to-[#43a047]" />
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pedido Enviado!</h2>
              <p className="text-gray-500">O seu pedido será analisado em menos de <strong>24h úteis</strong>.</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 text-left">
              <p className="font-semibold mb-2">📋 Próximos Passos:</p>
              <ul className="space-y-1">
                <li>• A equipa irá analisar o seu pedido</li>
                <li>• Receberá uma chamada em até 24h</li>
                <li>• Taxa de juro: 30% por mês (pode variar)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===================== SIMPLIFIED FORM (returning client) =====================
  if (isSimplifiedForm) {
    return (
      <div className="max-w-2xl mx-auto p-3 md:p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Novo Pedido de Crédito</h1>
          <p className="text-sm text-gray-500">Os seus dados pessoais já estão registados</p>
        </div>

        {/* Saved data summary */}
        <Card className="border-0 shadow-md bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-800">Dados Pessoais Guardados</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-green-700">
              <span>👤 {form.fullName}</span>
              <span>📞 {form.phone}</span>
              <span>📍 {form.neighborhood}, {form.district}</span>
              <span>💼 {form.companyName}</span>
              <span>💰 MZN {form.monthlyIncome}</span>
            </div>
          </CardContent>
        </Card>

        {/* Credit form only */}
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[#1b5e20] to-[#43a047]" />
          <CardContent className="p-5 md:p-8 space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#1b5e20]/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-[#1b5e20]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Informações do Crédito</h2>
                <p className="text-xs text-gray-500">Preencha apenas os detalhes do novo empréstimo</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Ocupação Principal *</Label>
                <Select value={form.occupation || undefined} onValueChange={v => updateField('occupation', v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="empregado_formal">Empregado Formal</SelectItem>
                    <SelectItem value="conta_propria">Conta Própria</SelectItem>
                    <SelectItem value="informal">Informal</SelectItem>
                    <SelectItem value="aposentado">Aposentado</SelectItem>
                    <SelectItem value="estudante">Estudante</SelectItem>
                    <SelectItem value="desempregado">Desempregado</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError field="occupation" />
              </div>
              <div>
                <Label className="text-sm font-medium">Empresa / Atividade *</Label>
                <Input value={form.companyName} onChange={e => updateField('companyName', e.target.value)} placeholder="Nome da empresa ou atividade" className="mt-1.5" />
                <FieldError field="companyName" />
              </div>
              <div>
                <Label className="text-sm font-medium">Rendimento Mensal (MZN) *</Label>
                <Input type="number" value={form.monthlyIncome} onChange={e => updateField('monthlyIncome', e.target.value)} placeholder="Ex: 25000" className="mt-1.5" />
                <FieldError field="monthlyIncome" />
              </div>
              <div>
                <Label className="text-sm font-medium">Valor Solicitado (MZN) *</Label>
                <Input type="number" value={form.requestedAmount} onChange={e => updateField('requestedAmount', e.target.value)} placeholder="Ex: 50000" className="mt-1.5" />
                <FieldError field="requestedAmount" />
              </div>
              <div>
                <Label className="text-sm font-medium">Data para Receber *</Label>
                <Input type="date" value={form.receiveDate} onChange={e => updateField('receiveDate', e.target.value)} className="mt-1.5" />
                <FieldError field="receiveDate" />
              </div>
              <div>
                <Label className="text-sm font-medium">Finalidade do Crédito *</Label>
                <Select value={form.creditPurpose || undefined} onValueChange={v => updateField('creditPurpose', v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger>
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
                <FieldError field="creditPurpose" />
              </div>
              <div>
                <Label className="text-sm font-medium">Tipo de Garantia *</Label>
                <Select value={form.guaranteeType || undefined} onValueChange={v => updateField('guaranteeType', v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bem_movel">Bem Móvel</SelectItem>
                    <SelectItem value="bem_imovel">Bem Imóvel</SelectItem>
                    <SelectItem value="fiador">Fiador</SelectItem>
                    <SelectItem value="salario">Salário</SelectItem>
                    <SelectItem value="sem_garantia">Sem Garantia</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError field="guaranteeType" />
              </div>
              <div>
                <Label className="text-sm font-medium">Modo de Garantia *</Label>
                <Select value={form.guaranteeMode || undefined} onValueChange={v => updateField('guaranteeMode', v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="antecipado">Antecipado</SelectItem>
                    <SelectItem value="postecipado">Postecipado</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError field="guaranteeMode" />
              </div>
              {/* Tier Selection */}
              <div className="md:col-span-2 space-y-3">
                <Label className="font-bold text-gray-700">Opção de Crédito Disponível</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {['A', 'B', 'C'].map((opt) => {
                    const isAvailable = getAvailableOptions(Number(form.requestedAmount), 30).includes(opt as CreditOption);
                    const isSelected = form.creditOption === opt;

                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => updateField('creditOption', opt as CreditOption)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left",
                          isAvailable
                            ? isSelected
                              ? "border-[#d37c22] bg-orange-50/50 shadow-sm"
                              : "border-gray-100 hover:border-gray-200"
                            : "opacity-40 grayscale cursor-not-allowed border-dashed"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px]",
                            isSelected ? "bg-[#d37c22] text-white" : "bg-gray-100 text-gray-500"
                          )}>
                            {opt}
                          </div>
                          <div>
                            <p className="font-bold text-xs">Opção {opt}</p>
                            <p className="text-[9px] text-gray-500">
                              {opt === 'A' ? 'Geral' : opt === 'B' ? 'Empresarial' : 'Venc. Fixo'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[10px]">
                            {opt === 'B' && !form.isInstallment && Number(form.requestedAmount) <= 15 ? '20%' : '30%'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Installments */}
              {getInstallmentLimits(Number(form.requestedAmount)) > 1 && (
                <div className="md:col-span-2 pt-2 border-t space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="font-bold">Pagamento Parcelado</Label>
                      <p className="text-[10px] text-muted-foreground">Dividir em mensalidades</p>
                    </div>
                    <Switch
                      checked={form.isInstallment}
                      onCheckedChange={(v) => updateField('isInstallment', v)}
                    />
                  </div>

                  {form.isInstallment && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                      <div>
                        <Label className="text-xs font-bold">Número de Meses</Label>
                        <Select value={form.installmentMonths.toString()} onValueChange={v => updateField('installmentMonths', parseInt(v))}>
                          <SelectTrigger className="border-2 font-bold mt-1">
                            <SelectValue placeholder="Meses" />
                          </SelectTrigger>
                          <SelectContent>
                            {[...Array(getInstallmentLimits(Number(form.requestedAmount)))].map((_, i) => (
                              <SelectItem key={i + 1} value={(i + 1).toString()}>
                                {i + 1} Meses
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="text-[10px] text-amber-700 font-medium leading-tight">
                          <AlertTriangle className="h-3 w-3 inline mr-1" />
                          Os juros de 30% são recapitalizados mensalmente sobre o saldo devedor.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {form.amortizationPlan && form.amortizationPlan.length > 0 && (
              <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 p-3 border-b">
                  <h3 className="text-xs font-bold flex items-center gap-2">
                    <TableIcon className="h-4 w-4 text-[#1b5e20]" />
                    Plano de Pagamento Estimado
                  </h3>
                </div>
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow>
                      <TableHead className="h-8 text-[10px] font-bold">Nº</TableHead>
                      <TableHead className="h-8 text-[10px] font-bold">Vencimento</TableHead>
                      <TableHead className="h-8 text-[10px] font-bold text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {form.amortizationPlan.map((row: any) => (
                      <TableRow key={row.installmentNumber} className="h-10 hover:bg-gray-50 transition-colors">
                        <TableCell className="py-2 text-xs font-bold">{row.installmentNumber}</TableCell>
                        <TableCell className="py-2 text-[10px]">
                          {new Date(row.date).toLocaleDateString('pt-MZ')}
                        </TableCell>
                        <TableCell className="py-2 text-right text-xs font-black text-green-700">
                          MT {row.total.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="p-3 bg-[#1b5e20]/5 text-center">
                  <p className="text-[10px] font-bold text-[#1b5e20]">
                    Total a Pagar: MT {form.amortizationPlan.reduce((acc: number, r: any) => acc + r.total, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-sm font-medium">Fotos dos Bens de Garantia (Opcional, máx 4)</Label>
                <span className="text-xs text-gray-500">{form.guaranteePhotos.length}/4</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {form.guaranteePhotos.map((photo, idx) => (
                  <div key={idx} className="relative aspect-square border rounded-xl overflow-hidden bg-gray-50 group">
                    <img src={photo} alt={`Garantia ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGuaranteePhoto(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {form.guaranteePhotos.length < 4 && (
                  <div
                    className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#1b5e20]/40 transition-colors bg-white"
                    onClick={() => !uploadingGuarantee && document.getElementById('guarantee-photo-simple')?.click()}
                  >
                    {uploadingGuarantee ? (
                      <Loader2 className="h-6 w-6 animate-spin text-[#1b5e20]" />
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-gray-400 mb-1" />
                        <span className="text-[10px] text-gray-500 font-medium px-2">Adicionar Foto</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleGuaranteePhotoUpload(file);
                      }}
                      className="hidden"
                      id="guarantee-photo-simple"
                      disabled={uploadingGuarantee}
                    />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5">Formatos: JPG, PNG (máx. 5MB cada)</p>
            </div>

            <div>
              <Label className="text-sm font-medium">Observações (opcional)</Label>
              <Textarea value={form.observations} onChange={e => updateField('observations', e.target.value)} placeholder="Informações adicionais..." className="mt-1.5" rows={3} />
            </div>

            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <Checkbox checked={form.truthDeclaration} onCheckedChange={(v) => updateField('truthDeclaration', v === true)} className="mt-0.5" />
              <div>
                <Label className="text-sm font-medium cursor-pointer">Declaração de Veracidade *</Label>
                <p className="text-xs text-amber-700 mt-1">Declaro que todas as informações são verdadeiras. Taxas: Opção A/C (30%), Opção B (20% até dia 15, senão 30%). Parcelamentos possuem juros capitalizados mensalmente.</p>
                <FieldError field="truthDeclaration" />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button onClick={handleSubmit} disabled={isLoading} className="gap-2 text-white font-semibold px-8 shadow-lg" style={{ backgroundColor: '#d37c22' }}>
                {isLoading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>) : (<><Send className="h-4 w-4" /> Enviar Pedido</>)}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===================== FULL FORM (first-time client) =====================
  return (
    <div className="max-w-3xl mx-auto p-3 md:p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Pedido de Crédito</h1>
        <p className="text-sm text-gray-500">Preencha as informações em 4 etapas simples</p>
      </div>

      {/* Step Progress Bar */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {FULL_STEPS.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const StepIcon = step.icon;
            return (
              <div key={step.id} style={{ display: 'contents' }}>
                <div className="flex flex-col items-center z-10 relative">
                  <button onClick={() => { if (isCompleted) setCurrentStep(step.id); }}
                    className={`w-11 h-11 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${isCompleted ? 'bg-[#1b5e20] text-white shadow-md cursor-pointer hover:scale-105' : isActive ? 'bg-white border-2 border-[#1b5e20] text-[#1b5e20] shadow-lg scale-105' : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-default'}`}>
                    {isCompleted ? <CheckCircle className="h-5 w-5 md:h-6 md:w-6" /> : <StepIcon className="h-5 w-5 md:h-6 md:w-6" />}
                  </button>
                  <span className={`mt-2 text-[10px] md:text-xs font-medium text-center leading-tight ${isActive ? 'text-[#1b5e20] font-bold' : isCompleted ? 'text-[#1b5e20]' : 'text-gray-400'}`}>{step.title}</span>
                </div>
                {index < FULL_STEPS.length - 1 && (
                  <div className="flex-1 mx-1 md:mx-3 mt-[-20px]">
                    <div className="h-1 rounded-full bg-gray-200 overflow-hidden">
                      <div className="h-full bg-[#1b5e20] transition-all duration-500 rounded-full" style={{ width: isCompleted ? '100%' : '0%' }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#1b5e20] to-[#43a047]" style={{ width: `${(currentStep / 4) * 100}%`, transition: 'width 0.5s ease' }} />
        <CardContent className="p-5 md:p-8">
          <div
            style={{
              transition: 'opacity 0.18s ease, transform 0.18s ease',
              opacity: animating ? 0 : 1,
              transform: animating
                ? stepDirection === 'forward' ? 'translateX(12px)' : 'translateX(-12px)'
                : 'translateX(0)',
            }}
          >

            {/* Step 1: Dados Pessoais */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#1b5e20]/10 flex items-center justify-center"><User className="h-5 w-5 text-[#1b5e20]" /></div>
                  <div><h2 className="text-lg font-bold text-gray-900">Dados Pessoais</h2><p className="text-xs text-gray-500">Informações de identificação</p></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium">Nome Completo *</Label>
                    <Input value={form.fullName} onChange={e => updateField('fullName', e.target.value)} placeholder="Digite o nome completo" className="mt-1.5" />
                    <FieldError field="fullName" />
                  </div>
                  <div><Label className="text-sm font-medium">Data de Nascimento *</Label><Input type="date" value={form.birthDate} onChange={e => updateField('birthDate', e.target.value)} className="mt-1.5" /><FieldError field="birthDate" /></div>
                  <div><Label className="text-sm font-medium">Sexo *</Label>
                    <Select value={form.gender || undefined} onValueChange={v => updateField('gender', v)} disabled={hasExistingData}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="masculino">Masculino</SelectItem><SelectItem value="feminino">Feminino</SelectItem></SelectContent></Select><FieldError field="gender" /></div>
                  <div><Label className="text-sm font-medium">Tipo de Documento *</Label>
                    <Select value={form.documentType || undefined} onValueChange={v => updateField('documentType', v)} disabled={hasExistingData}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="bi">Bilhete de Identidade (BI)</SelectItem><SelectItem value="passaporte">Passaporte</SelectItem><SelectItem value="cedula">Cédula Pessoal</SelectItem></SelectContent></Select><FieldError field="documentType" /></div>
                  <div><Label className="text-sm font-medium">Número do Documento *</Label><Input value={form.documentNumber} onChange={e => updateField('documentNumber', e.target.value)} placeholder="Ex: 123456789BA123" className="mt-1.5" /><FieldError field="documentNumber" /></div>
                  <div><Label className="text-sm font-medium">Data de Emissão</Label><Input type="date" value={form.documentIssueDate} onChange={e => updateField('documentIssueDate', e.target.value)} className="mt-1.5" /></div>
                  <div><Label className="text-sm font-medium">Data de Validade</Label><Input type="date" value={form.documentExpiryDate} onChange={e => updateField('documentExpiryDate', e.target.value)} className="mt-1.5" /></div>
                  <div><Label className="text-sm font-medium">NUIT (opcional)</Label><Input value={form.nuit} onChange={e => updateField('nuit', e.target.value)} placeholder="Identificação fiscal" className="mt-1.5" /></div>
                  <div><Label className="text-sm font-medium">Telefone / WhatsApp *</Label><Input value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="+258 84 123 4567" className="mt-1.5" /><FieldError field="phone" /></div>
                  <div><Label className="text-sm font-medium">Email (opcional)</Label><Input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="exemplo@email.com" className="mt-1.5" /></div>
                </div>
              </div>
            )}

            {/* Step 2: Endereço */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#1b5e20]/10 flex items-center justify-center"><MapPin className="h-5 w-5 text-[#1b5e20]" /></div>
                  <div><h2 className="text-lg font-bold text-gray-900">Endereço</h2><p className="text-xs text-gray-500">Local de residência</p></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label className="text-sm font-medium">Bairro *</Label><Input value={form.neighborhood} onChange={e => updateField('neighborhood', e.target.value)} placeholder="Digite o bairro" className="mt-1.5" /><FieldError field="neighborhood" /></div>
                  <div><Label className="text-sm font-medium">Distrito *</Label><Input value={form.district} onChange={e => updateField('district', e.target.value)} placeholder="Digite o distrito" className="mt-1.5" /><FieldError field="district" /></div>
                  <div><Label className="text-sm font-medium">Província *</Label><Input value={form.province} onChange={e => updateField('province', e.target.value)} placeholder="Digite a província" className="mt-1.5" /><FieldError field="province" /></div>
                  <div><Label className="text-sm font-medium">Tipo de Residência *</Label>
                    <Select value={form.residenceType || undefined} onValueChange={v => updateField('residenceType', v)} disabled={hasExistingData}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="casa_propria">Casa Própria</SelectItem><SelectItem value="arrendada">Arrendada</SelectItem><SelectItem value="casa_familiar">Casa Familiar</SelectItem></SelectContent></Select><FieldError field="residenceType" /></div>
                </div>
              </div>
            )}

            {/* Step 3: Dados Profissionais */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#1b5e20]/10 flex items-center justify-center"><Briefcase className="h-5 w-5 text-[#1b5e20]" /></div>
                  <div><h2 className="text-lg font-bold text-gray-900">Dados Profissionais</h2><p className="text-xs text-gray-500">Fonte de renda e atividade</p></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label className="text-sm font-medium">Ocupação Principal *</Label>
                    <Select value={form.occupation || undefined} onValueChange={v => updateField('occupation', v)}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="empregado_formal">Empregado Formal</SelectItem><SelectItem value="conta_propria">Conta Própria</SelectItem><SelectItem value="informal">Informal</SelectItem><SelectItem value="aposentado">Aposentado</SelectItem><SelectItem value="estudante">Estudante</SelectItem><SelectItem value="desempregado">Desempregado</SelectItem></SelectContent></Select><FieldError field="occupation" /></div>
                  <div><Label className="text-sm font-medium">Empresa / Atividade *</Label><Input value={form.companyName} onChange={e => updateField('companyName', e.target.value)} placeholder="Nome da empresa ou atividade" className="mt-1.5" /><FieldError field="companyName" /></div>
                  <div><Label className="text-sm font-medium">Tempo de Trabalho *</Label><Input value={form.workDuration} onChange={e => updateField('workDuration', e.target.value)} placeholder="Ex: 2 anos e 6 meses" className="mt-1.5" /><FieldError field="workDuration" /></div>
                  <div><Label className="text-sm font-medium">Rendimento Mensal (MZN) *</Label><Input type="number" inputMode="numeric" pattern="[0-9]*" value={form.monthlyIncome} onChange={e => updateField('monthlyIncome', e.target.value)} placeholder="Ex: 25000" className="mt-1.5" /><FieldError field="monthlyIncome" /></div>
                </div>
              </div>
            )}

            {/* Step 4: Crédito */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#1b5e20]/10 flex items-center justify-center"><CreditCard className="h-5 w-5 text-[#1b5e20]" /></div>
                  <div><h2 className="text-lg font-bold text-gray-900">Informações do Crédito</h2><p className="text-xs text-gray-500">Detalhes do empréstimo</p></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label className="text-sm font-medium">Valor Solicitado (MZN) *</Label><Input type="number" inputMode="numeric" pattern="[0-9]*" value={form.requestedAmount} onChange={e => updateField('requestedAmount', e.target.value)} placeholder="Ex: 50000" className="mt-1.5" /><FieldError field="requestedAmount" /></div>
                  <div><Label className="text-sm font-medium">Data para Receber *</Label><Input type="date" value={form.receiveDate} onChange={e => updateField('receiveDate', e.target.value)} className="mt-1.5" /><FieldError field="receiveDate" /></div>
                  <div><Label className="text-sm font-medium">Finalidade do Crédito *</Label>
                    <Select value={form.creditPurpose || undefined} onValueChange={v => updateField('creditPurpose', v)}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="negocio">Negócio</SelectItem><SelectItem value="consumo">Consumo</SelectItem><SelectItem value="saude">Saúde</SelectItem><SelectItem value="educacao">Educação</SelectItem><SelectItem value="emergencia">Emergência</SelectItem><SelectItem value="construcao">Construção/Reforma</SelectItem><SelectItem value="outros">Outros</SelectItem></SelectContent></Select><FieldError field="creditPurpose" /></div>
                  <div><Label className="text-sm font-medium">Tipo de Garantia *</Label>
                    <Select value={form.guaranteeType || undefined} onValueChange={v => updateField('guaranteeType', v)}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="bem_movel">Bem Móvel</SelectItem><SelectItem value="bem_imovel">Bem Imóvel</SelectItem><SelectItem value="fiador">Fiador</SelectItem><SelectItem value="salario">Salário</SelectItem><SelectItem value="sem_garantia">Sem Garantia</SelectItem></SelectContent></Select><FieldError field="guaranteeType" /></div>
                  <div><Label className="text-sm font-medium">Modo de Garantia *</Label>
                    <Select value={form.guaranteeMode || undefined} onValueChange={v => updateField('guaranteeMode', v)}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="antecipado">Antecipado</SelectItem><SelectItem value="postecipado">Postecipado</SelectItem></SelectContent></Select><FieldError field="guaranteeMode" /></div>
                  {/* Auto-selected Tier Display */}
                  <div className="md:col-span-2 p-4 rounded-xl bg-green-50/50 border-2 border-dashed border-green-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold text-[#1b5e20] text-xs uppercase tracking-wider">Plano de Crédito Determinado</Label>
                      <Badge className="bg-[#1b5e20] text-white">Opção {form.creditOption}</Badge>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                      {form.creditOption === 'A' && "Crédito Geral: Aplicável para valores até 4.000 MT com juros de 30%."}
                      {form.creditOption === 'B' && "Plano Express: Juros de 20% para prazos curtos (até 15 dias)."}
                      {form.creditOption === 'C' && "Vencimento Fixo: Plano padrão para montantes 5.000+ MT com juros de 30%."}
                    </p>
                    {form.creditOption === 'B' && (
                      <div className="bg-amber-50 p-2 rounded-lg border border-amber-100 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                        <p className="text-[10px] text-amber-700 leading-tight">
                          <strong>Nota:</strong> Se o pagamento não for realizado em 15 dias, a taxa é ajustada automaticamente para 30%.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Installments */}
                  {getInstallmentLimits(Number(form.requestedAmount)) > 1 && (
                    <div className="md:col-span-2 pt-2 border-t space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="font-bold">Pagamento Parcelado</Label>
                          <p className="text-[10px] text-muted-foreground">
                            {form.creditOption === 'A' ? 'Dividir em prestações semanais' : 'Dividir em prestações mensais'}
                          </p>
                        </div>
                        <Switch
                          checked={form.isInstallment}
                          onCheckedChange={(v) => updateField('isInstallment', v)}
                        />
                      </div>

                      {form.isInstallment && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                          <div>
                            <Label className="text-xs font-bold">Número de {form.creditOption === 'A' ? 'Semanas' : 'Meses'}</Label>
                            <Select value={(form.installmentMonths || 1).toString()} onValueChange={v => updateField('installmentMonths', parseInt(v))}>
                              <SelectTrigger className="border-2 font-bold mt-1">
                                <SelectValue placeholder={form.creditOption === 'A' ? 'Semanas' : 'Meses'} />
                              </SelectTrigger>
                              <SelectContent>
                                {[...Array(getInstallmentLimits(Number(form.requestedAmount)))].map((_, i) => (
                                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                                    {i + 1} {form.creditOption === 'A' ? (i === 0 ? 'Semana' : 'Semanas') : (i === 0 ? 'Mês' : 'Meses')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                            <p className="text-[10px] text-amber-700 font-medium leading-tight">
                              <AlertTriangle className="h-3 w-3 inline mr-1" />
                              {form.creditOption === 'A'
                                ? "A Opção A oferece flexibilidade semanal para pagamentos dentro do prazo de 30 dias."
                                : "Os juros de 30% são recapitalizados mensalmente sobre o saldo devedor."}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {form.amortizationPlan && form.amortizationPlan.length > 0 && (
                  <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-gray-50 p-3 border-b">
                      <h3 className="text-xs font-bold flex items-center gap-2">
                        <TableIcon className="h-4 w-4 text-[#1b5e20]" />
                        Plano de Pagamento Estimado
                      </h3>
                    </div>
                    <Table>
                      <TableHeader className="bg-gray-50/50">
                        <TableRow>
                          <TableHead className="h-8 text-[10px] font-bold">Nº</TableHead>
                          <TableHead className="h-8 text-[10px] font-bold">
                            {form.creditOption === 'A' ? 'Venc. Semana' : 'Venc. Mês'}
                          </TableHead>
                          <TableHead className="h-8 text-[10px] font-bold text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {form.amortizationPlan && Array.isArray(form.amortizationPlan) && form.amortizationPlan.map((row: any, idx: number) => (
                          <TableRow key={row.installmentNumber || idx} className="h-10 hover:bg-gray-50 transition-colors">
                            <TableCell className="py-2 text-xs font-bold">{row.installmentNumber || idx + 1}</TableCell>
                            <TableCell className="py-2 text-[10px]">
                              {row.date ? new Date(row.date).toLocaleDateString('pt-MZ') : '---'}
                            </TableCell>
                            <TableCell className="py-2 text-right text-xs font-black text-green-700">
                              MT {(row.total || 0).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="p-3 bg-[#1b5e20]/5 text-center">
                      <p className="text-[10px] font-bold text-[#1b5e20]">
                        Total a Pagar: MT {(form.amortizationPlan && Array.isArray(form.amortizationPlan)
                          ? form.amortizationPlan.reduce((acc: number, r: any) => acc + (Number(r.total) || 0), 0)
                          : 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                <div><Label className="text-sm font-medium">Observações (opcional)</Label><Textarea value={form.observations} onChange={e => updateField('observations', e.target.value)} placeholder="Informações adicionais..." className="mt-1.5" rows={3} /></div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-medium">Fotos dos Bens de Garantia (Opcional, máx 4)</Label>
                    <span className="text-xs text-gray-500">{form.guaranteePhotos.length}/4</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {form.guaranteePhotos.map((photo, idx) => (
                      <div key={idx} className="relative aspect-square border rounded-xl overflow-hidden bg-gray-50 group">
                        <img src={photo} alt={`Garantia ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeGuaranteePhoto(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {form.guaranteePhotos.length < 4 && (
                      <div
                        className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#1b5e20]/40 transition-colors bg-white"
                        onClick={() => !uploadingGuarantee && document.getElementById('guarantee-photo-full')?.click()}
                      >
                        {uploadingGuarantee ? (
                          <Loader2 className="h-6 w-6 animate-spin text-[#1b5e20]" />
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-gray-400 mb-1" />
                            <span className="text-[10px] text-gray-500 font-medium px-2">Adicionar Foto</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleGuaranteePhotoUpload(file);
                          }}
                          className="hidden"
                          id="guarantee-photo-full"
                          disabled={uploadingGuarantee}
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">Formatos: JPG, PNG (máx. 5MB cada)</p>
                </div>

                {/* Doc Upload */}
                <div>
                  <Label className="text-sm font-medium">Documento de Identidade (Frente e Verso) *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <div
                      className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer hover:border-[#1b5e20]/40 ${form.docFrontUrl ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}
                      onClick={() => !uploadingFront && document.getElementById('doc-front')?.click()}
                    >
                      {uploadingFront ? (
                        <Loader2 className="h-6 w-6 mx-auto mb-1.5 animate-spin text-[#1b5e20]" />
                      ) : (
                        <Upload className={`h-6 w-6 mx-auto mb-1.5 ${form.docFrontUrl ? 'text-green-600' : 'text-gray-400'}`} />
                      )}
                      <p className="text-xs font-medium text-gray-700">📋 Frente do BI</p>
                      {form.docFrontUrl ? (
                        <div className="mt-1.5 flex items-center justify-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                          <span className="text-xs text-green-700 truncate max-w-[150px]">Enviado</span>
                          <button onClick={e => { e.stopPropagation(); updateField('docFrontUrl', ''); }} className="ml-1 text-gray-400 hover:text-red-500">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-400 mt-1">{uploadingFront ? 'A enviar...' : 'Clique para selecionar ou tirar foto'}</p>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleDocFrontUpload(file);
                        }}
                        className="hidden"
                        id="doc-front"
                        disabled={uploadingFront}
                      />
                    </div>

                    <div
                      className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer hover:border-[#1b5e20]/40 ${form.docBackUrl ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}
                      onClick={() => !uploadingBack && document.getElementById('doc-back')?.click()}
                    >
                      {uploadingBack ? (
                        <Loader2 className="h-6 w-6 mx-auto mb-1.5 animate-spin text-[#1b5e20]" />
                      ) : (
                        <Upload className={`h-6 w-6 mx-auto mb-1.5 ${form.docBackUrl ? 'text-green-600' : 'text-gray-400'}`} />
                      )}
                      <p className="text-xs font-medium text-gray-700">📋 Verso do BI</p>
                      {form.docBackUrl ? (
                        <div className="mt-1.5 flex items-center justify-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                          <span className="text-xs text-green-700 truncate max-w-[150px]">Enviado</span>
                          <button onClick={e => { e.stopPropagation(); updateField('docBackUrl', ''); }} className="ml-1 text-gray-400 hover:text-red-500">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-400 mt-1">{uploadingBack ? 'A enviar...' : 'Clique para selecionar ou tirar foto'}</p>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleDocBackUpload(file);
                        }}
                        className="hidden"
                        id="doc-back"
                        disabled={uploadingBack}
                      />
                    </div>
                  </div>
                  <FieldError field="docFront" />
                  <FieldError field="docBack" />
                  <p className="text-[10px] text-gray-400 mt-1.5">Formatos: JPG, PNG, PDF (máx. 5MB)</p>
                </div>

                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <Checkbox checked={form.truthDeclaration} onCheckedChange={(v) => updateField('truthDeclaration', v === true)} className="mt-0.5" />
                  <div><Label className="text-sm font-medium cursor-pointer">Declaração de Veracidade *</Label><p className="text-xs text-amber-700 mt-1">Declaro que todas as informações são verdadeiras. Taxas: Opção A/C (30%), Opção B (20% até dia 15, senão 30%). Parcelamentos possuem juros capitalizados mensalmente.</p><FieldError field="truthDeclaration" /></div>
                </div>
              </div>
            )}

            {/* Nav */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              {currentStep > 1 ? (<Button type="button" variant="outline" onClick={prevStep} className="gap-2"><ChevronLeft className="h-4 w-4" />Anterior</Button>) : <div />}
              {currentStep < 4 ? (
                <Button type="button" onClick={nextStep} className="gap-2 text-white font-semibold px-6" style={{ backgroundColor: '#1b5e20' }}> Próximo<ChevronRight className="h-4 w-4" /></Button>
              ) : (
                <Button type="button" onClick={handleSubmit} disabled={isLoading} className="gap-2 text-white font-semibold px-8 shadow-lg" style={{ backgroundColor: '#d37c22' }}>
                  {isLoading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>) : (<><Send className="h-4 w-4" /> Enviar Pedido</>)}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <p className="text-center text-xs text-gray-400">Etapa {currentStep} de 4</p>
    </div>
  );
};

export default CreditApplicationForm;