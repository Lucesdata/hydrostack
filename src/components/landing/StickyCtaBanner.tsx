"use client";

import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Droplets } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StickyCtaBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent > 30 && !isDismissed) setIsVisible(true);
            else if (scrollPercent <= 30) setIsVisible(false);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isDismissed]);

    const handleDismiss = () => { setIsDismissed(true); setIsVisible(false); };
    const handleCta = () => router.push('/dashboard/new/introduction');

    if (!isVisible || isDismissed) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-500">
            <div
                className="flex items-center gap-4 px-5 py-4 rounded-2xl max-w-xl"
                style={{
                    background: 'var(--ocean-900)',
                    border: '1px solid rgba(0,200,168,0.25)',
                    boxShadow: '0 16px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,200,168,0.05)',
                    backdropFilter: 'blur(20px)',
                }}
            >
                {/* Icon */}
                <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(0,200,168,0.12)', border: '1px solid rgba(0,200,168,0.25)' }}
                >
                    <Droplets className="w-5 h-5" style={{ color: 'var(--teal-400)' }} />
                </div>

                {/* Text */}
                <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        ¿Listo para diseñar tu proyecto?
                    </p>
                    <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        Comienza gratis, sin tarjeta de crédito
                    </p>
                </div>

                {/* CTA */}
                <button
                    onClick={handleCta}
                    className="px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 shrink-0 group"
                    style={{
                        background: 'var(--teal-500)',
                        color: 'var(--ocean-950)',
                        boxShadow: '0 4px 16px rgba(0,200,168,0.25)',
                    }}
                >
                    Empezar Ahora
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Close */}
                <button
                    onClick={handleDismiss}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,200,168,0.08)'; (e.currentTarget as HTMLElement).style.color = 'var(--teal-400)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                    aria-label="Cerrar"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
