"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { WaterQualityEngine } from '@/lib/water-quality-engine';
import { WaterQualityState } from '@/types/project';
import {
    Activity,
    AlertCircle,
    ChevronRight,
    Save,
    CheckCircle2,
    Info,
    FlaskConical,
    Target,
    ShieldAlert
} from 'lucide-react';

export default function QualityAnalysisForm({
    projectId,
    initialData
}: {
    projectId: string;
    initialData: any
}) {
    const [formData, setFormData] = useState({
        ph: initialData?.ph ?? '',
        turbidity: initialData?.turbidity ?? '',
        color: initialData?.color ?? '',
        alkalinity: initialData?.alkalinity ?? '',
        hardness: initialData?.hardness ?? '',
        iron: initialData?.iron ?? '',
        manganese: initialData?.manganese ?? '',
        chlorides: initialData?.chlorides ?? '',
        sulfates: initialData?.sulfates ?? '',
        nitrates: initialData?.nitrates ?? '',
        fecal_coliforms: initialData?.fecal_coliforms ?? '',
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const [ircaResult, setIrcaResult] = useState({ score: 0, classification: { level: '', color: '', action: '' } });
    const [complexity, setComplexity] = useState<'baja' | 'media' | 'alta'>('baja');

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const params: any = {};
        Object.keys(formData).forEach(key => {
            const val = parseFloat(formData[key as keyof typeof formData] as string);
            if (!isNaN(val)) params[key] = val;
        });

        const result = WaterQualityEngine.calculateIRCA(params as WaterQualityState);
        setIrcaResult({
            score: result.score,
            classification: {
                level: result.risk_level,
                color: result.color,
                action: result.label
            }
        });

        const comp = WaterQualityEngine.classifyComplexity(params as WaterQualityState);
        setComplexity(comp);

    }, [formData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const isExceeding = (name: string, value: any) => {
        const val = parseFloat(value);
        if (isNaN(val)) return false;
        if (name === 'ph') return val < 6.5 || val > 9.0;
        const limits: any = { turbidity: 2, color: 15, fecal_coliforms: 0, iron: 0.3 };
        const limit = limits[name];
        return limit !== undefined && val > limit;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        const numericData: any = {
            project_id: projectId,
            irca_score: ircaResult.score,
            complexity_level: complexity,
            updated_at: new Date().toISOString()
        };

        Object.keys(formData)
            .filter(key => key !== 'id') // Prevent id conflict if present from initialData spread
            .forEach(key => {
                const val = parseFloat(formData[key as keyof typeof formData] as string);
                numericData[key] = isNaN(val) ? null : val;
            });

        try {
            const { error: upsertError } = await supabase
                .from('project_water_quality')
                .upsert(numericData, { onConflict: 'project_id' });

            if (upsertError) throw upsertError;

            setMessage('Resultados de laboratorio guardados.');
            setSaved(true);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al guardar el análisis');
        } finally {
            setLoading(false);
        }
    };

    const labels: Record<string, string> = {
        ph: 'pH',
        turbidity: 'Turbiedad (UNT)',
        color: 'Color (UPC)',
        alkalinity: 'Alcalinidad',
        hardness: 'Dureza Total',
        iron: 'Hierro Total',
        manganese: 'Manganeso',
        chlorides: 'Cloruros',
        sulfates: 'Sulfatos',
        nitrates: 'Nitratos',
        fecal_coliforms: 'Colif. Fecales'
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Lab Data Entry */}
            <div className="lg:col-span-8 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/30 via-emerald-500 to-emerald-500/30 opacity-40"></div>

                <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <FlaskConical className="w-3.5 h-3.5 text-emerald-500" /> Parámetros de Laboratorio
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {Object.keys(formData).map((key) => (
                            <div key={key} className="space-y-2 group">
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                                    {labels[key] || key}
                                    {isExceeding(key, (formData as any)[key]) && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse" />
                                    )}
                                </label>
                                <input
                                    id={key}
                                    name={key}
                                    type="number"
                                    step="0.01"
                                    value={(formData as any)[key]}
                                    onChange={handleInputChange}
                                    placeholder="0.0"
                                    className={`w-full bg-slate-900/50 border rounded-lg px-3 py-2 text-xs font-mono outline-none transition-all
                                        ${isExceeding(key, (formData as any)[key])
                                            ? 'border-red-500/40 text-red-400 focus:border-red-500'
                                            : 'border-slate-700 text-slate-300 focus:border-emerald-500/30'}`}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg
                                ${saved
                                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'}`}
                        >
                            {loading ? (
                                <span className="animate-pulse">Guardando...</span>
                            ) : (
                                <>
                                    <Save className="w-3.5 h-3.5" />
                                    {saved ? 'Resultados Actualizados' : 'Guardar Análisis'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Results Sidebar */}
            <div className="lg:col-span-4 space-y-4">
                {/* IRCA Score Card */}
                <div className="p-6 rounded-2xl border border-white/5 relative overflow-hidden shadow-2xl transition-all duration-500"
                    style={{ backgroundColor: `${ircaResult.classification.color}15` }}>
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
                        style={{ background: `radial-gradient(circle at center, ${ircaResult.classification.color}, transparent)` }}></div>

                    <div className="text-center space-y-2 relative">
                        <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Índice IRCA</p>
                        <div className="relative inline-block">
                            <h4 className="text-5xl font-black tracking-tighter transition-all duration-700"
                                style={{ color: ircaResult.classification.color, textShadow: `0 0 20px ${ircaResult.classification.color}30` }}>
                                {ircaResult.score.toFixed(1)}%
                            </h4>
                        </div>
                        <div className="py-1 px-3 rounded-full inline-block text-[10px] font-bold uppercase tracking-widest border"
                            style={{
                                borderColor: `${ircaResult.classification.color}30`,
                                color: ircaResult.classification.color,
                                backgroundColor: `${ircaResult.classification.color}10`
                            }}>
                            {ircaResult.classification.level}
                        </div>
                    </div>
                </div>

                {/* Complexity & Diagnosis */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
                    <div className="space-y-2">
                        <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 text-slate-400">
                            <Target className="w-3 h-3 text-emerald-500" /> Complejidad Técnica
                        </label>
                        <div className={`p-3 rounded-xl border flex items-center justify-between
                            ${complexity === 'alta' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                complexity === 'media' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                    'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                            <span className="text-[10px] font-black uppercase tracking-widest">{complexity}</span>
                            <div className="w-2 h-2 rounded-full animate-pulse shadow-lg" style={{ backgroundColor: 'currentColor' }} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 text-slate-400">
                            <ShieldAlert className="w-3 h-3 text-emerald-500" /> Recomendaciones
                        </label>
                        <p className="text-[10px] text-slate-400 italic leading-relaxed bg-slate-950/30 p-3 rounded-xl border border-white/5">
                            {ircaResult.classification.action}
                        </p>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="button"
                            onClick={() => router.push(`/dashboard/projects/${projectId}/caudales`)}
                            className="w-full flex items-center justify-between py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all group"
                        >
                            Pasar a Caudales
                            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
