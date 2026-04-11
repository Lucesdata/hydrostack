"use client";

import React, { useState, useMemo } from 'react';
import { Compass, Users, Zap, Wrench, ArrowRight, CheckCircle, FileText, Droplets, Sun, BatteryCharging, Mountain } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TECHNOLOGIES = [
    { name: 'FLA', label: 'Filtración Lenta en Arena', scores: { social: 95, economic: 90, environmental: 95, technical: 80 } },
    { name: 'FIME', label: 'Filtración en Múltiples Etapas', scores: { social: 85, economic: 75, environmental: 90, technical: 90 } },
    { name: 'FGDi+FLA', label: 'Prefiltro Dinámico + FLA', scores: { social: 80, economic: 70, environmental: 85, technical: 85 } },
    { name: 'Convencional', label: 'Planta Convencional', scores: { social: 50, economic: 40, environmental: 55, technical: 95 } },
    { name: 'Aireación+FLA', label: 'Aireación + Filtración Lenta', scores: { social: 75, economic: 65, environmental: 85, technical: 70 } },
    { name: 'FGAC', label: 'Filtro Grueso Ascendente', scores: { social: 80, economic: 78, environmental: 88, technical: 75 } },
    { name: 'Desarenador+FLA', label: 'Desarenador + FLA', scores: { social: 88, economic: 82, environmental: 92, technical: 72 } },
];

type SourceType = 'superficial' | 'subterranea' | 'lluvia';
type EnergyType = 'red' | 'solar' | 'ninguna';
type OperatorLevel = 'basico' | 'intermedio' | 'avanzado';

const RadarChart = ({ scores }: { scores: { social: number; economic: number; environmental: number; technical: number } }) => {
    const size = 140;
    const cx = size / 2;
    const cy = size / 2;
    const r = 50;

    const labels = [
        { key: 'social', label: 'SOC', angle: -90 },
        { key: 'economic', label: 'ECO', angle: 0 },
        { key: 'environmental', label: 'AMB', angle: 90 },
        { key: 'technical', label: 'TEC', angle: 180 },
    ];

    const toXY = (angle: number, value: number) => {
        const rad = (angle * Math.PI) / 180;
        const ratio = value / 100;
        return { x: cx + r * ratio * Math.cos(rad), y: cy + r * ratio * Math.sin(rad) };
    };

    const dataPoints = labels.map(l => toXY(l.angle, scores[l.key as keyof typeof scores]));
    const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
    const rings = [25, 50, 75, 100];

    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
            {rings.map(ring => {
                const rPath = labels.map((l, i) => {
                    const p = toXY(l.angle, ring);
                    return `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`;
                }).join(' ') + 'Z';
                return <path key={ring} d={rPath} fill="none" stroke="rgba(0,200,168,0.12)" strokeWidth="0.5" />;
            })}
            {labels.map(l => {
                const end = toXY(l.angle, 100);
                return <line key={l.key} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(0,200,168,0.15)" strokeWidth="0.5" />;
            })}
            <path d={dataPath} fill="rgba(240,168,50,0.12)" stroke="rgb(240,168,50)" strokeWidth="1.5" />
            {dataPoints.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="rgb(240,168,50)" />
            ))}
            {labels.map(l => {
                const labelPos = toXY(l.angle, 125);
                return (
                    <text key={l.key} x={labelPos.x} y={labelPos.y} textAnchor="middle" dominantBaseline="middle"
                        style={{ fontSize: '7px', fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {l.label}
                    </text>
                );
            })}
        </svg>
    );
};

