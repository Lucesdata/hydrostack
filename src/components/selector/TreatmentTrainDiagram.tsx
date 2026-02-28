'use client';

import React from 'react';
import type { TreatmentTrainStep } from '@/types/tech-selector';

interface Props {
    steps: TreatmentTrainStep[];
}

export default function TreatmentTrainDiagram({ steps }: Props) {
    if (steps.length === 0) return null;

    return (
        <div className="space-y-3">
            {/* Horizontal pipeline */}
            <div className="overflow-x-auto pb-2">
                <div className="flex items-center gap-0 min-w-max px-2">
                    {steps.map((step, i) => (
                        <React.Fragment key={i}>
                            {/* Step Box */}
                            <div className="flex flex-col items-center gap-1.5">
                                <div
                                    className="relative px-3 py-2.5 rounded-xl border text-center min-w-[90px]"
                                    style={{
                                        borderColor: `${step.color}40`,
                                        backgroundColor: `${step.color}10`,
                                    }}
                                >
                                    {/* Glow */}
                                    <div
                                        className="absolute inset-0 rounded-xl opacity-20 blur-md"
                                        style={{ backgroundColor: step.color }}
                                    />
                                    <span className="relative text-[11px] font-bold text-white/90 leading-tight">
                                        {step.label}
                                    </span>
                                </div>
                                {/* Type label */}
                                <span
                                    className="text-[8px] font-mono uppercase tracking-widest"
                                    style={{ color: `${step.color}99` }}
                                >
                                    {step.type === 'source' ? 'Captación'
                                        : step.type === 'pretreatment' ? 'Pre-trat.'
                                            : step.type === 'clarification' ? 'Clarif.'
                                                : step.type === 'filtration' ? 'Filtración'
                                                    : step.type === 'disinfection' ? 'Desinf.'
                                                        : 'Almac.'}
                                </span>
                            </div>

                            {/* Arrow connector */}
                            {i < steps.length - 1 && (
                                <div className="flex items-center mx-1">
                                    <div className="w-6 h-px bg-gradient-to-r" style={{
                                        backgroundImage: `linear-gradient(to right, ${step.color}60, ${steps[i + 1].color}60)`
                                    }} />
                                    <div
                                        className="w-0 h-0 border-t-[4px] border-b-[4px] border-l-[6px] border-t-transparent border-b-transparent -ml-px"
                                        style={{ borderLeftColor: `${steps[i + 1].color}60` }}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Flow direction label */}
            <div className="text-center text-[9px] font-mono text-slate-600 uppercase tracking-[0.3em]">
                Dirección del Flujo →
            </div>
        </div>
    );
}
