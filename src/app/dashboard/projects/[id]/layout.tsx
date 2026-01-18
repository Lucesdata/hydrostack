"use client";

import React, { use } from 'react';
import ProjectSidebar from '@/components/ProjectSidebar';

export default function ProjectLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    // Unwrap params using React.use()
    const { id } = use(params);

    return (
        <div className="container" style={{ display: 'flex', gap: '2rem', padding: '0', maxWidth: '100%' }}>
            <ProjectSidebar projectId={id} />
            <main style={{ flex: 1, padding: '2rem', maxWidth: '1000px' }}>
                {children}
            </main>
        </div>
    );
}
