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
        { label: '1. Info General', href: `/dashboard/projects/${projectId}/general`, moduleKey: 'general' },

        // BLOQUE B: Caracterización de Demanda
        { label: '2. Población y Censo', href: `/dashboard/projects/${projectId}/population`, moduleKey: 'population' },
        { label: '3. Población Estacional', href: `/dashboard/projects/${projectId}/floating-population`, moduleKey: 'floating_population' },

        // BLOQUE C: Caracterización de Fuente
        { label: '4. Fuente de Agua', href: `/dashboard/projects/${projectId}/source`, moduleKey: 'source' },
        { label: '5. Consumo de Agua', href: `/dashboard/projects/${projectId}/consumption`, moduleKey: 'consumption' },
        { label: '6. Calidad del Agua', href: `/dashboard/projects/${projectId}/quality`, moduleKey: 'quality' },

        // BLOQUE D: Caracterización Hidráulica
        { label: '7. Caudales de Diseño', href: `/dashboard/projects/${projectId}/caudales`, moduleKey: 'caudales' },
        { label: '8. Almacenamiento', href: `/dashboard/projects/${projectId}/tank`, moduleKey: 'tank' },
        { label: '9. Conducción', href: `/dashboard/projects/${projectId}/conduccion`, moduleKey: 'conduccion' },

        // BLOQUE E: Dimensionamiento de Tratamiento
        { label: '10. Desarenador', href: `/dashboard/projects/${projectId}/desarenador`, moduleKey: 'desarenador' },
        { label: '11. Ensayo de Jarras', href: `/dashboard/projects/${projectId}/jar-test`, moduleKey: 'jar_test' },
        { label: '12. Filtro Lento', href: `/dashboard/projects/${projectId}/filtro-lento`, moduleKey: 'filtro_lento' },
        { label: '13. Ingeniería Compacta', href: `/dashboard/projects/${projectId}/compact-design`, moduleKey: 'compact_design' },

        // BLOQUE F: Evaluación Técnica y Económica
        { label: '14. Costos (OpEx)', href: `/dashboard/projects/${projectId}/costs`, moduleKey: 'costs' },
        { label: '15. Viabilidad y O&M', href: `/dashboard/projects/${projectId}/viability`, moduleKey: 'viability' },
        { label: '16. Selección de Tecnología', href: `/dashboard/projects/${projectId}/tech-selection`, moduleKey: 'tech_selection' },
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
                    {[
                        { title: '🟢 BLOQUE A: CONTEXTO', items: navItems.filter(i => ['general'].includes(i.moduleKey)) },
                        { title: '🟢 BLOQUE B: DEMANDA', items: navItems.filter(i => ['population', 'floating_population', 'consumption'].includes(i.moduleKey)) },
                        { title: '🟢 BLOQUE C: FUENTE', items: navItems.filter(i => ['source', 'quality'].includes(i.moduleKey)) },
                        { title: '🟢 BLOQUE D: HIDRÁULICA', items: navItems.filter(i => ['caudales', 'tank', 'conduccion'].includes(i.moduleKey)) },
                        { title: '🟡 BLOQUE E: TRATAMIENTO', items: navItems.filter(i => ['desarenador', 'jar_test', 'filtro_lento', 'compact_design'].includes(i.moduleKey)) },
                        { title: '🟢 BLOQUE F: EVALUACIÓN', items: navItems.filter(i => ['costs', 'viability', 'tech_selection'].includes(i.moduleKey)) }
                    ].map((block) => {
                        const visibleItems = block.items.filter(item => {
                            const moduleStat = moduleStatuses.get(item.moduleKey);
                            return moduleStat && moduleStat.status !== 'not_applicable';
                        });

                        if (visibleItems.length === 0) return null;

                        return (
                            <div key={block.title} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-primary)', opacity: 0.8, paddingLeft: '0.85rem', marginBottom: '0.25rem' }}>
                                    {block.title.replace('CARACTERIZACIÓN', 'MODELADO')}
                                </p>
                                {visibleItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    const moduleStat = moduleStatuses.get(item.moduleKey);
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
                                                {item.label.split('. ')[1] || item.label}
                                            </span>
                                            {badge && (
                                                <span
                                                    title={`${badge.label}`}
                                                    style={{
                                                        fontSize: '0.55rem',
                                                        flexShrink: 0,
                                                        backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : `${badge.color}15`,
                                                        color: isActive ? 'white' : badge.color,
                                                        padding: '0.1rem 0.35rem',
                                                        borderRadius: '0.5rem',
                                                        fontWeight: 800,
                                                        border: isActive ? '1px solid rgba(255,255,255,0.4)' : `1px solid ${badge.color}30`,
                                                        textTransform: 'uppercase'
                                                    }}
                                                >
                                                    {badge.label.substring(0, 3)}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        );
                    })}
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
