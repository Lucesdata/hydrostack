"use client";

import { useState, useEffect } from 'react';
import { Check, Brain, Sparkles } from 'lucide-react';

// Agent code lines with typing animation
const agentCodeLines = [
    { type: 'comment', text: '// 🧠 Agente HYDROSTACK analizando...' },
    { type: 'blank', text: '' },
    { type: 'keyword', prefix: 'async ', name: 'function ', value: 'dimensionarFIME', suffix: '(proyecto) {' },
    { type: 'code', prefix: '  const ', name: 'poblacion', value: ' = await calcularProyeccion(2045);' },
    { type: 'code', prefix: '  const ', name: 'QMD', value: ' = poblacion * dotacion * K1;' },
    { type: 'blank', text: '' },
    { type: 'comment', text: '  // Validando normativa RAS-2000...' },
    { type: 'code', prefix: '  const ', name: 'fgdi', value: ' = diseñarFiltroGrueso(QMD);' },
    { type: 'code', prefix: '  const ', name: 'fla', value: ' = diseñarFiltroLento(QMD);' },
    { type: 'blank', text: '' },
    { type: 'validation', prefix: '  if (', condition: 'cumpleNormativa(fgdi, fla)', suffix: ') {' },
    { type: 'success', text: '    return generarGemeloDigital();' },
    { type: 'close', text: '  }' },
    { type: 'close', text: '}' },
];

export default function FeaturesSection() {
    const [visibleLines, setVisibleLines] = useState(0);
    const [currentChar, setCurrentChar] = useState(0);
    const [isTyping, setIsTyping] = useState(true);
    const [showBadges, setShowBadges] = useState(false);

    useEffect(() => {
        if (!isTyping) return;

        const totalLines = agentCodeLines.length;

        if (visibleLines < totalLines) {
            const timeout = setTimeout(() => {
                setVisibleLines(prev => prev + 1);
            }, 150);
            return () => clearTimeout(timeout);
        } else {
            // Avoid calling setState synchronously
            const initialTimeout = setTimeout(() => {
                setShowBadges(true);
            }, 0);

            // Reset after pause
            const resetTimeout = setTimeout(() => {
                setVisibleLines(0);
                setShowBadges(false);
            }, 5000);

            return () => {
                clearTimeout(initialTimeout);
                clearTimeout(resetTimeout);
            };
        }
    }, [visibleLines, isTyping]);

    const renderLine = (line: typeof agentCodeLines[0], index: number) => {
        const isVisible = index < visibleLines;
        if (!isVisible) return null;

        switch (line.type) {
            case 'comment':
                return (
                    <div key={index} className="text-slate-500 animate-fadeIn">
                        {line.text}
                    </div>
                );
            case 'blank':
                return <div key={index} className="h-4"></div>;
            case 'keyword':
                return (
                    <div key={index} className="animate-fadeIn">
                        <span className="text-purple-400">{line.prefix}</span>
                        <span className="text-sky-400">{line.name}</span>
                        <span className="text-yellow-300">{line.value}</span>
                        <span className="text-slate-300">{line.suffix}</span>
                    </div>
                );
            case 'code':
                return (
                    <div key={index} className="animate-fadeIn">
                        <span className="text-purple-400">{line.prefix}</span>
                        <span className="text-sky-300">{line.name}</span>
                        <span className="text-slate-300">{line.value}</span>
                    </div>
                );
            case 'validation':
                return (
                    <div key={index} className="animate-fadeIn">
                        <span className="text-purple-400">{line.prefix}</span>
                        <span className="text-emerald-400">{line.condition}</span>
                        <span className="text-slate-300">{line.suffix}</span>
                    </div>
                );
            case 'success':
                return (
                    <div key={index} className="animate-fadeIn text-emerald-400">
                        {line.text}
                    </div>
                );
            case 'close':
                return (
                    <div key={index} className="animate-fadeIn text-slate-300">
                        {line.text}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <section id="features" className="bg-slate-50 py-24 font-sans">
            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                <div>
                    <span className="inline-block bg-white border border-slate-200 text-slate-800 text-xs font-semibold px-3 py-1 rounded-full mb-6 shadow-sm">
                        AGENTE DE INGENIERÍA IA
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-slate-900 tracking-tight leading-tight mb-6">
                        El copiloto que dimensiona con criterio normativo.
                    </h2>
                    <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                        Hydrostack traduce datos de calidad de agua cruda en diseños de procesos validados, completando perfiles hidráulicos, listas de materiales y validación normativa automáticamente.
                    </p>

                    <div className="space-y-5">
                        <div className="flex items-start gap-4">
                            <div className="bg-emerald-500 rounded-lg p-1.5 mt-1">
                                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                            </div>
                            <div>
                                <span className="text-lg text-slate-900 font-medium block">Matriz de Selección FIME</span>
                                <span className="text-sm text-slate-500">Algoritmo de decisión basado en turbiedad, color y coliformes para sugerir la tecnología óptima.</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-emerald-500 rounded-lg p-1.5 mt-1">
                                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                            </div>
                            <div>
                                <span className="text-lg text-slate-900 font-medium block">Gemelos Digitales</span>
                                <span className="text-sm text-slate-500">Modelos virtuales de plantas reales para simulación y optimización continua.</span>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-emerald-500 rounded-lg p-1.5 mt-1">
                                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                            </div>
                            <div>
                                <span className="text-lg text-slate-900 font-medium block">Validación Normativa</span>
                                <span className="text-sm text-slate-500">Cumplimiento automático de RAS-2000 y lineamientos CINARA.</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    {/* Animated Code Terminal */}
                    <div className="rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-800">
                        {/* Terminal Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                                <Brain className="w-4 h-4 text-emerald-400" />
                                <span>agente_hydrostack.ts</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                                <span className="text-xs text-amber-400 font-mono">Ejecutando...</span>
                            </div>
                        </div>

                        {/* Code Content */}
                        <div className="p-6 font-mono text-sm leading-relaxed min-h-[320px]">
                            {agentCodeLines.map((line, index) => renderLine(line, index))}

                            {/* Cursor */}
                            {visibleLines < agentCodeLines.length && (
                                <span className="inline-block w-2 h-5 bg-emerald-400 animate-pulse ml-1"></span>
                            )}
                        </div>

                        {/* Status Badges */}
                        <div className={`px-6 pb-6 flex gap-3 transition-opacity duration-500 ${showBadges ? 'opacity-100' : 'opacity-0'}`}>
                            <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5" />
                                CUMPLE RAS-2000
                            </span>
                            <span className="bg-sky-500/20 text-sky-400 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                GEMELO GENERADO
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
