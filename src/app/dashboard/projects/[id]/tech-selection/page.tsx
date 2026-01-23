"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import TechSelectionMatrix from '@/components/projects/TechSelectionMatrix';

export default function TechSelectionPage() {
    const params = useParams();
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

    if (loading) return <div style={{ padding: '2rem' }}>Cargando Selección...</div>;
    if (!project) return <div style={{ padding: '2rem' }}>Proyecto no encontrado</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <TechSelectionMatrix projectId={projectId} />
        </div>
    );
}
