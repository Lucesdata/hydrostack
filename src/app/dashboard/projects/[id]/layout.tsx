/**
 * Layout de Proyecto - Solo Dashboard
 */
import React from 'react';

export default async function ProjectLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <div style={{
            width: '100%',
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            padding: '2rem'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {children}
            </div>
        </div>
    );
}
