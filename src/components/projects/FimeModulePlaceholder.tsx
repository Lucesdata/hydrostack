"use client";

import React from 'react';
import Link from 'next/link';

interface FimeModulePlaceholderProps {
    projectId: string;
    title: string;
    description: string;
    icon?: string;
}

export default function FimeModulePlaceholder({
    projectId,
    title,
    description,
    icon = '🏗️'
}: FimeModulePlaceholderProps) {
    return (
        <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            maxWidth: '640px'
        }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>{icon}</span>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                    {title}
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>{description}</p>
            </div>
            <div style={{
                padding: '2rem',
                border: '2px dashed #e2e8f0',
                borderRadius: '12px',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                marginBottom: '1.5rem'
            }}>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                    Este módulo FIME está en fase de desarrollo. La ingeniería de detalle se implementará en una próxima versión de HydroStack.
                </p>
            </div>
            <Link
                href={`/dashboard/projects/${projectId}/general`}
                style={{
                    display: 'inline-block',
                    padding: '0.5rem 1rem',
                    color: '#059669',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    textDecoration: 'none'
                }}
            >
                ← Volver al proyecto
            </Link>
        </div>
    );
}
