'use client';

import React from 'react';
import { Waves, Droplets, CloudRain, Ship } from 'lucide-react';
import type { SourceInputs, WaterSourceType, SeasonalVariability } from '@/types/tech-selector';

const SOURCE_OPTIONS: { value: WaterSourceType; label: string; icon: React.ReactNode; desc: string }[] = [
    { value: 'surface', label: 'Superficial', icon: <Waves className="w-5 h-5" />, desc: 'Ríos, quebradas, embalses' },
    { value: 'groundwater', label: 'Subterránea', icon: <Droplets className="w-5 h-5" />, desc: 'Pozos profundos, manantiales' },
    { value: 'rainwater', label: 'Agua Lluvia', icon: <CloudRain className="w-5 h-5" />, desc: 'Captación pluvial' },
    { value: 'seawater', label: 'Agua de Mar', icon: <Ship className="w-5 h-5" />, desc: 'Salobre o marina (>1000 mg/L TDS)' },
];

const VARIABILITY_OPTIONS: { value: SeasonalVariability; label: string; color: string }[] = [
    { value: 'low', label: 'Baja', color: 'emerald' },
    { value: 'medium', label: 'Media', color: 'yellow' },
    { value: 'high', label: 'Alta', color: 'red' },
];

interface Props {
    data: SourceInputs;
    onChange: (data: SourceInputs) => void;
}

function SliderInput({ label, value, min, max, step, unit, onChange, helpText }: {
    label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void; helpText?: string;
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">{label}</label>
                <span className="text-sm font-bold text-white tabular-nums">
                    {value} <span className="text-slate-500 text-xs font-normal">{unit}</span>
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={e => onChange(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-emerald-500 cursor-pointer [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-emerald-500/30"
            />
            <div className="flex justify-between text-[10px] text-slate-600">
                <span>{min}</span>
                {helpText && <span className="text-slate-500">{helpText}</span>}
                <span>{max}</span>
            </div>
        </div>
    );
}

export default function SelectorStepSource({ data, onChange }: Props) {
    const update = (partial: Partial<SourceInputs>) => onChange({ ...data, ...partial });

    return (
        <div className="space-y-6">
            {/* Source Type Cards (Read-Only) */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider">Tipo de Fuente</label>
                    <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider">
                        Fijado en Fundamentos
                    </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {SOURCE_OPTIONS.map(opt => (
                        <div
                            key={opt.value}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${data.sourceType === opt.value
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/5'
                                : 'bg-white/[0.02] border-white/5 text-slate-600 opacity-50'
                                }`}
                        >
                            <div className={`p-2 rounded-lg ${data.sourceType === opt.value ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                                {opt.icon}
                            </div>
                            <span className="text-sm font-semibold">{opt.label}</span>
                            <span className="text-[10px] text-slate-500 leading-tight">{opt.desc}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sliders Grid */}
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
                <SliderInput
                    label="Turbiedad"
                    value={data.turbidity}
                    min={0} max={500} step={1}
                    unit="NTU"
                    onChange={v => update({ turbidity: v })}
                    helpText="≤2 NTU legal"
                />
                <SliderInput
                    label="Sólidos Disueltos (TDS)"
                    value={data.tds}
                    min={0} max={40000} step={50}
                    unit="mg/L"
                    onChange={v => update({ tds: v })}
                    helpText="≤500 deseable"
                />
                <SliderInput
                    label="Hierro + Manganeso"
                    value={data.ironManganese}
                    min={0} max={10} step={0.1}
                    unit="mg/L"
                    onChange={v => update({ ironManganese: v })}
                    helpText="≤0.3 Fe, ≤0.1 Mn"
                />
                <SliderInput
                    label="Nitratos"
                    value={data.nitrates}
                    min={0} max={100} step={1}
                    unit="mg/L"
                    onChange={v => update({ nitrates: v })}
                    helpText="≤50 OMS"
                />
            </div>

            {/* Binary Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                <div className="flex items-center gap-3">
                    <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">Contaminación Microbiológica</label>
                    <button
                        onClick={() => update({ microbiologicalContamination: !data.microbiologicalContamination })}
                        className={`relative w-11 h-6 rounded-full transition-colors ${data.microbiologicalContamination ? 'bg-red-500/30' : 'bg-white/10'
                            }`}
                    >
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-all ${data.microbiologicalContamination ? 'translate-x-5 bg-red-400' : 'bg-slate-500'
                            }`} />
                    </button>
                    <span className={`text-xs font-bold ${data.microbiologicalContamination ? 'text-red-400' : 'text-slate-500'}`}>
                        {data.microbiologicalContamination ? 'Sí' : 'No'}
                    </span>
                </div>
            </div>

            {/* Seasonal Variability */}
            <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">Variabilidad Estacional</label>
                <div className="flex gap-2">
                    {VARIABILITY_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => update({ seasonalVariability: opt.value })}
                            className={`flex-1 py-2.5 px-4 rounded-xl border text-xs font-bold tracking-wide transition-all ${data.seasonalVariability === opt.value
                                ? opt.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    : opt.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                                : 'bg-white/[0.02] border-white/5 text-slate-500 hover:border-white/10'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
