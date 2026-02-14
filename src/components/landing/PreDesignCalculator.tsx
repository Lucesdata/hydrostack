"use client";

import React, { useState, useMemo } from 'react';
import { Calculator, Droplets, Activity, ArrowRight, Zap, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PreDesignCalculator() {
    const router = useRouter();
    const [caudal, setCaudal] = useState(5);
    const [turbiedad, setTurbiedad] = useState(25);
    const [showResults, setShowResults] = useState(false);

    // Simplified logic from selector-engine
    const recommendation = useMemo(() => {
        if (turbiedad > 70) {
            return {
                tech: 'Convencional (fuera de rango FIME)',
                color: 'red',
                area: caudal * 80,
                complexity: 'Alta',
                opex: 0.45,
                reason: 'Turbiedad muy alta requiere coagulación-floculación'
            };
        }
        
        if (turbiedad > 50) {
            return {
                tech: 'FIME con Pre-Filtro Dinámico',
                color: 'amber',
                area: caudal * 60,
                complexity: 'Media',
                opex: 0.18,
                reason: 'Requiere pretratamiento intensivo (FGDi)'
            };
        }

        if (turbiedad > 20) {
            return {
                tech: 'FIME Completo (FGDi + FLA)',
                color: 'emerald',
                area: caudal * 50,
                complexity: 'Media',
                opex: 0.12,
                reason: 'Turbiedad moderada, ideal para FIME completo'
            };
        }

        return {
            tech: 'Filtración Lenta en Arena (FLA)',
            color: 'sky',
            area: caudal * 40,
            complexity: 'Baja',
            opex: 0.08,
            reason: 'Agua favorable, solo requiere FLA'
        };
    }, [caudal, turbiedad]);

    const handleCalculate = () => {
        setShowResults(true);
    };

    const handleStartProject = () => {
        router.push('/dashboard/new/selector');
    };

    const getTurbidityColor = () => {
        if (turbiedad > 70) return 'text-red-400';
        if (turbiedad > 50) return 'text-amber-400';
        if (turbiedad > 20) return 'text-blue-400';
        return 'text-emerald-400';
    };

    return (
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-24 relative overflow-hidden">
            {/* Animated Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px] pointer-events-none animate-grid-flow"></div>
            
            {/* Radial Gradient Accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    
                    {/* Left: Info */}
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-medium tracking-wide uppercase mb-6">
                            <Calculator className="w-3 h-3" />
                            Pre-Diseño Rápido
                        </div>

                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-6">
                            ¿Qué tecnología necesito?
                        </h2>

                        <p className="text-lg text-slate-300 leading-relaxed mb-8">
                            Obtén una recomendación instantánea basada en los parámetros de tu fuente de agua. 
                            El motor de selección HYDROSTACK analiza caudal y calidad para sugerir la tecnología óptima según RAS-2000.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">Algoritmo normativo</p>
                                    <p className="text-sm text-slate-400">Cumplimiento automático de RAS-2000</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle className="w-4 h-4 text-sky-400" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">Estimación de costos</p>
                                    <p className="text-sm text-slate-400">OPEX y área estimada al instante</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle className="w-4 h-4 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">Sin registro</p>
                                    <p className="text-sm text-slate-400">Prueba gratis, sin compromiso</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Calculator Card */}
                    <div className="bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                                <Calculator className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white">Calculadora de Pre-Diseño</h3>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Estimación instantánea</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Caudal Input */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Droplets className="w-4 h-4 text-sky-400" />
                                        Caudal de Diseño
                                    </label>
                                    <span className="text-2xl font-black text-white">{caudal} <span className="text-sm text-slate-500">L/s</span></span>
                                </div>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="50"
                                    step="0.5"
                                    value={caudal}
                                    onChange={(e) => setCaudal(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-sky-500"
                                />
                                <div className="flex justify-between text-xs text-slate-600 font-medium mt-2">
                                    <span>0.5</span>
                                    <span>10</span>
                                    <span>25</span>
                                    <span>50</span>
                                </div>
                            </div>

                            {/* Turbiedad Input */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-amber-400" />
                                        Turbiedad
                                    </label>
                                    <span className={`text-2xl font-black ${getTurbidityColor()}`}>
                                        {turbiedad} <span className="text-sm text-slate-500">NTU</span>
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    step="1"
                                    value={turbiedad}
                                    onChange={(e) => setTurbiedad(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
                                />
                                <div className="flex justify-between text-xs text-slate-600 font-medium mt-2">
                                    <span>Baja (1)</span>
                                    <span>Media (50)</span>
                                    <span>Alta (100)</span>
                                </div>
                            </div>

                            {/* Calculate Button */}
                            <button
                                onClick={handleCalculate}
                                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group"
                            >
                                <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Calcular Recomendación
                            </button>

                            {/* Results */}
                            {showResults && (
                                <div className="pt-6 border-t border-white/10 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className={`bg-${recommendation.color}-500/10 border border-${recommendation.color}-500/20 rounded-xl p-5`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Tecnología Recomendada</span>
                                        </div>
                                        <h4 className={`text-2xl font-black text-${recommendation.color}-400 mb-2`}>
                                            {recommendation.tech}
                                        </h4>
                                        <p className="text-sm text-slate-400 mb-4">{recommendation.reason}</p>

                                        <div className="grid grid-cols-3 gap-3 mb-4">
                                            <div className="bg-slate-900/60 rounded-lg p-3 text-center">
                                                <p className="text-xs text-slate-500 mb-1">Área Est.</p>
                                                <p className="text-lg font-black text-white">{recommendation.area.toFixed(0)} m²</p>
                                            </div>
                                            <div className="bg-slate-900/60 rounded-lg p-3 text-center">
                                                <p className="text-xs text-slate-500 mb-1">OpEx</p>
                                                <p className="text-lg font-black text-white">${recommendation.opex}</p>
                                            </div>
                                            <div className="bg-slate-900/60 rounded-lg p-3 text-center">
                                                <p className="text-xs text-slate-500 mb-1">Complejidad</p>
                                                <p className="text-lg font-black text-white">{recommendation.complexity}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleStartProject}
                                            className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 group"
                                        >
                                            Iniciar Diseño Completo
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
