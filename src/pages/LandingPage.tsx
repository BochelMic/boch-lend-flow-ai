import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calculator,
  ShieldCheck,
  Zap,
  Clock,
  ChevronRight,
  Menu,
  X,
  CheckCircle2,
  ChevronDown,
  Star,
  ArrowRight,
  Terminal,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import AboutSection from '@/components/landing/AboutSection';
import ProductsSection from '@/components/landing/ProductsSection';
import CreditSimulatorModule from '@/components/credit-simulator/CreditSimulatorModule';

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [logoClicks, setLogoClicks] = useState(0);

  const handleLogoClick = () => {
    if (logoClicks + 1 >= 6) {
      setLogoClicks(0);
      sessionStorage.setItem('secretAccess', 'internal');
      navigate('/gestor');
    } else {
      setLogoClicks(prev => prev + 1);
    }
  };

  // Simulator State (Removed hardcoded logic in favor of Module)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const primaryColor = '#0b3a20'; // BOCHEL Dark Green
  const secondaryColor = '#d37c22'; // BOCHEL Orange/Gold
  const accentColor = '#bd4c37'; // BOCHEL Red/Orange

  const faqs = [
    {
      question: "Quais são os requisitos para solicitar um crédito?",
      answer: "Para solicitar um crédito na Bochel, precisa de ser maior de idade, ter um documento de identificação válido (BI ou Passaporte), um comprovativo de rendimentos recente e um comprovativo de residência."
    },
    {
      question: "Quanto tempo demora até receber o dinheiro?",
      answer: "Após a aprovação do seu crédito e assinatura do contrato digital, a transferência é realizada no próprio dia útil ou no máximo em 24 horas."
    },
    {
      question: "Posso amortizar o meu crédito antes do tempo?",
      answer: "Sim! Na Bochel incentivamos a saúde financeira. Pode amortizar total ou parcialmente o seu crédito a qualquer momento, ajustando os juros em conformidade com as nossas políticas transparentes."
    },
    {
      question: "É seguro enviar a minha documentação online?",
      answer: "Absolutamente. Utilizamos protocolos de encriptação militar (SSL/TLS) para garantir que todos os seus dados e documentos são transmitidos e armazenados com 100% de segurança e confidencialidade."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-[#0b3a20] selection:text-white pb-0">

      {/* Navigation Bar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={handleLogoClick}>
              {scrolled ? (
                <div className="logo-animated logo-glow">
                  <img src="/logo-bochel.png?v=3" alt="Bochel Microcrédito" className="h-[4.5rem] md:h-14 object-contain" />
                </div>
              ) : (
                <div className="logo-animated bg-white/90 backdrop-blur-sm p-1.5 rounded-lg border border-white/20">
                  <img src="/logo-bochel.png?v=3" alt="Bochel Microcrédito" className="h-14 md:h-12 object-contain" />
                </div>
              )}
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#vantagens" className={`text-sm font-bold hover:text-[${secondaryColor}] transition-colors ${scrolled ? 'text-gray-700' : 'text-gray-100 shadow-sm'}`}>Vantagens</a>
              <a href="#como-funciona" className={`text-sm font-bold hover:text-[${secondaryColor}] transition-colors ${scrolled ? 'text-gray-700' : 'text-gray-100 shadow-sm'}`}>Como Funciona</a>
              <a href="#simulador" className={`text-sm font-bold hover:text-[${secondaryColor}] transition-colors ${scrolled ? 'text-gray-700' : 'text-gray-100 shadow-sm'}`}>Simulador</a>
              <a href="#sobre" className={`text-sm font-bold hover:text-[${secondaryColor}] transition-colors ${scrolled ? 'text-gray-700' : 'text-gray-100 shadow-sm'}`}>Sobre Nós</a>
              <a href="#faq" className={`text-sm font-bold hover:text-[${secondaryColor}] transition-colors ${scrolled ? 'text-gray-700' : 'text-gray-100 shadow-sm'}`}>FAQ</a>

              <div className="flex items-center space-x-4 pl-4 border-l border-gray-300">
                <Button
                  variant="ghost"
                  className={`font-bold ${scrolled ? 'text-gray-800 hover:bg-gray-100' : 'text-white hover:bg-white/20'}`}
                  onClick={() => navigate('/login')}
                >
                  Entrar
                </Button>
                <Button
                  className="font-bold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  style={{ backgroundColor: secondaryColor }}
                  onClick={() => navigate('/register')}
                >
                  Criar Conta
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 rounded-md ${scrolled ? 'text-gray-800' : 'text-white'}`}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white absolute top-full left-0 w-full shadow-xl border-t border-gray-100 py-4 flex flex-col px-6 space-y-4">
            <a href="#vantagens" onClick={() => setMobileMenuOpen(false)} className="text-gray-800 font-bold text-lg py-2 border-b border-gray-100">Vantagens</a>
            <a href="#como-funciona" onClick={() => setMobileMenuOpen(false)} className="text-gray-800 font-bold text-lg py-2 border-b border-gray-100">Como Funciona</a>
            <a href="#simulador" onClick={() => setMobileMenuOpen(false)} className="text-gray-800 font-bold text-lg py-2 border-b border-gray-100">Simulador de Crédito</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-gray-800 font-bold text-lg py-2 border-b border-gray-100">FAQ</a>
            <div className="pt-4 flex flex-col space-y-3">
              <Button variant="outline" className="w-full justify-center font-bold text-lg h-12 border-gray-300" onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}>Entrar / Login</Button>
              <Button className="w-full justify-center font-bold text-lg h-12 !text-white" style={{ backgroundColor: secondaryColor }} onClick={() => { setMobileMenuOpen(false); navigate('/register'); }}>Criar Conta e Solicitar</Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-bg-metical.png"
            alt="Fundo Notas e Moedas de Metical"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b3a20]/95 via-[#0b3a20]/80 to-[#0b3a20]/40 mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <span className="flex h-2 w-2 rounded-full" style={{ backgroundColor: secondaryColor }}></span>
              <span className="text-xs font-bold tracking-wider text-white uppercase">Mais que um empréstimo</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
              A Força do Seu <br />
              <span style={{ color: secondaryColor }}>Projeto.</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-lg leading-relaxed font-light">
              Soluções financeiras à sua medida. Mais simples, 100% digital, rápido e sem complicações desnecessárias.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => document.getElementById('simulador')?.scrollIntoView({ behavior: 'smooth' })}
                className="h-14 px-8 text-lg font-bold text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all rounded-xl"
                style={{ backgroundColor: secondaryColor }}
              >
                Simular Crédito Agora
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                className="h-14 px-8 text-lg font-bold bg-white/10 backdrop-blur-md text-white border-white/30 hover:bg-white/20 transition-all rounded-xl"
                onClick={() => document.getElementById('vantagens')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Conhecer Vantagens
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vantagens Section */}
      <section id="vantagens" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: secondaryColor }}>Porquê Escolher-nos</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">A experiência financeira que o seu negócio merece</h3>
            <p className="text-lg text-gray-600">A Bochel remove a burocracia tradicional para lhe entregar o crédito que precisa num tempo recorde.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-shadow border border-gray-100 group"
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                <Zap size={28} strokeWidth={2} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3 block">Aprovação Rápida</h4>
              <p className="text-gray-600 leading-relaxed font-medium">O nosso sistema inteligente analisa o seu pedido em instantes, garantindo uma resposta célere à sua solicitação.</p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-shadow border border-gray-100 group"
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${secondaryColor}15`, color: secondaryColor }}>
                <Clock size={28} strokeWidth={2} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3 block">100% Digital</h4>
              <p className="text-gray-600 leading-relaxed font-medium">Faça tudo através do seu telemóvel ou computador. Sem filas, sem papeladas infindáveis e sem sair de casa.</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-shadow border border-gray-100 group"
            >
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                <ShieldCheck size={28} strokeWidth={2} />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3 block">Total Confiança</h4>
              <p className="text-gray-600 leading-relaxed font-medium">A proteção e privacidade dos seus dados é a nossa prioridade. Operamos com máxima transparência fiscal, sem custos ocultos.</p>
            </motion.div>
          </div>
        </div>
      </section>

      <ProductsSection />

      {/* Como Funciona Section */}
      < section id="como-funciona" className="py-24 bg-gray-50 border-y border-gray-100" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: primaryColor }}>Simples e Direto</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Como funciona o nosso crédito?</h3>
            <p className="text-lg text-gray-600">Em apenas quatro passos simples o dinheiro que precisa estará na sua conta.</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            {/* Lines connecting steps */}
            <div className="hidden md:block absolute top-[60px] left-[12%] right-[12%] h-0.5 border-t-2 border-dashed border-gray-300 z-0"></div>

            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-lg mb-6" style={{ backgroundColor: primaryColor }}>
                1
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Simulação</h4>
              <p className="text-gray-600 font-medium px-2">Utilize o nosso simulador para escolher o montante e os prazos que melhor se adaptam a si.</p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-lg mb-6" style={{ backgroundColor: secondaryColor }}>
                2
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Solicite Crédito</h4>
              <p className="text-gray-600 font-medium px-2">Crie a sua conta, preencha o formulário e faça upload dos seus documentos.</p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-lg mb-6" style={{ backgroundColor: '#0b3a20' }}>
                3
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2 mt-[-5px]">Assinar Contrato<br />(Após Aprovação)</h4>
              <p className="text-gray-600 font-medium px-2 mt-2">Leia atentamente e assine digitalmente o seu contrato após análise da nossa equipa.</p>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-lg mb-6" style={{ backgroundColor: accentColor }}>
                4
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Receba o Dinheiro</h4>
              <p className="text-gray-600 font-medium px-2">Após a assinatura digital, enviamos o dinheiro para a sua conta bancária ou carteira móvel imediatamente.</p>
            </motion.div>
          </div>
          <div className="mt-16 text-center">
            <Button
              onClick={() => document.getElementById('simulador')?.scrollIntoView({ behavior: 'smooth' })}
              className="h-12 px-8 text-base font-bold text-white shadow-md hover:-translate-y-0.5 transition-all rounded-lg"
              style={{ backgroundColor: primaryColor }}
            >
              Começar Agora <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div >
      </section >

      {/* Simulador Section */}
      < section id="simulador" className="py-12 md:py-24 bg-white relative overflow-hidden" >
        {/* Background decorative elements */}
        < div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-gray-100 rounded-full blur-3xl opacity-50" ></div >
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[500px] h-[500px] rounded-full blur-3xl opacity-20" style={{ backgroundColor: `${secondaryColor}40` }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-[1fr_4fr] gap-6 lg:gap-8 items-center">

            <div className="order-2 lg:order-1">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">Simule o seu crédito instantaneamente.</h2>
              <p className="text-sm md:text-base text-gray-600 mb-6 font-medium">
                Descubra as condições ideais para o seu projeto. Ajuste o montante e o prazo à sua medida.
              </p>
              <ul className="space-y-2 mb-8 hidden sm:block">
                <li className="flex items-center text-gray-700 text-sm">
                  <CheckCircle2 className="mr-2 w-4 h-4 shrink-0" style={{ color: secondaryColor }} />
                  <span className="font-bold">Taxas 20% (Opção B)</span>
                </li>
                <li className="flex items-center text-gray-700 text-sm">
                  <CheckCircle2 className="mr-2 w-4 h-4 shrink-0" style={{ color: secondaryColor }} />
                  <span className="font-bold">Até 6 parcelas</span>
                </li>
              </ul>
            </div>

            {/* Calculadora Box */}
            <div className="order-1 lg:order-2 w-full lg:-mr-6 xl:-mr-12">
              <CreditSimulatorModule
                className="max-w-full p-0 shadow-none border-0"
                onApply={(simData) => navigate('/register', { state: simData })}
              />
            </div>
          </div>
        </div>
      </section >

      {/* Testemunhos (Testimonials) Section */}
      < section className="py-24 bg-gray-50 border-t border-gray-100" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: secondaryColor }}>Feedback</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">O que dizem os nossos clientes</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex text-yellow-400 mb-4">
                <Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} />
              </div>
              <p className="text-gray-600 font-medium italic mb-6">"Solicitei um crédito para expandir o meu negócio e o processo foi extremamente rápido. Em 24h já tinha o dinheiro."</p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 mr-3">JM</div>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">João Muchanga</h5>
                  <p className="text-xs text-gray-500 font-semibold">Empreendedor</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex text-yellow-400 mb-4">
                <Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} />
              </div>
              <p className="text-gray-600 font-medium italic mb-6">"Fiquei surpresa com o atendimento 100% digital. Todo o processo fluiu de forma transparente, sem letras pequenas."</p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 mr-3">LM</div>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">Lúcia Macamo</h5>
                  <p className="text-xs text-gray-500 font-semibold">Comerciante</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex text-yellow-400 mb-4">
                <Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} /><Star fill="currentColor" size={20} />
              </div>
              <p className="text-gray-600 font-medium italic mb-6">"As condições de pagamento adaptam-se perfeitalmente à minha realidade financeira. Recomendo os serviços da Bochel."</p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 mr-3">PM</div>
                <div>
                  <h5 className="font-bold text-gray-900 text-sm">Pedro Matsinhe</h5>
                  <p className="text-xs text-gray-500 font-semibold">Professor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* Sobre Nós Section */}
      < AboutSection />

      {/* FAQ Section */}
      < section id="faq" className="py-24 bg-white" >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: primaryColor }}>Dúvidas frequentes</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900">Perguntas Frequentes (FAQ)</h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors">
                <button
                  className="w-full text-left px-6 py-5 flex justify-between items-center bg-gray-50 focus:outline-none"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-bold text-gray-900 text-lg">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 py-5 bg-white border-t border-gray-100">
                    <p className="text-gray-600 font-medium leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* Footer */}
      < footer className="bg-[#082a17] text-white py-16 border-t border-[#0b3a20]" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-10 pb-10 border-b border-[#0f4a29]">
            <div className="col-span-2">
              <div className="flex items-center mb-6">
                <div className="bg-white/90 p-1.5 rounded-lg mr-4">
                  <img src="/logo-bochel.png?v=3" alt="Bochel Microcrédito" className="h-10 object-contain" />
                </div>
              </div>
              <p className="text-gray-300 text-sm font-medium leading-relaxed max-w-sm">"Mais que um empréstimo. É a força do seu projeto." A Bochel Microcrédito, EI é a sua parceira financeira confiável, oferecendo soluções de crédito rápidas, seguras e 100% digitais.</p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-5" style={{ color: secondaryColor }}>Acesso Rápido</h4>
              <ul className="space-y-3 text-sm font-medium text-gray-300">
                <li><a href="#vantagens" className="hover:text-white transition-colors">Vantagens</a></li>
                <li><a href="#como-funciona" className="hover:text-white transition-colors">Como Funciona</a></li>
                <li><a href="#simulador" className="hover:text-white transition-colors">Simulador</a></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Login / Entrar</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-5" style={{ color: secondaryColor }}>Contactos</h4>
              <ul className="space-y-3 text-sm font-medium text-gray-300">
                <li>Moçambique, Maputo - Malhampsene (N4)</li>
                <li>bm@bochelmicrocredito.com</li>
                <li>+258 86 188 7302</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center text-center font-medium text-sm text-gray-400 mt-4 pt-4 border-t border-[#0f4a29]">
            <div className="mb-4 md:mb-0 flex flex-col md:items-start text-left">
              <span>&copy; {new Date().getFullYear()} Bochel Microcrédito, EI. Todos os direitos reservados.</span>
              <span className="mt-1 text-xs text-gray-500">
                Desenvolvido por <a href="https://www.lgtecserv.com" target="_blank" rel="noopener noreferrer" className="text-[#d37c22] hover:text-white transition-colors">LG TecServ</a>
              </span>
            </div>
            <div className="flex space-x-6">
              <button onClick={() => navigate('/termos-de-uso')} className="hover:text-white transition-colors">Termos de Uso</button>
              <button onClick={() => navigate('/politicas-de-privacidade')} className="hover:text-white transition-colors">Políticas de Privacidade</button>
            </div>
          </div>
        </div>
      </footer >
    </div >
  );
};

export default LandingPage;
