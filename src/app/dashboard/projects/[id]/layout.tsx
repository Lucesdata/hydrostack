/**
 * 🔒 ÁREA CRÍTICA: Layout de Proyecto
 * Razón: Gestiona la navegación (Sidebar), el contenido principal y el panel de resumen.
 * Riesgo: Fallos aquí desconectan al usuario del proyecto o rompen la navegación entre módulos.
 * 
 * Este layout envuelve todos los 16 módulos técnicos.
 */
import React from 'react';
import ProjectSidebar from '@/components/ProjectSidebar';
import ProjectSummary from '@/components/projects/ProjectSummary';
import ProjectHero from '@/components/projects/ProjectHero';

export default async function ProjectLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <div className="project-layout">
            <ProjectSidebar projectId={id} />
            <main className="project-main">
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <ProjectHero projectId={id} />
                    {children}
                </div>
            </main>
            <ProjectSummary projectId={id} />
        </div>
    );
}
