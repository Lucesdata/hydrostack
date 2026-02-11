"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import {
    Activity,
    Save,
    ChevronRight,
    Users,
    Droplet,
    ArrowRightCircle,
    CheckCircle2,
    AlertCircle,
    Info,
    Gauge,
    Zap,
    TrendingDown,
    Calculator
} from 'lucide-react';

export default function CaudalesForm({ projectId, initialData }: { projectId: string; initialData: any }) {
    const [formData, setFormData] = useState({
        net_dotation: initialData?.net_dotation ?? 100,
        losses_index: initialData?.losses_index ?? 25,
        k1_coef: initialData?.k1_coef ?? 1.3,
        k2_coef: initialData?.k2_coef ?? 1.6,
    });

    const [results, setResults] = useState({
        gross_dotation: 0,
        qmd: 0,
        qmd_max: 0,
        qmh_max: 0,
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const pfutura = initialData?.calculated_flows?.final_population || 0;
    const [seasonalData, setSeasonalData] = useState<any>(null);

    useEffect(() => {
        async function fetchSeasonalData() {
            const { data } = await supabase
                .from('project_seasonal_data')
                .select('*')
                .eq('project_id', projectId)
                .maybeSingle();
            if (data) setSeasonalData(data);
        }
        fetchSeasonalData();
    }, [projectId, supabase]);

    useEffect(() => {
        const dneta = Number(formData.net_dotation);
        const ipp = Number(formData.losses_index);
        const k1 = Number(formData.k1_coef);
        const k2 = Number(formData.k2_coef);

        if (dneta && pfutura) {
            const dbruta = dneta / (1 - ipp / 100);
            const touristCount = seasonalData?.daily_tourist_count || 0;
            const seasonalPeak = seasonalData?.seasonal_peak_factor || 1.0;

            const qmdBase = (pfutura * dbruta) / 86400;
            const qmdTourists = (touristCount * dneta) / 86400;

            const qmdTotal = qmdBase + qmdTourists;
            const qmd_max = qmdTotal * k1;
            const qmh_max = qmd_max * k2 * seasonalPeak;

            setResults({
                gross_dotation: Number(dbruta.toFixed(2)),
                qmd: Number(qmdTotal.toFixed(3)),
                qmd_max: Number(qmd_max.toFixed(3)),
                qmh_max: Number(qmh_max.toFixed(3)),
            });
        }
    }, [formData, pfutura, seasonalData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent | React.MouseEvent, shouldRedirect = false) => {
        if (e) e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        const updateData = {
            net_dotation: Number(formData.net_dotation),
            losses_index: Number(formData.losses_index),
            k1_coef: Number(formData.k1_coef),
            k2_coef: Number(formData.k2_coef),
            calculated_flows: {
                ...initialData?.calculated_flows,
                ...results
            },
            updated_at: new Date().toISOString()
        };

        try {
            const { error: upsertError } = await supabase
                .from('project_calculations')
                .upsert({
                    project_id: projectId,
                    ...updateData
                }, { onConflict: 'project_id' });

            if (upsertError) throw upsertError;

            if (shouldRedirect) {
                router.push(`/dashboard/projects/${projectId}/fime-seleccion-tecnologia`);
            } else {
                setMessage('Cálculos actualizados.');
                setSaved(true);
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message || 'Error al guardar los cálculos');
        } finally {
            if (!shouldRedirect) {
                setLoading(false);
            }
        }
    };

    if (!pfutura) {
        return (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                <div className="space-y-2">
                    <h3 className="text-red-400 font-bold text-lg">Población no definida</h3>
                    <p className="text-red-400/70 text-sm max-w-md mx-auto">
                        Primero debes completar la sección de <strong>Censo y Comunidad</strong> para obtener la población futura proyectada.
                    </p>
                </div>
                <button
                    onClick={() => router.push(`/dashboard/projects/${projectId}/population`)}
                    className="px-6 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                    Ir a Censo
                </button>
            </div>
        );
    }

    const ResultItem = ({ label, value, unit, icon: Icon, primary = false }: any) => (
        <div className={`p-4 rounded-xl border transition-all ${primary ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-950/40 border-white/5'}`}>
            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-1">
                {Icon && <Icon className={`w-3 h-3 ${primary ? 'text-emerald-400' : 'text-slate-600'}`} />}
                {label}
            </p>
            <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black tracking-tighter ${primary ? 'text-emerald-400' : 'text-white'}`}>
                    {value.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">{unit}</span>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-700">
            {/* Input Parameters Section */}
            <div className="lg:col-span-7 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/20 via-emerald-500/50 to-emerald-500/20"></div>

                <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-emerald-500" /> Parámetros de Diseño
                </h3>

                {message && (
                    <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-[10px] font-bold uppercase tracking-wider animate-in slide-in-from-top-2">
                        <CheckCircle2 className="w-4 h-4" /> {message}
                    </div>
                )}

                <form className="flex-1 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-3 h-3 text-emerald-500" /> Dotación Neta
                            </label>
                            <div className="relative group">
                                <input
                                    name="net_dotation"
                                    type="number"
                                    value={formData.net_dotation}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-emerald-500/50 transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-600">L/HAB/D</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <TrendingDown className="w-3 h-3 text-emerald-500" /> Índice de Pérdidas
                            </label>
                            <div className="relative group">
                                <input
                                    name="losses_index"
                                    type="number"
                                    value={formData.losses_index}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-emerald-500/50 transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-600">%</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Coeficiente K1</label>
                            <input
                                name="k1_coef"
                                type="number"
                                step="0.1"
                                value={formData.k1_coef}
                                onChange={handleChange}
                                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-emerald-500/50 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Coeficiente K2</label>
                            <input
                                name="k2_coef"
                                type="number"
                                step="0.1"
                                value={formData.k2_coef}
                                onChange={handleChange}
                                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-emerald-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="mt-auto pt-8 flex gap-3">
                        <button
                            type="button"
                            onClick={(e) => handleSave(e, false)}
                            disabled={loading}
                            className="flex-1 py-3 px-6 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
                        >
                            {loading && !saved ? 'Guardando...' : 'Guardar Cálculos'}
                        </button>
                        <button
                            type="button"
                            onClick={(e) => handleSave(e, true)}
                            disabled={loading}
                            className="flex-[1.5] py-3 px-6 rounded-xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {loading ? 'Procesando...' : 'Guardar y Continuar'}
                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </form>
            </div>

            {/* Results Display Section */}
            <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl space-y-4">
                    <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-emerald-500" /> Resultados de Demanda
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <ResultItem label="Población Futura" value={pfutura} unit="hab" icon={Users} />
                        <ResultItem label="Dotación Bruta" value={results.gross_dotation} unit="l/h/d" icon={Droplet} />
                    </div>

                    <div className="space-y-3 pt-4 border-t border-white/5">
                        <ResultItem label="Caudal Medio Diario (Qmd)" value={results.qmd} unit="L/S" primary />
                        <ResultItem label="Caudal Máximo Diario (QMD)" value={results.qmd_max} unit="L/S" primary />
                        <ResultItem label="Caudal Máximo Horario (QMH)" value={results.qmh_max} unit="L/S" primary />
                    </div>

                    {(saved || initialData?.calculated_flows) && (
                        <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-4 group">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                                <CheckCircle2 className="w-5 h-5 text-slate-950 stroke-[3]" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Fase Completa</p>
                                <p className="text-[9px] text-emerald-400/60 uppercase font-bold tracking-tight">Listo para Selección de Tecnología</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-slate-950/30 border border-white/5 rounded-2xl p-4 flex gap-4 items-start">
                    <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-500 leading-relaxed italic">
                        Los cálculos incluyen demandas estacionales y factores de mayoración según la normativa vigente (RAS). Verifique los coeficientes de consumo pico antes de continuar.
                    </p>
                </div>
            </div>
        </div>
    );
}
