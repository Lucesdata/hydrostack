import { createClient } from '@/utils/supabase/server';
import PopulationForm from '@/components/projects/PopulationForm';
import { redirect } from 'next/navigation';

export default async function PopulationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Verify project existence and ownership
    const { data: project, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('id', id)
        .single();

    if (error || !project) {
        redirect('/dashboard');
    }

    // Fetch existing calculations
    const { data: calculations } = await supabase
        .from('project_calculations')
        .select('*')
        .eq('project_id', id)
        .single();

    return (
        <div>
            <h1 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Población y Demanda</h1>
            <p style={{ marginBottom: '2rem', color: 'var(--color-gray-dark)' }}>
                Proyecto: <strong>{project.name}</strong>
            </p>

            <div style={{ marginBottom: '2rem' }}>
                <p style={{ color: 'var(--color-foreground)', marginBottom: '1rem' }}>
                    Ingrese los datos censales para proyectar la población futura y estimar los caudales de diseño.
                </p>
            </div>

            <PopulationForm projectId={id} initialData={calculations} />
        </div>
    );
}
