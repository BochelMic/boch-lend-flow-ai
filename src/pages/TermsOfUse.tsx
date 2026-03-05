import React, { useEffect } from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const TermsOfUse = () => {
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
                        <FileText className="h-8 w-8 text-[#d37c22]" />
                        <h1 className="text-3xl md:text-5xl font-bold">Termos de Uso</h1>
                    </div>
                    <p className="text-gray-300 text-lg">Última atualização: Março de 2026</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 mt-12">
                <div className="bg-white rounded-3xl shadow-sm p-8 md:p-14 border border-gray-100 text-gray-700">
                    <h2 className="text-2xl font-bold text-[#0b3a20] mt-2 mb-5 pb-2 border-b border-gray-100">1. Introdução e Aceitação</h2>
                    <p className="mb-5 leading-relaxed text-[1.05rem]">
                        Bem-vindo(a) à <strong className="text-gray-900 font-bold">BOCHEL Microcrédito EI</strong>. Estes Termos de Uso (adiante referidos como "Termos") estabelecem as regras e condições que regem a utilização da nossa página web, da nossa aplicação e dos serviços financeiros prestados pela BOCHEL.
                    </p>
                    <p className="mb-10 leading-relaxed text-[1.05rem]">
                        Ao criar uma conta, solicitar um crédito ou utilizar as nossas ferramentas (como o simulador de crédito), o Cliente concorda plena e inequivocamente com os presentes Termos. Se não concordar com qualquer parte destes Termos, solicitamos que não utilize os nossos serviços.
                    </p>

                    <h2 className="text-2xl font-bold text-[#0b3a20] mt-10 mb-5 pb-2 border-b border-gray-100">2. Condições de Elegibilidade</h2>
                    <p className="mb-4 leading-relaxed text-[1.05rem]">Para usufruir dos serviços de concessão de microcrédito da BOCHEL, o Cliente deve cumprir impreterivelmente com os seguintes requisitos:</p>
                    <ul className="list-disc pl-6 space-y-3 mb-10 text-[1.05rem]">
                        <li>Ter idade igual ou superior a 18 (dezoito) anos e capacidade legal e mental para celebrar contratos.</li>
                        <li>Ser de nacionalidade moçambicana ou residente legal em território nacional, titular de documento de identificação válido.</li>
                        <li>Apresentar capacidade financeira para solver a sua dívida, comprovada através de documentação laboral ou comercial (comprovativo de rendimentos, declaração de empresa, etc.).</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-[#0b3a20] mt-10 mb-5 pb-2 border-b border-gray-100">3. Cadastro e Conta do Utilizador</h2>
                    <p className="mb-5 leading-relaxed text-[1.05rem]">
                        Ao registar-se na nossa plataforma, o Cliente compromete-se a fornecer informações verdadeiras, exatas e completas. A criação de contas com identidade falsa constitui fraude, e resultará no bloqueio da conta e comunicação às entidades judiciais competentes.
                    </p>
                    <p className="mb-10 leading-relaxed text-[1.05rem]">
                        O Cliente é inteiramente responsável pela guarda e sigilo dos seus dados de acesso (password) e de toda a atividade realizada sob a sua conta.
                    </p>

                    <h2 className="text-2xl font-bold text-[#0b3a20] mt-10 mb-5 pb-2 border-b border-gray-100">4. Concessão de Crédito e Condições</h2>
                    <p className="mb-4 leading-relaxed text-[1.05rem]">A aprovação de qualquer solicitação de crédito está sujeita a uma rigorosa avaliação e análise de risco (financeira e legal) pela equipa de Gestão da BOCHEL.</p>
                    <ul className="list-disc pl-6 space-y-3 mb-10 text-[1.05rem]">
                        <li><strong className="text-gray-900">Transparência:</strong> O custo total do crédito, a taxa de juros aplicada, os prazos de vencimento, comissões e garantias necessárias serão explicitamente informados ao Cliente antes da formalização do contrato.</li>
                        <li><strong className="text-gray-900">Assinatura do Contrato:</strong> O desembolso de qualquer valor está condicionado à leitura atenta e assinatura formal, digital ou física, de um <em className="italic">Contrato Mútuo de Prestação de Serviços Financeiros</em>.</li>
                        <li><strong className="text-gray-900">Incumprimento:</strong> Em caso de incumprimento, o Cliente fica sujeito a taxas de mora cujas percentagens encontram-se dispostas no respetivo contrato assinado, podendo a BOCHEL accionar meios de cobrança judicial ou extra-judicial se necessário.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-[#0b3a20] mt-10 mb-5 pb-2 border-b border-gray-100">5. Direitos e Obrigações do Cliente</h2>
                    <p className="mb-4 leading-relaxed text-[1.05rem]">Para garantir um relacionamento financeiro saudável:</p>
                    <ul className="list-disc pl-6 space-y-3 mb-10 text-[1.05rem]">
                        <li><strong className="text-gray-900">É um direito do Cliente:</strong> Liquidar total ou parcialmente, de forma antecipada, os empréstimos (sob ajustamento legal de juros de amortização estipulados pela BOCHEL) e ter acesso imediato à sua faturação, histórico e extratos.</li>
                        <li><strong className="text-gray-900">É dever do Cliente:</strong> Manter atualizados todos os seus contactos e informações de residência, e proceder ao pagamento rigoroso das tranches na data de maturidade do contrato.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-[#0b3a20] mt-10 mb-5 pb-2 border-b border-gray-100">6. Propriedade Intelectual</h2>
                    <p className="mb-10 leading-relaxed text-[1.05rem]">
                        Todo o conteúdo disponibilizado na plataforma da BOCHEL, incluindo marcas (BOCHEL Microcrédito EI), logotipos, textos, códigos informáticos, gráficos e interfaces de design, bem como a infraestrutura de backend subjacente, são propriedade exclusiva da empresa. É estritamente proibida a cópia, reprodução, distribuição ou engenharia reversa destes constituintes sem prévia autorização escrita da direção.
                    </p>

                    <h2 className="text-2xl font-bold text-[#0b3a20] mt-10 mb-5 pb-2 border-b border-gray-100">7. Modificações dos Termos</h2>
                    <p className="mb-10 leading-relaxed text-[1.05rem]">
                        A BOCHEL reserva-se o direito de alterar, modificar ou atualizar estes Termos de Utilização a qualquer momento. Modificações importantes em regras base serão devidamente comunicadas aos clientes através dos canais de contacto ativos. O uso contínuo da plataforma pós-alterações implicará a aceitação dos novos Termos.
                    </p>

                    <h2 className="text-2xl font-bold text-[#0b3a20] mt-10 mb-5 pb-2 border-b border-gray-100">8. Lei Aplicável e Foro</h2>
                    <p className="mb-10 leading-relaxed text-[1.05rem] bg-gray-50 p-6 rounded-xl border border-gray-100">
                        A interpretação e aplicação deste Acordo reger-se-á inteiramente pelas leis estabelecidas e vigentes da República de Moçambique. As partes acordam que qualquer litígio resultante deste acordo será submetido à jurisdição exclusiva dos tribunais competentes da Cidade de Maputo, ou outro foro imposto por força legal do direito moçambicano.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TermsOfUse;
