'use client';

import React, { useState } from 'react';
import {
    Trophy, Shield, ShieldAlert, ChevronDown, ChevronUp,
    AlertTriangle, CheckCircle, Info, RotateCcw, Sparkles,
    Zap, DollarSign, Leaf, Cpu
} from 'lucide-react';
import type { SelectorResult, ScoredTechnology, IgstWeights } from '@/types/tech-selector';
import RadarChart from './RadarChart';
import TreatmentTrainDiagram from './TreatmentTrainDiagram';

interface Props {
    result: SelectorResult;
    onReset: () => void;
}

const DIMENSION_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    sociocultural: { label: 'Socio-cultural', icon: <Sparkles className="w-3 h-3" />, color: '#f59e0b' },
    economic: { label: 'Económica', icon: <DollarSign className="w-3 h-3" />, color: '#3b82f6' },
    environmental: { label: 'Ambiental', icon: <Leaf className="w-3 h-3" />, color: '#10b981' },
    technological: { label: 'Tecnológica', icon: <Cpu className="w-3 h-3" />, color: '#8b5cf6' },
};

export default function SelectorDashboard({ result, onReset }: Props) {
    const [expandedTech, setExpandedTech] = useState<string | null>(
        result.recommendedTechId || null
    );
    const [selectedForRadar, setSelectedForRadar] = useState<string[]>(() => {
        const viable = result.technologies.filter(t => t.viable);
        return viable.slice(0, 3).map(t => t.profile.id);
    });

    const toggleRadarSelection = (id: string) => {
        setSelectedForRadar(prev => {
            if (prev.includes(id)) return prev.filter(x => x !== id);
            if (prev.length >= 3) return [...prev.slice(1), id]; // max 3
            return [...prev, id];
        });
    };

    const viableCount = result.technologies.filter(t => t.viable).length;
    const discardedCount = result.technologies.filter(t => !t.viable).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                            <Trophy className="w-4 h-4 text-emerald-400" />
                        </div>
                        <h2 className="text-lg font-bold text-white">Resultados del Análisis</h2>
                    </div>
                    <p className="text-xs text-slate-400">
                        <span className="text-emerald-400 font-bold">{viableCount}</span> tecnologías viables ·{' '}
                        <span className="text-red-400 font-bold">{discardedCount}</span> descartadas
                    </p>
                </div>
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-xs text-slate-400 hover:text-white hover:border-white/20 transition-all"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Nuevo Análisis
                </button>
            </div>

            {/* Dynamic IGST Weights Display */}
            <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                <div className="flex items-center gap-2 mb-3">
                    <Cpu className="w-4 h-4 text-blue-400" />
                    <h3 className="text-xs font-mono text-blue-400 uppercase tracking-wider font-bold">Ponderación IA Dinámica</h3>
                    <span className="text-[10px] text-blue-300/70 ml-2 italic">Ajustado según fuente y presupuesto</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(result.weights).map(([key, weight]) => {
                        const dim = DIMENSION_LABELS[key];
                        return (
                            <div key={key} className="flex flex-col gap-1 p-2 rounded-lg bg-white/5 border border-white/5">
                                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                                    <span style={{ color: dim.color }}>{dim.icon}</span>
                                    {dim.label}
                                </span>
                                <span className="text-lg font-black text-white">{Math.round(weight * 100)}%</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* SECTION A: Ranked Technology Table */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                <div className="px-5 py-3 border-b border-white/5">
                    <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Ranking de Tecnologías — IGST</h3>
                </div>
                <div className="divide-y divide-white/[0.03]">
                    {result.technologies.map((tech, idx) => (
                        <TechRow
                            key={tech.profile.id}
                            tech={tech}
                            rank={idx + 1}
                            isExpanded={expandedTech === tech.profile.id}
                            isSelectedForRadar={selectedForRadar.includes(tech.profile.id)}
                            onToggleExpand={() => setExpandedTech(
                                expandedTech === tech.profile.id ? null : tech.profile.id
                            )}
                            onToggleRadar={() => toggleRadarSelection(tech.profile.id)}
                            weights={result.weights}
                        />
                    ))}
                </div>
            </div>

            {/* SECTION B + C: Radar Chart & Treatment Train */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Radar */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                    <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-4">Comparación Multidimensional</h3>
                    <RadarChart
                        entries={result.technologies
                            .filter(t => selectedForRadar.includes(t.profile.id))
                            .map(t => ({
                                label: t.profile.shortName,
                                color: t.profile.color,
                                dimensions: t.dimensions,
                            }))}
                    />
                    <p className="text-[10px] text-slate-600 text-center mt-2">Click en una tecnología del ranking para agregar/quitar del radar (máx. 3)</p>
                </div>

                {/* Treatment Train */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                    <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-4">Tren de Tratamiento Recomendado</h3>
                    {result.treatmentTrain.length > 0 ? (
                        <TreatmentTrainDiagram steps={result.treatmentTrain} />
                    ) : (
                        <p className="text-xs text-slate-500 text-center py-8">Ninguna tecnología viable encontrada</p>
                    )}
                    {result.recommendedTechId && (
                        <div className="mt-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                            <p className="text-[11px] text-slate-400">
                                <span className="text-emerald-400 font-bold">
                                    {result.technologies.find(t => t.recommended)?.profile.name}
                                </span>{' '}
                                — Tren de tratamiento tipo para el contexto evaluado
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════
// Technology Row Component
// ═══════════════════════════════════════════════

function TechRow({ tech, rank, isExpanded, isSelectedForRadar, onToggleExpand, onToggleRadar, weights }: {
    tech: ScoredTechnology;
    rank: number;
    isExpanded: boolean;
    isSelectedForRadar: boolean;
    onToggleExpand: () => void;
    onToggleRadar: () => void;
    weights: IgstWeights;
}) {
    return (
        <div className={`transition-colors ${tech.recommended ? 'bg-emerald-500/[0.03]' : ''}`}>
            {/* Main Row */}
            <div className="flex items-center gap-3 px-5 py-3.5">
                {/* Rank */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black font-mono ${tech.recommended
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : tech.viable
                        ? 'bg-white/5 text-slate-400 border border-white/5'
                        : 'bg-red-500/10 text-red-400/50 border border-red-500/10'
                    }`}>
                    {rank}
                </div>

                {/* Name + viability badge */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <button onClick={onToggleRadar} className="group">
                            <div
                                className={`w-3 h-3 rounded-full border-2 transition-all ${isSelectedForRadar ? 'scale-110' : 'opacity-40 group-hover:opacity-70'
                                    }`}
                                style={{
                                    borderColor: tech.profile.color,
                                    backgroundColor: isSelectedForRadar ? tech.profile.color : 'transparent',
                                }}
                            />
                        </button>
                        <span className={`text-sm font-bold truncate ${tech.viable ? 'text-white' : 'text-slate-500 line-through'}`}>
                            {tech.profile.shortName}
                        </span>
                        {tech.recommended && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono text-emerald-400">
                                <Trophy className="w-2.5 h-2.5" /> RECOMENDADA
                            </span>
                        )}
                        {!tech.viable && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] font-mono text-red-400">
                                <ShieldAlert className="w-2.5 h-2.5" /> NO VIABLE
                            </span>
                        )}
                    </div>
                </div>

                {/* IGST Score */}
                <div className="flex items-center gap-3">
                    {tech.viable && (
                        <div className="hidden sm:flex items-center gap-1.5">
                            <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${tech.igst}%`,
                                        backgroundColor: tech.profile.color,
                                    }}
                                />
                            </div>
                        </div>
                    )}
                    <span className={`text-sm font-mono font-black tabular-nums w-10 text-right ${tech.viable ? 'text-white' : 'text-slate-600'
                        }`}>
                        {tech.viable ? tech.igst : '—'}
                    </span>
                    <button onClick={onToggleExpand} className="p-1 text-slate-500 hover:text-slate-300 transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Expanded Detail */}
            {isExpanded && (
                <div className="px-5 pb-4 space-y-4">
                    {/* Dimension Scores */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Object.entries(tech.dimensions).map(([key, value]) => {
                            const dim = DIMENSION_LABELS[key];
                            const weightPercent = Math.round(weights[key as keyof IgstWeights] * 100);
                            return (
                                <div key={key} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <span style={{ color: dim.color }}>{dim.icon}</span>
                                            <span className="text-[10px] font-mono text-slate-500">{dim.label}</span>
                                        </div>
                                        <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400" title="Peso ponderado del IGST">
                                            {weightPercent}%
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden relative">
                                            <div
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{ width: `${value}%`, backgroundColor: dim.color }}
                                            />
                                        </div>
                                        <span className="text-xs font-mono font-bold text-white tabular-nums">{value}</span>
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 h-0.5 opacity-20" style={{ backgroundColor: dim.color, width: `${weightPercent}%` }} />
                                </div>
                            );
                        })}
                    </div>

                    {/* Viability Filters */}
                    {!tech.viable && (
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider">Filtros Incumplidos</span>
                            {tech.filters.filter(f => !f.passed).map((f, i) => (
                                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10">
                                    <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                    <span className="text-[11px] text-red-300">{f.reason}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Justification Panel */}
                    <div className="space-y-3">
                        {/* Selection Reason */}
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <Info className="w-3 h-3 text-blue-400" />
                                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">Evaluación</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">{tech.justification.selectionReason}</p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                            {/* Risks */}
                            {tech.justification.risks.length > 0 && (
                                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <AlertTriangle className="w-3 h-3 text-yellow-400" />
                                        <span className="text-[10px] font-mono text-yellow-400 uppercase tracking-wider">Riesgos</span>
                                    </div>
                                    <ul className="space-y-1">
                                        {tech.justification.risks.map((r, i) => (
                                            <li key={i} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                                                <span className="text-yellow-400/50 mt-0.5">•</span>
                                                {r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Recommendations */}
                            {tech.justification.operationalRecommendations.length > 0 && (
                                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                                        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Recomendaciones</span>
                                    </div>
                                    <ul className="space-y-1">
                                        {tech.justification.operationalRecommendations.map((r, i) => (
                                            <li key={i} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                                                <span className="text-emerald-400/50 mt-0.5">•</span>
                                                {r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tech Description */}
                    <p className="text-[11px] text-slate-500 italic leading-relaxed border-t border-white/5 pt-3">
                        {tech.profile.description}
                    </p>
                </div>
            )}
        </div>
    );
}
