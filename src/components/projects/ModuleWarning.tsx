"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Project, ModuleKey } from '@/types/project';
import { RecommendationEngine } from '@/lib/recommendation-engine';

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
    const supabase = createClient();

    useEffect(() => {
        const fetchProject = async () => {
            const { data } = await supabase
                .from('projects')
                .select('project_domain, project_context, project_level, treatment_category')
                .eq('id', projectId)
                .single();

            if (data) {
                const moduleConfig = RecommendationEngine.getModuleConfig(
                    moduleKey,
                    data.project_domain,
                    data.project_context,
                    data.project_level,
                    data.treatment_category
                );
                setConfig(moduleConfig);
            }
        };

        fetchProject();
    }, [projectId, moduleKey, supabase]);

    if (!config || !config.adaptations) return null;

    const { adaptations } = config;

    return (
        <div style={{ marginBottom: '2rem' }}>
            {adaptations.warning && (
                <div style={{
                    backgroundColor: '#FFFBEB',
                    border: '1px solid #FCD34D',
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1rem',
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
    );
}
