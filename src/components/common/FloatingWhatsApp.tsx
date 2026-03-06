import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const FloatingWhatsApp = () => {
    const location = useLocation();

    // Don't show WhatsApp button inside the admin/agent panels
    if (location.pathname.startsWith('/gestor') || location.pathname.startsWith('/agente')) {
        return null;
    }

    // Replace with your actual WhatsApp business number
    const phoneNumber = "258861887302";
    const message = "Olá! Gostaria de saber mais sobre a Bochel Microcrédito.";

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#1ebd5a] hover:scale-110 transition-all duration-300 flex items-center justify-center group"
            aria-label="Contacte-nos no WhatsApp"
        >
            <MessageCircle className="w-8 h-8" />

            {/* Tooltip */}
            <span className="absolute right-full mr-4 bg-white text-gray-800 text-sm font-bold px-4 py-2 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-100">
                Fale connosco
                {/* Small triangle arrow poiting right */}
                <span className="absolute top-1/2 -right-2 -translate-y-1/2 border-8 border-transparent border-l-white"></span>
            </span>
        </a>
    );
};

export default FloatingWhatsApp;
