"use client";

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import {
    Wind,
    Droplets,
    Waves,
    Mountain,
    CircleDot,
    CloudRain,
    ShieldCheck,
    MapPin,
    ArrowRight,
    Save,
    CheckCircle2,
    AlertCircle,
    Layers,
    Navigation2,
    Check,
    ChevronRight
} from 'lucide-react';

type SOURCE_DATA = {
    project_id: string;
    source_type: string | null;
    is_permanent: string | null;
    water_quality_rainy: string[] | null;
    is_protected: string | null;
    distance_to_community: number | null;
};

export default function SourceForm({ projectId, initialData }: { projectId: string; initialData: SOURCE_DATA | null }) {
    const [formData, setFormData] = useState({
        source_type: initialData?.source_type ?? '',
        is_permanent: initialData?.is_permanent ?? '',
        water_quality_rainy: initialData?.water_quality_rainy ?? [] as string[],
        is_protected: initialData?.is_protected ?? '',
        distance_to_community: initialData?.distance_to_community ?? '',
        water_table_level: (initialData as any)?.water_table_level ?? '',
        well_depth: (initialData as any)?.well_depth ?? '',
        seasonal_risk_factor: (initialData as any)?.seasonal_risk_factor ?? 'Bajo'
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRadioChange = (val: string, name: string) => {
        setFormData({ ...formData, [name]: val });
    };

    const handleCheckboxChange = (val: string) => {
        let newQuality = [...formData.water_quality_rainy];
        if (newQuality.includes(val)) {
            newQuality = newQuality.filter(item => item !== val);
        } else {
            newQuality.push(val);
        }
        setFormData({ ...formData, water_quality_rainy: newQuality });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        const sourceData = {
            project_id: projectId,
            source_type: formData.source_type,
            is_permanent: formData.is_permanent,
            water_quality_rainy: formData.water_quality_rainy,
            is_protected: formData.is_protected,
            distance_to_community: Number(formData.distance_to_community) || null,
            water_table_level: parseFloat(formData.water_table_level.toString()) || null,
            well_depth: parseFloat(formData.well_depth.toString()) || null,
            seasonal_risk_factor: formData.seasonal_risk_factor,
            updated_at: new Date().toISOString()
        };

        try {
            const { error: upsertError } = await supabase
                .from('project_sources')
                .upsert(sourceData, { onConflict: 'project_id' });

            if (upsertError) throw upsertError;

            setMessage('Diagnóstico de fuente guardado exitosamente.');
            setSaved(true);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al guardar los datos');
        } finally {
            setLoading(false);
        }
    };

    const SourceOption = ({ label, icon: Icon, active, onClick }: { label: string; icon: any; active: boolean; onClick: () => void }) => (
        <button
            type="button"
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2 group
                ${active
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : 'bg-slate-900/50 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'}`}
        >
            <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${active ? 'text-emerald-400' : 'text-slate-600'}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        </button>
    );

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

    const CompactCheckbox = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
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
            {label}
        </button>
    );

    return (
        <div className="space-y-4 animate-in fade-in duration-700">
            {/* Form Section */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                {/* Header Style Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 via-emerald-500 to-emerald-500/50"></div>

                {message && (
                    <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-xs font-medium animate-in slide-in-from-top-1">
                        <CheckCircle2 className="w-4 h-4" />
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs font-medium animate-in shake duration-300">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Grid 1: Source Type & Permanence */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                        {/* Source Selection */}
                        <div className="md:col-span-7 space-y-4">
                            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Waves className="w-3 h-3 text-emerald-500" /> Tipo de Fuente *
                            </label>
                            <div className="grid grid-cols-5 gap-3">
                                <SourceOption label="Quebrada" icon={Wind} active={formData.source_type === 'Quebrada'} onClick={() => handleRadioChange('Quebrada', 'source_type')} />
                                <SourceOption label="Río" icon={Droplets} active={formData.source_type === 'Río'} onClick={() => handleRadioChange('Río', 'source_type')} />
                                <SourceOption label="Nacimiento" icon={Mountain} active={formData.source_type === 'Nacimiento'} onClick={() => handleRadioChange('Nacimiento', 'source_type')} />
                                <SourceOption label="Pozo" icon={CircleDot} active={formData.source_type === 'Pozo'} onClick={() => handleRadioChange('Pozo', 'source_type')} />
                                <SourceOption label="Otra" icon={Layers} active={formData.source_type === 'Otra'} onClick={() => handleRadioChange('Otra', 'source_type')} />
                            </div>
                        </div>

                        {/* Permanence */}
                        <div className="md:col-span-5 space-y-4">
                            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <CloudRain className="w-3 h-3 text-emerald-500" /> Disponibilidad Permanente *
                            </label>
                            <div className="flex gap-2">
                                {['Sí', 'No', 'N/D'].map(opt => (
                                    <CompactRadio
                                        key={opt}
                                        label={opt}
                                        active={formData.is_permanent === (opt === 'N/D' ? 'No se sabe' : opt)}
                                        onClick={() => handleRadioChange(opt === 'N/D' ? 'No se sabe' : opt, 'is_permanent')}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-white/5 w-full"></div>

                    {/* Grid 2: Quality & Protection */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                        {/* Rain Effects */}
                        <div className="md:col-span-7 space-y-4">
                            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Layers className="w-3 h-3 text-emerald-500" /> Comportamiento en lluvia
                            </label>
                            <div className="grid grid-cols-1 gap-2">
                                {['Se mantiene clara', 'Se vuelve turbia', 'Aumenta caudal'].map(opt => (
                                    <CompactCheckbox
                                        key={opt}
                                        label={opt}
                                        active={formData.water_quality_rainy.includes(opt)}
                                        onClick={() => handleCheckboxChange(opt)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Protection & Distance */}
                        <div className="md:col-span-5 space-y-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <ShieldCheck className="w-3 h-3 text-emerald-500" /> ¿Fuente protegida?
                                </label>
                                <div className="flex gap-2">
                                    {['Sí', 'No', 'Parcial'].map(opt => (
                                        <CompactRadio
                                            key={opt}
                                            label={opt}
                                            active={formData.is_protected === (opt === 'Parcial' ? 'Parcialmente' : opt)}
                                            onClick={() => handleRadioChange(opt === 'Parcial' ? 'Parcialmente' : opt, 'is_protected')}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Navigation2 className="w-3 h-3 text-emerald-500" /> Distancia a Red (m)
                                </label>
                                <input
                                    type="number"
                                    name="distance_to_community"
                                    value={formData.distance_to_community}
                                    onChange={handleTextChange}
                                    placeholder="Ej: 500"
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/30 transition-all font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pozo Expansion */}
                    {formData.source_type === 'Pozo' && (
                        <div className="grid grid-cols-2 gap-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl animate-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <label className="text-[9px] font-mono font-bold text-emerald-500 uppercase tracking-widest">Profundidad (m)</label>
                                <input
                                    type="number"
                                    name="well_depth"
                                    value={formData.well_depth}
                                    onChange={handleTextChange}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-mono font-bold text-emerald-500 uppercase tracking-widest">Nivel Freático (m)</label>
                                <input
                                    type="number"
                                    name="water_table_level"
                                    value={formData.water_table_level}
                                    onChange={handleTextChange}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none"
                                />
                            </div>
                        </div>
                    )}

                    <div className="h-px bg-white/5 w-full"></div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg
                                ${saved
                                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'}`}
                        >
                            {loading ? (
                                <span className="animate-pulse">Guardando...</span>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {saved ? 'Diagnóstico Actualizado' : 'Guardar Diagnóstico'}
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push(`/dashboard/projects/${projectId}/quality`)}
                            disabled={!saved && !initialData}
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                        >
                            Siguiente: Calidad
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>

            {/* Context Note - Compact */}
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/30 rounded-xl border border-white/5 max-w-fit">
                <AlertCircle className="w-3 h-3 text-slate-500 shrink-0" />
                <p className="text-[9px] text-slate-500 italic tracking-wide">
                    La caracterización de la fuente determina la complejidad del sistema de tratamiento.
                </p>
            </div>
        </div>
    );
}
