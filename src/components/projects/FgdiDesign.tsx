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
    ArrowUpCircle,
    Thermometer,
    Gauge,
    Save
} from 'lucide-react';

// Types
type WaterQuality = {
    turbidity: number | null;
    color: number | null;
    fecal_coliforms: number | null;
};

type DesignParams = {
    vf: number;
    num_units: number;
    ratio_l_a: number;
};

type DesignResults = {
    q_unit_lps: number;
    q_unit_m3h: number;
    area_m2: number;
    width_a: number;
    length_l: number;
    real_vf: number;
    wash_velocity_check: number;
};

export default function FgdiDesign({ projectId }: { projectId: string }) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Data States
    const [quality, setQuality] = useState<WaterQuality>({ turbidity: null, color: null, fecal_coliforms: null });
    const [qmd, setQmd] = useState<number>(0);

    // Design Inputs
    const [designParams, setDesignParams] = useState<DesignParams>({
        vf: 2.0,
        num_units: 2,
        ratio_l_a: 3
    });

    // Initial Load
    useEffect(() => {
        async function loadData() {
            const { data: qData } = await supabase.from('project_water_quality').select('*').eq('project_id', projectId).maybeSingle();
            if (qData) {
                setQuality({
                    turbidity: qData.turbidity,
                    color: qData.color,
                    fecal_coliforms: qData.fecal_coliforms
                });
            }

            const { data: cData } = await supabase.from('project_calculations').select('calculated_flows').eq('project_id', projectId).maybeSingle();
            if (cData && cData.calculated_flows) {
                const flows = cData.calculated_flows;
                const flowValue = flows.qmd_max || flows.QMD || flows.qmd || flows.qmh_max || 0;
                setQmd(flowValue);
                if (flows.fgdi?.params) {
                    setDesignParams(flows.fgdi.params);
                    setSaved(true);
                }
            }
            setLoading(false);
        }
        loadData();
    }, [projectId, supabase]);

    const recommendation = React.useMemo(() => {
        if (quality.turbidity !== null && quality.color !== null) {
            const t = quality.turbidity;
            const c = quality.color;

            if (t <= 15 && c <= 25) {
                if (t < 10 && c < 20) {
                    return { recommended: true, message: 'FIME Estándar: FGDi + FLA', type: 'success' as const };
                } else {
                    return { recommended: true, message: 'Bajo Riesgo: FGDi mandatorio', type: 'warning' as const };
                }
            } else {
                return { recommended: false, message: 'Requiere FGAC Adicional', type: 'error' as const };
            }
        }
        return { recommended: false, message: 'Sin datos de calidad', type: 'warning' as const };
    }, [quality]);

    const results = React.useMemo(() => {
        if (!qmd || designParams.num_units < 1) return null;

        const q_unit_lps = qmd / designParams.num_units;
        const q_unit_m3h = (q_unit_lps * 3600) / 1000;
        const area = q_unit_m3h / designParams.vf;
        const a = Math.sqrt(area / designParams.ratio_l_a);
        const l = designParams.ratio_l_a * a;

        return {
            q_unit_lps,
            q_unit_m3h,
            area_m2: area,
            width_a: a,
            length_l: l,
            real_vf: q_unit_m3h / (a * l),
            wash_velocity_check: 0.2
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
                fgdi: {
                    params: designParams,
                    results: results,
                    recommendation: recommendation,
                    updated_at: new Date().toISOString()
                }
            };

            const { error: upsertError } = await supabase.from('project_calculations').upsert({
                project_id: projectId,
                calculated_flows: updatedFlows
            }, { onConflict: 'project_id' });

            if (upsertError) throw upsertError;
            setSaved(true);
            if (redirect) router.push(`/dashboard/projects/${projectId}/fime-lento-arena`);
        } catch (error) {
            console.error('Error saving FGDi design:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">Cargando Parámetros...</p>
        </div>
    );

    const errors = [];
    if (designParams.vf < 2.0 || designParams.vf > 3.0) errors.push(`Vf (${designParams.vf} m/h) fuera de rango (2.0 - 3.0 m/h)`);
    if (results && results.area_m2 > 10) errors.push(`Área (${results.area_m2.toFixed(2)} m²) excede máx. 10 m²`);
    if (designParams.ratio_l_a < 3 || designParams.ratio_l_a > 6) errors.push(`Relación L/a fuera de rango (3-6)`);

    const ResultItem = ({ label, value, unit, icon: Icon, primary = false }: any) => (
        <div className={`p-3 rounded-xl border transition-all ${primary ? 'bg-violet-500/10 border-violet-500/20' : 'bg-slate-950/40 border-white/5'}`}>
            <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-1">
                {Icon && <Icon className={`w-3 h-3 ${primary ? 'text-violet-400' : 'text-slate-600'}`} />}
                {label}
            </p>
            <div className="flex items-baseline gap-1.5">
                <span className={`text-xl font-black tracking-tight ${primary ? 'text-violet-400' : 'text-white'}`}>
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
                    <div className="bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-violet-600/20 border border-violet-500/30 rounded-2xl p-4 flex items-center justify-between backdrop-blur-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-full bg-violet-500/5 skew-x-[-20deg] translate-x-32 group-hover:translate-x-16 transition-transform duration-1000"></div>
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center shadow-lg shadow-violet-500/10">
                                <Target className="w-6 h-6 text-violet-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-violet-400/80 uppercase tracking-widest mb-0.5">Caudal Máximo Diario de Diseño</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-white tracking-tighter">{qmd.toFixed(2)}</span>
                                    <span className="text-sm font-bold text-violet-400">L/s</span>
                                    <span className="mx-3 text-slate-700 font-light">|</span>
                                    <span className="text-xl font-bold text-slate-300">{(qmd * 3.6).toFixed(2)}</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">m³/h</span>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-3 bg-slate-950/40 px-4 py-2 rounded-xl border border-white/5 relative z-10">
                            <Activity className="w-4 h-4 text-violet-400" />
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
                                <h4 className="text-white font-black text-lg">Caudal de Diseño Ausente</h4>
                                <p className="text-slate-400 text-sm">Debe completar la Fase 1 para habilitar el dimensionamiento del FGDi.</p>
                            </div>
                        </div>
                        <button onClick={() => router.push(`/dashboard/projects/${projectId}/population`)} className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-[11px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95">
                            Completar Fase 1
                        </button>
                    </div>
                )}
            </div>

            {/* Step 1 & 2 Container */}
            <div className="lg:col-span-7 space-y-6">
                {/* 1. Tech Validation (Compact) */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/20 via-emerald-500/50 to-emerald-500/20"></div>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-emerald-500" /> Validación CINARA
                        </h3>
                        <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm
                            ${recommendation.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                recommendation.type === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                    'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {recommendation.recommended ? 'Apto' : 'Riesgo Alto'}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 text-center">
                            <p className="text-[8px] font-bold text-slate-600 uppercase mb-1">Turbiedad</p>
                            <p className="text-sm font-black text-white">{quality.turbidity ?? '-'} <span className="text-[8px] text-slate-500">UNT</span></p>
                        </div>
                        <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 text-center">
                            <p className="text-[8px] font-bold text-slate-600 uppercase mb-1">Color</p>
                            <p className="text-sm font-black text-white">{quality.color ?? '-'} <span className="text-[8px] text-slate-500">UPC</span></p>
                        </div>
                        <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5 text-center">
                            <p className="text-[8px] font-bold text-slate-600 uppercase mb-1">Coliformes</p>
                            <p className="text-sm font-black text-white text-xs">{quality.fecal_coliforms ?? '-'}</p>
                        </div>
                    </div>

                    <div className={`p-3 rounded-xl border text-[10px] font-bold uppercase tracking-wide flex items-center gap-3
                        ${recommendation.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' :
                            recommendation.type === 'warning' ? 'bg-amber-500/5 border-amber-500/10 text-amber-400' :
                                'bg-red-500/5 border-red-500/10 text-red-400'}`}>
                        {recommendation.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {recommendation.message}
                    </div>
                </div>

                {/* 2. Hydraulic Config */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl relative flex flex-col">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500/20 via-violet-500/50 to-violet-500/20"></div>
                    <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                        <Settings2 className="w-4 h-4 text-violet-500" /> Configuración Hidráulica
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Wind className="w-3 h-3 text-violet-400" /> Vel. Filtración (Vf)
                            </label>
                            <div className="relative group">
                                <input
                                    type="number" step="0.1" value={designParams.vf}
                                    onChange={(e) => setDesignParams({ ...designParams, vf: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-violet-500/50 transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-600">M/H</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Layers className="w-3 h-3 text-violet-400" /> No. Unidades
                            </label>
                            <input
                                type="number" value={designParams.num_units}
                                onChange={(e) => setDesignParams({ ...designParams, num_units: parseInt(e.target.value) || 0 })}
                                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-violet-500/50 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Ruler className="w-3 h-3 text-violet-400" /> Relación Largo/Ancho (L:a)
                            </label>
                            <input
                                type="number" step="0.1" value={designParams.ratio_l_a}
                                onChange={(e) => setDesignParams({ ...designParams, ratio_l_a: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-violet-500/50 transition-all"
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
                            className="flex-[1.5] py-3 px-6 rounded-xl bg-violet-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-violet-500 transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2 group disabled:opacity-30"
                        >
                            Finalizar e Ir a FLA
                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column: Results & Build Specs */}
            <div className="lg:col-span-5 space-y-6">
                {/* Results Panel */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl space-y-4">
                    <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-violet-500" /> Resultados Dimensionamiento
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                        <ResultItem label="Área Unitaria" value={results?.area_m2} unit="m²" icon={Box} />
                        <ResultItem label="Velocidad Real" value={results?.real_vf} unit="m/h" icon={Gauge} />
                        <ResultItem label="Ancho (a)" value={results?.width_a} unit="m" />
                        <ResultItem label="Largo (L)" value={results?.length_l} unit="m" />
                    </div>

                    {results && (
                        <div className="pt-4 border-t border-white/5">
                            <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-3">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Waves className="w-3 h-3 text-violet-400" /> Verificación de Lavado
                                </p>
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-slate-500 uppercase">Q Lavado Req (L/s)</span>
                                    <span className="text-white text-xs">{(0.15 * results.area_m2 * 1000).toFixed(0)} - {(0.30 * results.area_m2 * 1000).toFixed(0)}</span>
                                </div>
                                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="w-2/3 h-full bg-violet-500"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Build Specs Table */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl relative">
                    <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-emerald-500" /> Lecho Filtrante (Normativo)
                    </h3>

                    <div className="space-y-3">
                        {[
                            { name: 'Capa Superior', material: 'Grava Fina', h: '0.20m', size: '3-6mm' },
                            { name: 'Capa Media', material: 'Grava Media', h: '0.20m', size: '6-13mm' },
                            { name: 'Capa Inferior', material: 'Grava Gruesa', h: '0.20m', size: '13-25mm' },
                        ].map((layer, idx) => (
                            <div key={idx} className="bg-slate-950/30 p-3 rounded-lg border border-white/5 flex items-center justify-between text-[10px]">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-slate-500 font-bold uppercase tracking-tight">{layer.name}</span>
                                    <span className="text-white font-black">{layer.material}</span>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-slate-600 font-bold uppercase text-[8px]">Espesor</span>
                                        <span className="text-emerald-400 font-mono font-bold">{layer.h}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-slate-600 font-bold uppercase text-[8px]">Tamaño</span>
                                        <span className="text-slate-400 font-mono italic">{layer.size}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg flex justify-between items-center">
                            <span className="text-[10px] font-black text-emerald-400 uppercase">Altura Total Lecho</span>
                            <span className="text-sm font-black text-white">0.60 m</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
