"use client";

/**
 * 🔒 ÁREA CRÍTICA: Sidebar de Navegación de Proyecto
 * Razón: Define el flujo universal de 16 módulos y gestiona los estados de recomendación.
 * Riesgo: Cambios aquí pueden romper la navegación entre módulos o duplicar rutas.
 * 
 * Este componente es el "GPS" técnico de HydroStack.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Project, ProjectModuleStatus, ModuleKey, DOMAIN_LABELS, CONTEXT_LABELS, CATEGORY_LABELS } from '@/types/project';
import { RecommendationEngine } from '@/lib/recommendation-engine';

export default function ProjectSidebar({ projectId }: { projectId: string }) {
    const pathname = usePathname();
    const [project, setProject] = useState<Project | null>(null);
    const [moduleStatuses, setModuleStatuses] = useState<Map<ModuleKey, ProjectModuleStatus>>(new Map());
    const supabase = createClient();

    useEffect(() => {
        const fetchProject = async () => {
            const { data } = await supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .single();
            if (data) setProject(data as Project);
        };

        const fetchModuleStatuses = async () => {
            const { data } = await supabase
                .from('project_module_status')
                .select('*')
                .eq('project_id', projectId);

            if (data) {
                const statusMap = new Map<ModuleKey, ProjectModuleStatus>();
                data.forEach((status: ProjectModuleStatus) => {
                    statusMap.set(status.module_key, status);
                });
                setModuleStatuses(statusMap);
            }
        };

        fetchProject();
        fetchModuleStatuses();
    }, [projectId, supabase]);

    const navItems: { label: string; href: string; moduleKey: ModuleKey }[] = [
        // BLOQUE A: Contexto
        { label: 'Info General', href: `/dashboard/projects/${projectId}/general`, moduleKey: 'general' },
        { label: 'Viabilidad Tecnológica', href: `/dashboard/projects/${projectId}/viability-matrix`, moduleKey: 'viability_matrix' },

        // BLOQUE B: Caracterización de Demanda
        { label: 'Población y Censo', href: `/dashboard/projects/${projectId}/population`, moduleKey: 'population' },
        { label: 'Población Estacional', href: `/dashboard/projects/${projectId}/floating-population`, moduleKey: 'floating_population' },

        // BLOQUE C: Caracterización de Fuente
        { label: 'Fuente de Agua', href: `/dashboard/projects/${projectId}/source`, moduleKey: 'source' },
        { label: 'Consumo de Agua', href: `/dashboard/projects/${projectId}/consumption`, moduleKey: 'consumption' },
        { label: 'Calidad del Agua', href: `/dashboard/projects/${projectId}/quality`, moduleKey: 'quality' },

        // BLOQUE D: Caracterización Hidráulica
        { label: 'Caudales de Diseño', href: `/dashboard/projects/${projectId}/caudales`, moduleKey: 'caudales' },
        { label: 'Almacenamiento', href: `/dashboard/projects/${projectId}/tank`, moduleKey: 'tank' },
        { label: 'Conducción', href: `/dashboard/projects/${projectId}/conduccion`, moduleKey: 'conduccion' },

        // BLOQUE E: Dimensionamiento de Tratamiento (Standard)
        { label: 'Desarenador', href: `/dashboard/projects/${projectId}/desarenador`, moduleKey: 'desarenador' },
        { label: 'Ensayo de Jarras', href: `/dashboard/projects/${projectId}/jar-test`, moduleKey: 'jar_test' },
        { label: 'Filtro Lento', href: `/dashboard/projects/${projectId}/filtro-lento`, moduleKey: 'filtro_lento' },
        { label: 'Ingeniería Compacta', href: `/dashboard/projects/${projectId}/compact-design`, moduleKey: 'compact_design' },

        // BLOQUE E: FIME SPECIALIZED FLOW
        { label: 'Pretratamiento FIME', href: `/dashboard/projects/${projectId}/fime-pretratamiento`, moduleKey: 'fime_pretratamiento' },
        { label: 'Filtro Grueso Dinámico', href: `/dashboard/projects/${projectId}/fime-grueso-dinamico`, moduleKey: 'fime_grueso_dinamico' },
        { label: 'Filtro Grueso Asc/Des', href: `/dashboard/projects/${projectId}/fime-grueso-asdesc`, moduleKey: 'fime_grueso_asdesc' },
        { label: 'Filtro Lento de Arena', href: `/dashboard/projects/${projectId}/fime-lento-arena`, moduleKey: 'fime_lento_arena' },
        { label: 'Hidráulica Integrada', href: `/dashboard/projects/${projectId}/fime-hidraulica`, moduleKey: 'fime_hidraulica' },
        { label: 'Layout e Implantación', href: `/dashboard/projects/${projectId}/fime-implantacion`, moduleKey: 'fime_implantacion' },
        { label: 'Balance de Masas', href: `/dashboard/projects/${projectId}/fime-balance-masas`, moduleKey: 'fime_balance_masas' },

        // BLOQUE E: COMPACT PLANT SPECIALIZED FLOW (SKELETON)
        { label: 'Mezcla Rápida', href: `/dashboard/projects/${projectId}/compact-mixing`, moduleKey: 'compact_mixing' },
        { label: 'Floculación', href: `/dashboard/projects/${projectId}/compact-flocculation`, moduleKey: 'compact_flocculation' },
        { label: 'Sedimentación', href: `/dashboard/projects/${projectId}/compact-sedimentation`, moduleKey: 'compact_sedimentation' },
        { label: 'Filtración Rápida', href: `/dashboard/projects/${projectId}/compact-filtration`, moduleKey: 'compact_filtration' },
        { label: 'Desinfección (CT)', href: `/dashboard/projects/${projectId}/compact-disinfection`, moduleKey: 'compact_disinfection' },

        // BLOQUE F: Evaluación Técnica y Económica
        { label: 'Costos (OpEx)', href: `/dashboard/projects/${projectId}/costs`, moduleKey: 'costs' },
        { label: 'Viabilidad y O&M', href: `/dashboard/projects/${projectId}/viability`, moduleKey: 'viability' },
        { label: 'Matriz AHP (Profundización)', href: `/dashboard/projects/${projectId}/tech-selection`, moduleKey: 'tech_selection' },
    ];

    return (
        <aside style={{
            width: '280px',
            backgroundColor: 'white',
            borderRight: '1px solid var(--color-gray-medium)',
            height: 'calc(100vh - 80px)',
            padding: '1.5rem 1rem',
            position: 'sticky',
            top: '0',
            overflowY: 'auto'
        }}>
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-gray-dark)', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                    Estructura del Proyecto
                </h3>

                {project && (
                    <div style={{ fontSize: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--color-gray-light)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid var(--color-gray-medium)' }}>
                        <div style={{ marginBottom: '0.25rem' }}><strong>Dominio:</strong> {DOMAIN_LABELS[project.project_domain] || project.project_domain}</div>
                        <div style={{ marginBottom: '0.25rem' }}><strong>Contexto:</strong> {CONTEXT_LABELS[project.project_context] || project.project_context}</div>
                        {project.treatment_category && (
                            <div style={{ color: 'var(--color-primary)', fontWeight: 600 }}>T: {CATEGORY_LABELS[project.treatment_category]}</div>
                        )}
                    </div>
                )}

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {(() => {
                        let globalIndex = 0;
                        return [
                            { title: '🟢 BLOQUE A: CONTEXTO', items: navItems.filter(i => ['general', 'viability_matrix'].includes(i.moduleKey)) },
                            { title: '🟢 BLOQUE B: DEMANDA', items: navItems.filter(i => ['population', 'floating_population', 'consumption'].includes(i.moduleKey)) },
                            { title: '🟢 BLOQUE C: FUENTE', items: navItems.filter(i => ['source', 'quality'].includes(i.moduleKey)) },
                            { title: '🟢 BLOQUE D: HIDRÁULICA', items: navItems.filter(i => ['caudales', 'tank', 'conduccion'].includes(i.moduleKey)) },
                            {
                                title: '🟡 BLOQUE E: TRATAMIENTO', items: navItems.filter(i => [
                                    'desarenador', 'jar_test', 'filtro_lento', 'compact_design',
                                    'fime_pretratamiento', 'fime_grueso_dinamico', 'fime_grueso_asdesc',
                                    'fime_lento_arena', 'fime_hidraulica', 'fime_implantacion', 'fime_balance_masas',
                                    'compact_mixing', 'compact_flocculation', 'compact_sedimentation', 'compact_filtration', 'compact_disinfection'
                                ].includes(i.moduleKey))
                            },
                            { title: '🟢 BLOQUE F: EVALUACIÓN', items: navItems.filter(i => ['costs', 'viability', 'tech_selection'].includes(i.moduleKey)) }
                        ].map((block) => {
                            const visibleItems = block.items.filter(item => {
                                const moduleStat = moduleStatuses.get(item.moduleKey);
                                const sysRec = project ? RecommendationEngine.getModuleRecommendation(
                                    item.moduleKey,
                                    project.project_domain,
                                    project.project_context,
                                    project.project_level,
                                    project.treatment_category
                                ) : 'optional';

                                if (moduleStat) return moduleStat.status !== 'not_applicable';
                                return sysRec === 'essential' || sysRec === 'recommended';
                            });

                            if (visibleItems.length === 0) return null;

                            return (
                                <div key={block.title} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-primary)', opacity: 0.8, paddingLeft: '0.85rem', marginBottom: '0.25rem' }}>
                                        {block.title.replace('CARACTERIZACIÓN', 'MODELADO')}
                                    </p>
                                    {visibleItems.map((item) => {
                                        globalIndex++;
                                        const isActive = pathname === item.href;
                                        let moduleStat = moduleStatuses.get(item.moduleKey);

                                        // Auto-healing logic repeated here if needed, but we did it in filtering to check visibility.
                                        // We need the badge though.
                                        const sysRec = project ? RecommendationEngine.getModuleRecommendation(
                                            item.moduleKey,
                                            project.project_domain,
                                            project.project_context,
                                            project.project_level,
                                            project.treatment_category
                                        ) : 'optional';

                                        if (!moduleStat && (sysRec === 'essential' || sysRec === 'recommended')) {
                                            moduleStat = {
                                                module_key: item.moduleKey,
                                                status: sysRec,
                                                is_user_override: false
                                            } as any;
                                        }

                                        const badge = moduleStat ? RecommendationEngine.getRecommendationBadge(moduleStat.status) : null;

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                style={{
                                                    padding: '0.5rem 0.85rem',
                                                    borderRadius: 'var(--radius-sm)',
                                                    textDecoration: 'none',
                                                    fontSize: '0.8rem',
                                                    color: isActive ? 'white' : 'var(--color-gray-dark)',
                                                    backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                                                    transition: 'all 0.15s ease',
                                                    fontWeight: isActive ? 600 : 400,
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    borderLeft: isActive ? 'none' : '2px solid transparent'
                                                }}
                                                onMouseEnter={(e: any) => { if (!isActive) e.currentTarget.style.backgroundColor = '#f4f4f5'; }}
                                                onMouseLeave={(e: any) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                                            >
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '0.5rem' }}>
                                                    {globalIndex}. {item.label}
                                                </span>
                                                {badge && (
                                                    <span
                                                        title={moduleStat?.status === 'essential' && project?.project_context === 'rural' ? 'Esencial por contexto rural: Este componente es clave para asegurar continuidad del servicio y control sanitario.' : `${badge.label}`}
                                                        style={{
                                                            fontSize: '0.55rem',
                                                            flexShrink: 0,
                                                            backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : `${badge.color}15`,
                                                            color: isActive ? 'white' : (moduleStat?.status === 'essential' && project?.project_context === 'rural' ? '#C2410C' : badge.color),
                                                            padding: '0.1rem 0.35rem',
                                                            borderRadius: '0.5rem',
                                                            fontWeight: 800,
                                                            border: isActive ? '1px solid rgba(255,255,255,0.4)' : `1px solid ${badge.color}30`,
                                                            textTransform: 'uppercase'
                                                        }}
                                                    >
                                                        {moduleStat?.status === 'essential' && project?.project_context === 'rural' ? 'RURAL' : badge.label.substring(0, 3)}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            );
                        })
                    })()}
                </nav>
            </div>

            <Link href={`/dashboard/projects/${projectId}/report`} style={{ display: 'block', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', textDecoration: 'none', fontSize: '0.85rem', color: pathname.includes('/report') ? 'white' : 'var(--color-primary)', backgroundColor: pathname.includes('/report') ? 'var(--color-primary)' : 'rgba(34, 84, 131, 0.1)', fontWeight: 600, marginBottom: '1rem', textAlign: 'center' }}>
                📂 Consolidar Memoria Técnica
            </Link>

            <div>
                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-gray-dark)', fontSize: '0.85rem', paddingTop: '1rem', borderTop: '1px solid var(--color-gray-medium)' }}>
                    ← Volver al Dashboard
                </Link>
            </div>
        </aside>
    );
}
