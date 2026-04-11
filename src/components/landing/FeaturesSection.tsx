"use client";

import { useState, useEffect } from 'react';
import { Check, Brain, Sparkles } from 'lucide-react';

const agentCodeLines = [
    { type: 'comment', text: '// Motor IGST evaluando tecnologías...' },
    { type: 'blank', text: '' },
    { type: 'keyword', prefix: 'async ', name: 'function ', value: 'evaluarIGST', suffix: '(proyecto) {' },
    { type: 'code', prefix: '  const ', name: 'fuente', value: ' = analizarFuente(tipo, calidad);' },
    { type: 'code', prefix: '  const ', name: 'viable', value: ' = filtrarViabilidad(energia, operador);' },
    { type: 'blank', text: '' },
    { type: 'comment', text: '  // Calculando 4 dimensiones IGST...' },
    { type: 'code', prefix: '  const ', name: 'scores', value: ' = calcularIGST(social, econ, amb, tec);' },
    { type: 'code', prefix: '  const ', name: 'ranking', value: ' = ordenarPorScore(viable, scores);' },
    { type: 'blank', text: '' },
    { type: 'validation', prefix: '  if (', condition: 'ranking[0].igst > 80', suffix: ') {' },
    { type: 'success', text: '    return generarInforme(ranking[0]);' },
    { type: 'close', text: '  }' },
    { type: 'close', text: '}' },
];

const features = [
    {
        tag: 'IGST',
        title: 'Motor IGST Multicriterio',
        description: 'Evalúa 7 tecnologías en 4 dimensiones: Sociocultural, Económica, Ambiental y Tecnológica.',
        color: 'var(--amber-500)',
    },
    {
        tag: 'INFORME',
        title: 'Informe Técnico Automático',
        description: 'Documento normativo completo con memorias de cálculo, granulometría y protocolos O&M.',
        color: 'var(--teal-500)',
    },
    {
        tag: 'NORMA',
        title: 'Validación Normativa',
        description: 'Cumplimiento automático de RAS-2000 y lineamientos CINARA.',
        color: 'var(--sky-400)',
    },
];

