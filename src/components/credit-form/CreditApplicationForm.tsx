import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import {
  CheckCircle, Send, User, MapPin, Briefcase, CreditCard,
  ChevronRight, ChevronLeft, Upload, X, Loader2, AlertTriangle, Clock, Ban, DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { notifyEvent } from '@/utils/notifyEvent';

interface CreditApplicationFormProps {
  isPublicAccess?: boolean;
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

const CreditApplicationForm = ({ isPublicAccess = false }: CreditApplicationFormProps) => {
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
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bochel_credit_form_data');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Error parsing form data:", e);
          localStorage.removeItem('bochel_credit_form_data');
        }
      }
    }
    return initialFormState;
  });

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

      // 1. Block if pending request
      if (pendingRes.data && pendingRes.data.length > 0) {
        setIsBlocked(true);
        setBlockReason('Já tem um pedido de crédito pendente em análise. Aguarde a decisão antes de fazer um novo pedido.');
        setCheckingStatus(false);
        return;
      }

      const clientId: string | null = clientRes.data?.[0]?.id ?? null;

      // 2. Block if approved request with unpaid loan
      if (approvedRes.data && approvedRes.data.length > 0) {
        let loanFullyPaid = false;
        if (clientId) {
          const { data: paidLoans } = await supabase
            .from('loans').select('id').eq('client_id', clientId).in('status', ['paid', 'completed']).limit(1);
          loanFullyPaid = !!(paidLoans && paidLoans.length > 0);
        }
        if (!loanFullyPaid) {
          setIsBlocked(true);
          setBlockReason('Ja tem um credito aprovado. Deve quitar a divida antes de solicitar novo credito.');
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

      const { data: uploadData, error } = await supabase.storage.from('chat-files').upload(path, compressed, {
        contentType: compressed.type || 'image/jpeg',
        upsert: true,
        cacheControl: '3600'
      });
      if (error) {
        console.warn(`Upload ${side} failed:`, error.message, error);

        let errorMsg = "Não foi possível enviar a foto.";
        if (error.message.includes('Payload too large') || (compressed.size > 5 * 1024 * 1024)) {
          errorMsg = "A foto é demasiado grande (>5MB). Tente tirar outra foto ou reduzir o tamanho.";
        } else if (error.message.includes('storage/quota-exceeded')) {
          errorMsg = "Limite de armazenamento atingido.";
        } else if (error.message === 'Failed to fetch') {
          errorMsg = "Erro de conexão ou certificado SSL no telemóvel. Tente usar Chrome ou Safari.";
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

      // Try to create/update client record (non-blocking)
      if (user) {
        try {
          const { data: existingClient } = await supabase
            .from('clients').select('id').eq('user_id', user.id).maybeSingle();
          if (!existingClient) {
            await supabase.from('clients').insert({
              user_id: user.id, name: form.fullName,
              email: form.email || user.email, phone: form.phone,
              address, id_number: form.documentNumber, status: 'active',
            });
          }
        } catch { }
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
        user_id: user?.id || null,
        agent_id: user?.role === 'agente' ? user.id : null,
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
        doc_front_url: form.docFrontUrl,
        doc_back_url: form.docBackUrl,
        guarantee_photos: form.guaranteePhotos,
      };

      // Try up to 2 times
      let lastError: any = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const { error } = await supabase.from('credit_requests').insert(requestData);
          if (error) throw error;
          lastError = null;
          break;
        } catch (err) {
          lastError = err;
          if (attempt === 0) {
            // Wait 1s before retry
            await new Promise(r => setTimeout(r, 1000));
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
        });
      } catch (notifyErr) {
        console.warn('Notification error (non-blocking):', notifyErr);
      }

      setIsSubmitted(true);
      toast({ title: "Pedido enviado com sucesso!", description: "Será analisado em menos de 24h úteis." });
    } catch (error: any) {
      const message = error?.message?.includes('Failed to fetch')
        ? 'Erro de conexão. Verifique a internet e tente novamente.'
        : error?.message || 'Tente novamente.';
      toast({ title: "Erro ao enviar", description: message, variant: "destructive" });
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
                <Label className="text-sm font-medium">Prazo de Pagamento</Label>
                <div className="mt-1.5 bg-gray-50 border rounded-md px-3 py-2.5 text-sm text-gray-700 font-medium">30 dias (1 mês)</div>
                <p className="text-[10px] text-gray-400 mt-1">Prazo fixo</p>
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
            </div>

            {Number(form.requestedAmount) > 0 && (
              <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4">
                <h3 className="text-[#166534] font-semibold text-sm mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Resumo do Empréstimo Esperado
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><p className="text-[#166534]/70">Capital</p><p className="font-bold text-[#166534]">MZN {(Number(form.requestedAmount) || 0).toLocaleString()}</p></div>
                  <div><p className="text-[#166534]/70">Juros (30%)</p><p className="font-bold text-[#166534]">MZN {((Number(form.requestedAmount) || 0) * 0.3).toLocaleString()}</p></div>
                  <div><p className="text-[#166534]/70">Prazo</p><p className="font-bold text-[#166534]">30 Dias</p></div>
                  <div><p className="text-[#166534]/70">Total a Pagar</p><p className="font-black text-[#166534]">MZN {((Number(form.requestedAmount) || 0) * 1.3).toLocaleString()}</p></div>
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
                <p className="text-xs text-amber-700 mt-1">Declaro que todas as informações são verdadeiras. Taxa de juro: 30% por mês (pode variar conforme o valor).</p>
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
                  <div>
                    <Label className="text-sm font-medium">Prazo de Pagamento</Label>
                    <div className="mt-1.5 bg-gray-50 border rounded-md px-3 py-2.5 text-sm text-gray-700 font-medium">30 dias (1 mês)</div>
                    <p className="text-[10px] text-gray-400 mt-1">Prazo fixo</p>
                  </div>
                  <div><Label className="text-sm font-medium">Tipo de Garantia *</Label>
                    <Select value={form.guaranteeType || undefined} onValueChange={v => updateField('guaranteeType', v)}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="bem_movel">Bem Móvel</SelectItem><SelectItem value="bem_imovel">Bem Imóvel</SelectItem><SelectItem value="fiador">Fiador</SelectItem><SelectItem value="salario">Salário</SelectItem><SelectItem value="sem_garantia">Sem Garantia</SelectItem></SelectContent></Select><FieldError field="guaranteeType" /></div>
                  <div><Label className="text-sm font-medium">Modo de Garantia *</Label>
                    <Select value={form.guaranteeMode || undefined} onValueChange={v => updateField('guaranteeMode', v)}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="antecipado">Antecipado</SelectItem><SelectItem value="postecipado">Postecipado</SelectItem></SelectContent></Select><FieldError field="guaranteeMode" /></div>
                </div>

                {Number(form.requestedAmount) > 0 && (
                  <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4">
                    <h3 className="text-[#166534] font-semibold text-sm mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" /> Resumo do Empréstimo Esperado
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div><p className="text-[#166534]/70">Capital</p><p className="font-bold text-[#166534]">MZN {(Number(form.requestedAmount) || 0).toLocaleString()}</p></div>
                      <div><p className="text-[#166534]/70">Juros (30%)</p><p className="font-bold text-[#166534]">MZN {((Number(form.requestedAmount) || 0) * 0.3).toLocaleString()}</p></div>
                      <div><p className="text-[#166534]/70">Prazo</p><p className="font-bold text-[#166534]">30 Dias</p></div>
                      <div><p className="text-[#166534]/70">Total a Pagar</p><p className="font-black text-[#166534]">MZN {((Number(form.requestedAmount) || 0) * 1.3).toLocaleString()}</p></div>
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
                  <div><Label className="text-sm font-medium cursor-pointer">Declaração de Veracidade *</Label><p className="text-xs text-amber-700 mt-1">Declaro que todas as informações são verdadeiras. Taxa de juro: 30% por mês (pode variar).</p><FieldError field="truthDeclaration" /></div>
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