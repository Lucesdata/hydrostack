"use client";

import React, { useState, useMemo } from 'react';
import { Compass, Users, Zap, Wrench, ArrowRight, CheckCircle, FileText, Droplets, Sun, BatteryCharging, Mountain } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Technology database matching the real IGST engine
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

// Inline SVG radar chart
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
        return {
            x: cx + r * ratio * Math.cos(rad),
            y: cy + r * ratio * Math.sin(rad),
        };
    };

    const dataPoints = labels.map(l => {
        const val = scores[l.key as keyof typeof scores];
        return toXY(l.angle, val);
    });

    const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

    // Grid rings
    const rings = [25, 50, 75, 100];

    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
            {/* Grid */}
            {rings.map(ring => {
                const rPoints = labels.map(l => toXY(l.angle, ring));
                const rPath = rPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
                return <path key={ring} d={rPath} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />;
            })}

            {/* Axes */}
            {labels.map(l => {
                const end = toXY(l.angle, 100);
                return <line key={l.key} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />;
            })}

            {/* Data polygon */}
            <path d={dataPath} fill="rgba(245, 158, 11, 0.15)" stroke="rgb(245, 158, 11)" strokeWidth="1.5" />

            {/* Data points */}
            {dataPoints.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="rgb(245, 158, 11)" />
            ))}

            {/* Labels */}
            {labels.map(l => {
                const labelPos = toXY(l.angle, 125);
                const val = scores[l.key as keyof typeof scores];
                return (
                    <text key={l.key} x={labelPos.x} y={labelPos.y} textAnchor="middle" dominantBaseline="middle" className="text-[7px] fill-slate-400 font-mono font-bold">
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

    // IGST-like scoring engine (simplified for landing)
    const result = useMemo(() => {
        // Apply modifiers based on inputs
        const modifiers = {
            social: 0,
            economic: 0,
            environmental: 0,
            technical: 0,
        };

        // Source modifiers
        if (source === 'subterranea') {
            modifiers.environmental += 10;
            modifiers.technical -= 5;
        } else if (source === 'lluvia') {
            modifiers.social += 5;
            modifiers.environmental += 15;
            modifiers.economic += 10;
        }

        // Population modifiers (larger = more complex)
        if (population > 5000) {
            modifiers.technical += 10;
            modifiers.economic -= 15;
            modifiers.social -= 10;
        } else if (population > 2000) {
            modifiers.technical += 5;
            modifiers.economic -= 5;
        }

        // Energy modifiers
        if (energy === 'ninguna') {
            modifiers.social += 15;
            modifiers.environmental += 10;
            modifiers.economic += 20;
        } else if (energy === 'solar') {
            modifiers.environmental += 10;
            modifiers.economic += 5;
        }

        // Operator modifiers
        if (operator === 'basico') {
            modifiers.social += 10;
            modifiers.technical -= 10;
        } else if (operator === 'avanzado') {
            modifiers.technical += 15;
            modifiers.social -= 5;
        }

        // Score each technology
        const scored = TECHNOLOGIES.map(tech => {
            const s = {
                social: Math.min(100, Math.max(0, tech.scores.social + modifiers.social)),
                economic: Math.min(100, Math.max(0, tech.scores.economic + modifiers.economic)),
                environmental: Math.min(100, Math.max(0, tech.scores.environmental + modifiers.environmental)),
                technical: Math.min(100, Math.max(0, tech.scores.technical + modifiers.technical)),
            };
            const igst = Math.round((s.social + s.economic + s.environmental + s.technical) / 4);
            return { ...tech, finalScores: s, igst };
        });

        scored.sort((a, b) => b.igst - a.igst);
        return scored[0];
    }, [source, population, energy, operator]);

    const handleCalculate = () => {
        setShowResults(true);
    };

    const handleStartProject = () => {
        router.push('/dashboard/new/introduction');
    };

    return (
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-24 relative overflow-hidden">
            {/* Animated Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px] pointer-events-none animate-grid-flow"></div>

            {/* Radial Gradient Accent */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    {/* Left: Info */}
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono font-medium tracking-wide uppercase mb-6">
                            <Compass className="w-3 h-3" />
                            Motor IGST Multicriterio
                        </div>

                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-6">
                            ¿Qué tecnología necesita tu comunidad?
                        </h2>

                        <p className="text-lg text-slate-300 leading-relaxed mb-8">
                            El motor de selección IGST evalúa <span className="text-amber-400 font-semibold">7 tecnologías</span> en 4 dimensiones para encontrar la solución óptima.
                            Pruébalo ahora y obtén un informe técnico completo.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle className="w-4 h-4 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">Motor IGST multicriterio</p>
                                    <p className="text-sm text-slate-400">4 dimensiones: Sociocultural, Económica, Ambiental, Tecnológica</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">Informe técnico automático</p>
                                    <p className="text-sm text-slate-400">Documento normativo RAS-2000 generado al instante</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle className="w-4 h-4 text-sky-400" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">Sin registro</p>
                                    <p className="text-sm text-slate-400">Prueba el selector gratis, sin compromiso</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Mini Selector Card */}
                    <div className="bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                                <Compass className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white">Selector IGST Rápido</h3>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Evaluación instantánea</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {/* Source Type */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2.5">
                                    <Droplets className="w-3.5 h-3.5 text-sky-400" />
                                    Tipo de Fuente
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {([
                                        { value: 'superficial' as SourceType, label: 'Superficial', icon: Mountain },
                                        { value: 'subterranea' as SourceType, label: 'Subterránea', icon: Droplets },
                                        { value: 'lluvia' as SourceType, label: 'Lluvia', icon: Sun },
                                    ]).map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setSource(opt.value)}
                                            className={`py-2.5 px-2 rounded-xl text-xs font-bold uppercase tracking-wider flex flex-col items-center gap-1.5 transition-all border ${source === opt.value
                                                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-lg shadow-amber-500/10'
                                                : 'bg-slate-800/50 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'
                                                }`}
                                        >
                                            <opt.icon className="w-4 h-4" />
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Population */}
                            <div>
                                <div className="flex items-center justify-between mb-2.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                                        Población
                                    </label>
                                    <span className="text-xl font-black text-white">{population.toLocaleString()} <span className="text-xs text-slate-500">hab</span></span>
                                </div>
                                <input
                                    type="range"
                                    min="100"
                                    max="10000"
                                    step="100"
                                    value={population}
                                    onChange={(e) => setPopulation(parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
                                />
                                <div className="flex justify-between text-xs text-slate-600 font-medium mt-1.5">
                                    <span>100</span>
                                    <span>2,500</span>
                                    <span>5,000</span>
                                    <span>10,000</span>
                                </div>
                            </div>

                            {/* Energy */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2.5">
                                    <BatteryCharging className="w-3.5 h-3.5 text-yellow-400" />
                                    Energía Disponible
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {([
                                        { value: 'red' as EnergyType, label: 'Red Eléctrica' },
                                        { value: 'solar' as EnergyType, label: 'Solar' },
                                        { value: 'ninguna' as EnergyType, label: 'Sin energía' },
                                    ]).map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setEnergy(opt.value)}
                                            className={`py-2 px-2 rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-all border ${energy === opt.value
                                                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                                                : 'bg-slate-800/50 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Operator Level */}
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2.5">
                                    <Wrench className="w-3.5 h-3.5 text-slate-400" />
                                    Nivel del Operador
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {([
                                        { value: 'basico' as OperatorLevel, label: 'Básico' },
                                        { value: 'intermedio' as OperatorLevel, label: 'Intermedio' },
                                        { value: 'avanzado' as OperatorLevel, label: 'Avanzado' },
                                    ]).map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setOperator(opt.value)}
                                            className={`py-2 px-2 rounded-xl text-xs font-bold uppercase tracking-wider text-center transition-all border ${operator === opt.value
                                                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                                                : 'bg-slate-800/50 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Calculate */}
                            <button
                                onClick={handleCalculate}
                                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-black py-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 group"
                            >
                                <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Evaluar Tecnología
                            </button>

                            {/* Results */}
                            {showResults && (
                                <div className="pt-5 border-t border-white/10 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tecnología Recomendada</span>
                                            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">IGST v2.0</span>
                                        </div>
                                        <h4 className="text-xl font-black text-amber-400 mb-0.5">
                                            {result.label}
                                        </h4>
                                        <p className="text-xs text-slate-500 mb-4 font-mono">{result.name}</p>

                                        <div className="grid grid-cols-2 gap-4 items-center">
                                            {/* Score */}
                                            <div className="space-y-3">
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[10px] text-slate-500 font-mono">IGST Score</span>
                                                        <span className="text-lg font-black text-white">{result.igst}</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-700"
                                                            style={{ width: `${result.igst}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                                                    <div className="flex items-center justify-between bg-slate-900/60 rounded px-2 py-1">
                                                        <span className="text-slate-500">SOC</span>
                                                        <span className="text-white font-bold">{result.finalScores.social}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between bg-slate-900/60 rounded px-2 py-1">
                                                        <span className="text-slate-500">ECO</span>
                                                        <span className="text-white font-bold">{result.finalScores.economic}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between bg-slate-900/60 rounded px-2 py-1">
                                                        <span className="text-slate-500">AMB</span>
                                                        <span className="text-white font-bold">{result.finalScores.environmental}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between bg-slate-900/60 rounded px-2 py-1">
                                                        <span className="text-slate-500">TEC</span>
                                                        <span className="text-white font-bold">{result.finalScores.technical}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Radar */}
                                            <div className="w-full aspect-square">
                                                <RadarChart scores={result.finalScores} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-4">
                                            <button
                                                onClick={handleStartProject}
                                                className="bg-amber-500 hover:bg-amber-400 text-white font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs group"
                                            >
                                                <Compass className="w-3.5 h-3.5" />
                                                Selector Completo
                                                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                            <button
                                                onClick={handleStartProject}
                                                className="bg-white/10 hover:bg-white/15 text-slate-200 font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs border border-white/10 group"
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
