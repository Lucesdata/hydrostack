"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Project, DOMAIN_LABELS, CONTEXT_LABELS, LEVEL_LABELS, CATEGORY_LABELS } from '@/types/project';

export default function ProjectHero({ projectId }: { projectId: string }) {
    const [project, setProject] = useState<Project | null>(null);
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
        fetchProject();
    }, [projectId, supabase]);

    if (!project) return null;

    return (
        <div style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #1e40af 100%)',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            color: 'white',
            marginBottom: '2rem',
            boxShadow: '0 4px 20px rgba(30, 64, 175, 0.15)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background pattern/glassmorphism effect */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '300px',
                height: '300px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '50%',
                zIndex: 0
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                            {project.name}
                        </h1>
                        <p style={{ opacity: 0.9, fontSize: '1rem', maxWidth: '600px', lineHeight: '1.5' }}>
                            {project.description || 'Sin descripción detallada.'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Badge label={DOMAIN_LABELS[project.project_domain]} icon="💧" />
                        <Badge label={project.status} color="rgba(255,255,255,0.2)" />
                    </div>
                </div>

                <div style={{
                    marginTop: '2rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid rgba(255,255,255,0.15)',
                    display: 'flex',
                    gap: '2.5rem',
                    flexWrap: 'wrap'
                }}>
                    <MetaItem label="Contexto" value={CONTEXT_LABELS[project.project_context]} />
                    <MetaItem label="Nivel" value={LEVEL_LABELS[project.project_level]} />
                    {project.treatment_category && (
                        <MetaItem label="Tecnología" value={CATEGORY_LABELS[project.treatment_category]} />
                    )}
                    {project.location && (
                        <MetaItem label="Ubicación" value={project.location} />
                    )}
                </div>

                {project.project_domain === 'water_treatment' && project.project_context === 'rural' && (
                    <div style={{
                        marginTop: '1.5rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(8px)',
                        padding: '1.25rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'flex-start'
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>🏡</span>
                        <div>
                            <p style={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                                Contexto rural identificado
                            </p>
                            <p style={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.9 }}>
                                Este proyecto se desarrolla en un entorno rural. HydroStack priorizará soluciones de tratamiento robustas, de operación simple y sostenibles en el tiempo. Puedes ajustar o sobreescribir cualquier recomendación técnica según la realidad del sistema.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Badge({ label, icon, color }: { label: string; icon?: string; color?: string }) {
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.8rem',
            backgroundColor: color || 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(4px)',
            borderRadius: '2rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
        }}>
            {icon && <span>{icon}</span>}
            {label}
        </span>
    );
}

function MetaItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.7, marginBottom: '0.25rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                {label}
            </p>
            <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                {value}
            </p>
        </div>
    );
}
