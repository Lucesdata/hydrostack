"use client";

import React, { useState, useEffect } from 'react';
import { X, Zap, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StickyCtaBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            
            // Show after 30% scroll
            if (scrollPercent > 30 && !isDismissed) {
                setIsVisible(true);
            } else if (scrollPercent <= 30) {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isDismissed]);

    const handleDismiss = () => {
        setIsDismissed(true);
        setIsVisible(false);
    };

    const handleCta = () => {
        router.push('/dashboard/new/selector');
    };

    if (!isVisible || isDismissed) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-2xl shadow-2xl shadow-emerald-900/30 px-6 py-4 flex items-center gap-4 max-w-2xl border border-emerald-400/20">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <Zap className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1">
                    <p className="text-lg font-black mb-1">¿Listo para diseñar tu proyecto?</p>
                    <p className="text-sm text-emerald-100">Comienza gratis, sin tarjeta de crédito</p>
                </div>

                {/* CTA Button */}
                <button
                    onClick={handleCta}
                    className="bg-white hover:bg-slate-100 text-emerald-600 font-black px-6 py-3 rounded-xl transition-all flex items-center gap-2 group shrink-0"
                >
                    Empezar Ahora
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Close Button */}
                <button
                    onClick={handleDismiss}
                    className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors shrink-0"
                    aria-label="Cerrar"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
