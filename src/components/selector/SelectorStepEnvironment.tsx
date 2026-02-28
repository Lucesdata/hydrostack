'use client';

import React from 'react';
import type { EnvironmentInputs, LevelOption } from '@/types/tech-selector';

const LEVEL_OPTIONS: { value: LevelOption; label: string }[] = [
    { value: 'low', label: 'Bajo' },
    { value: 'medium', label: 'Medio' },
    { value: 'high', label: 'Alto' },
];

interface Props {
    data: EnvironmentInputs;
    onChange: (data: EnvironmentInputs) => void;
}

function LevelSelector({ label, description, value, onChange }: {
    label: string; description: string; value: LevelOption; onChange: (v: LevelOption) => void
}) {
    return (
        <div className="space-y-2">
            <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider">{label}</label>
                <p className="text-[10px] text-slate-600 mt-0.5">{description}</p>
            </div>
            <div className="flex gap-2">
                {LEVEL_OPTIONS.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-bold tracking-wide transition-all ${value === opt.value
                                ? opt.value === 'low' ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                    : opt.value === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-white/[0.02] border-white/5 text-slate-500 hover:border-white/10'
                            }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function SelectorStepEnvironment({ data, onChange }: Props) {
    const update = (partial: Partial<EnvironmentInputs>) => onChange({ ...data, ...partial });

    return (
        <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
                <LevelSelector
                    label="Aceptación Comunitaria"
                    description="Disposición de la comunidad a adoptar tecnología nueva"
                    value={data.communityAcceptance}
                    onChange={v => update({ communityAcceptance: v })}
                />

                <LevelSelector
                    label="Materiales Locales"
                    description="Disponibilidad de arena, grava, cemento, etc."
                    value={data.localMaterialAvailability}
                    onChange={v => update({ localMaterialAvailability: v })}
                />

                <LevelSelector
                    label="Acceso a Repuestos"
                    description="Facilidad para obtener repuestos especializados"
                    value={data.sparePartsAccess}
                    onChange={v => update({ sparePartsAccess: v })}
                />
            </div>

            {/* Sludge Disposal */}
            <div className="space-y-2">
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Posibilidad de Disposición de Lodos/Salmuera
                </label>
                <p className="text-[10px] text-slate-600">¿Existe un sistema o sitio adecuado para disponer residuos del tratamiento?</p>
                <div className="flex gap-3 mt-2">
                    <button
                        onClick={() => update({ sludgeDisposalPossibility: true })}
                        className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${data.sludgeDisposalPossibility
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-white/[0.02] border-white/5 text-slate-500 hover:border-white/10'
                            }`}
                    >
                        Sí — Disponible
                    </button>
                    <button
                        onClick={() => update({ sludgeDisposalPossibility: false })}
                        className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${!data.sludgeDisposalPossibility
                                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                : 'bg-white/[0.02] border-white/5 text-slate-500 hover:border-white/10'
                            }`}
                    >
                        No — Sin acceso
                    </button>
                </div>
            </div>
        </div>
    );
}
