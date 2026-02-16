"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/hooks/useSupabase';
import {
    Activity,
    Settings2,
    Beaker,
    CheckCircle2,
    AlertCircle,
    Info,
    ArrowRightCircle,
    ShieldAlert,
    Wind,
    Waves,
    Target,
    Zap,
    Pencil,
    Table,
    ChevronRight
} from 'lucide-react';

type WaterQuality = {
    turbidity: number | null;
    color: number | null;
    fecal_coliforms: number | null;
    ph: number | null;
    alkalinity: number | null;
};

// Perfil Estándar (Agua Superficial Buena Calidad)
const STANDARD_PROFILE = {
    turbidity: 4.1,
    color: 10.0,
    fecal_coliforms: 56,
    ph: 7.37,
    alkalinity: 150
};

const MetricBox = ({ label, value, unit }: { label: string; value: any; unit?: string }) => (
    <div className="bg-slate-950/40 border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center gap-1 group transition-all hover:bg-slate-950/60">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors tracking-tight">{value}</span>
            {unit && <span className="text-[9px] font-bold text-slate-600 uppercase">{unit}</span>}
        </div>
    </div>
);

export default function FimeTechSelection({ projectId }: { projectId: string }) {
    const router = useRouter();
    const supabase = useSupabase();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [quality, setQuality] = useState<WaterQuality>({ turbidity: null, color: null, fecal_coliforms: null, ph: null, alkalinity: null });
    const [hasData, setHasData] = useState(false);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const { data: qData } = await supabase.from('project_water_quality').select('*').eq('project_id', projectId).maybeSingle();
            if (qData) {
                setQuality({
                    turbidity: qData.turbidity,
                    color: qData.color,
                    fecal_coliforms: qData.fecal_coliforms,
                    ph: qData.ph,
                    alkalinity: qData.alkalinity
                });
                setHasData(qData.turbidity !== null);
            }
            setLoading(false);
        }
        loadData();
    }, [projectId, supabase]);

    const handleUseStandardProfile = async () => {
        setSaving(true);
        const { error } = await supabase.from('project_water_quality').upsert({
            project_id: projectId,
            ...STANDARD_PROFILE,
            updated_at: new Date().toISOString()
        }, { onConflict: 'project_id' });

        if (!error) {
            setQuality(STANDARD_PROFILE);
            setHasData(true);
            router.refresh();
        }
        setSaving(false);
    };

    const recommendation = React.useMemo(() => {
        if (!quality || quality.turbidity === null) return null;

        const t = Number(quality.turbidity);
        const c = Number(quality.color || 0);
        const coli = Number(quality.fecal_coliforms || 0);

        const rec = {
            tech: '',
            configuration: [] as string[],
            message: '',
            description: '',
            type: 'success' as 'success' | 'warning' | 'error',
            warnings: [] as string[],
            requiresPilot: false,
            blocked: false,
            designParams: {
                fgac_vf: 0,
                fla_vf: 0.15
            }
        };

        if (t > 70 || coli > 20000 || c > 40) {
            rec.tech = 'NO APTO PARA DISEÑO DIRECTO';
            rec.message = 'Estudio Piloto Obligatorio';
            rec.description = 'La calidad excede los límites empíricos de la tecnología FIME. Se prohíbe el diseño directo sin validación experimental previa.';
            rec.type = 'error';
            rec.requiresPilot = true;
            rec.blocked = true;
            rec.warnings.push('Turbiedad > 70 UNT o Coliformes > 20k');
            return rec;
        }

        if (t < 10 && coli < 500 && c < 20) {
            rec.tech = 'DISEÑO FGDI + FLA';
            rec.message = 'Nivel Bajo de Contaminación';
            rec.description = 'Según recomendación CINARA: No se requiere filtración gruesa ascendente (FGAC) para estos niveles.';
            rec.type = 'success';
            rec.designParams.fgac_vf = 0;
            return rec;
        }

        if (t <= 20 && coli <= 10000 && c <= 30) {
            rec.tech = 'FGDI + FGAC + FLA';
            rec.message = 'Nivel Medio - Tren Estándar';
            rec.description = 'Configuración recomendada con velocidad de filtración ascendente de 0.60 m/h.';
            rec.type = 'success';
            rec.designParams.fgac_vf = 0.60;
            return rec;
        }

        if (t <= 50 && coli <= 20000 && c <= 40) {
            rec.tech = 'FGDI + FGAC + FLA (MODIFICADO)';
            rec.message = 'Nivel Alto - Régimen Estricto';
            rec.description = 'Se prescribe reducción obligatoria de velocidad en FGAC a 0.45 m/h para asegurar remoción.';
            rec.type = 'warning';
            rec.designParams.fgac_vf = 0.45;
            return rec;
        }

        if (t <= 70) {
            rec.tech = 'FGDI + FGAC SERIE + FLA';
            rec.message = 'Nivel Muy Alto - Configuración Especial';
            rec.description = 'Requiere sistema FGAS-3 (3 capas o serie) operando a baja velocidad (0.30 m/h).';
            rec.type = 'warning';
            rec.warnings.push('Requiere 3 unidades FGAC en serie.');
            rec.designParams.fgac_vf = 0.30;
            return rec;
        }

        rec.tech = 'Evaluación Manual Requerida';
        rec.blocked = true;
        return rec;
    }, [quality]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">Analizando Perfil de Calidad...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">

            {!hasData ? (
                <div className="relative group overflow-hidden bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Beaker className="w-64 h-64 text-emerald-500" />
                    </div>

                    <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                                <Zap className="w-3 h-3" /> Configuración Rápida
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tight">Perfil de Calidad de Entrada</h2>
                            <p className="text-slate-400 text-sm leading-relaxed excerpt">
                                Para agilizar su pre-informe, hemos cargado un <span className="text-emerald-400 font-semibold tracking-wide">Perfil Estándar de Agua Superficial</span> basado en fuentes de buena calidad técnica (Referencia: <span className="italic">Normativa CINARA</span>).
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-2xl mx-auto">
                            <MetricBox label="Turbiedad" value={STANDARD_PROFILE.turbidity} unit="UNT" />
                            <MetricBox label="Color" value={STANDARD_PROFILE.color} unit="UPC" />
                            <MetricBox label="Coliformes" value={STANDARD_PROFILE.fecal_coliforms} unit="UFC" />
                            <MetricBox label="pH" value={STANDARD_PROFILE.ph} />
                            <MetricBox label="Alcalinidad" value={STANDARD_PROFILE.alkalinity} />
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <button
                                onClick={handleUseStandardProfile}
                                disabled={saving}
                                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                {saving ? <span className="animate-pulse">Guardando...</span> : (
                                    <>
                                        Usar valores estándar
                                        <ChevronRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => router.push(`/dashboard/projects/${projectId}/quality`)}
                                className="w-full sm:w-auto px-8 py-3.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 font-bold text-[11px] uppercase tracking-[0.2em] rounded-2xl border border-white/5 transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                <Pencil className="w-4 h-4" />
                                Editar manualmente
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Quality Summary Card */}
                    <div className="lg:col-span-4 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 via-emerald-500 to-emerald-500/50 opacity-20"></div>

                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Beaker className="w-4 h-4 text-emerald-500" /> Datos de la Fuente
                            </h3>
                            <button
                                onClick={() => router.push(`/dashboard/projects/${projectId}/quality`)}
                                className="p-2 rounded-lg bg-slate-800/50 border border-white/5 text-slate-400 hover:text-emerald-400 transition-colors"
                            >
                                <Pencil className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="space-y-4 flex-1">
                            {[
                                { label: 'Turbiedad', value: quality.turbidity, unit: 'UNT', limit: 10, icon: Wind },
                                { label: 'Color Real', value: quality.color, unit: 'UPC', limit: 20, icon: Waves },
                                { label: 'Coliformes', value: quality.fecal_coliforms, unit: 'UFC', limit: 500, icon: Target },
                            ].map((item, idx) => (
                                <div key={idx} className="bg-slate-950/30 p-4 rounded-xl border border-white/5 flex items-center justify-between group transition-all hover:bg-slate-950/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-slate-900/50">
                                            <item.icon className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-400">{item.label}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-lg font-black tracking-tight ${Number(item.value) > item.limit ? 'text-amber-500' : 'text-emerald-400'}`}>
                                            {item.value} <span className="text-[9px] font-bold text-slate-600 uppercase">{item.unit}</span>
                                        </div>
                                        {Number(item.value) > item.limit && (
                                            <div className="text-[8px] font-bold text-amber-500/70 uppercase">Excede Rango Óptimo</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recommendation Card */}
                    <div className="lg:col-span-8">
                        {recommendation && (
                            <div className={`h-full bg-slate-900/40 backdrop-blur-xl border rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col justify-center transition-all duration-500
                                ${recommendation.type === 'success' ? 'border-emerald-500/20' :
                                    recommendation.type === 'warning' ? 'border-amber-500/20' : 'border-red-500/20'}`}>

                                <div className={`absolute top-0 left-0 w-full h-1 opacity-50
                                    ${recommendation.type === 'success' ? 'bg-emerald-500' :
                                        recommendation.type === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`}></div>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-5">
                                        <div className={`p-4 rounded-2xl shadow-lg
                                            ${recommendation.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 shadow-emerald-500/10' :
                                                recommendation.type === 'warning' ? 'bg-amber-500/20 text-amber-400 shadow-amber-500/10' :
                                                    'bg-red-500/20 text-red-400 shadow-red-500/10'}`}>
                                            {recommendation.type === 'success' ? <Settings2 className="w-8 h-8" /> :
                                                recommendation.type === 'warning' ? <ShieldAlert className="w-8 h-8" /> :
                                                    <AlertCircle className="w-8 h-8" />}
                                        </div>
                                        <div className="space-y-1">
                                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-80
                                                ${recommendation.type === 'success' ? 'text-emerald-400' :
                                                    recommendation.type === 'warning' ? 'text-amber-400' : 'text-red-400'}`}>
                                                {recommendation.message}
                                            </span>
                                            <h2 className="text-3xl font-black text-white tracking-tighter leading-none">{recommendation.tech}</h2>
                                        </div>
                                    </div>

                                    <p className="text-slate-400 text-base leading-relaxed max-w-2xl font-medium">
                                        {recommendation.description}
                                    </p>

                                    {recommendation.warnings.length > 0 && (
                                        <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-2xl space-y-2">
                                            {recommendation.warnings.map((w, i) => (
                                                <div key={i} className="flex items-center gap-3 text-red-400 text-[10px] font-bold uppercase tracking-wide">
                                                    <AlertCircle className="w-3.5 h-3.5" /> {w}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {!recommendation.blocked && (
                                        <div className="pt-4">
                                            <button
                                                onClick={() => router.push(`/dashboard/projects/${projectId}/fime-grueso-dinamico`)}
                                                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-3 active:scale-95"
                                            >
                                                Verificar Diseño FGDi
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Results Table Section */}
            {hasData && recommendation && !recommendation.blocked && (
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="space-y-1 text-center md:text-left">
                            <h3 className="text-xl font-bold text-white tracking-tight flex items-center justify-center md:justify-start gap-3">
                                <Table className="w-5 h-5 text-emerald-500" /> Proyección de Eficiencias
                            </h3>
                            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Modelo de Tratamiento Cinara</p>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-950/20">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-950/40 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                    <th className="p-5 border-b border-white/5">Unidad Procesadora</th>
                                    <th className="p-5 border-b border-white/5">Función Técnica</th>
                                    <th className="p-5 border-b border-white/5">Ef. Turbiedad</th>
                                    <th className="p-5 border-b border-white/5">Remoción Bacteriana</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <tr className="hover:bg-white/5 transition-colors group">
                                    <td className="p-5">
                                        <div className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors">FGDi (Dinámico)</div>
                                        <div className="text-[9px] font-bold text-slate-600 uppercase">Pretratamiento</div>
                                    </td>
                                    <td className="p-5 text-xs text-slate-400 font-medium italic">Protección sólidos gruesos</td>
                                    <td className="p-5 text-sm font-mono font-black text-emerald-400">50 - 60%</td>
                                    <td className="p-5 text-xs text-slate-500 font-bold">0.5 - 1.0 Log</td>
                                </tr>
                                {recommendation.tech.includes('FGAC') && (
                                    <tr className="hover:bg-white/5 transition-colors group">
                                        <td className="p-5">
                                            <div className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors">FGAC (Ascendente)</div>
                                            <div className="text-[9px] font-bold text-slate-600 uppercase">Filtración Gruesa</div>
                                        </td>
                                        <td className="p-5 text-xs text-slate-400 font-medium italic">Reducción carga orgánica</td>
                                        <td className="p-5 text-sm font-mono font-black text-emerald-400">70 - 80%</td>
                                        <td className="p-5 text-xs text-slate-500 font-bold">1.0 - 2.0 Log</td>
                                    </tr>
                                )}
                                <tr className="bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors group">
                                    <td className="p-5 border-l-4 border-emerald-500">
                                        <div className="text-xs font-black text-emerald-400">FLA (Arena)</div>
                                        <div className="text-[9px] font-bold text-emerald-500/50 uppercase">Tratamiento Final</div>
                                    </td>
                                    <td className="p-5 text-xs text-slate-300 font-bold">Pulimiento Microbiológico</td>
                                    <td className="p-5">
                                        <div className="text-xs font-black text-emerald-400 uppercase tracking-tighter">Salida &lt; 1.0 UNT</div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-white tracking-tight text-emerald-400 shadow-emerald-500/20">99.9%</span>
                                            <span className="text-[9px] font-bold text-emerald-500/50 uppercase tracking-widest">(3.0 Log)</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
