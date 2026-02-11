"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
    Activity,
    Settings2,
    Wind,
    Waves,
    Target,
    Trash2,
    ChevronRight,
    AlertCircle,
    ShieldAlert,
    CheckCircle2,
    Box,
    Layers,
    Ruler,
    Zap,
    FlaskConical,
    Thermometer,
    Gauge,
    Droplets
} from 'lucide-react';

type DesignParams = {
    vf: number; // Velocidad de filtración (m/h) 0.1 - 0.3
    num_units: number; // Número de unidades
    ratio_l_a: number; // Relación Largo/Ancho
};

type DesignResults = {
    q_unit_lps: number;
    q_unit_m3h: number;
    area_total_m2: number;
    area_unit_m2: number;
    width_a: number;
    length_l: number;
    real_vf: number;
    is_area_safe: boolean;
};

export default function FlaDesign({ projectId }: { projectId: string }) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Data States
    const [qmd, setQmd] = useState<number>(0);

    // Design Inputs
    const [designParams, setDesignParams] = useState<DesignParams>({
        vf: 0.15,
        num_units: 2,
        ratio_l_a: 2.0
    });

    // Initial Load
    useEffect(() => {
        async function loadData() {
            const { data: cData } = await supabase.from('project_calculations').select('calculated_flows').eq('project_id', projectId).maybeSingle();
            if (cData && cData.calculated_flows) {
                const flows = cData.calculated_flows;
                setQmd(flows.qmd_max || flows.QMD || flows.qmd || flows.qmh_max || 0);

                if (flows.fla?.params) {
                    setDesignParams(flows.fla.params);
                    setSaved(true);
                }
            }
            setLoading(false);
        }
        loadData();
    }, [projectId, supabase]);

    // Derived Design Results
    const results = React.useMemo(() => {
        if (!qmd || designParams.num_units < 1) return null;

        const q_total_m3h = (qmd * 3600) / 1000;
        const area_total = q_total_m3h / designParams.vf;
        const area_unit = area_total / designParams.num_units;

        const width = Math.sqrt(area_unit / designParams.ratio_l_a);
        const length = designParams.ratio_l_a * width;
        const real_vf = q_total_m3h / (area_unit * designParams.num_units);

        return {
            q_unit_lps: qmd / designParams.num_units,
            q_unit_m3h: q_total_m3h / designParams.num_units,
            area_total_m2: area_total,
            area_unit_m2: area_unit,
            width_a: width,
            length_l: length,
            real_vf,
            is_area_safe: area_unit <= 100
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
                fla: {
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
            if (redirect) router.push(`/dashboard/projects/${projectId}/fime-desinfeccion`);
        } catch (error) {
            console.error('Error saving FLA design:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4 text-center">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">Cargando Parámetros Hidráulicos...</p>
        </div>
    );

    const errors = [];
    if (designParams.vf < 0.1 || designParams.vf > 0.2) errors.push(`Vf (${designParams.vf} m/h) fuera de rango (0.1 - 0.2 m/h)`);
    if (results && results.area_unit_m2 > 100) errors.push(`Área (${results.area_unit_m2.toFixed(2)} m²) excede máx. 100 m²`);
    if (designParams.num_units < 2) errors.push(`Mínimo 2 unidades requeridas`);

    const ResultItem = ({ label, value, unit, icon: Icon, primary = false }: any) => (
        <div className={`p-3 rounded-xl border transition-all ${primary ? 'bg-cyan-500/10 border-cyan-500/20 shadow-lg shadow-cyan-500/5' : 'bg-slate-950/40 border-white/5'}`}>
            <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-1">
                {Icon && <Icon className={`w-3 h-3 ${primary ? 'text-cyan-400' : 'text-slate-600'}`} />}
                {label}
            </p>
            <div className="flex items-baseline gap-1.5">
                <span className={`text-xl font-black tracking-tight ${primary ? 'text-cyan-400' : 'text-white'}`}>
                    {typeof value === 'number' ? value.toFixed(2) : value}
                </span>
                <span className="text-[9px] font-bold text-slate-500 uppercase">{unit}</span>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-700">
            {/* Left Column: Form & Config */}
            <div className="lg:col-span-12 space-y-6">
                {/* QMD Status Banner */}
                {qmd > 0 ? (
                    <div className="bg-gradient-to-r from-cyan-600/20 via-sky-600/20 to-cyan-600/20 border border-cyan-500/30 rounded-2xl p-4 flex items-center justify-between backdrop-blur-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-full bg-cyan-500/5 skew-x-[-20deg] translate-x-32 group-hover:translate-x-16 transition-transform duration-1000"></div>
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/10">
                                <Target className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-cyan-400/80 uppercase tracking-widest mb-0.5">Caudal Máximo Diario de Diseño</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-white tracking-tighter">{qmd.toFixed(2)}</span>
                                    <span className="text-sm font-bold text-cyan-400">L/s</span>
                                    <span className="mx-3 text-slate-700 font-light">|</span>
                                    <span className="text-xl font-bold text-slate-300">{(qmd * 3.6).toFixed(2)}</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">m³/h</span>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-3 bg-slate-950/40 px-4 py-2 rounded-xl border border-white/5 relative z-10">
                            <Activity className="w-4 h-4 text-cyan-400" />
                            <div className="text-right">
                                <p className="text-[8px] font-bold text-slate-500 uppercase">Estado Hidráulico</p>
                                <p className="text-[10px] font-black text-emerald-400 uppercase">Caudal Validado</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5 text-center md:text-left">
                            <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center shrink-0">
                                <ShieldAlert className="w-8 h-8 text-red-500" />
                            </div>
                            <div>
                                <h4 className="text-white font-black text-lg">Caudal de Diseño No Detectado</h4>
                                <p className="text-slate-400 text-sm">Debe completar la Fase 1 para habilitar el dimensionamiento del FLA.</p>
                            </div>
                        </div>
                        <button onClick={() => router.push(`/dashboard/projects/${projectId}/caudales`)} className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-[11px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95">
                            Ir a Caudales
                        </button>
                    </div>
                )}
            </div>

            {/* Design Config Column */}
            <div className="lg:col-span-7 space-y-6">
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl relative flex flex-col">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/20 via-cyan-500/50 to-cyan-500/20"></div>
                    <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                        <Settings2 className="w-4 h-4 text-cyan-500" /> Configuración Hidráulica (Normativa)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Wind className="w-3 h-3 text-cyan-400" /> Vel. Filtración (Vf)
                            </label>
                            <div className="relative group">
                                <input
                                    type="number" step="0.01" value={designParams.vf}
                                    onChange={(e) => setDesignParams({ ...designParams, vf: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-cyan-500/50 transition-all font-bold"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-600">M/H</span>
                            </div>
                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">Normativo: 0.10 - 0.20 m/h</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Layers className="w-3 h-3 text-cyan-400" /> No. Módulos (n)
                            </label>
                            <input
                                type="number" min="2" value={designParams.num_units}
                                onChange={(e) => setDesignParams({ ...designParams, num_units: parseInt(e.target.value) || 0 })}
                                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-cyan-500/50 transition-all font-bold"
                            />
                            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">Mínimo 2 módulos requeridos</p>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Ruler className="w-3 h-3 text-cyan-400" /> Relación Largo/Ancho (L:a)
                            </label>
                            <input
                                type="number" step="0.1" value={designParams.ratio_l_a}
                                onChange={(e) => setDesignParams({ ...designParams, ratio_l_a: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-cyan-500/50 transition-all font-bold"
                            />
                        </div>
                    </div>

                    {errors.length > 0 && (
                        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl space-y-2">
                            <p className="text-[9px] font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
                                <AlertCircle className="w-3.5 h-3.5" /> Errores Normativos
                            </p>
                            <ul className="space-y-1">
                                {errors.map((err, i) => (
                                    <li key={i} className="text-[9px] text-red-400/80 font-bold uppercase tracking-tight">• {err}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="mt-8 flex gap-3 pt-4 border-t border-white/5">
                        <button
                            onClick={() => handleSave(false)}
                            disabled={saving || errors.length > 0}
                            className="flex-1 py-3 px-6 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all disabled:opacity-30"
                        >
                            {saving ? 'Procesando...' : 'Guardar Diseño'}
                        </button>
                        <button
                            onClick={() => handleSave(true)}
                            disabled={saving || errors.length > 0}
                            className="flex-[1.5] py-3 px-6 rounded-xl bg-cyan-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 group disabled:opacity-30"
                        >
                            Finalizar e Ir a Desinfección
                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>

                {/* Warning Banner for Schmutzdecke */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-4 backdrop-blur-md">
                    <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30 shrink-0">
                        <FlaskConical className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Control Operativo (Schmutzdecke)</p>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Prohibido cloración previa al FLA. La eficiencia biológica depende de la maduración de la capa biológica (15-30 días).
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column: Results & Build Specs */}
            <div className="lg:col-span-5 space-y-6">
                {/* Results Panel */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl space-y-4">
                    <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-500" /> Resultados Hidráulicos
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                        <ResultItem label="Caudal Unitario" value={results?.q_unit_lps} unit="L/s" icon={Droplets} />
                        <ResultItem label="Área Unitaria" value={results?.area_unit_m2} unit="m²" icon={Box} primary />
                        <ResultItem label="Ancho (a)" value={results?.width_a} unit="m" />
                        <ResultItem label="Largo (L)" value={results?.length_l} unit="m" />
                        <div className="col-span-2">
                            <ResultItem label="Velocidad Real" value={results?.real_vf} unit="m/h" icon={Gauge} />
                        </div>
                    </div>

                    {results && results.area_unit_m2 > 100 && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                            <p className="text-[9px] font-bold text-red-400 uppercase tracking-tight">
                                Área crítica ({'>'}100 m²). Dificulta raspado manual.
                            </p>
                        </div>
                    )}
                </div>

                {/* Build Specs Table */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl relative">
                    <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-emerald-500" /> Perfil Estratigráfico (m)
                    </h3>

                    <div className="space-y-2.5">
                        {[
                            { name: 'Agua Sobrenadante', h: '1.10m', type: 'h_water', color: 'bg-sky-500' },
                            { name: 'Arena Sílice (d10 0.15-0.30mm)', h: '0.80m', type: 'h_sand', color: 'bg-amber-400' },
                            { name: 'Soporte: Grava Fina (1.6-3mm)', h: '0.05m', type: 'h_gravel', color: 'bg-slate-400' },
                            { name: 'Soporte: Grava Media (6-13mm)', h: '0.10m', type: 'h_gravel', color: 'bg-slate-500' },
                            { name: 'Soporte: Grava Gruesa (19-38mm)', h: '0.15m', type: 'h_gravel', color: 'bg-slate-600' },
                        ].map((layer, idx) => (
                            <div key={idx} className="bg-slate-950/30 p-2.5 rounded-xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-1.5 h-6 rounded-full ${layer.color} opacity-40 group-hover:opacity-100 transition-opacity`}></div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-white font-bold tracking-tight">{layer.name}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[11px] font-black text-slate-300 font-mono tracking-tighter">{layer.h}</span>
                                </div>
                            </div>
                        ))}
                        <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex justify-between items-center mt-2 shadow-inner">
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Altura Caja Estimada</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-base font-black text-white">2.50</span>
                                <span className="text-[8px] font-bold text-slate-500 uppercase">m</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
