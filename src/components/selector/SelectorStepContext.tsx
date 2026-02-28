'use client';

import React from 'react';
import { TreePine, Building, Building2, BatteryWarning, Plug, Zap, UserX, User, GraduationCap, Wallet } from 'lucide-react';
import type { ContextInputs, SettlementType, EnergyAvailability, OperatorSkill, BudgetRange } from '@/types/tech-selector';

const SETTLEMENT_OPTIONS: { value: SettlementType; label: string; icon: React.ReactNode; desc: string }[] = [
    { value: 'rural', label: 'Rural', icon: <TreePine className="w-5 h-5" />, desc: 'Comunidad dispersa o concentrada, <2.500 hab' },
    { value: 'semi_rural', label: 'Semi-rural', icon: <Building className="w-5 h-5" />, desc: 'Pequeño municipio, 2.500–12.500 hab' },
    { value: 'urban', label: 'Urbano', icon: <Building2 className="w-5 h-5" />, desc: 'Ciudad o zona metropolitana, >12.500 hab' },
];

const ENERGY_OPTIONS: { value: EnergyAvailability; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'none', label: 'Sin Energía', icon: <BatteryWarning className="w-4 h-4" />, color: 'red' },
    { value: 'intermittent', label: 'Intermitente', icon: <Plug className="w-4 h-4" />, color: 'yellow' },
    { value: 'stable', label: 'Estable', icon: <Zap className="w-4 h-4" />, color: 'emerald' },
];

const OPERATOR_OPTIONS: { value: OperatorSkill; label: string; icon: React.ReactNode }[] = [
    { value: 'none', label: 'Sin Operador', icon: <UserX className="w-4 h-4" /> },
    { value: 'basic', label: 'Básico', icon: <User className="w-4 h-4" /> },
    { value: 'technical', label: 'Técnico', icon: <GraduationCap className="w-4 h-4" /> },
];

const BUDGET_OPTIONS: { value: BudgetRange; label: string; range: string }[] = [
    { value: 'very_low', label: 'Muy Bajo', range: '<$3.500/L/s' },
    { value: 'low', label: 'Bajo', range: '$3.500–7.000/L/s' },
    { value: 'medium', label: 'Medio', range: '$7.000–15.000/L/s' },
    { value: 'high', label: 'Alto', range: '>$15.000/L/s' },
];

interface Props {
    data: ContextInputs;
    onChange: (data: ContextInputs) => void;
}

export default function SelectorStepContext({ data, onChange }: Props) {
    const update = (partial: Partial<ContextInputs>) => onChange({ ...data, ...partial });

    return (
        <div className="space-y-6">
            {/* Settlement Type */}
            <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">Tipo de Asentamiento</label>
                <div className="grid grid-cols-3 gap-3">
                    {SETTLEMENT_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => update({ settlementType: opt.value })}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${data.settlementType === opt.value
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/10'
                                }`}
                        >
                            <div className={`p-2 rounded-lg ${data.settlementType === opt.value ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                                {opt.icon}
                            </div>
                            <span className="text-sm font-semibold">{opt.label}</span>
                            <span className="text-[10px] text-slate-500 leading-tight hidden sm:block">{opt.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Energy Availability */}
            <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">Disponibilidad Energética</label>
                <div className="flex gap-2">
                    {ENERGY_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => update({ energyAvailability: opt.value })}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-xs font-bold transition-all ${data.energyAvailability === opt.value
                                    ? opt.color === 'red' ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                        : opt.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    : 'bg-white/[0.02] border-white/5 text-slate-500 hover:border-white/10'
                                }`}
                        >
                            {opt.icon}
                            <span className="hidden sm:inline">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Operator Skill */}
            <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">Nivel del Operador</label>
                <div className="flex gap-2">
                    {OPERATOR_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => update({ operatorSkill: opt.value })}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-xs font-bold transition-all ${data.operatorSkill === opt.value
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    : 'bg-white/[0.02] border-white/5 text-slate-500 hover:border-white/10'
                                }`}
                        >
                            {opt.icon}
                            <span className="hidden sm:inline">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Budget Range */}
            <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">Rango Presupuestal (CAPEX)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {BUDGET_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => update({ budgetRange: opt.value })}
                            className={`flex flex-col items-center gap-1 py-3 px-3 rounded-xl border text-center transition-all ${data.budgetRange === opt.value
                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                    : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                }`}
                        >
                            <span className={`text-sm font-bold ${data.budgetRange === opt.value ? 'text-emerald-400' : 'text-slate-400'}`}>
                                {opt.label}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{opt.range}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
