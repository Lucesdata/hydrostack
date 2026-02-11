"use client";

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import {
    Droplets,
    Beaker,
    AlertTriangle,
    ShieldCheck,
    Home,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Save,
    Check,
    Waves,
    Eye,
    Zap,
    Thermometer
} from 'lucide-react';
import QualityAnalysisForm from './QualityAnalysisForm';

type QUALITY_DATA = {
    project_id: string;
    has_analysis: string | null;
    perceived_problems: string[] | null;
    pollution_sources: string | null;
    home_treatment: string[] | null;
};

export default function QualityForm({ projectId, initialData }: { projectId: string; initialData: QUALITY_DATA | null }) {
    const [formData, setFormData] = useState({
        has_analysis: initialData?.has_analysis ?? '',
        perceived_problems: initialData?.perceived_problems ?? [] as string[],
        pollution_sources: initialData?.pollution_sources ?? '',
        home_treatment: initialData?.home_treatment ?? [] as string[],
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleRadioChange = (val: string, name: string) => {
        setFormData({ ...formData, [name]: val });
    };

    const handleCheckboxChange = (val: string, field: 'perceived_problems' | 'home_treatment') => {
        let newArray = [...formData[field]];
        if (newArray.includes(val)) {
            newArray = newArray.filter(item => item !== val);
        } else {
            newArray.push(val);
        }
        setFormData({ ...formData, [field]: newArray });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        const qualityData = {
            project_id: projectId,
            has_analysis: formData.has_analysis,
            perceived_problems: formData.perceived_problems,
            pollution_sources: formData.pollution_sources,
            home_treatment: formData.home_treatment,
            updated_at: new Date().toISOString()
        };

        try {
            const { error: upsertError } = await supabase
                .from('project_water_quality')
                .upsert(qualityData, { onConflict: 'project_id' });

            if (upsertError) throw upsertError;

            setMessage('Diagnóstico cualitativo actualizado.');
            setSaved(true);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al guardar los datos');
        } finally {
            setLoading(false);
        }
    };

    const CompactRadio = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
        <button
            type="button"
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all
                ${active
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : 'bg-slate-900/50 border-slate-700 text-slate-500 hover:border-slate-500'}`}
        >
            <div className={`w-3 h-3 rounded-full border flex items-center justify-center transition-all
                ${active ? 'border-emerald-500' : 'border-slate-700'}`}>
                {active && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
            </div>
            {label}
        </button>
    );

    const CompactCheckbox = ({ label, active, onClick, icon: Icon }: { label: string; active: boolean; onClick: () => void; icon?: any }) => (
        <button
            type="button"
            onClick={onClick}
            className={`flex-1 flex items-center gap-3 px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all
                ${active
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : 'bg-slate-900/50 border-slate-700 text-slate-500 hover:border-slate-500'}`}
        >
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all
                ${active ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700'}`}>
                {active && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
            </div>
            {Icon && <Icon className={`w-3 h-3 ${active ? 'text-emerald-400' : 'text-slate-600'}`} />}
            {label}
        </button>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Qualitative Assessment Section */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 via-emerald-500 to-emerald-500/50 opacity-50"></div>

                {message && (
                    <div className="mb-4 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-[10px] font-medium animate-in slide-in-from-top-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {/* Column 1: Analysis & Problems */}
                        <div className="space-y-6">
                            {/* Has Analysis */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Beaker className="w-3 h-3 text-emerald-500" /> ¿Cuenta con Análisis Lab? *
                                </label>
                                <div className="flex gap-2">
                                    {['Sí', 'No'].map(opt => (
                                        <CompactRadio
                                            key={opt}
                                            label={opt}
                                            active={formData.has_analysis === opt}
                                            onClick={() => handleRadioChange(opt, 'has_analysis')}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Perceived Problems */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Eye className="w-3 h-3 text-emerald-500" /> Percepción de la Comunidad
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Turbidez', 'Olor', 'Sabor', 'Color'].map(opt => (
                                        <CompactCheckbox
                                            key={opt}
                                            label={opt}
                                            active={formData.perceived_problems.includes(opt)}
                                            onClick={() => handleCheckboxChange(opt, 'perceived_problems')}
                                            icon={Waves}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Pollution & Treatment */}
                        <div className="space-y-6">
                            {/* Pollution Sources */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3 text-emerald-500" /> Riesgos de Contaminación *
                                </label>
                                <div className="flex gap-2">
                                    {['Sí', 'No'].map(opt => (
                                        <CompactRadio
                                            key={opt}
                                            label={opt}
                                            active={formData.pollution_sources === opt}
                                            onClick={() => handleRadioChange(opt, 'pollution_sources')}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Home Treatment */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Home className="w-3 h-3 text-emerald-500" /> Prácticas en el Hogar
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Hervido', 'Cloro', 'Filtro'].map(opt => (
                                        <CompactCheckbox
                                            key={opt}
                                            label={opt}
                                            active={formData.home_treatment.includes(opt)}
                                            onClick={() => handleCheckboxChange(opt, 'home_treatment')}
                                            icon={Zap}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`py-2.5 px-6 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg
                                ${saved
                                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'}`}
                        >
                            {loading ? (
                                <span className="animate-pulse">Guardando...</span>
                            ) : (
                                <>
                                    <Save className="w-3.5 h-3.5" />
                                    {saved ? 'Diagnóstico Guardado' : 'Guardar Diagnóstico'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Expanded Quantitative Section */}
            {formData.has_analysis === 'Sí' && (
                <div className="animate-in slide-in-from-top-4 duration-500">
                    <QualityAnalysisForm projectId={projectId} initialData={initialData} />
                </div>
            )}

            {/* Navigation Placeholder if no analysis */}
            {formData.has_analysis !== 'Sí' && (
                <div className="flex justify-end pt-4">
                    <button
                        type="button"
                        onClick={() => router.push(`/dashboard/projects/${projectId}/caudales`)}
                        disabled={!saved && !initialData}
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                    >
                        Continuar a Caudales
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
