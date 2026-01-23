"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import FloatingPopulationForm from '@/components/projects/FloatingPopulationForm';

export default function FloatingPopPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        async function loadProject() {
            const { data } = await supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .single();
            setProject(data);
            setLoading(false);
        }
        loadProject();
    }, [projectId, supabase]);

    if (loading) return <div style={{ padding: '2rem' }}>Cargando dinámicas turísticas...</div>;
    if (!project) return <div style={{ padding: '2rem' }}>Proyecto no encontrado</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Módulo de Población Estacional</h1>
                <p style={{ color: 'var(--color-gray-medium)' }}>Ajuste de demanda por población flotante o variaciones de visitantes.</p>
            </div>
            <FloatingPopulationForm projectId={projectId} />
        </div>
    );
}
