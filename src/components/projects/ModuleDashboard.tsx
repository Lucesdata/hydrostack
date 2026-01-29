"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Project, ProjectModuleStatus, ModuleKey, CATEGORY_LABELS } from '@/types/project';
import { RecommendationEngine } from '@/lib/recommendation-engine';

interface ModuleDashboardProps {
    projectId: string;
}

export default function ModuleDashboard({ projectId }: ModuleDashboardProps) {
    const [project, setProject] = useState<Project | null>(null);
    const [moduleStatuses, setModuleStatuses] = useState<Map<ModuleKey, ProjectModuleStatus>>(new Map());
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
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
        };
        fetchData();
    }, [projectId, supabase]);

    const allModules: { num: number; label: string; href: string; moduleKey: ModuleKey; block: string }[] = [
        { num: 1, label: 'Info General', href: `/dashboard/projects/${projectId}/general`, moduleKey: 'general', block: 'A' },
        { num: 2, label: 'Viabilidad Tecnológica', href: `/dashboard/projects/${projectId}/viability-matrix`, moduleKey: 'viability_matrix', block: 'A' },
        { num: 3, label: 'Población y Censo', href: `/dashboard/projects/${projectId}/population`, moduleKey: 'population', block: 'B' },
        { num: 4, label: 'Población Estacional', href: `/dashboard/projects/${projectId}/floating-population`, moduleKey: 'floating_population', block: 'B' },
        { num: 5, label: 'Consumo de Agua', href: `/dashboard/projects/${projectId}/consumption`, moduleKey: 'consumption', block: 'B' },
        { num: 6, label: 'Fuente de Agua', href: `/dashboard/projects/${projectId}/source`, moduleKey: 'source', block: 'C' },
        { num: 7, label: 'Calidad del Agua', href: `/dashboard/projects/${projectId}/quality`, moduleKey: 'quality', block: 'C' },
        { num: 8, label: 'Caudales de Diseño', href: `/dashboard/projects/${projectId}/caudales`, moduleKey: 'caudales', block: 'D' },
        { num: 9, label: 'Almacenamiento', href: `/dashboard/projects/${projectId}/tank`, moduleKey: 'tank', block: 'D' },
        { num: 10, label: 'Conducción', href: `/dashboard/projects/${projectId}/conduccion`, moduleKey: 'conduccion', block: 'D' },
        { num: 11, label: 'Pretratamiento FIME', href: `/dashboard/projects/${projectId}/fime-pretratamiento`, moduleKey: 'fime_pretratamiento', block: 'E' },
        { num: 12, label: 'FG Dinámico', href: `/dashboard/projects/${projectId}/fime-grueso-dinamico`, moduleKey: 'fime_grueso_dinamico', block: 'E' },
        { num: 13, label: 'FG Asc/Des', href: `/dashboard/projects/${projectId}/fime-grueso-asdesc`, moduleKey: 'fime_grueso_asdesc', block: 'E' },
        { num: 14, label: 'Filtro Lento Arena', href: `/dashboard/projects/${projectId}/fime-lento-arena`, moduleKey: 'fime_lento_arena', block: 'E' },
        { num: 15, label: 'Hidráulica FIME', href: `/dashboard/projects/${projectId}/fime-hidraulica`, moduleKey: 'fime_hidraulica', block: 'E' },
        { num: 16, label: 'Implantación', href: `/dashboard/projects/${projectId}/fime-implantacion`, moduleKey: 'fime_implantacion', block: 'E' },
        { num: 17, label: 'Balance de Masas', href: `/dashboard/projects/${projectId}/fime-balance-masas`, moduleKey: 'fime_balance_masas', block: 'E' },
        { num: 18, label: 'Costos OpEx', href: `/dashboard/projects/${projectId}/costs`, moduleKey: 'costs', block: 'F' },
        { num: 19, label: 'Viabilidad O&M', href: `/dashboard/projects/${projectId}/viability`, moduleKey: 'viability', block: 'F' },
    ];

    const getModuleStatus = (moduleKey: ModuleKey) => {
        const moduleStat = moduleStatuses.get(moduleKey);
        const sysRec = project ? RecommendationEngine.getModuleRecommendation(
            moduleKey,
            project.project_domain,
            project.project_context,
            project.project_level,
            project.treatment_category
        ) : 'optional';

        const userComplete = moduleStat?.status_updated_at !== null && moduleStat?.status === 'essential';
        const isMandatory = sysRec === 'essential' || sysRec === 'recommended';

        if (userComplete) return 'completed';
        if (isMandatory) return 'pending';
        return 'optional';
    };

    const stats = {
        completed: allModules.filter(m => getModuleStatus(m.moduleKey) === 'completed').length,
        pending: allModules.filter(m => getModuleStatus(m.moduleKey) === 'pending').length,
        optional: allModules.filter(m => getModuleStatus(m.moduleKey) === 'optional').length,
        total: allModules.length
    };

    const progressPercentage = Math.round((stats.completed / stats.total) * 100);

    return (
        <div style={{ padding: '1.5rem 0', maxWidth: '100%' }}>
            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
            }}>
                {/* Total Modules */}
                <div style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>
                        Total Módulos
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>{stats.total}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.5rem' }}>
                        📈 {project?.treatment_category === 'fime' ? 'FIME' : 'Estándar'}
                    </div>
                </div>

                {/* Completed */}
                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid #e5e7eb'
                }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>
                        Completos
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e293b' }}>{stats.completed}</div>
                    <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '0.5rem', fontWeight: 500 }}>
                        ✓ Finalizados
                    </div>
                </div>

                {/* Pending */}
                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid #e5e7eb'
                }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>
                        Pendientes
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e293b' }}>{stats.pending}</div>
                    <div style={{ fontSize: '0.7rem', color: '#f59e0b', marginTop: '0.5rem', fontWeight: 500 }}>
                        ○ Requeridos
                    </div>
                </div>

                {/* Optional */}
                <div style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: '1px solid #e5e7eb'
                }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>
                        Opcionales
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e293b' }}>{stats.optional}</div>
                    <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.5rem', fontWeight: 500 }}>
                        ◇ No críticos
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Fases FIME */}
                    <div style={{
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        border: '1px solid #e5e7eb'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1rem'
                        }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
                                Módulo FIME - 6 Fases
                            </h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {/* Fase 1 */}
                            <Link
                                href={`/dashboard/projects/${projectId}/fime`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    transition: 'all 0.15s ease',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: 'white'
                                }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '1rem',
                                    fontSize: '1.5rem'
                                }}>
                                    📊
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                        Fase 1: Diagnóstico y Proyección de Demanda
                                    </div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                                        Proyección poblacional • Caudales • QMD
                                    </div>
                                </div>
                                <div style={{
                                    padding: '0.375rem 0.875rem',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.25)',
                                    fontSize: '0.7rem',
                                    fontWeight: 700
                                }}>
                                    DISPONIBLE
                                </div>
                            </Link>

                            {/* Fase 2 */}
                            <Link
                                href={`/dashboard/projects/${projectId}/fime-seleccion-tecnologia`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    transition: 'all 0.15s ease',
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    color: 'white'
                                }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '1rem',
                                    fontSize: '1.5rem'
                                }}>
                                    🔍
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                        Fase 2: Selección de Tecnología
                                    </div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                                        Validación CINARA • Criterios de decisión
                                    </div>
                                </div>
                                <div style={{
                                    padding: '0.375rem 0.875rem',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.25)',
                                    fontSize: '0.7rem',
                                    fontWeight: 700
                                }}>
                                    DISPONIBLE
                                </div>
                            </Link>

                            {/* Fase 3 */}
                            <Link
                                href={`/dashboard/projects/${projectId}/fime-grueso-dinamico`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    transition: 'all 0.15s ease',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    color: 'white'
                                }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '1rem',
                                    fontSize: '1.5rem'
                                }}>
                                    🏗️
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                        Fase 3: Dimensionamiento FGDi
                                    </div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                                        Filtración Gruesa Dinámica • Especificaciones
                                    </div>
                                </div>
                                <div style={{
                                    padding: '0.375rem 0.875rem',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.25)',
                                    fontSize: '0.7rem',
                                    fontWeight: 700
                                }}>
                                    NUEVO
                                </div>
                            </Link>

                            {/* Fase 4 */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    background: '#f8fafc',
                                    opacity: 0.6,
                                    cursor: 'not-allowed'
                                }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: '#e5e7eb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '1rem',
                                    fontSize: '1.5rem'
                                }}>
                                    💧
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem', color: '#1e293b' }}>
                                        Fase 4: Dimensionamiento FLA
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                        Filtración Lenta en Arena • Barrera microbiológica
                                    </div>
                                </div>
                                <div style={{
                                    padding: '0.375rem 0.875rem',
                                    borderRadius: '12px',
                                    background: '#fef3c7',
                                    color: '#92400e',
                                    fontSize: '0.7rem',
                                    fontWeight: 700
                                }}>
                                    PRÓXIMAMENTE
                                </div>
                            </div>

                            {/* Fase 5 */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    background: '#f8fafc',
                                    opacity: 0.6,
                                    cursor: 'not-allowed'
                                }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: '#e5e7eb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '1rem',
                                    fontSize: '1.5rem'
                                }}>
                                    ⚡
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem', color: '#1e293b' }}>
                                        Fase 5: Módulo de Desinfección
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                        Hipoclorito • Tanque de contacto CT
                                    </div>
                                </div>
                                <div style={{
                                    padding: '0.375rem 0.875rem',
                                    borderRadius: '12px',
                                    background: '#fef3c7',
                                    color: '#92400e',
                                    fontSize: '0.7rem',
                                    fontWeight: 700
                                }}>
                                    PRÓXIMAMENTE
                                </div>
                            </div>

                            {/* Fase 6 */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    background: '#f8fafc',
                                    opacity: 0.6,
                                    cursor: 'not-allowed'
                                }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: '#e5e7eb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '1rem',
                                    fontSize: '1.5rem'
                                }}>
                                    📄
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem', color: '#1e293b' }}>
                                        Fase 6: Resultados y Soporte
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                        Balance de masas • Planos • Informe PDF
                                    </div>
                                </div>
                                <div style={{
                                    padding: '0.375rem 0.875rem',
                                    borderRadius: '12px',
                                    background: '#fef3c7',
                                    color: '#92400e',
                                    fontSize: '0.7rem',
                                    fontWeight: 700
                                }}>
                                    PRÓXIMAMENTE
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Progress */}
                    <div style={{
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        border: '1px solid #e5e7eb'
                    }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>
                            Progreso del Proyecto
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                            <div style={{
                                width: '180px',
                                height: '180px',
                                borderRadius: '50%',
                                background: `conic-gradient(#10b981 ${progressPercentage * 3.6}deg, #e5e7eb 0deg)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem',
                                position: 'relative'
                            }}>
                                <div style={{
                                    width: '140px',
                                    height: '140px',
                                    borderRadius: '50%',
                                    background: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'column'
                                }}>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1e293b' }}>
                                        {progressPercentage}%
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>
                                        Completado
                                    </div>
                                </div>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
                                {stats.completed} de {stats.total} módulos finalizados
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div style={{
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        border: '1px solid #e5e7eb'
                    }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
                            Acciones Rápidas
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <Link
                                href={`/dashboard/projects/${projectId}/fime`}
                                style={{
                                    display: 'block',
                                    padding: '0.875rem 1.25rem',
                                    background: '#10b981',
                                    color: 'white',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    textAlign: 'center',
                                    transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#059669';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#10b981';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                ⚡ Iniciar Diseño FIME
                            </Link>
                            <Link
                                href={`/dashboard/projects/${projectId}/report`}
                                style={{
                                    display: 'block',
                                    padding: '0.875rem 1.25rem',
                                    background: 'white',
                                    border: '2px solid #e5e7eb',
                                    color: '#1e293b',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    textAlign: 'center',
                                    transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#10b981';
                                    e.currentTarget.style.color = '#10b981';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#e5e7eb';
                                    e.currentTarget.style.color = '#1e293b';
                                }}
                            >
                                📄 Ver Informe Técnico
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
