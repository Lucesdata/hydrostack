import { createClient } from '@/utils/supabase/server';
import SourceForm from '@/components/projects/SourceForm';
import { redirect } from 'next/navigation';

export default async function SourcePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Verify project
    const { data: project, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('id', id)
        .single();

    if (error || !project) {
        redirect('/dashboard');
    }

    // Fetch existing source data
    const { data: sourceData } = await supabase
        .from('project_sources')
        .select('*')
        .eq('project_id', id)
        .single();

    return (
        <div>
            <h1 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Fuente de Abastecimiento</h1>
            <p style={{ marginBottom: '2rem', color: 'var(--color-gray-dark)' }}>
                Sección 2: Diagnóstico de la fuente de agua.
            </p>

            <SourceForm projectId={id} initialData={sourceData} />
        </div>
    );
}
