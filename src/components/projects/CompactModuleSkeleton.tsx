"use client";

import React from 'react';
import Button from '@/components/ui/Button';
import ModuleWarning from '@/components/projects/ModuleWarning';
import ModuleNavigation from '@/components/projects/ModuleNavigation';
import { ModuleKey } from '@/types/project';

interface CompactModuleSkeletonProps {
    projectId: string;
    moduleKey: ModuleKey;
    title: string;
    description: string;
}

export default function CompactModuleSkeleton({
    projectId,
    moduleKey,
    title,
    description
}: CompactModuleSkeletonProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-gray-medium)' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>{title}</h2>
                    <p style={{ color: 'var(--color-gray-dark)', fontSize: '0.95rem' }}>{description}</p>
                </div>

                <ModuleWarning projectId={projectId} moduleKey={moduleKey} />

                <div style={{ marginTop: '2rem', padding: '3rem', border: '2px dashed var(--color-gray-medium)', borderRadius: 'var(--radius-md)', textAlign: 'center', backgroundColor: 'var(--color-bg-secondary)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏗️</div>
                    <h3 style={{ fontWeight: 700, color: 'var(--color-gray-dark)', marginBottom: '0.5rem' }}>Módulo en Fase de Definición Técnica</h3>
                    <p style={{ color: 'var(--color-gray-dark)', maxWidth: '500px', margin: '0 auto', fontSize: '0.9rem' }}>
                        Este componente de la Planta Compacta se encuentra actualmente en fase conceptual.
                        La ingeniería de detalle y los algoritmos de dimensionamiento lamelar/coagulación serán implementados en la siguiente fase evolutiva de HydroStack.
                    </p>
                </div>

                <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end', opacity: 0.5 }}>
                    <Button onClick={() => { }} variant="primary" disabled>
                        Guardar (Próximamente)
                    </Button>
                </div>
            </div>

            <ModuleNavigation projectId={projectId} currentModuleKey={moduleKey} />
        </div>
    );
}
