"use client";

/**
 * MÓDULO: Población y Censo
 * BLOQUE: B — Caracterización de Demanda
 */

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import {
    Users,
    Home,
    TrendingUp,
    Calculator,
    ChevronRight,
    Save,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

type CENSUS_DATA = {
    project_id: string;
    community_name: string | null;
    municipality: string | null;
    dwellings_number: number | null;
    people_per_dwelling: number | null;
    initial_population: number | null;
    growth_rate: number | null;
    projection_years: number | null;
    calculated_flows?: any;
};

export default function PopulationForm({ projectId, initialData }: { projectId: string; initialData: CENSUS_DATA | null }) {
    const [formData, setFormData] = useState({
        community_name: initialData?.community_name ?? '',
        municipality: initialData?.municipality ?? '',
        dwellings_number: initialData?.dwellings_number ?? '',
        people_per_dwelling: initialData?.people_per_dwelling ?? '',
        growth_rate: initialData?.growth_rate ?? 1.5,
        projection_years: initialData?.projection_years ?? 25,
        projection_method: 'Geometrico'
    });

    const estimatedPop = (Number(formData.dwellings_number) || 0) * (Number(formData.people_per_dwelling) || 0);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const calculateAndSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        const dwellings = Number(formData.dwellings_number);
        const ppd = Number(formData.people_per_dwelling);
        const rate = Number(formData.growth_rate);
        const years = Number(formData.projection_years);

        if (!formData.community_name || !formData.municipality || !dwellings || !ppd) {
            setError('Por favor complete los campos obligatorios.');
            setLoading(false);
            return;
        }

        const initial_population = Math.round(dwellings * ppd);
        let final_population = 0;
        const r = rate / 100;
        const t = years;

        if (formData.projection_method === 'Exponencial') {
            final_population = Math.round(initial_population * Math.exp(r * t));
        } else {
            final_population = Math.round(initial_population * Math.pow((1 + r), t));
        }

        const calculationData = {
            project_id: projectId,
            community_name: formData.community_name,
            municipality: formData.municipality,
            dwellings_number: dwellings,
            people_per_dwelling: ppd,
            initial_population: initial_population,
            growth_rate: rate,
            projection_years: years,
            calculated_flows: {
                final_population,
                method: formData.projection_method
            },
            updated_at: new Date().toISOString()
        };

        try {
            const { error: upsertError } = await supabase
                .from('project_calculations')
                .upsert(calculationData, { onConflict: 'project_id' });

            if (upsertError) throw upsertError;

            setMessage(`Población Proyectada: ${final_population.toLocaleString()} hab.`);
            setSaved(true);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Error al guardar los datos');
        } finally {
            setLoading(false);
        }
    };

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

                <form onSubmit={calculateAndSave} className="space-y-8">
                    {/* Compact Grid 1: Community & Census */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Home className="w-3 h-3" /> Comunidad y Municipio *
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    name="community_name"
                                    value={formData.community_name}
                                    onChange={handleChange}
                                    placeholder="Nombre"
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500/50 transition-all outline-none"
                                    required
                                />
                                <input
                                    name="municipality"
                                    value={formData.municipality}
                                    onChange={handleChange}
                                    placeholder="Municipio"
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500/50 transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                                Viviendas / Personas *
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="number"
                                    name="dwellings_number"
                                    value={formData.dwellings_number}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-emerald-500/30 transition-all outline-none"
                                    required
                                />
                                <input
                                    type="number"
                                    step="0.1"
                                    name="people_per_dwelling"
                                    value={formData.people_per_dwelling}
                                    onChange={handleChange}
                                    placeholder="3.5"
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-emerald-500/30 transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-2.5 flex items-center justify-between">
                            <div>
                                <p className="text-[9px] font-mono font-bold text-emerald-500 uppercase tracking-wider mb-1">Población Base</p>
                                <div className="text-xl font-bold text-white leading-tight">
                                    {estimatedPop} <span className="text-[10px] font-mono text-emerald-400/60 uppercase ml-1">hab</span>
                                </div>
                            </div>
                            <Users className="w-6 h-6 text-emerald-500/20" />
                        </div>
                    </div>

                    <div className="h-px bg-white/5 w-full"></div>

                    {/* Compact Grid 2: Projections */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp className="w-3 h-3" /> Tasa (%)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="growth_rate"
                                value={formData.growth_rate}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Años de Diseño</label>
                            <input
                                type="number"
                                name="projection_years"
                                value={formData.projection_years}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Método RAS</label>
                            <select
                                name="projection_method"
                                value={formData.projection_method}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-[11px] text-sm text-white outline-none focus:border-emerald-500/30 appearance-none cursor-pointer"
                            >
                                <option value="Geometrico">Método Geométrico</option>
                                <option value="Exponencial">Método Exponencial</option>
                            </select>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex-1 min-w-[140px] py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg
                                    ${saved
                                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'}`}
                            >
                                {loading ? (
                                    <span className="animate-pulse">...</span>
                                ) : (
                                    <>
                                        <Calculator className="w-4 h-4" />
                                        {saved ? 'Recalcular' : 'Calcular'}
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push(`/dashboard/projects/${projectId}/floating-population`)}
                                disabled={!(saved || initialData?.initial_population)}
                                className="w-10 h-10 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl transition-all flex items-center justify-center disabled:opacity-40"
                                title="Siguiente"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Context Note - Compact */}
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/30 rounded-xl border border-white/5 max-w-fit">
                <AlertCircle className="w-3 h-3 text-slate-500 shrink-0" />
                <p className="text-[9px] text-slate-500 italic tracking-wide">
                    Cálculos basados en el Título B del RAS-2000. Recomendado: Método Geométrico para zonas rurales.
                </p>
            </div>
        </div>
    );
}
