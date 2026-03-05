import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Calculator, MessageCircle, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';

export default function MobileBottomNav() {
    const location = useLocation();
    const { user } = useAuth();
    const [showMore, setShowMore] = useState(false);

    const getNavItems = () => {
        const prefix = user?.role === 'gestor' ? '/gestor' : user?.role === 'agente' ? '/agente' : '';

        if (user?.role === 'cliente') {
            return {
                main: [
                    { name: 'Início', href: '/dashboard-cliente', icon: LayoutDashboard },
                    { name: 'Pedidos', href: '/pedidos', icon: FileText },
                    { name: 'Crédito', href: '/credit-form', icon: Calculator },
                    { name: 'Chat', href: '/chat', icon: MessageCircle },
                ],
                more: [
                    { name: 'Histórico', href: '/historico' },
                    { name: 'Contratos', href: '/contratos' },
                ],
            };
        }
        if (user?.role === 'agente') {
            return {
                main: [
                    { name: 'Início', href: `${prefix}/dashboard`, icon: LayoutDashboard },
                    { name: 'Pedidos', href: `${prefix}/credit-requests`, icon: FileText },
                    { name: 'Clientes', href: `${prefix}/clientes`, icon: Calculator },
                    { name: 'Chat', href: `${prefix}/chat`, icon: MessageCircle },
                ],
                more: [
                    { name: 'Novo Pedido', href: `${prefix}/credit-form` },
                    { name: 'Empréstimos', href: `${prefix}/emprestimos` },
                    { name: 'Cobranças', href: `${prefix}/cobrancas` },
                    { name: 'Contratos', href: `${prefix}/contratos` },
                ],
            };
        }
        // gestor
        return {
            main: [
                { name: 'Início', href: `${prefix}/dashboard`, icon: LayoutDashboard },
                { name: 'Pedidos', href: `${prefix}/credit-requests`, icon: FileText },
                { name: 'Clientes', href: `${prefix}/clientes`, icon: Calculator },
                { name: 'Chat', href: `${prefix}/chat`, icon: MessageCircle },
            ],
            more: [
                { name: 'Empréstimos', href: `${prefix}/emprestimos` },
                { name: 'Cobranças', href: `${prefix}/cobrancas` },
                { name: 'Contratos', href: `${prefix}/contratos` },
                { name: 'Crédito', href: `${prefix}/credit-form` },
                { name: 'Simulador', href: `${prefix}/credit-simulator` },
                { name: 'Usuários', href: `${prefix}/usuarios` },
                { name: 'Agentes', href: `${prefix}/agentes` },
                { name: 'Relatórios', href: `${prefix}/reports` },
                { name: 'Subsistemas', href: `${prefix}/subsistemas` },
                { name: 'Configurações', href: `${prefix}/settings` },
            ],
        };
    };

    const { main, more } = getNavItems();

    return (
        <>
            {/* More Menu Overlay */}
            {showMore && (
                <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setShowMore(false)}>
                    <div
                        className="absolute bottom-20 left-4 right-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 space-y-1"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {more.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setShowMore(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Bottom Nav Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                <div className="flex items-center justify-around px-2 py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))]">
                    {main.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex flex-col items-center gap-0.5 min-w-[56px] py-1.5 rounded-xl transition-all ${isActive
                                    ? 'text-[#d37c22]'
                                    : 'text-gray-400 active:text-gray-600'
                                    }`}
                            >
                                <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-[#d37c22]/10' : ''}`}>
                                    <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.8} />
                                </div>
                                <span className={`text-[10px] leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                    {more.length > 0 && (
                        <button
                            onClick={() => setShowMore(!showMore)}
                            className={`flex flex-col items-center gap-0.5 min-w-[56px] py-1.5 rounded-xl transition-all ${showMore ? 'text-[#d37c22]' : 'text-gray-400 active:text-gray-600'
                                }`}
                        >
                            <div className={`p-1.5 rounded-xl transition-colors ${showMore ? 'bg-[#d37c22]/10' : ''}`}>
                                <MoreHorizontal className="h-5 w-5" strokeWidth={showMore ? 2.5 : 1.8} />
                            </div>
                            <span className={`text-[10px] leading-none ${showMore ? 'font-bold' : 'font-medium'}`}>
                                Mais
                            </span>
                        </button>
                    )}
                </div>
            </nav>
        </>
    );
}