export default function PreDesignCalculator() {
    const router = useRouter();
    const [source, setSource] = useState<SourceType>('superficial');
    const [population, setPopulation] = useState(1200);
    const [energy, setEnergy] = useState<EnergyType>('red');
    const [operator, setOperator] = useState<OperatorLevel>('basico');
    const [showResults, setShowResults] = useState(false);

    const result = useMemo(() => {
        const mod = { social: 0, economic: 0, environmental: 0, technical: 0 };
        if (source === 'subterranea') { mod.environmental += 10; mod.technical -= 5; }
        else if (source === 'lluvia') { mod.social += 5; mod.environmental += 15; mod.economic += 10; }
        if (population > 5000) { mod.technical += 10; mod.economic -= 15; mod.social -= 10; }
        else if (population > 2000) { mod.technical += 5; mod.economic -= 5; }
        if (energy === 'ninguna') { mod.social += 15; mod.environmental += 10; mod.economic += 20; }
        else if (energy === 'solar') { mod.environmental += 10; mod.economic += 5; }
        if (operator === 'basico') { mod.social += 10; mod.technical -= 10; }
        else if (operator === 'avanzado') { mod.technical += 15; mod.social -= 5; }

        const scored = TECHNOLOGIES.map(tech => {
            const s = {
                social: Math.min(100, Math.max(0, tech.scores.social + mod.social)),
                economic: Math.min(100, Math.max(0, tech.scores.economic + mod.economic)),
                environmental: Math.min(100, Math.max(0, tech.scores.environmental + mod.environmental)),
                technical: Math.min(100, Math.max(0, tech.scores.technical + mod.technical)),
            };
            return { ...tech, finalScores: s, igst: Math.round((s.social + s.economic + s.environmental + s.technical) / 4) };
        });
        scored.sort((a, b) => b.igst - a.igst);
        return scored[0];
    }, [source, population, energy, operator]);

    const handleStartProject = () => router.push('/dashboard/new/introduction');

    const selBtn = (active: boolean) => ({
        padding: '10px 8px',
        borderRadius: '0.6rem',
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase' as const,
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s',
        border: active ? '1px solid rgba(240,168,50,0.5)' : '1px solid rgba(0,200,168,0.1)',
        background: active ? 'rgba(240,168,50,0.1)' : 'rgba(0,200,168,0.03)',
        color: active ? 'var(--amber-400)' : 'var(--text-muted)',
        cursor: 'pointer',
    });

    return (
        <section
            className="relative py-28 overflow-hidden"
            style={{ background: 'var(--ocean-900)' }}
        >
            {/* Background */}
            <div className="absolute inset-0 bg-grid-ocean pointer-events-none" />
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(240,168,50,0.04) 0%, transparent 65%)', borderRadius: '50%', filter: 'blur(40px)' }}
            />
            <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(0,200,168,0.2), transparent)' }}
            />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-14 items-center">

                    {/* Left info */}
                    <div>
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase mb-8"
                            style={{
                                border: '1px solid rgba(240,168,50,0.25)',
                                background: 'rgba(240,168,50,0.06)',
                                color: 'var(--amber-400)',
                            }}
                        >
                            <Compass className="w-3.5 h-3.5" />
                            Motor IGST Multicriterio
                        </div>

                        <h2
                            className="font-display font-bold leading-tight mb-6"
                            style={{
                                fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                                color: 'var(--text-primary)',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            ¿Qué tecnología<br />
                            necesita tu{' '}
                            <em style={{ color: 'var(--amber-400)', fontStyle: 'italic' }}>comunidad?</em>
                        </h2>

                        <p
                            className="text-base leading-relaxed mb-10"
                            style={{ color: 'var(--text-secondary)', maxWidth: '42ch' }}
                        >
                            El motor de selección IGST evalúa{' '}
                            <span style={{ color: 'var(--amber-400)', fontWeight: 600 }}>7 tecnologías</span>{' '}
                            en 4 dimensiones para encontrar la solución óptima.
                        </p>

                        <div className="space-y-5">
                            {[
                                { icon: CheckCircle, color: 'var(--amber-400)', title: 'Motor IGST multicriterio', sub: '4 dimensiones: Sociocultural, Económica, Ambiental, Tecnológica' },
                                { icon: CheckCircle, color: 'var(--teal-500)', title: 'Informe técnico automático', sub: 'Documento normativo RAS-2000 generado al instante' },
                                { icon: CheckCircle, color: 'var(--sky-400)', title: 'Sin registro', sub: 'Prueba el selector gratis, sin compromiso' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                                        style={{ background: `${item.color}12`, border: `1px solid ${item.color}30` }}
                                    >
                                        <item.icon className="w-4 h-4" style={{ color: item.color }} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Selector card */}
                    <div
                        className="rounded-2xl p-7"
                        style={{
                            background: 'var(--ocean-950)',
                            border: '1px solid rgba(0,200,168,0.12)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                        }}
                    >
                        {/* Card header */}
                        <div className="flex items-center gap-3 mb-7">
                            <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: 'rgba(240,168,50,0.12)', border: '1px solid rgba(240,168,50,0.25)' }}
                            >
                                <Compass className="w-5 h-5" style={{ color: 'var(--amber-400)' }} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Selector IGST Rápido</h3>
                                <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>// evaluación instantánea</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {/* Source Type */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase mb-2.5" style={{ color: 'var(--text-muted)' }}>
                                    <Droplets className="w-3.5 h-3.5" style={{ color: 'var(--sky-400)' }} />
                                    Tipo de Fuente
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {([
                                        { value: 'superficial' as SourceType, label: 'Superficial', icon: Mountain },
                                        { value: 'subterranea' as SourceType, label: 'Subterránea', icon: Droplets },
                                        { value: 'lluvia' as SourceType, label: 'Lluvia', icon: Sun },
                                    ]).map(opt => (
                                        <button key={opt.value} onClick={() => setSource(opt.value)} style={selBtn(source === opt.value)}>
                                            <opt.icon className="w-4 h-4" />
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Population */}
                            <div>
                                <div className="flex items-center justify-between mb-2.5">
                                    <label className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                                        <Users className="w-3.5 h-3.5" style={{ color: 'var(--teal-400)' }} />
                                        Población
                                    </label>
                                    <span className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                                        {population.toLocaleString()} <span className="text-xs font-sans" style={{ color: 'var(--text-muted)' }}>hab</span>
                                    </span>
                                </div>
                                <input
                                    type="range" min="100" max="10000" step="100" value={population}
                                    onChange={e => setPopulation(parseInt(e.target.value))}
                                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                                    style={{ background: `linear-gradient(to right, var(--teal-500) ${(population / 10000) * 100}%, rgba(0,200,168,0.12) 0%)`, accentColor: 'var(--teal-500)' }}
                                />
                                <div className="flex justify-between text-xs mt-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                    <span>100</span><span>2,500</span><span>5,000</span><span>10,000</span>
                                </div>
                            </div>

                            {/* Energy */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase mb-2.5" style={{ color: 'var(--text-muted)' }}>
                                    <BatteryCharging className="w-3.5 h-3.5" style={{ color: 'var(--amber-400)' }} />
                                    Energía Disponible
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {([
                                        { value: 'red' as EnergyType, label: 'Red Eléctrica' },
                                        { value: 'solar' as EnergyType, label: 'Solar' },
                                        { value: 'ninguna' as EnergyType, label: 'Sin energía' },
                                    ]).map(opt => (
                                        <button key={opt.value} onClick={() => setEnergy(opt.value)}
                                            style={{ ...selBtn(energy === opt.value), flexDirection: 'row', justifyContent: 'center' }}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Operator */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase mb-2.5" style={{ color: 'var(--text-muted)' }}>
                                    <Wrench className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                                    Nivel del Operador
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {([
                                        { value: 'basico' as OperatorLevel, label: 'Básico' },
                                        { value: 'intermedio' as OperatorLevel, label: 'Intermedio' },
                                        { value: 'avanzado' as OperatorLevel, label: 'Avanzado' },
                                    ]).map(opt => (
                                        <button key={opt.value} onClick={() => setOperator(opt.value)}
                                            style={{ ...selBtn(operator === opt.value), flexDirection: 'row', justifyContent: 'center' }}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Evaluate */}
                            <button
                                onClick={() => setShowResults(true)}
                                className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 group"
                                style={{
                                    background: 'var(--amber-500)',
                                    color: 'var(--ocean-950)',
                                    boxShadow: '0 4px 20px rgba(240,168,50,0.25)',
                                }}
                            >
                                <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                Evaluar Tecnología
                            </button>

                            {/* Results */}
                            {showResults && (
                                <div
                                    className="pt-5 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
                                    style={{ borderTop: '1px solid rgba(0,200,168,0.1)' }}
                                >
                                    <div
                                        className="rounded-xl p-5"
                                        style={{
                                            background: 'rgba(240,168,50,0.05)',
                                            border: '1px solid rgba(240,168,50,0.2)',
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-mono tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                                                Tecnología Recomendada
                                            </span>
                                            <span
                                                className="text-xs font-mono px-2 py-0.5 rounded-full"
                                                style={{ background: 'rgba(240,168,50,0.1)', color: 'var(--amber-400)', border: '1px solid rgba(240,168,50,0.2)' }}
                                            >
                                                IGST v2.0
                                            </span>
                                        </div>
                                        <h4
                                            className="font-display font-bold text-xl mb-0.5"
                                            style={{ color: 'var(--amber-400)' }}
                                        >
                                            {result.label}
                                        </h4>
                                        <p className="text-xs font-mono mb-4" style={{ color: 'var(--text-muted)' }}>{result.name}</p>

                                        <div className="grid grid-cols-2 gap-4 items-center">
                                            <div className="space-y-3">
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>IGST Score</span>
                                                        <span className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{result.igst}</span>
                                                    </div>
                                                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,200,168,0.1)' }}>
                                                        <div
                                                            className="h-full rounded-full transition-all duration-700"
                                                            style={{ width: `${result.igst}%`, background: 'linear-gradient(90deg, var(--amber-500), var(--amber-400))' }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-1.5 text-xs">
                                                    {[
                                                        ['SOC', result.finalScores.social],
                                                        ['ECO', result.finalScores.economic],
                                                        ['AMB', result.finalScores.environmental],
                                                        ['TEC', result.finalScores.technical],
                                                    ].map(([label, val]) => (
                                                        <div
                                                            key={label as string}
                                                            className="flex items-center justify-between px-2 py-1 rounded"
                                                            style={{ background: 'rgba(0,200,168,0.04)', border: '1px solid rgba(0,200,168,0.08)' }}
                                                        >
                                                            <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{label}</span>
                                                            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{val}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="w-full aspect-square">
                                                <RadarChart scores={result.finalScores} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                            <button
                                                onClick={handleStartProject}
                                                className="py-2.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all group"
                                                style={{ background: 'var(--amber-500)', color: 'var(--ocean-950)' }}
                                            >
                                                <Compass className="w-3.5 h-3.5" />
                                                Selector Completo
                                                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                            <button
                                                onClick={handleStartProject}
                                                className="py-2.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all group"
                                                style={{
                                                    background: 'rgba(0,200,168,0.05)',
                                                    border: '1px solid rgba(0,200,168,0.15)',
                                                    color: 'var(--text-secondary)',
                                                }}
                                            >
                                                <FileText className="w-3.5 h-3.5" />
                                                Ver Informe
                                                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                        </div>
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
