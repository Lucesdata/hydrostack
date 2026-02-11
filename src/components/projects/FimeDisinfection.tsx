"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
    Activity,
    Settings2,
    Target,
    ChevronRight,
    AlertCircle,
    ShieldAlert,
    Box,
    FlaskConical,
    Gauge,
    Droplets,
    Clock,
    Zap,
    Thermometer,
    Heater,
    Container,
    Beaker,
    CheckCircle2
} from 'lucide-react';

type DesignParams = {
    contact_time: number; // min (15-60)
    chlorine_dose: number; // mg/L (1-3 typ)
    chlorine_concentration: number; // % (e.g. 70% for HTH)
};

type DesignResults = {
    tank_volume_m3: number;
    chlorine_daily_kg: number;
    monthly_consumption_kg: number;
    required_residual: number;
};

export default function FimeDisinfection({ projectId }: { projectId: string }) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Data States
    const [qmd, setQmd] = useState<number>(0);

    // Design Inputs
    const [designParams, setDesignParams] = useState<DesignParams>({
        contact_time: 30,
        chlorine_dose: 1.5,
        chlorine_concentration: 70
    });

    // Initial Load
    useEffect(() => {
        async function loadData() {
            const { data: cData } = await supabase.from('project_calculations').select('calculated_flows').eq('project_id', projectId).maybeSingle();
            if (cData && cData.calculated_flows) {
                const flows = cData.calculated_flows;
                setQmd(flows.qmd_max || flows.QMD || flows.qmd || flows.qmh_max || 0);

                if (flows.disinfection?.params) {
                    setDesignParams(flows.disinfection.params);
                    setSaved(true);
                }
            }
            setLoading(false);
        }
        loadData();
    }, [projectId, supabase]);

    // Derived Design Results
    const results = React.useMemo(() => {
        if (!qmd) return null;

        const q_m3min = (qmd * 60) / 1000;
        const vol = q_m3min * designParams.contact_time;

        const flow_l_day = qmd * 86400;
        const chlorine_pure_kg_day = (flow_l_day * designParams.chlorine_dose) / 1000000;
        const commercial_kg_day = chlorine_pure_kg_day / (designParams.chlorine_concentration / 100);

        return {
            tank_volume_m3: vol,
            chlorine_daily_kg: commercial_kg_day,
            monthly_consumption_kg: commercial_kg_day * 30,
            required_residual: 0.3
        };
    }, [designParams, qmd]);

    const handleSave = async (redirect: boolean = false) => {
        if (!results) return;
        setSaving(true);
        try {
            const { data: latestData } = await supabase.from('project_calculations').select('calculated_flows').eq('project_id', projectId).single();
            const currentFlows = latestData?.calculated_flows || {};
            const updatedFlows = {
                ...currentFlows,
                disinfection: {
                    params: designParams,
                    results: results,
                    updated_at: new Date().toISOString()
                }
            };

            const { error: updateError } = await supabase.from('project_calculations').upsert({
                project_id: projectId,
                calculated_flows: updatedFlows
            }, { onConflict: 'project_id' });

            if (updateError) throw updateError;
            setSaved(true);
            if (redirect) router.push(`/dashboard/projects/${projectId}/fime-resultados`);
        } catch (error) {
            console.error('Error saving disinfection design:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4 text-center">
            <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">Cargando Módulo de Cloración...</p>
        </div>
    );

    const ResultItem = ({ label, value, unit, icon: Icon, primary = false }: any) => (
        <div className={`p-4 rounded-xl border transition-all ${primary ? 'bg-amber-500/10 border-amber-500/20 shadow-lg shadow-amber-500/5' : 'bg-slate-950/40 border-white/5'}`}>
            <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-1">
                {Icon && <Icon className={`w-3.5 h-3.5 ${primary ? 'text-amber-400' : 'text-slate-600'}`} />}
                {label}
            </p>
            <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black tracking-tight ${primary ? 'text-amber-400' : 'text-white'}`}>
                    {typeof value === 'number' ? value.toFixed(2) : value}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{unit}</span>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-700">
            {/* Header / Flow Indicator */}
            <div className="lg:col-span-12">
                {qmd > 0 ? (
                    <div className="bg-gradient-to-r from-amber-600/20 via-orange-600/20 to-amber-600/20 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between backdrop-blur-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-full bg-amber-500/5 skew-x-[-20deg] translate-x-32 group-hover:translate-x-16 transition-transform duration-1000"></div>
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10">
                                <Target className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-amber-400/80 uppercase tracking-widest mb-0.5">Caudal Máximo Diario de Diseño</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-white tracking-tighter">{qmd.toFixed(2)}</span>
                                    <span className="text-sm font-bold text-amber-400">L/s</span>
                                    <span className="mx-3 text-slate-700 font-light">|</span>
                                    <span className="text-xl font-bold text-slate-300">{(qmd * 3.6).toFixed(2)}</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">m³/h</span>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-3 bg-slate-950/40 px-4 py-2 rounded-xl border border-white/5 relative z-10">
                            <Activity className="w-4 h-4 text-emerald-400" />
                            <div className="text-right">
                                <p className="text-[8px] font-bold text-slate-500 uppercase">Proceso Final</p>
                                <p className="text-[10px] font-black text-amber-400 uppercase">Aseguramiento Calidad</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <ShieldAlert className="w-10 h-10 text-red-500" />
                            <div>
                                <h4 className="text-white font-black text-lg uppercase tracking-tight">Caudal No Definido</h4>
                                <p className="text-slate-400 text-sm">El dimensionamiento del tanque requiere el QMD calculado en la Fase 1.</p>
                            </div>
                        </div>
                        <button onClick={() => router.push(`/dashboard/projects/${projectId}/caudales`)} className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-[11px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-500/20">
                            Completar Fase 1
                        </button>
                    </div>
                )}
            </div>

            {/* Config Section */}
            <div className="lg:col-span-7 space-y-6">
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/20 via-amber-500/50 to-amber-500/20"></div>
                    <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                        <Settings2 className="w-4 h-4 text-amber-500" /> Parámetros de Cloración
                    </h3>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-amber-400" /> Tiempo de Contacto (t)
                            </label>
                            <div className="relative group">
                                <input
                                    type="number" min="15" value={designParams.contact_time}
                                    onChange={(e) => setDesignParams({ ...designParams, contact_time: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-amber-500/50 transition-all font-bold"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-600">MIN</span>
                            </div>
                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">Normativo (RAS): Mínimo 15-30 min</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <FlaskConical className="w-3.5 h-3.5 text-amber-400" /> Dosis Objetivo
                                </label>
                                <div className="relative group">
                                    <input
                                        type="number" step="0.1" value={designParams.chlorine_dose}
                                        onChange={(e) => setDesignParams({ ...designParams, chlorine_dose: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-amber-500/50 transition-all font-bold"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-600">MG/L</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Beaker className="w-3.5 h-3.5 text-amber-400" /> Concentración Químico
                                </label>
                                <div className="relative group">
                                    <input
                                        type="number" value={designParams.chlorine_concentration}
                                        onChange={(e) => setDesignParams({ ...designParams, chlorine_concentration: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-amber-500/50 transition-all font-bold"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-600">%</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex gap-3 border-t border-white/5">
                            <button
                                onClick={() => handleSave(false)}
                                disabled={saving || !results}
                                className="flex-1 py-3 px-6 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all disabled:opacity-30"
                            >
                                {saving ? 'Pocessando...' : 'Guardar Diseño'}
                            </button>
                            <button
                                onClick={() => handleSave(true)}
                                disabled={saving || !results}
                                className="flex-[1.5] py-3 px-6 rounded-xl bg-amber-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-amber-500 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 group disabled:opacity-30"
                            >
                                Finalizar Proyecto
                                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Normative Tip */}
                <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5 flex items-start gap-4 backdrop-blur-md">
                    <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30 shrink-0">
                        <AlertCircle className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Requisito Residual (Norma Potabilidad)</p>
                        <p className="text-xs text-slate-400 leading-relaxed uppercase tracking-tight font-medium">
                            Se debe garantizar un cloro residual libre entre 0.3 y 2.0 mg/L en cualquier punto de la red de distribución.
                        </p>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-5 space-y-6">
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl space-y-5">
                    <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-amber-500" /> Dimensionamiento Hidráulico
                    </h3>

                    <ResultItem
                        label="Volumen Tanque de Contacto"
                        value={results?.tank_volume_m3}
                        unit="m³"
                        icon={Container}
                        primary
                    />

                    <div className="pt-2">
                        <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-500" /> Consumo de Desinfectante
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 flex items-center justify-between group hover:border-amber-500/20 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gasto Diario</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-black text-white">{results?.chlorine_daily_kg.toFixed(3)}</span>
                                    <span className="ml-2 text-[10px] font-bold text-slate-600 uppercase">Kg/Día</span>
                                </div>
                            </div>
                            <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 flex items-center justify-between group hover:border-amber-500/20 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                        <Box className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reserva Mensual</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-black text-white">{results?.monthly_consumption_kg.toFixed(2)}</span>
                                    <span className="ml-2 text-[10px] font-bold text-slate-600 uppercase">Kg/Mes</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <div>
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Seguridad Bacteriológica</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Tanque dimensionado para inactivación patógena.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
