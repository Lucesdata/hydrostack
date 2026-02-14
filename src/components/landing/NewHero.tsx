"use client";

import React, { useState, useEffect } from 'react';
import { Brain, Play, Zap, Cpu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const agentExamples = [
    "Dimensiona un sistema FIME para 1.200 habitantes",
    "Optimiza un filtro lento según RAS-2000",
    "Convierte este diseño en un gemelo digital",
    "Evalúa riesgos de calidad de agua cruda"
];

export default function NewHero() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [displayText, setDisplayText] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    // Typing animation effect
    useEffect(() => {
        const currentExample = agentExamples[placeholderIndex];

        if (isTyping) {
            if (displayText.length < currentExample.length) {
                const timeout = setTimeout(() => {
                    setDisplayText(currentExample.slice(0, displayText.length + 1));
                }, 50);
                return () => clearTimeout(timeout);
            } else {
                const timeout = setTimeout(() => {
                    setIsTyping(false);
                }, 2000);
                return () => clearTimeout(timeout);
            }
        } else {
            if (displayText.length > 0) {
                const timeout = setTimeout(() => {
                    setDisplayText(displayText.slice(0, -1));
                }, 30);
                return () => clearTimeout(timeout);
            } else {
                // Avoid calling setState synchronously
                const initialTimeout = setTimeout(() => {
                    setPlaceholderIndex((prev) => (prev + 1) % agentExamples.length);
                    setIsTyping(true);
                }, 0);
                return () => clearTimeout(initialTimeout);
            }
        }
    }, [displayText, isTyping, placeholderIndex]);

    const handleStart = () => {
        router.push('/dashboard');
    };

    const handleDemoClick = async () => {
        setLoading(true);
        console.log("Iniciando acceso demo..."); // DEBUG

        try {
            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout: El servidor tardó demasiado en responder')), 10000)
            );

            // Race between sign in and timeout
            const signInPromise = supabase.auth.signInAnonymously();

            // @ts-ignore
            const result = await Promise.race([signInPromise, timeoutPromise]) as { data: any, error: any };
            const { error } = result;

            if (error) {
                console.error("Error en signInAnonymously:", error); // DEBUG
                // Check for network error
                if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
                    alert('Error de conexión con el servidor. Por favor verifica tu internet.');
                } else {
                    alert(`Error de autenticación: ${error.message} - Verifica que "Enable Anonymous Sign-ins" esté activado en Supabase.`);
                    router.push('/login');
                }
                setLoading(false);
                return;
            }

            console.log("Login anónimo exitoso, redirigiendo..."); // DEBUG
            router.push('/dashboard');
            router.refresh();
        } catch (error: any) {
            console.error('Demo login failed (CATCH):', error); // DEBUG

            if (error.message?.includes('Timeout')) {
                alert('El servidor tardó demasiado en responder. Verifica tu conexión o intenta nuevamente.');
            } else if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
                alert('No se pudo conectar con el servidor (Supabase). Verifica tu conexión.');
            } else {
                alert(`Error inesperado: ${error.message}`);
            }
            setLoading(false);
        }
    };

    return (
        <header className="relative min-h-[900px] flex items-center pt-20 overflow-hidden bg-slate-950 font-sans">
            {/* Video Background Only */}
            <div className="absolute inset-0 z-0">
                {/* Video Background */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                >
                    <source src="/videos/plant-hero.mp4" type="video/mp4" />
                </video>
                
                {/* Dark Gradient Overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-slate-900/30"></div>
                
                {/* Grid Overlay Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none"></div>
            </div>

            <div className="relative z-20 max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-16 items-center">

                {/* Hero Left Content */}
                <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-medium tracking-wide uppercase">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Ingeniería de Acueductos Rurales
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tight leading-[1.1]">
                        Diseña y optimiza sistemas de{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-500">
                            tratamiento de agua
                        </span>.
                    </h1>

                    <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
                        Hydrostack transforma datos de campo en diseños normativos, gemelos digitales y sistemas inteligentes para la potabilización de agua.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            onClick={handleStart}
                            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-900/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            <Zap className="w-5 h-5" />
                            Probar Demo Guiada (5 min)
                        </button>
                        <button
                            onClick={handleDemoClick}
                            disabled={loading}
                            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Preparando...' : 'Ver cómo funciona'}
                        </button>
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                        <div className="flex items-center gap-[-8px]">
                            <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs text-white font-medium">JP</div>
                            <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-xs text-white font-medium -ml-3">AS</div>
                            <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-600 flex items-center justify-center text-xs text-white font-medium -ml-3">mk</div>
                            <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-emerald-600 flex items-center justify-center text-xs text-white font-medium -ml-3">+100</div>
                        </div>
                        <div className="h-8 w-px bg-white/20"></div>
                        <div className="text-sm text-slate-300">
                            Usado por <span className="text-white font-semibold">Acueductos Rurales</span> y ONGs.
                        </div>
                    </div>
                </div>

                {/* AI Agent Card - ORIGINAL GLASS PANEL STYLE */}
                <div className="glass-panel p-8 rounded-2xl text-white relative overflow-hidden">

                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-semibold tracking-tight">🧠 Copiloto técnico para ingeniería hidráulica</h3>
                            <p className="text-slate-400 text-xs mt-1">Diseña, valida y transforma sistemas de agua potable.</p>
                        </div>
                        <Cpu className="w-6 h-6 text-emerald-400" />
                    </div>


                    <p className="text-slate-300 text-sm leading-relaxed mb-6">
                        Un copiloto de ingeniería que dimensiona plantas, genera gemelos digitales y valida cumplimiento normativo bajo RAS-2000 y lineamientos CINARA.
                    </p>

                    {/* Animated Input Field */}
                    <div className="space-y-1.5 mb-6">
                        <label className="text-[11px] font-mono font-medium text-emerald-400 uppercase tracking-wider">¿Qué necesitas diseñar?</label>
                        <div className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-400 min-h-[48px] flex items-center">
                            <span className="opacity-80">{displayText}</span>
                            <span className="w-0.5 h-5 bg-emerald-400 ml-0.5 animate-pulse"></span>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={handleStart}
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-medium py-3 rounded-lg shadow-lg shadow-emerald-900/20 transition-all flex justify-center items-center gap-2 group"
                    >
                        <Play className="w-4 h-4" />
                        Iniciar con el Agente
                    </button>

                    {/* Footer Note */}
                    <p className="text-xs text-slate-500 text-center mt-4">
                        La IA acelera y ordena el trabajo del ingeniero, no lo sustituye.
                    </p>
                </div>
            </div>

            {/* Scrolling Banner */}
            <div className="absolute bottom-0 left-0 w-full bg-slate-950 py-4 border-y border-white/5 overflow-hidden z-20">
                <div className="flex animate-marquee">
                    <div className="flex items-center gap-16 text-slate-400 font-mono text-sm tracking-widest uppercase whitespace-nowrap shrink-0">
                        <span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Proyección Poblacional</span>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Selección FIME</span>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Gemelos Digitales</span>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Validación Normativa</span>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> RAS-2000</span>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> CINARA</span>
                    </div>
                    <div className="flex items-center gap-16 text-slate-400 font-mono text-sm tracking-widest uppercase whitespace-nowrap shrink-0 ml-16">
                        <span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Proyección Poblacional</span>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Selección FIME</span>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Gemelos Digitales</span>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Validación Normativa</span>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> RAS-2000</span>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> CINARA</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
