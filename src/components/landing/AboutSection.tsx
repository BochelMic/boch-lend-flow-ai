import React from 'react';
import { Target, Eye, Diamond, CheckCircle, Award, Scale, Search, ShieldCheck } from 'lucide-react';

const AboutSection = () => {
    const secondaryColor = '#d37c22'; // BOCHEL Orange/Gold
    const primaryColor = '#0b3a20'; // BOCHEL Dark Green

    const values = [
        { icon: <CheckCircle className="w-5 h-5" />, title: "Integridade", description: "Atuamos com honestidade e clareza contratual." },
        { icon: <Scale className="w-5 h-5" />, title: "Responsabilidade Financeira", description: "Concedemos crédito de forma consciente, evitando o superendividamento." },
        { icon: <Award className="w-5 h-5" />, title: "Compromisso", description: "Valorizamos o relacionamento próximo com os nossos clientes." },
        { icon: <Search className="w-5 h-5" />, title: "Transparência", description: "Apresentamos claramente taxas, prazos e encargos." },
        { icon: <Diamond className="w-5 h-5" />, title: "Sustentabilidade", description: "Buscamos crescimento sólido e responsável." },
    ];

    return (
        <section id="sobre" className="py-24 bg-white overflow-hidden relative">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 opacity-10 pointer-events-none">
                <svg width="404" height="404" fill="none" viewBox="0 0 404 404"><defs><pattern id="85737c0e-0916-41d7-917f-596dc7edfa27" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><rect x="0" y="0" width="4" height="4" fill="currentColor"></rect></pattern></defs><rect width="404" height="404" fill="url(#85737c0e-0916-41d7-917f-596dc7edfa27)"></rect></svg>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Mission & Vision Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
                    <div>
                        <div className="inline-flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-1.5 mb-6">
                            <span className="flex h-2 w-2 rounded-full" style={{ backgroundColor: secondaryColor }}></span>
                            <span className="text-sm font-bold tracking-wider text-gray-800 uppercase">Sobre Nós</span>
                        </div>

                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                            Promovemos a Inclusão Financeira em Moçambique.
                        </h2>

                        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                            A <strong className="text-gray-900">BOCHEL Microcrédito EI</strong> é uma empresa moçambicana de capital individual, sediada em Maputo, dedicada à concessão de microcrédito responsável para empreendedores, comerciantes, funcionários públicos e trabalhadores do setor informal.
                        </p>

                        <p className="text-lg text-gray-600 leading-relaxed mb-8">
                            Fundada em 2025 com o propósito de impulsionar pequenos negócios, atuamos com foco na simplicidade, agilidade e transparência nos processos de concessão de crédito.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <Target className="w-8 h-8 mb-4" style={{ color: secondaryColor }} />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Missão</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">Oferecer soluções de crédito acessíveis, responsáveis e sustentáveis, contribuindo para o crescimento económico dos nossos clientes e do país.</p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <Eye className="w-8 h-8 mb-4" style={{ color: secondaryColor }} />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Visão</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">Ser reconhecida como a melhor empresa de microcrédito confiável e transparente em Moçambique e no mundo, com foco na ética e eficiência.</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#0b3a20] to-[#2a7a4c] transform skew-y-3 rounded-3xl -z-10 shadow-xl opacity-90"></div>
                        <img
                            src="https://images.unsplash.com/photo-1550565118-3a14e8d0386f?q=80&w=2070&auto=format&fit=crop"
                            alt="Espaço corporativo"
                            className="rounded-3xl shadow-2xl object-cover h-[500px] w-full transform -translate-y-4 translate-x-4 border-4 border-white"
                        />
                        {/* Overlay badge */}
                        <div className="absolute bottom-6 left-0 bg-white p-5 rounded-2xl shadow-xl border border-gray-100 transform -translate-x-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-50">
                                <ShieldCheck className="w-6 h-6" style={{ color: primaryColor }} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-lg">100% Legal</p>
                                <p className="text-sm text-gray-500">Registada e Licenciada</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History & Operations */}
                <div className="mt-24 bg-gray-50 rounded-3xl p-8 lg:p-12 border border-gray-100">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">Nossa História & Operação</h3>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Nascemos da iniciativa empreendedora para criar um modelo de crédito adaptado à realidade local moçambicana.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-50">
                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                                <span className="text-2xl font-bold text-blue-600">1</span>
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-3">Crédito Individual</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">Foco em crédito para pequenos comerciantes e trabalhadores do setor informal que necessitam de apoio para os seus negócios diários.</p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-50">
                            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-6">
                                <span className="text-2xl font-bold text-orange-600">2</span>
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-3">Apoio Financeiro Emergencial</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">Desenvolvemos soluções ágeis para situações inesperadas, garantindo que os nossos clientes tenham o apoio necessário quando mais precisam.</p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-50">
                            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-6">
                                <span className="text-2xl font-bold text-green-600">3</span>
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-3">Capital de Giro</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">Providenciamos fundos de maneio para microempreendedores expandirem as suas operações e manterem a fluidez financeira.</p>
                        </div>
                    </div>
                </div>

                {/* Values and Transparency */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-24">
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">Nossos Valores</h3>
                        <ul className="space-y-6">
                            {values.map((v, i) => (
                                <li key={i} className="flex gap-4">
                                    <div className="flex-shrink-0 mt-1" style={{ color: secondaryColor }}>{v.icon}</div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900">{v.title}</h4>
                                        <p className="text-gray-600 text-sm mt-1">{v.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <div className="bg-[#0b3a20] rounded-3xl p-8 lg:p-10 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 -m-8 opacity-10">
                                <ShieldCheck className="w-48 h-48" />
                            </div>

                            <h3 className="text-2xl font-bold mb-6 text-white relative z-10">Transparência & Gestão</h3>

                            <p className="text-gray-300 mb-8 text-sm leading-relaxed relative z-10">
                                A nossa gestão é centralizada no seu proprietário e diretor executivo. Contamos com um Gestor Geral formado, Agentes de Campo em RH, Apoio contabilístico certificado e Consultoria jurídica externa.
                            </p>

                            <div className="space-y-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="w-5 h-5 text-[#d37c22]" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">Práticas Rigorosas</h4>
                                        <p className="text-xs text-gray-400 mt-1">Clareza nas taxas, recibos formais e contratos sempre escritos.</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="w-5 h-5 text-[#d37c22]" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">Regularização Legal</h4>
                                        <p className="text-xs text-gray-400 mt-1">NUIT ativo, Alvará de atividade válido e devidamente registada na AT.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default AboutSection;
