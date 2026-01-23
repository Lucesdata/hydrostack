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
import { Project, ProjectModuleStatus, ModuleKey } from '@/types/project';
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
                        <div style={{ marginBottom: '0.25rem' }}><strong>Dominio:</strong> {project.project_domain === 'water_treatment' ? 'Agua Potable' : 'Residuales'}</div>
                        <div style={{ marginBottom: '0.25rem' }}><strong>Contexto:</strong> {project.project_context}</div>
                        {project.treatment_category && (
                            <div style={{ color: 'var(--color-primary)', fontWeight: 600 }}>C: {project.treatment_category}</div>
                        )}
                    </div>
                )}

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const moduleStatus = moduleStatuses.get(item.moduleKey);
                        const badge = moduleStatus ? RecommendationEngine.getRecommendationBadge(moduleStatus.system_recommendation) : null;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    padding: '0.65rem 0.85rem',
                                    borderRadius: 'var(--radius-sm)',
                                    textDecoration: 'none',
                                    fontSize: '0.85rem',
                                    color: isActive ? 'white' : 'var(--color-gray-dark)',
                                    backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                                    transition: 'all 0.2s ease',
                                    fontWeight: isActive ? 600 : 400,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '0.5rem' }}>
                                    {item.label}
                                </span>
                                {badge && (
                                    <span title={badge.label} style={{ fontSize: '0.75rem', flexShrink: 0 }}>
                                        {badge.icon}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <Link href={`/dashboard/projects/${projectId}/report`} style={{ display: 'block', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', textDecoration: 'none', fontSize: '0.9rem', color: pathname.includes('/report') ? 'white' : 'var(--color-primary)', backgroundColor: pathname.includes('/report') ? 'var(--color-primary)' : 'rgba(34, 84, 131, 0.1)', fontWeight: 600, marginBottom: '1rem', textAlign: 'center' }}>
                📄 Informe Final
            </Link>

            <div>
                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-gray-dark)', fontSize: '0.85rem', paddingTop: '1rem', borderTop: '1px solid var(--color-gray-medium)' }}>
                    ← Volver al Dashboard
                </Link>
            </div>
        </aside>
    );
}