export default function FeaturesSection() {
    const [visibleLines, setVisibleLines] = useState(0);
    const [showBadges, setShowBadges] = useState(false);

    useEffect(() => {
        const totalLines = agentCodeLines.length;
        if (visibleLines < totalLines) {
            const t = setTimeout(() => setVisibleLines(prev => prev + 1), 150);
            return () => clearTimeout(t);
        } else {
            const t1 = setTimeout(() => setShowBadges(true), 0);
            const t2 = setTimeout(() => { setVisibleLines(0); setShowBadges(false); }, 5000);
            return () => { clearTimeout(t1); clearTimeout(t2); };
        }
    }, [visibleLines]);

    const renderLine = (line: typeof agentCodeLines[0], index: number) => {
        if (index >= visibleLines) return null;
        switch (line.type) {
            case 'comment':
                return <div key={index} className="animate-fadeIn" style={{ color: '#4a7a6e' }}>{line.text}</div>;
            case 'blank':
                return <div key={index} className="h-3" />;
            case 'keyword':
                return (
                    <div key={index} className="animate-fadeIn">
                        <span style={{ color: '#c792ea' }}>{line.prefix}</span>
                        <span style={{ color: '#82aaff' }}>{line.name}</span>
                        <span style={{ color: '#ffcb6b' }}>{line.value}</span>
                        <span style={{ color: '#e8f4f8' }}>{line.suffix}</span>
                    </div>
                );
            case 'code':
                return (
                    <div key={index} className="animate-fadeIn">
                        <span style={{ color: '#c792ea' }}>{line.prefix}</span>
                        <span style={{ color: '#89ddff' }}>{line.name}</span>
                        <span style={{ color: '#7ba3b8' }}>{line.value}</span>
                    </div>
                );
            case 'validation':
                return (
                    <div key={index} className="animate-fadeIn">
                        <span style={{ color: '#c792ea' }}>{line.prefix}</span>
                        <span style={{ color: 'var(--teal-400)' }}>{line.condition}</span>
                        <span style={{ color: '#e8f4f8' }}>{line.suffix}</span>
                    </div>
                );
            case 'success':
                return <div key={index} className="animate-fadeIn" style={{ color: 'var(--teal-400)' }}>{line.text}</div>;
            case 'close':
                return <div key={index} className="animate-fadeIn" style={{ color: '#e8f4f8' }}>{line.text}</div>;
            default:
                return null;
        }
    };

    return (
        <section
            id="features"
            className="relative py-28 overflow-hidden"
            style={{ background: 'var(--ocean-950)' }}
        >
            {/* Wave pattern background */}
            <div className="absolute inset-0 bg-wave-lines animate-wave-flow pointer-events-none" style={{ opacity: 0.6 }} />

            <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(0,200,168,0.2), transparent)' }}
            />

            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">

                {/* Left: Features */}
                <div>
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase mb-8"
                        style={{
                            border: '1px solid rgba(0,200,168,0.2)',
                            background: 'rgba(0,200,168,0.06)',
                            color: 'var(--teal-400)',
                        }}
                    >
                        <Brain className="w-3.5 h-3.5" />
                        Agente de Ingeniería IA
                    </div>

                    <h2
                        className="font-display font-bold leading-tight mb-6"
                        style={{
                            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                            color: 'var(--text-primary)',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        El copiloto que dimensiona<br />
                        con{' '}
                        <em style={{ color: 'var(--teal-400)', fontStyle: 'italic' }}>
                            criterio normativo.
                        </em>
                    </h2>

                    <p
                        className="text-base leading-relaxed mb-10"
                        style={{ color: 'var(--text-secondary)', maxWidth: '42ch' }}
                    >
                        Hydrostack traduce datos de calidad de agua cruda en diseños validados,
                        perfiles hidráulicos y validación normativa automática.
                    </p>

                    <div className="space-y-6">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-start gap-5 group">
                                <div
                                    className="flex items-center justify-center shrink-0 w-9 h-9 rounded-lg text-xs font-mono font-semibold mt-0.5 transition-all duration-300 group-hover:scale-110"
                                    style={{
                                        background: 'rgba(0,200,168,0.08)',
                                        border: `1px solid ${f.color}30`,
                                        color: f.color,
                                    }}
                                >
                                    <Check className="w-4 h-4" style={{ color: f.color }} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span
                                            className="text-xs font-mono tracking-widest"
                                            style={{ color: f.color }}
                                        >
                                            {f.tag}
                                        </span>
                                    </div>
                                    <p
                                        className="font-semibold text-base mb-1"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        {f.title}
                                    </p>
                                    <p
                                        className="text-sm leading-relaxed"
                                        style={{ color: 'var(--text-secondary)' }}
                                    >
                                        {f.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Terminal */}
                <div className="relative">
                    <div
                        className="rounded-2xl overflow-hidden shadow-2xl"
                        style={{
                            background: '#0a0f1a',
                            border: '1px solid rgba(0,200,168,0.15)',
                            boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,200,168,0.05)',
                        }}
                    >
                        {/* Terminal header */}
                        <div
                            className="flex items-center justify-between px-4 py-3"
                            style={{
                                background: '#070d18',
                                borderBottom: '1px solid rgba(0,200,168,0.1)',
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                                <div className="w-3 h-3 rounded-full" style={{ background: 'var(--teal-500)', opacity: 0.7 }} />
                            </div>
                            <div
                                className="flex items-center gap-2 text-xs"
                                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                            >
                                <Brain className="w-3.5 h-3.5" style={{ color: 'var(--teal-400)' }} />
                                agente_hydrostack.ts
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Sparkles
                                    className="w-3.5 h-3.5 animate-pulse"
                                    style={{ color: 'var(--amber-500)' }}
                                />
                                <span
                                    className="text-xs"
                                    style={{ color: 'var(--amber-500)', fontFamily: 'var(--font-mono)' }}
                                >
                                    Ejecutando...
                                </span>
                            </div>
                        </div>

                        {/* Code */}
                        <div
                            className="p-6 text-sm leading-relaxed min-h-[300px]"
                            style={{ fontFamily: 'var(--font-mono)' }}
                        >
                            {agentCodeLines.map((line, index) => renderLine(line, index))}
                            {visibleLines < agentCodeLines.length && (
                                <span
                                    className="inline-block w-2 h-4 ml-1 animate-pulse"
                                    style={{ background: 'var(--teal-500)', borderRadius: '1px' }}
                                />
                            )}
                        </div>

                        {/* Badges */}
                        <div
                            className={`px-6 pb-5 flex gap-3 transition-opacity duration-500 ${showBadges ? 'opacity-100' : 'opacity-0'}`}
                        >
                            <span
                                className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
                                style={{
                                    background: 'rgba(240,168,50,0.1)',
                                    border: '1px solid rgba(240,168,50,0.2)',
                                    color: 'var(--amber-500)',
                                    fontFamily: 'var(--font-mono)',
                                }}
                            >
                                <Check className="w-3.5 h-3.5" />
                                IGST SCORE: 93
                            </span>
                            <span
                                className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
                                style={{
                                    background: 'rgba(0,200,168,0.08)',
                                    border: '1px solid rgba(0,200,168,0.2)',
                                    color: 'var(--teal-400)',
                                    fontFamily: 'var(--font-mono)',
                                }}
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                INFORME GENERADO
                            </span>
                        </div>
                    </div>

                    {/* Decorative glow under terminal */}
                    <div
                        className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-16 pointer-events-none"
                        style={{
                            background: 'radial-gradient(ellipse, rgba(0,200,168,0.12) 0%, transparent 70%)',
                            filter: 'blur(12px)',
                        }}
                    />
                </div>
            </div>
        </section>
    );
}
