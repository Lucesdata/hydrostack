import { createClient } from '@/utils/supabase/server';
import QualityForm from '@/components/projects/QualityForm';
import { redirect } from 'next/navigation';

export default async function QualityPage({ params }: { params: Promise<{ id: string }> }) {
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

    // Fetch existing quality data
    const { data: qualityData } = await supabase
        .from('project_water_quality')
        .select('*')
        .eq('project_id', id)
        .single();

    return (
        <div>
            <h1 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Calidad del Agua</h1>
            <p style={{ marginBottom: '2rem', color: 'var(--color-gray-dark)' }}>
                Sección 4: Percepción y análisis de la calidad del agua.
            </p>

            <QualityForm projectId={id} initialData={qualityData} />
        </div>
    );
}
