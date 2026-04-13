'use client';

import React, { useState } from 'react';
import { Settings, MapPin, Leaf, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import type { SelectorInputs, SourceInputs, DesignInputs, ContextInputs, EnvironmentInputs } from '@/types/tech-selector';
import SelectorStepDesign from './SelectorStepDesign';
import SelectorStepContext from './SelectorStepContext';
import SelectorStepEnvironment from './SelectorStepEnvironment';
import SelectorDashboard from './SelectorDashboard';
import { runSelector } from '@/lib/tech-selector-engine';
import type { SelectorResult } from '@/types/tech-selector';

const STEPS = [
    { id: 0, label: 'Diseño', icon: Settings, description: 'Parámetros de diseño hidráulico' },
    { id: 1, label: 'Contexto', icon: MapPin, description: 'Restricciones operativas y presupuestales' },
    { id: 2, label: 'Entorno', icon: Leaf, description: 'Factores ambientales y sociales' },
];

const DEFAULT_DESIGN: DesignInputs = {
    flowRate: 5,
    population: 3000,
    peakFactor: 1.5,
    qualityTarget: 'who',
};

const DEFAULT_CONTEXT: ContextInputs = {
    settlementType: 'rural',
    energyAvailability: 'intermittent',
    operatorSkill: 'basic',
    budgetRange: 'low',
};

const DEFAULT_ENVIRONMENT: EnvironmentInputs = {
    communityAcceptance: 'medium',
    localMaterialAvailability: 'medium',
    sparePartsAccess: 'medium',
    sludgeDisposalPossibility: true,
};

interface TechSelectorWizardProps {
    initialSourceData: SourceInputs;
}

export default function TechSelectorWizard({ initialSourceData }: TechSelectorWizardProps) {
    const [step, setStep] = useState(0);
    const [design, setDesign] = useState<DesignInputs>(DEFAULT_DESIGN);
    const [context, setContext] = useState<ContextInputs>(DEFAULT_CONTEXT);
    const [environment, setEnvironment] = useState<EnvironmentInputs>(DEFAULT_ENVIRONMENT);
    const [result, setResult] = useState<SelectorResult | null>(null);
    const [showResults, setShowResults] = useState(false);

    const handleRunSelector = () => {
        const inputs: SelectorInputs = { source: initialSourceData, design, context, environment };
        const selectorResult = runSelector(inputs);
        setResult(selectorResult);
        setShowResults(true);
    };

    const handleReset = () => {
        setShowResults(false);
        setResult(null);
        setStep(0);
    };

    if (showResults && result) {
        return <SelectorDashboard result={result} onReset={handleReset} />;
    }

    return (
        <div className="space-y-6">
            {/* Progress Steps */}
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2">
                {STEPS.map((s, i) => {
                    const Icon = s.icon;
                    const isActive = step === i;
                    const isCompleted = step > i;

                    return (
                        <React.Fragment key={s.id}>
                            <button
                                onClick={() => step > i ? setStep(i) : undefined}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-mono transition-all whitespace-nowrap ${isActive
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    : isCompleted
                                        ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400/60 cursor-pointer hover:border-emerald-500/30'
                                        : 'bg-white/[0.02] border-white/5 text-slate-500'
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{s.label}</span>
                                <span className="sm:hidden">{i + 1}</span>
                            </button>
                            {i < STEPS.length - 1 && (
                                <div className={`w-6 h-px ${isCompleted ? 'bg-emerald-500/30' : 'bg-white/5'}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Step Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    {React.createElement(STEPS[step].icon, { className: 'w-5 h-5 text-emerald-400' })}
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white">{STEPS[step].label}</h2>
                    <p className="text-xs text-slate-400">{STEPS[step].description}</p>
                </div>
            </div>

            {/* Step Content */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 sm:p-6">
                {step === 0 && <SelectorStepDesign data={design} onChange={setDesign} />}
                {step === 1 && <SelectorStepContext data={context} onChange={setContext} />}
                {step === 2 && <SelectorStepEnvironment data={environment} onChange={setEnvironment} />}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setStep(s => s - 1)}
                    disabled={step === 0}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-slate-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Anterior
                </button>

                {step < STEPS.length - 1 ? (
                    <button
                        onClick={() => setStep(s => s + 1)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all"
                    >
                        Siguiente
                        <ArrowRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button
                        onClick={handleRunSelector}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
                    >
                        <Sparkles className="w-4 h-4" />
                        Ejecutar Análisis
                    </button>
                )}
            </div>
        </div>
    );
}
