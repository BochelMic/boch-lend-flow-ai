import React, { useEffect } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-[#0b3a20] text-white pt-20 pb-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <Button
                        variant="ghost"
                        className="text-white hover:bg-white/20 mb-6 pl-0"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Button>
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="h-8 w-8 text-[#d37c22]" />
                        <h1 className="text-3xl md:text-5xl font-bold">Políticas de Privacidade</h1>
                    </div>
                    <p className="text-gray-300 text-lg">Última atualização: Março de 2026</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 mt-12">
                <div className="bg-white rounded-3xl shadow-sm p-8 md:p-14 border border-gray-100 text-gray-700">
                    <h2 className="text-2xl font-bold text-[#0b3a20] mt-2 mb-5 pb-2 border-b border-gray-100">1. Introdução</h2>
                    <p className="mb-5 leading-relaxed text-[1.05rem]">
                        A <strong className="text-gray-900 font-bold">BOCHEL Microcrédito EI</strong> (adiante designada por "BOCHEL", "Nós" ou "Nossa") valoriza e respeita a privacidade de todos os seus clientes (adiante designados por "Utilizador", "Cliente" ou "Si"). Esta Política de Privacidade descreve de que forma recolhemos, utilizamos, armazenamos, partilhamos e protegemos os seus dados pessoais ao interagir com os nossos serviços de microcrédito e ao utilizar a nossa plataforma web e aplicações móveis.
                    </p>
                    <p className="mb-10 leading-relaxed text-[1.05rem]">
                        Ao utilizar os nossos serviços, concorda com a recolha e o uso das suas informações de acordo com esta política.
                    </p>

                    <h2 className="text-2xl font-bold text-[#0b3a20] mt-10 mb-5 pb-2 border-b border-gray-100">2. Que Dados Pessoais Recolhemos?</h2>
                    <p className="mb-4 leading-relaxed text-[1.05rem]">Para a análise e concessão de microcrédito seguro e responsável, recolhemos os seguintes dados:</p>
                    <ul className="list-disc pl-6 space-y-3 mb-10 text-[1.05rem]">
                        <li><strong className="text-gray-900">Informações de Identificação:</strong> Nome completo, data de nascimento, género, número de Bilhete de Identidade (BI), Passaporte ou DIRE, e NUIT.</li>
                        <li><strong className="text-gray-900">Informações de Contacto:</strong> Endereço físico, número de telefone e endereço de email.</li>
                        <li><strong className="text-gray-900">Informações Financeiras e Profissionais:</strong> Comprovativo de rendimentos, declaração de serviço, extractos bancários, histórico de crédito, garantias e informações sobre a conta bancária ou conta de dinheiro móvel (M-Pesa, e-Mola, mKesh).</li>
                        <li><strong className="text-gray-900">Informações Técnicas:</strong> Endereço IP, tipo de navegador, páginas acedidas e dados de utilização da plataforma (recolhidos através de cookies e tecnologias semelhantes).</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-[#0b3a20] mt-10 mb-5 pb-2 border-b border-gray-100">3. Finalidade da Recolha de Dados</h2>
                    <p className="mb-4 leading-relaxed text-[1.05rem]">A BOCHEL utiliza as suas informações para as seguintes finalidades:</p>
                    <ul className="list-disc pl-6 space-y-3 mb-10 text-[1.05rem]">
                        <li>Avaliação de viabilidade financeira e análise de risco para concessão de crédito.</li>
                        <li>Elaboração e formalização de contratos de empréstimo.</li>
                        <li>Gestão da sua conta de cliente (amortizações, saldos, multas).</li>
                        <li>Comunicação consigo (envio de notificações sobre pedidos, lembretes de pagamento, alterações contratuais).</li>
                        <li>Prevenção de fraudes, branqueamento de capitais e garantia da segurança das operações.</li>
                        <li>Cumprimento de obrigações legais, fiscais (AT) e regulamentares em Moçambique.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-[#0b3a20] mt-10 mb-5 pb-2 border-b border-gray-100">4. Partilha e Divulgação de Dados</h2>
                    <p className="mb-4 leading-relaxed text-[1.05rem]">Garantimos que os seus dados <strong className="text-gray-900">não são vendidos nem partilhados para fins comerciais de terceiros</strong>. No entanto, poderemos partilhar as suas informações nas seguintes circunstâncias:</p>
                    <ul className="list-disc pl-6 space-y-3 mb-10 text-[1.05rem]">
                        <li><strong className="text-gray-900">Autoridades Governamentais e Reguladoras:</strong> Para cumprimento de obrigações legais (ex: Autoridade Tributária de Moçambique, Banco de Moçambique).</li>
                        <li><strong className="text-gray-900">Prestadores de Serviços:</strong> Serviços de contabilidade, consultoria jurídica ou parceiros tecnológicos que processam dados em nosso nome, sempre sujeitos a rigorosos acordos de confidencialidade.</li>
                        <li><strong className="text-gray-900">Centrais de Risco:</strong> Como parte da avaliação de crédito e cumprimento de normas do sistema financeiro nacional.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-[#0b3a20] mt-10 mb-5 pb-2 border-b border-gray-100">5. Segurança dos Dados</h2>
                    <p className="mb-10 leading-relaxed text-[1.05rem]">
                        Mantemos medidas técnicas e organizativas sólidas (incluindo encriptação de dados em trânsito e em repouso) para proteger as suas informações contra acesso, alteração, divulgação ou destruição não autorizada. Contudo, nenhum método de transmissão pela Internet ou armazenamento eletrónico é 100% invulnerável.
                    </p>

                    <h2 className="text-2xl font-bold text-[#0b3a20] mt-10 mb-5 pb-2 border-b border-gray-100">6. Retenção de Dados</h2>
                    <p className="mb-10 leading-relaxed text-[1.05rem]">
                        Armazenaremos os seus dados pessoais pelo prazo estritamente necessário para cumprir as finalidades descritas nesta Política, bem como para o cumprimento das obrigações legais, fiscais e contabilísticas (geralmente por um período mínimo de até 10 anos, conforme a lei moçambicana aplicável).
                    </p>

                    <h2 className="text-2xl font-bold text-[#0b3a20] mt-10 mb-5 pb-2 border-b border-gray-100">7. Os Seus Direitos</h2>
                    <p className="mb-4 leading-relaxed text-[1.05rem]">Ao abrigo da legislação de proteção de dados aplicável em Moçambique, o cliente tem direito a:</p>
                    <ul className="list-disc pl-6 space-y-3 mb-10 text-[1.05rem]">
                        <li>Requerer o acesso aos dados pessoais que a BOCHEL possui sobre si.</li>
                        <li>Solicitar a retificação de dados incorretos ou desatualizados.</li>
                        <li>Solicitar a exclusão dos seus dados (sempre que isto não limite o dever da BOCHEL de manter os dados por questões legais ou contratuais pendentes).</li>
                        <li>Retirar o consentimento para o tratamento de dados não essenciais.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-[#0b3a20] mt-10 mb-5 pb-2 border-b border-gray-100">8. Contactos</h2>
                    <p className="mb-10 leading-relaxed text-[1.05rem] bg-gray-50 p-6 rounded-xl border border-gray-100">
                        No caso de dúvidas, solicitações ou exercício dos seus direitos, entre em contacto connosco através do email:<br />
                        <a href="mailto:bochelmicrocredito@gmail.com" className="text-[#d37c22] font-bold hover:underline">bochelmicrocredito@gmail.com</a> ou visite as nossas instalações.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
