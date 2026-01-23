"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Project, ModuleKey, ModuleStatus, ProjectModuleStatus } from '@/types/project';
import { RecommendationEngine } from '@/lib/recommendation-engine';
import { useRouter } from 'next/navigation';

/**
 * Componente que muestra advertencias y recomendaciones contextuales en cada módulo
 * basadas en el Diagrama de Decisión Funcional.
 */
export default function ModuleWarning({
    projectId,
    moduleKey
}: {
    projectId: string;
    moduleKey: ModuleKey;
}) {
    const [config, setConfig] = useState<any>(null);
    const [moduleStatus, setModuleStatus] = useState<ProjectModuleStatus | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            // Fetch project metadata for config
            const { data: project } = await supabase
                .from('projects')
                .select('project_domain, project_context, project_level, treatment_category')
                .eq('id', projectId)
                .single();

            // Fetch current module status
            const { data: status } = await supabase
                .from('project_module_status')
                .select('*')
                .eq('project_id', projectId)
                .eq('module_key', moduleKey)
                .single();

            if (project) {
                const moduleConfig = RecommendationEngine.getModuleConfig(
                    moduleKey,
                    project.project_domain,
                    project.project_context,
                    project.project_level,
                    project.treatment_category
                );
                setConfig(moduleConfig);
            }

            if (status) {
                setModuleStatus(status as ProjectModuleStatus);
            }
        };

        fetchData();
    }, [projectId, moduleKey, supabase]);

    const handleStatusUpdate = async (newStatus: ModuleStatus) => {
        if (!moduleStatus) return;
        setIsSaving(true);

        try {
            const { error } = await supabase
                .from('project_module_status')
                .update({
                    status: newStatus,
                    is_user_override: true,
                    status_updated_at: new Date().toISOString()
                })
                .eq('id', moduleStatus.id);

            if (error) throw error;

            setModuleStatus({
                ...moduleStatus,
                status: newStatus,
                is_user_override: true
            });

            router.refresh();
        } catch (err) {
            console.error('Error updating module status:', err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!config) return null;

    const { adaptations } = config;
    const badge = moduleStatus ? RecommendationEngine.getRecommendationBadge(moduleStatus.status) : null;

    return (
        <div style={{ marginBottom: '2.5rem' }}>
            {/* Header: Technical Status & Engineering Decision */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--color-bg-secondary)',
                padding: '1rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-gray-medium)',
                marginBottom: '1.5rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-gray-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Recomendación:
                    </p>
                    {badge && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.25rem 0.75rem',
                            backgroundColor: `${badge.color}15`,
                            color: badge.color,
                            borderRadius: '1rem',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            border: `1px solid ${badge.color}30`
                        }}>
                            {badge.icon} {badge.label}
                        </div>
                    )}
                    {moduleStatus?.is_user_override && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-gray-dark)', fontStyle: 'italic' }}>
                            (Ajustado por el Ingeniero)
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gray-dark)' }}>Estado técnico:</p>
                    <select
                        value={moduleStatus?.status || 'optional'}
                        onChange={(e) => handleStatusUpdate(e.target.value as ModuleStatus)}
                        disabled={isSaving}
                        style={{
                            fontSize: '0.8rem',
                            padding: '0.3rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--color-gray-medium)',
                            backgroundColor: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="essential">Aplicar: Esencial</option>
                        <option value="recommended">Aplicar: Recomendado</option>
                        <option value="optional">Aplicar: Opcional</option>
                        <option value="not_applicable">No aplica al proyecto</option>
                    </select>
                </div>
            </div>

            {/* Contextual Logic */}
            {adaptations && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {adaptations.warning && (
                        <div style={{
                            backgroundColor: '#FFFBEB',
                            border: '1px solid #FCD34D',
                            padding: '1rem',
                            borderRadius: 'var(--radius-sm)',
                            display: 'flex',
                            gap: '0.75rem',
                            alignItems: 'start'
                        }}>
                            <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                            <div style={{ fontSize: '0.9rem', color: '#92400E', lineHeight: 1.5 }}>
                                <strong>Nota Técnica:</strong> {adaptations.warning}
                            </div>
                        </div>
                    )}

                    {adaptations.help_text && (
                        <div style={{
                            backgroundColor: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            padding: '1rem',
                            borderRadius: 'var(--radius-sm)',
                            display: 'flex',
                            gap: '0.75rem',
                            alignItems: 'start'
                        }}>
                            <span style={{ fontSize: '1.25rem' }}>💡</span>
                            <div style={{ fontSize: '0.9rem', color: '#1E40AF', lineHeight: 1.5 }}>
                                <strong>Sugerencia Contextual:</strong> {adaptations.help_text}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
