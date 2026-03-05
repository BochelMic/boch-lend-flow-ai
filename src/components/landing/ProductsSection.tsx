import React from 'react';
import { motion } from 'framer-motion';
import { User, HeartPulse, ShoppingCart, Briefcase, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProductsSection = () => {
    const primaryColor = '#0b3a20'; // BOCHEL Dark Green
    const secondaryColor = '#d37c22'; // BOCHEL Orange/Gold
    const accentColor = '#bd4c37'; // BOCHEL Red/Orange

    const products = [
        {
            id: 1,
            title: 'Crédito Individual',
            description: 'Ideal para necessidades pessoais e apoio financeiro imediato com taxas competitivas.',
            icon: <User className="w-8 h-8" />,
            color: primaryColor
        },
        {
            id: 2,
            title: 'Crédito Emergencial',
            description: 'Aprovação expressa para aquelas situações inesperadas que exigem liquidez urgente.',
            icon: <HeartPulse className="w-8 h-8" />,
            color: accentColor
        },
        {
            id: 3,
            title: 'Crédito de Consumo',
            description: 'Perfeito para a aquisição de bens, viagens ou projetos pessoais com pagamentos flexíveis.',
            icon: <ShoppingCart className="w-8 h-8" />,
            color: '#0891b2' // Cyan
        },
        {
            id: 4,
            title: 'Crédito para PE',
            description: 'Alavanque a sua Pequena Empresa com capital de maneio rápido e simplificado.',
            icon: <Briefcase className="w-8 h-8" />,
            color: secondaryColor
        }
    ];

    return (
        <section id="pacotes" className="py-24 bg-gray-50 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5 }}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <h2 className="text-sm font-bold tracking-widest uppercase mb-3" style={{ color: secondaryColor }}>Os Nossos Serviços</h2>
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Soluções feitas à sua medida</h3>
                    <p className="text-lg text-gray-600">Dispomos de vários pacotes desenhados para responder às necessidades específicas da sua vida ou do seu negócio.</p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 group flex flex-col h-full"
                        >
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:-translate-y-2 transition-transform duration-300"
                                style={{ backgroundColor: `${product.color}15`, color: product.color }}
                            >
                                {product.icon}
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">{product.title}</h4>
                            <p className="text-gray-600 leading-relaxed font-medium flex-grow mb-6">{product.description}</p>

                            <Button
                                variant="ghost"
                                className="w-full justify-between mt-auto hover:bg-gray-50 font-bold group/btn"
                                style={{ color: product.color }}
                                onClick={() => document.getElementById('simulador')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Simular <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProductsSection;
