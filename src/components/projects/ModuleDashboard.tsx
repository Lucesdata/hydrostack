"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Project, ProjectModuleStatus, ModuleKey, CATEGORY_LABELS } from '@/types/project';
import { RecommendationEngine } from '@/lib/recommendation-engine';
import {
    ClipboardCheck,
    Users,
    Droplets,
    Activity,
    Layout,
    FileText,
    ChevronRight,
    AlertCircle,
    ShieldCheck,
    Zap,
    Settings,
    CheckCircle2,
    CircleDashed,
    BarChart3
} from 'lucide-react';

interface ModuleDashboardProps {
    projectId: string;
}

interface EngineeringPhase {
    id: string;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    moduleKeys: ModuleKey[];
    href: string;
}

export default function ModuleDashboard({ projectId }: ModuleDashboardProps) {
    const [project, setProject] = useState<Project | null>(null);
    const [moduleStatuses, setModuleStatuses] = useState<Map<ModuleKey, ProjectModuleStatus>>(new Map());
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: projectData } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('id', projectId)
                    .single();
                if (projectData) setProject(projectData as Project);

                const { data: statuses } = await supabase
                    .from('project_module_status')
                    .select('*')
                    .eq('project_id', projectId);

                if (statuses) {
                    const statusMap = new Map<ModuleKey, ProjectModuleStatus>();
                    statuses.forEach((status: ProjectModuleStatus) => {
                        statusMap.set(status.module_key, status);
                    });
                    setModuleStatuses(statusMap);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [projectId, supabase]);

    const handleReset = async () => {
        if (!confirm('¿Estás seguro de que quieres reiniciar este proyecto? Se borrarán todos los cálculos y progresos técnicos.')) return;

        try {
            setLoading(true);
            await supabase.from('project_calculations').delete().eq('project_id', projectId);
            await supabase.from('project_module_status').delete().eq('project_id', projectId);
            window.location.reload();
        } catch (error) {
            console.error('Error resetting project:', error);
            alert('Error al reiniciar proyecto.');
        } finally {
            setLoading(false);
        }
    };

    const getModuleIntegrity = useCallback((moduleKey: ModuleKey) => {
        const moduleStat = moduleStatuses.get(moduleKey);
        const recommendation = project ? RecommendationEngine.getModuleRecommendation(
            moduleKey,
            project.project_domain,
            project.project_context,
            project.project_level,
            project.treatment_category
        ) : 'optional';

        const isCompleted = moduleStat?.status_updated_at !== null && (moduleStat?.status === 'essential' || moduleStat?.status === 'recommended' || moduleStat?.status === 'optional');
        const weight = RecommendationEngine.getModuleWeight(recommendation);

        return { isCompleted, weight, recommendation };
    }, [moduleStatuses, project]);

    const phases: EngineeringPhase[] = useMemo(() => [
        {
            id: 'A',
            title: 'Fundamentos',
            subtitle: 'Definición base y matriz de viabilidad',
            icon: <ClipboardCheck />,
            color: '#10b981',
            moduleKeys: ['general', 'viability_matrix'],
            href: `/dashboard/projects/${projectId}/general`
        },
        {
            id: 'B',
            title: 'Demanda',
            subtitle: 'Población y hábitos de consumo',
            icon: <Users />,
            color: '#0ea5e9',
            moduleKeys: ['population', 'floating_population', 'consumption'],
            href: `/dashboard/projects/${projectId}/population`
        },
        {
            id: 'C',
            title: 'Fuente',
            subtitle: 'Caracterización e índices IRCA',
            icon: <Droplets />,
            color: '#3b82f6',
            moduleKeys: ['source', 'quality'],
            href: `/dashboard/projects/${projectId}/source`
        },
        {
            id: 'D',
            title: 'Hidráulica',
            subtitle: 'Caudales, tanques y conducción',
            icon: <Activity />,
            color: '#8b5cf6',
            moduleKeys: ['caudales', 'tank', 'conduccion'],
            href: `/dashboard/projects/${projectId}/caudales`
        },
        {
            id: 'E',
            title: 'Tratamiento',
            subtitle: 'Dimensionamiento de unidades',
            icon: <Layout />,
            color: '#f59e0b',
            moduleKeys: [
                'fime_pretratamiento', 'fime_grueso_dinamico', 'fime_grueso_asdesc',
                'fime_lento_arena', 'fime_hidraulica', 'fime_implantacion', 'fime_balance_masas',
                'compact_mixing', 'compact_flocculation', 'compact_sedimentation', 'compact_filtration', 'compact_disinfection'
            ],
            href: `/dashboard/projects/${projectId}/fime-seleccion-tecnologia`
        },
        {
            id: 'F',
            title: 'Reporte',
            subtitle: 'Costos y expediente técnico',
            icon: <FileText />,
            color: '#f43f5e',
            moduleKeys: ['costs', 'viability'],
            href: `/dashboard/projects/${projectId}/costs`
        }
    ], [projectId]);

    const phaseProgress = useMemo(() => {
        return phases.map(phase => {
            const stats = phase.moduleKeys.map(key => getModuleIntegrity(key))
                .filter(m => m.recommendation !== 'not_applicable');
            const completedCount = stats.filter(s => s.isCompleted).length;
            const totalCount = stats.length;
            const isDone = completedCount === totalCount && totalCount > 0;
            const isStarted = completedCount > 0;
            return { ...phase, completedCount, totalCount, isDone, isStarted };
        });
    }, [phases, getModuleIntegrity]);

    const performanceScore = useMemo(() => {
        const donePhases = phaseProgress.filter(p => p.isDone).length;
        const totalPhases = phaseProgress.length;
        return Math.round((donePhases / totalPhases) * 100);
    }, [phaseProgress]);

    const auditObservations = useMemo(() => {
        if (!project) return [];
        return RecommendationEngine.performTechnicalAudit(project, {});
    }, [project]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-500 min-h-[calc(100vh-100px)] px-2 relative font-sans">
            {/* Header / Reset Button */}
            <div className="absolute top-0 right-2 z-10">
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                >
                    <Activity className="w-3 h-3" />
                    Reiniciar Proyecto
                </button>
            </div>

            {/* Upper Section: New Phase KPI + Details */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* NEW KPI: Phase Status & Performance */}
                <div className="lg:col-span-1 bg-[#12151c] border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group">
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-2">
                                <BarChart3 className="w-3 h-3 text-emerald-500" />
                                Estado de Ingeniería
                            </h3>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-emerald-400 leading-none">{performanceScore}%</span>
                                <div className="w-8 h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: `${performanceScore}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {phaseProgress.map((phase) => (
                                <div key={phase.id} className="flex items-center justify-between group/item">
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${phase.isDone ? 'bg-emerald-500/20 border-emerald-500/50' :
                                                phase.isStarted ? 'bg-amber-500/10 border-amber-500/30' :
                                                    'bg-slate-800/50 border-slate-700'
                                                }`}
                                        >
                                            {phase.isDone ? (
                                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                            ) : (
                                                <span className={`text-[9px] font-bold ${phase.isStarted ? 'text-amber-500' : 'text-slate-500'}`}>{phase.id}</span>
                                            )}
                                        </div>
                                        <span className={`text-[11px] font-medium transition-colors ${phase.isDone ? 'text-slate-200' : 'text-slate-500 group-hover/item:text-slate-300'}`}>
                                            {phase.title}
                                        </span>
                                    </div>
                                    <span className="text-[8px] font-mono text-slate-600 font-bold">
                                        {phase.completedCount}/{phase.totalCount}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/50 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[8px] text-slate-500 uppercase font-black tracking-tighter">Rendimiento</span>
                            <span className="text-lg font-black text-white leading-none tracking-tighter">
                                {performanceScore >= 80 ? 'EXCELENTE' : performanceScore >= 50 ? 'EN PROGRESO' : 'INICIANDO'}
                            </span>
                        </div>
                        <div className={`p-1.5 rounded-lg ${performanceScore >= 80 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                            <Zap className="w-4 h-4 fill-current" />
                        </div>
                    </div>
                </div>

                {/* Project Context & Details */}
                <div className="lg:col-span-3 bg-[#12151c] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                    <div className="pr-40">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                {project?.name || 'Cargando...'}
                            </h1>
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest">
                                {project?.status || 'BORRADOR'}
                            </div>
                        </div>
                        <p className="text-slate-400 text-xs mt-2 leading-snug font-medium">
                            {project?.description ? (project.description.length > 200 ? project.description.substring(0, 200) + '...' : project.description) : 'Planificación técnica de tratamiento de agua potable rural bajo normativa RAS-2000 y CINARA.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 border-y border-slate-800/50 mt-2">
                        <div className="space-y-0.5">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Dominio</span>
                            <div className="text-slate-200 text-xs font-semibold flex items-center gap-1.5">
                                <Droplets className="w-2.5 h-2.5 text-emerald-500" />
                                {project?.project_domain === 'water_treatment' ? 'Potabilización' : 'Residuales'}
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Categoría</span>
                            <div className="text-slate-200 text-xs font-semibold flex items-center gap-1.5 text-ellipsis overflow-hidden whitespace-nowrap">
                                <Settings className="w-2.5 h-2.5 text-emerald-400" />
                                {project?.treatment_category ? CATEGORY_LABELS[project.treatment_category] : '--'}
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Contexto</span>
                            <div className="text-slate-200 text-xs font-semibold flex items-center gap-1.5">
                                <Users className="w-2.5 h-2.5 text-blue-500" />
                                {project?.project_context || 'Rural'}
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Norma</span>
                            <div className="text-slate-200 text-xs font-semibold flex items-center gap-1.5 uppercase">
                                <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
                                RAS-00 / CINARA
                            </div>
                        </div>
                    </div>

                    <div className="mt-3">
                        <h4 className="text-[9px] text-slate-500 font-black uppercase mb-2 flex items-center gap-1.5 tracking-tighter">
                            <AlertCircle className="w-3 h-3 text-emerald-500" />
                            Auditoría Técnica en Tiempo Real
                        </h4>
                        <div className="space-y-1 max-h-[50px] overflow-y-auto pr-2 custom-scrollbar">
                            {auditObservations.length > 0 ? (
                                auditObservations.map((obs, i) => (
                                    <div key={i} className="text-[10px] text-slate-400 bg-slate-800/20 p-1.5 rounded border-l-2 border-emerald-500/50 flex items-start gap-2">
                                        <div className="w-1 h-1 bg-emerald-500 rounded-full mt-1.5" />
                                        <span>{obs}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-[10px] text-slate-500 italic">
                                    Proyecto en cumplimiento técnico inicial. No se detectan anomalías críticas.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid: 6 Engineering Phases */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {phaseProgress.map((phase) => (
                    <Link
                        key={phase.id}
                        href={phase.href}
                        className="group block bg-[#12151c] border border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 transition-all hover:bg-slate-800/20 duration-300 relative overflow-hidden"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div
                                className="p-2 rounded-lg bg-slate-800/50"
                                style={{ color: phase.isStarted ? phase.color : '#475569' }}
                            >
                                {React.cloneElement(phase.icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
                            </div>
                            <div className="text-[9px] font-black text-slate-600 group-hover:text-slate-400 transition-colors uppercase tracking-[0.2em]">
                                Fase {phase.id}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors tracking-tight">
                                    {phase.title}
                                </h3>
                                {phase.isDone && <ShieldCheck className="w-3 h-3 text-emerald-500" />}
                            </div>
                            <p className="text-slate-500 text-[10px] leading-tight mb-3 line-clamp-1">
                                {phase.subtitle}
                            </p>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-800/50">
                            <div className="flex items-center gap-2">
                                <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full transition-all duration-1000 ease-in-out"
                                        style={{
                                            width: `${(phase.completedCount / phase.totalCount) * 100}%`,
                                            backgroundColor: phase.isDone ? '#10b981' : phase.color
                                        }}
                                    />
                                </div>
                                <span className="text-[9px] font-bold text-slate-400">
                                    {phase.completedCount}/{phase.totalCount}
                                </span>
                            </div>
                            <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                        </div>
                    </Link>
                ))}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: #0a0c10;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: #1e293b;
                  border-radius: 2px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: #334155;
                }
            `}</style>
        </div>
    );
}
