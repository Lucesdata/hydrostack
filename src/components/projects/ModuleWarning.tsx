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
    const [auditObservations, setAuditObservations] = useState<string[]>([]);
    const [project, setProject] = useState<Project | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            // Fetch project data for config and audits
            const { data: proj } = await supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .single();

            // Fetch current module status
            const { data: status } = await supabase
                .from('project_module_status')
                .select('*')
                .eq('project_id', projectId)
                .eq('module_key', moduleKey)
                .single();

            // Fetch additional data for audits
            const { data: source } = await supabase.from('project_sources').select('*').eq('project_id', projectId).single();
            const { data: calc } = await supabase.from('project_calculations').select('*').eq('project_id', projectId).single();
            const { data: cons } = await supabase.from('project_consumption').select('*').eq('project_id', projectId).single();
            const { data: qual } = await supabase.from('project_water_quality').select('*').eq('project_id', projectId).single();
            const { data: caud } = await supabase.from('project_caudales').select('*').eq('project_id', projectId).single();
            const { data: tank } = await supabase.from('project_tank').select('*').eq('project_id', projectId).single();

            if (proj) {
                setProject(proj as Project);
                const moduleConfig = RecommendationEngine.getModuleConfig(
                    moduleKey,
                    proj.project_domain,
                    proj.project_context,
                    proj.project_level,
                    proj.treatment_category
                );
                setConfig(moduleConfig);

                // Perform Technical Audit Phase B
                const auditData = {
                    source: source,
                    calculations: calc,
                    consumption: cons,
                    quality: qual,
                    caudales: caud,
                    tank: tank
                };
                const observations = RecommendationEngine.performTechnicalAudit(proj as Project, auditData);
                setAuditObservations(observations);
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
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            border: `1px solid ${badge.color}30`
                        }}>
                            <span style={{ fontSize: '1rem' }}>{badge.icon}</span> {badge.label}
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
                        <option value="essential">Definición: Crítico</option>
                        <option value="recommended">Definición: Sugerido</option>
                        <option value="optional">Definición: Complementario</option>
                        <option value="not_applicable">Fuera de alcance</option>
                    </select>
                </div>
            </div>

            {/* Contextual Logic & Passive Audits */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* 🅱️ FASE B: Auditorías Técnicas */}
                {auditObservations.length > 0 && (
                    <div style={{
                        backgroundColor: '#F0F9FF',
                        border: '1px solid #BAE6FD',
                        padding: '1rem 1.25rem',
                        borderRadius: 'var(--radius-md)'
                    }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0369A1', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                            🔭 Auditoría Técnica Proyectada:
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {auditObservations.map((obs, i) => (
                                <li key={i} style={{ fontSize: '0.85rem', color: '#0C4A6E', display: 'flex', gap: '0.5rem' }}>
                                    <span>🔹</span> {obs}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {adaptations && (
                    <>
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
                                <span style={{ fontSize: '1.25rem' }}>ℹ️</span>
                                <div style={{ fontSize: '0.9rem', color: '#92400E', lineHeight: 1.5 }}>
                                    {adaptations.warning}
                                </div>
                            </div>
                        )}

                        {adaptations.help_text && (
                            <div style={{
                                backgroundColor: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                padding: '1rem',
                                borderRadius: 'var(--radius-sm)',
                                display: 'flex',
                                gap: '0.75rem',
                                alignItems: 'start'
                            }}>
                                <span style={{ fontSize: '1.25rem' }}>🎓</span>
                                <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.5 }}>
                                    {adaptations.help_text}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
