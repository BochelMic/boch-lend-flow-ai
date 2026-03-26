import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Calculator, MessageCircle, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// Import 3D Icons
import inicioImg from '@/assets/icon 3d/inicio.png';
import pedidosImg from '@/assets/icon 3d/pedidos.png';
import clientesImg from '@/assets/icon 3d/clientes.png';
import chatImg from '@/assets/icon 3d/chat.png';

export default function MobileBottomNav() {
    const location = useLocation();
    const { user } = useAuth();
    const [showMore, setShowMore] = useState(false);

    const getNavItems = () => {
        const prefix = user?.role === 'gestor' ? '/gestor' : user?.role === 'agente' ? '/agente' : '';

        if (user?.role === 'cliente') {
            return {
                main: [
                    { name: 'Início', href: '/dashboard-cliente', icon: LayoutDashboard, image: inicioImg },
                    { name: 'Pedidos', href: '/pedidos', icon: FileText, image: pedidosImg },
                    { name: 'Crédito', href: '/credit-form', icon: Calculator },
                    { name: 'Chat', href: '/chat', icon: MessageCircle, image: chatImg },
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
                    { name: 'Início', href: `${prefix}/dashboard`, icon: LayoutDashboard, image: inicioImg },
                    { name: 'Pedidos', href: `${prefix}/credit-requests`, icon: FileText, image: pedidosImg },
                    { name: 'Clientes', href: `${prefix}/clientes`, icon: Calculator, image: clientesImg },
                    { name: 'Chat', href: `${prefix}/chat`, icon: MessageCircle, image: chatImg },
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
                { name: 'Início', href: `${prefix}/dashboard`, icon: LayoutDashboard, image: inicioImg },
                { name: 'Pedidos', href: `${prefix}/credit-requests`, icon: FileText, image: pedidosImg },
                { name: 'Clientes', href: `${prefix}/clientes`, icon: Calculator, image: clientesImg },
                { name: 'Chat', href: `${prefix}/chat`, icon: MessageCircle, image: chatImg },
            ],
            more: [
                { name: 'Empréstimos', href: `${prefix}/emprestimos` },
                { name: 'Pagamentos', href: `${prefix}/pagamentos` },
                { name: 'Contratos', href: `${prefix}/contratos` },
                { name: 'Cobranças', href: `${prefix}/cobrancas` },
                { name: 'Caixa', href: `${prefix}/caixa` },
                { name: 'Relatórios', href: `${prefix}/reports` },
                { name: 'Agentes', href: `${prefix}/agentes` },
                { name: 'Simulador', href: `${prefix}/credit-simulator` },
                { name: 'Administração', href: `${prefix}/admin` },
                { name: 'Auditoria', href: `${prefix}/audit` },
                { name: 'Subsistemas', href: `${prefix}/subsistemas` },
                { name: 'Configurações', href: `${prefix}/settings` },
                { name: 'Novo Crédito', href: `${prefix}/credit-form` },
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
                        className="absolute bottom-20 left-4 right-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 space-y-1 max-h-[70vh] overflow-y-auto scrollbar-hide"
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
            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2">
                <div className="flex items-end justify-around py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] h-20">
                    {main.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-end gap-1 min-w-[64px] transition-all relative",
                                    isActive ? "text-[#d37c22]" : "text-gray-400 active:scale-95"
                                )}
                            >
                                <div className={cn(
                                    "relative flex items-center justify-center transition-all duration-300",
                                    isActive ? "translate-y-[-8px] scale-110" : ""
                                )}>
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className={cn(
                                                "w-10 h-10 object-contain icon-3d-nav",
                                                isActive ? "icon-3d-nav-active" : "icon-3d-nav-idle"
                                            )}
                                        />
                                    ) : (
                                        <div className={cn(
                                            "p-2 rounded-2xl transition-all shadow-sm",
                                            isActive ? "bg-gradient-to-br from-[#d37c22] to-[#ff9d42] text-white shadow-orange-200" : "bg-gray-50"
                                        )}>
                                            <item.icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                                        </div>
                                    )}

                                    {isActive && (
                                        <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#d37c22] shadow-[0_0_8px_#d37c22]" />
                                    )}
                                </div>
                                <span className={cn(
                                    "text-[10px] leading-none tracking-tight transition-all",
                                    isActive ? "font-black opacity-100" : "font-semibold opacity-60"
                                )}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                    {more.length > 0 && (
                        <button
                            onClick={() => setShowMore(!showMore)}
                            className={cn(
                                "flex flex-col items-center justify-end gap-1 min-w-[64px] transition-all relative",
                                showMore ? "text-[#d37c22]" : "text-gray-400 active:scale-95"
                            )}
                        >
                            <div className={cn(
                                "relative flex items-center justify-center transition-all duration-300 group",
                                showMore ? "translate-y-[-8px] scale-110" : ""
                            )}>
                                <div className={cn(
                                    "p-2.5 rounded-2xl transition-all shadow-sm",
                                    showMore ? "bg-gradient-to-br from-[#d37c22] to-[#ff9d42] text-white shadow-orange-200" : "bg-gray-50 text-gray-400"
                                )}>
                                    <MoreHorizontal className="h-6 w-6" strokeWidth={showMore ? 2.5 : 2} />
                                </div>
                                {showMore && (
                                    <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#d37c22] shadow-[0_0_8px_#d37c22]" />
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px] leading-none tracking-tight transition-all",
                                showMore ? "font-black opacity-100" : "font-semibold opacity-60"
                            )}>
                                Mais
                            </span>
                        </button>
                    )}
                </div>
            </nav>
        </>
    );
}
