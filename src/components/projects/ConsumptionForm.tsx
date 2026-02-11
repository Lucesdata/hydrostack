"use client";

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import {
    Droplets,
    Calendar,
    Clock,
    Database,
    ChevronRight,
    Save,
    CheckCircle2,
    AlertCircle,
    Check
} from 'lucide-react';

type CONSUMPTION_DATA = {
    project_id: string;
    main_uses: string[] | null;
    daily_availability: string | null;
    peak_hours: string[] | null;
    has_storage: string | null;
};

export default function ConsumptionForm({ projectId, initialData }: { projectId: string; initialData: CONSUMPTION_DATA | null }) {
    const [formData, setFormData] = useState({
        main_uses: initialData?.main_uses ?? [] as string[],
        daily_availability: initialData?.daily_availability ?? '',
        peak_hours: initialData?.peak_hours ?? [] as string[],
        has_storage: initialData?.has_storage ?? '',
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

    const handleCheckboxChange = (val: string, field: 'main_uses' | 'peak_hours') => {
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

        const consumptionData = {
            project_id: projectId,
            main_uses: formData.main_uses,
            daily_availability: formData.daily_availability,
            peak_hours: formData.peak_hours,
            has_storage: formData.has_storage,
            updated_at: new Date().toISOString()
        };

        try {
            const { error: upsertError } = await supabase
                .from('project_consumption')
                .upsert(consumptionData, { onConflict: 'project_id' });

            if (upsertError) throw upsertError;

            setMessage('Información de consumo sintetizada y guardada.');
            setSaved(true);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al guardar los datos');
        } finally {
            setLoading(false);
        }
    };

    const CheckboxOption = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-medium transition-all
                ${active
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}
        >
            <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all
                ${active ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                {active && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
            </div>
            {label}
        </button>
    );

    const RadioOption = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
        <button
            type="button"
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-medium transition-all
                ${active
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}
        >
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all
                ${active ? 'border-emerald-500' : 'border-slate-600'}`}>
                {active && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
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

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Column 1: Uses & Availability */}
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Droplets className="w-3 h-3 text-emerald-500/50" /> Uso principal del agua
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {['Uso doméstico', 'Riego', 'Animales'].map(opt => (
                                        <CheckboxOption
                                            key={opt}
                                            label={opt}
                                            active={formData.main_uses.includes(opt)}
                                            onClick={() => handleCheckboxChange(opt, 'main_uses')}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar className="w-3 h-3 text-emerald-500/50" /> ¿Tienen agua todos los días?
                                </label>
                                <div className="flex gap-3">
                                    {['Sí', 'No'].map(opt => (
                                        <RadioOption
                                            key={opt}
                                            label={opt}
                                            active={formData.daily_availability === opt}
                                            onClick={() => handleRadioChange(opt, 'daily_availability')}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Peak Hours & Storage */}
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-emerald-500/50" /> Horarios de mayor consumo
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {['Mañana', 'Tarde', 'Noche'].map(opt => (
                                        <CheckboxOption
                                            key={opt}
                                            label={opt}
                                            active={formData.peak_hours.includes(opt)}
                                            onClick={() => handleCheckboxChange(opt, 'peak_hours')}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Database className="w-3 h-3 text-emerald-500/50" /> ¿Tienen tanque de almacenamiento?
                                </label>
                                <div className="flex gap-3">
                                    {['Sí', 'No'].map(opt => (
                                        <RadioOption
                                            key={opt}
                                            label={opt}
                                            active={formData.has_storage === opt}
                                            onClick={() => handleRadioChange(opt, 'has_storage')}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

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
                                    {saved ? 'Información Actualizada' : 'Guardar Información'}
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push(`/dashboard/projects/${projectId}/source`)}
                            disabled={!saved && !initialData}
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                        >
                            Siguiente: Fuente de Agua
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>

            {/* Context Note - Compact */}
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/30 rounded-xl border border-white/5 max-w-fit">
                <AlertCircle className="w-3 h-3 text-slate-500 shrink-0" />
                <p className="text-[9px] text-slate-500 italic tracking-wide">
                    Esta información es vital para el diseño de la capacidad de almacenamiento y horarios de operación.
                </p>
            </div>
        </div>
    );
}
