"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import {
    Activity,
    Target,
    ChevronRight,
    Printer,
    FileText,
    LayoutGrid,
    Briefcase,
    Waves,
    ShieldCheck,
    Droplets,
    Settings2,
    Construction,
    FlaskConical,
    CheckCircle2
} from 'lucide-react';

type ProjectCalculations = {
    qmd_max?: number;
    fgdi?: {
        params: any;
        results: any;
    };
    fla?: {
        params: any;
        results: any;
    };
    disinfection?: {
        params: any;
        results: any;
    };
};

export default function FimeResults({ projectId }: { projectId: string }) {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ProjectCalculations | null>(null);

    useEffect(() => {
        async function loadData() {
            const { data: cData } = await supabase
                .from('project_calculations')
                .select('calculated_flows')
                .eq('project_id', projectId)
                .maybeSingle();

            if (cData && cData.calculated_flows) {
                setData(cData.calculated_flows);
            }
            setLoading(false);
        }
        loadData();
    }, [projectId, supabase]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4 text-center">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">Consolidando Reporte Técnico...</p>
        </div>
    );

    if (!data) return (
        <div className="bg-slate-950/40 border border-red-500/20 rounded-2xl p-12 text-center backdrop-blur-xl">
            <p className="text-red-400 font-black uppercase tracking-widest text-xs">Error de Integración</p>
            <p className="text-slate-500 text-sm mt-2">No se encontraron datos de diseño para este proyecto.</p>
        </div>
    );

    const SummaryCard = ({ title, icon: Icon, color, children }: any) => (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-2xl relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${color}`}></div>
            <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4 opacity-50" />}
                {title}
            </h3>
            {children}
        </div>
    );

    const Metric = ({ label, value, unit, sublabel }: any) => (
        <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</span>
            <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-white tracking-tight">{value}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase">{unit}</span>
            </div>
            {sublabel && <span className="text-[8px] font-bold text-slate-600 uppercase mt-1">{sublabel}</span>}
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Status Banner */}
            <div className="bg-gradient-to-r from-emerald-600/20 via-emerald-600/10 to-emerald-600/20 border border-emerald-500/30 rounded-2xl p-5 flex items-center justify-between backdrop-blur-xl relative overflow-hidden">
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-emerald-400/80 uppercase tracking-widest mb-0.5">Estado del Diseño Hidráulico</p>
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase">Sistema Consolidado</h2>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-4 bg-slate-950/40 px-5 py-2.5 rounded-xl border border-white/5 relative z-10">
                    <div className="text-right">
                        <p className="text-[9px] font-bold text-slate-500 uppercase">Resumen</p>
                        <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Listo para Reporte</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/5 flex items-center justify-center border border-emerald-500/10">
                        <FileText className="w-4 h-4 text-emerald-500" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* 1. Basic Parameters */}
                <SummaryCard title="Parámetros Base" icon={Activity} color="from-blue-500/20 via-blue-500/50 to-blue-500/20">
                    <div className="grid grid-cols-1 gap-4">
                        <Metric
                            label="Caudal de Diseño (QMD)"
                            value={data.qmd_max?.toFixed(2) || '---'}
                            unit="L/s"
                        />
                        <Metric
                            label="Producción Diaria"
                            value={data.qmd_max ? ((data.qmd_max * 86400) / 1000).toFixed(1) : '---'}
                            unit="m³/día"
                        />
                    </div>
                </SummaryCard>

                {/* 2. FGDi Summary */}
                <SummaryCard title="Pretratamiento (FGDi)" icon={Construction} color="from-indigo-500/20 via-indigo-500/50 to-indigo-500/20">
                    {data.fgdi?.results ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center group/item text-white">
                                <span className="text-[9px] font-bold text-slate-500 uppercase">Módulos</span>
                                <span className="text-xs font-black font-mono">{data.fgdi.params.num_units}</span>
                            </div>
                            <div className="flex justify-between items-center group/item text-white">
                                <span className="text-[9px] font-bold text-slate-500 uppercase">Velocidad</span>
                                <span className="text-xs font-black font-mono">{data.fgdi.params.filtration_rate} m/h</span>
                            </div>
                            <div className="pt-2 border-t border-white/5 flex flex-col">
                                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Área Total</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-black text-white">{data.fgdi.results.totalRequiredArea}</span>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">m²</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-[10px] font-bold text-slate-600 uppercase italic">Sin dimensionamiento</p>
                    )}
                </SummaryCard>

                {/* 3. FLA Summary */}
                <SummaryCard title="Filtración (FLA)" icon={Waves} color="from-cyan-500/20 via-cyan-500/50 to-cyan-500/20">
                    {data.fla?.results ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center group/item text-white">
                                <span className="text-[9px] font-bold text-slate-500 uppercase">Módulos</span>
                                <span className="text-xs font-black font-mono">{data.fla.params.num_units}</span>
                            </div>
                            <div className="flex justify-between items-center group/item text-white">
                                <span className="text-[9px] font-bold text-slate-500 uppercase">Velocidad</span>
                                <span className="text-xs font-black font-mono">{data.fla.params.vf} m/h</span>
                            </div>
                            <div className="pt-2 border-t border-white/5 flex flex-col">
                                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mb-1">Área Superficial</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-black text-white">{data.fla.results.area_total_m2.toFixed(2)}</span>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">m²</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-[10px] font-bold text-slate-600 uppercase italic">Sin dimensionamiento</p>
                    )}
                </SummaryCard>

                {/* 4. Disinfection Summary */}
                <SummaryCard title="Desinfección" icon={FlaskConical} color="from-amber-500/20 via-amber-500/50 to-amber-500/20">
                    {data.disinfection?.results ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center group/item text-white text-[10px]">
                                <span className="text-[9px] font-bold text-slate-500 uppercase whitespace-nowrap">T. Contacto</span>
                                <span className="font-black font-mono">{data.disinfection.params.contact_time} min</span>
                            </div>
                            <div className="flex justify-between items-center group/item text-white">
                                <span className="text-[9px] font-bold text-slate-500 uppercase">Dosis</span>
                                <span className="text-xs font-black font-mono">{data.disinfection.params.chlorine_dose} mg/L</span>
                            </div>
                            <div className="pt-2 border-t border-white/5 flex flex-col">
                                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest mb-1">Consumo Cloro</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-black text-white">{data.disinfection.results.monthly_consumption_kg.toFixed(1)}</span>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">kg/mes</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-[10px] font-bold text-slate-600 uppercase italic">Sin dimensionamiento</p>
                    )}
                </SummaryCard>
            </div>

            {/* Actions Section */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pt-6 border-t border-white/5">
                <button
                    onClick={() => window.print()}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-white/10 bg-slate-800/50 text-slate-300 font-bold text-[11px] uppercase tracking-widest hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl"
                >
                    <Printer className="w-4 h-4" />
                    Exportar PDF / Imprimir
                </button>
                <Link
                    href={`/dashboard/projects/${projectId}/report`}
                    className="w-full sm:w-auto px-10 py-3.5 rounded-xl bg-emerald-600 text-white font-black text-[11px] uppercase tracking-[0.1em] hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95 group"
                >
                    <FileText className="w-4 h-4" />
                    Generar Memoria Técnica
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>
        </div>
    );
}
