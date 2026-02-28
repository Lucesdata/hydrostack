'use client';

import React from 'react';
import type { DesignInputs, QualityTarget } from '@/types/tech-selector';

const QUALITY_TARGETS: { value: QualityTarget; label: string; desc: string }[] = [
    { value: 'who', label: 'OMS', desc: 'Guías de la OMS para calidad de agua potable' },
    { value: 'national', label: 'Nacional', desc: 'Resolución 2115/2007 (Colombia) — Decreto 1575' },
    { value: 'custom', label: 'Personalizado', desc: 'Valores objetivo definidos por el ingeniero' },
];

interface Props {
    data: DesignInputs;
    onChange: (data: DesignInputs) => void;
}

export default function SelectorStepDesign({ data, onChange }: Props) {
    const update = (partial: Partial<DesignInputs>) => onChange({ ...data, ...partial });

    return (
        <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
                {/* Flow Rate */}
                <div className="space-y-2">
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider">Caudal de Diseño</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={data.flowRate}
                            onChange={e => update({ flowRate: parseFloat(e.target.value) || 0 })}
                            min={0.1}
                            max={1000}
                            step={0.1}
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm font-mono focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">L/s</span>
                    </div>
                    <p className="text-[10px] text-slate-600">Caudal máximo diario de diseño</p>
                </div>

                {/* Population */}
                <div className="space-y-2">
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider">Población Servida</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={data.population}
                            onChange={e => update({ population: parseInt(e.target.value) || 0 })}
                            min={10}
                            max={500000}
                            step={100}
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm font-mono focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">hab</span>
                    </div>
                    <p className="text-[10px] text-slate-600">Población de diseño al año horizonte</p>
                </div>

                {/* Peak Factor */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider">Factor Pico (K₁)</label>
                        <span className="text-sm font-bold text-white tabular-nums">{data.peakFactor.toFixed(1)}</span>
                    </div>
                    <input
                        type="range"
                        min={1.0}
                        max={3.0}
                        step={0.1}
                        value={data.peakFactor}
                        onChange={e => update({ peakFactor: parseFloat(e.target.value) })}
                        className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-emerald-500 cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-emerald-500/30"
                    />
                    <div className="flex justify-between text-[10px] text-slate-600">
                        <span>1.0</span>
                        <span className="text-slate-500">Res. 0330: K₁ rural ≈ 1.3</span>
                        <span>3.0</span>
                    </div>
                </div>
            </div>

            {/* Quality Target */}
            <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">Norma de Calidad Objetivo</label>
                <div className="grid sm:grid-cols-3 gap-3">
                    {QUALITY_TARGETS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => update({ qualityTarget: opt.value })}
                            className={`flex flex-col gap-1.5 p-4 rounded-xl border text-left transition-all ${data.qualityTarget === opt.value
                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                    : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                }`}
                        >
                            <span className={`text-sm font-bold ${data.qualityTarget === opt.value ? 'text-emerald-400' : 'text-slate-300'}`}>
                                {opt.label}
                            </span>
                            <span className="text-[10px] text-slate-500 leading-tight">{opt.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Computed estimate hint */}
            {data.flowRate > 0 && data.population > 0 && (
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-slate-400">
                    <span className="text-emerald-400 font-mono font-bold">≈ {((data.flowRate * 86400) / data.population).toFixed(0)}</span>{' '}
                    L/hab/día — Dotación bruta estimada
                </div>
            )}
        </div>
    );
}
