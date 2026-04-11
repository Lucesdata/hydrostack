"use client";

import React, { useState, useEffect } from 'react';
import { ArrowRight, Zap, Cpu, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/hooks/useSupabase';

const agentExamples = [
    "Selecciona la tecnología óptima para tu comunidad",
    "Genera un informe técnico normativo RAS-2000",
    "Dimensiona un sistema FIME para 1.200 habitantes",
    "Evalúa 7 tecnologías con el motor IGST"
];

export default function NewHero() {
    const router = useRouter();
    const supabase = useSupabase();
    const [loading, setLoading] = useState(false);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [displayText, setDisplayText] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        const currentExample = agentExamples[placeholderIndex];
        if (isTyping) {
            if (displayText.length < currentExample.length) {
                const t = setTimeout(() => setDisplayText(currentExample.slice(0, displayText.length + 1)), 50);
                return () => clearTimeout(t);
            } else {
                const t = setTimeout(() => setIsTyping(false), 2000);
                return () => clearTimeout(t);
            }
        } else {
            if (displayText.length > 0) {
                const t = setTimeout(() => setDisplayText(displayText.slice(0, -1)), 30);
                return () => clearTimeout(t);
            } else {
                const t = setTimeout(() => {
                    setPlaceholderIndex((prev) => (prev + 1) % agentExamples.length);
                    setIsTyping(true);
                }, 0);
                return () => clearTimeout(t);
            }
        }
    }, [displayText, isTyping, placeholderIndex]);

    const handleStart = () => router.push('/dashboard');

    const handleDemoClick = async () => {
        setLoading(true);
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 10000)
            );
            const result = await Promise.race([supabase.auth.signInAnonymously(), timeoutPromise]) as { data: any, error: any };
            const { error } = result;
            if (error) {
                if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
                    alert('Error de conexión con el servidor.');
                } else {
                    alert(`Error de autenticación: ${error.message}`);
                    router.push('/login');
                }
                setLoading(false);
                return;
            }
            router.push('/dashboard');
            router.refresh();
        } catch (error: any) {
            if (error.message?.includes('Timeout')) {
                alert('El servidor tardó demasiado. Intenta nuevamente.');
            } else {
                alert(`Error inesperado: ${error.message}`);
            }
            setLoading(false);
        }
    };

    return (
        <header
            className="relative min-h-screen flex items-center pt-20 overflow-hidden"
            style={{ background: 'var(--ocean-950)' }}
        >
            {/* Video — deep, subdued */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay loop muted playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ opacity: 0.12 }}
                >
                    <source src="/videos/plant-hero.mp4" type="video/mp4" />
                </video>

                {/* Left gradient veil */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(105deg, var(--ocean-950) 45%, rgba(2,12,27,0.85) 70%, rgba(2,12,27,0.4) 100%)'
                    }}
                />

                {/* Wave pattern overlay */}
                <div className="absolute inset-0 bg-wave-lines animate-wave-flow" style={{ opacity: 0.9 }} />

                {/* Subtle radial glow from center-left */}
                <div
                    className="absolute"
                    style={{
                        top: '20%', left: '-10%',
                        width: '60vw', height: '60vw',
                        background: 'radial-gradient(circle, rgba(0,200,168,0.06) 0%, transparent 65%)',
                        pointerEvents: 'none',
                    }}
                />
            </div>

            {/* Main content */}
            <div className="relative z-20 max-w-7xl mx-auto px-6 w-full py-16">

                {/* Status badge */}
                <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 mb-10 rounded-full text-xs font-mono tracking-widest uppercase"
                    style={{
                        border: '1px solid rgba(0,200,168,0.25)',
                        background: 'rgba(0,200,168,0.07)',
                        color: 'var(--teal-400)',
                    }}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    Ingeniería de Acueductos Rurales
                    <ChevronRight className="w-3 h-3 opacity-60" />
                </div>

                <div className="grid lg:grid-cols-[1fr_420px] gap-14 xl:gap-20 items-center">

                    {/* ── Left: Headline ─────────────────── */}
                    <div className="space-y-8">
                        <h1
                            className="font-display font-bold leading-[0.92] tracking-tight"
                            style={{ fontSize: 'clamp(3.2rem, 7vw, 6rem)', color: 'var(--text-primary)' }}
                        >
                            Diseña y optimiza<br />
                            sistemas de<br />
                            <em
                                className="not-italic font-light"
                                style={{ color: 'var(--teal-500)', fontStyle: 'italic' }}
                            >
                                tratamiento
                            </em>
                            <br />
                            de agua.
                        </h1>

                        {/* Teal rule accent */}
                        <div
                            className="h-px w-12"
                            style={{ background: 'var(--teal-500)', opacity: 0.6 }}
                        />

                        <p
                            className="text-lg leading-relaxed max-w-lg"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            Hydrostack transforma datos de campo en diseños normativos,
                            gemelos digitales y sistemas inteligentes para la potabilización de agua.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            <button
                                onClick={handleStart}
                                className="group px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5"
                                style={{
                                    background: 'var(--teal-500)',
                                    color: 'var(--ocean-950)',
                                    boxShadow: '0 4px 20px rgba(0,200,168,0.3)',
                                }}
                            >
                                <Zap className="w-4 h-4" />
                                Probar Demo Guiada (5 min)
                                <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                            </button>
                            <button
                                onClick={handleDemoClick}
                                disabled={loading}
                                className="px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5"
                                style={{
                                    border: '1px solid rgba(0,200,168,0.25)',
                                    color: 'var(--text-primary)',
                                    background: 'rgba(0,200,168,0.04)',
                                }}
                            >
                                {loading ? 'Preparando...' : 'Ver cómo funciona'}
                            </button>
                        </div>

                        {/* Social proof */}
                        <div className="flex items-center gap-5 pt-2">
                            <div className="flex items-center">
                                {['JP', 'AS', 'mk'].map((init, i) => (
                                    <div
                                        key={init}
                                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold"
                                        style={{
                                            border: '2px solid var(--ocean-950)',
                                            background: `hsl(${190 + i * 15}, 40%, 30%)`,
                                            color: 'var(--text-primary)',
                                            marginLeft: i === 0 ? 0 : '-10px',
                                            zIndex: 3 - i,
                                            position: 'relative',
                                        }}
                                    >
                                        {init}
                                    </div>
                                ))}
                                <div
                                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold -ml-2.5 relative z-0"
                                    style={{
                                        border: '2px solid var(--ocean-950)',
                                        background: 'var(--teal-500)',
                                        color: 'var(--ocean-950)',
                                    }}
                                >
                                    +100
                                </div>
                            </div>
                            <div
                                className="w-px h-8"
                                style={{ background: 'rgba(0,200,168,0.2)' }}
                            />
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                Usado por{' '}
                                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                                    Acueductos Rurales
                                </span>{' '}
                                y ONGs.
                            </p>
                        </div>
                    </div>

                    {/* ── Right: Agent Card ────────────────── */}
                    <div
                        className="rounded-2xl p-7 relative overflow-hidden"
                        style={{
                            background: 'var(--ocean-900)',
                            border: '1px solid rgba(0,200,168,0.15)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,200,168,0.05)',
                        }}
                    >
                        {/* Corner glow */}
                        <div
                            className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
                            style={{ background: 'radial-gradient(circle, rgba(0,200,168,0.08) 0%, transparent 70%)' }}
                        />

                        {/* Card header */}
                        <div className="flex items-start justify-between mb-5">
                            <div>
                                <div
                                    className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase mb-2"
                                    style={{ color: 'var(--teal-400)' }}
                                >
                                    <Cpu className="w-3.5 h-3.5" />
                                    Copiloto Técnico
                                </div>
                                <h3
                                    className="text-lg font-semibold leading-snug"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Ingeniería hidráulica<br />
                                    <span style={{ color: 'var(--teal-400)' }}>asistida por IA</span>
                                </h3>
                            </div>
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: 'rgba(0,200,168,0.1)', border: '1px solid rgba(0,200,168,0.2)' }}
                            >
                                <Cpu className="w-5 h-5" style={{ color: 'var(--teal-500)' }} />
                            </div>
                        </div>

                        <p
                            className="text-sm leading-relaxed mb-6"
                            style={{ color: 'var(--text-secondary)', borderLeft: '2px solid rgba(0,200,168,0.25)', paddingLeft: '1rem' }}
                        >
                            Dimensiona plantas, genera gemelos digitales y valida cumplimiento
                            normativo bajo RAS-2000 y lineamientos CINARA.
                        </p>

                        {/* Animated input */}
                        <div className="mb-5">
                            <label
                                className="block text-xs font-mono tracking-widest uppercase mb-2"
                                style={{ color: 'var(--teal-400)', opacity: 0.8 }}
                            >
                                ¿Qué necesitas diseñar?
                            </label>
                            <div
                                className="w-full rounded-lg px-4 py-3 text-sm min-h-[48px] flex items-center"
                                style={{
                                    background: 'rgba(2,12,27,0.6)',
                                    border: '1px solid rgba(0,200,168,0.15)',
                                    color: 'var(--text-secondary)',
                                    fontFamily: 'var(--font-mono)',
                                }}
                            >
                                <span>{displayText}</span>
                                <span
                                    className="w-0.5 h-4 ml-0.5 animate-pulse inline-block"
                                    style={{ background: 'var(--teal-500)' }}
                                />
                            </div>
                        </div>

                        {/* CTA */}
                        <button
                            onClick={handleStart}
                            className="w-full py-3.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 group"
                            style={{
                                background: 'var(--teal-500)',
                                color: 'var(--ocean-950)',
                                boxShadow: '0 4px 16px rgba(0,200,168,0.25)',
                            }}
                        >
                            Iniciar con el Agente
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                        </button>

                        <p
                            className="text-xs text-center mt-4"
                            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                        >
                            La IA acelera y ordena el trabajo del ingeniero, no lo sustituye.
                        </p>
                    </div>
                </div>
            </div>

            {/* Scrolling banner */}
            <div
                className="absolute bottom-0 left-0 w-full py-3.5 overflow-hidden z-20"
                style={{
                    borderTop: '1px solid rgba(0,200,168,0.08)',
                    borderBottom: '1px solid rgba(0,200,168,0.08)',
                    background: 'rgba(2,12,27,0.85)',
                    backdropFilter: 'blur(8px)',
                }}
            >
                <div className="flex animate-marquee">
                    {[...Array(2)].map((_, rep) => (
                        <div
                            key={rep}
                            className="flex items-center gap-14 whitespace-nowrap shrink-0"
                            style={{
                                color: 'var(--text-muted)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.7rem',
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                marginLeft: rep === 1 ? '3.5rem' : 0,
                            }}
                        >
                            <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--amber-500)' }} />
                                Selector Tecnológico IGST
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--teal-500)' }} />
                                Informe Técnico Automático
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--teal-500)' }} />
                                Proyección Poblacional
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--teal-500)' }} />
                                Gemelos Digitales
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--teal-500)' }} />
                                Validación RAS-2000
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--sky-400)' }} />
                                CINARA
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </header>
    );
}
