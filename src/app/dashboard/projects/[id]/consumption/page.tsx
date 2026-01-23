import { createClient } from '@/utils/supabase/server';
import ConsumptionForm from '@/components/projects/ConsumptionForm';
import { redirect } from 'next/navigation';

export default async function ConsumptionPage({ params }: { params: Promise<{ id: string }> }) {
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

    // Fetch existing consumption data
    const { data: consumptionData } = await supabase
        .from('project_consumption')
        .select('*')
        .eq('project_id', id)
        .single();

    return (
        <div>
            <h1 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Consumo de Agua</h1>
            <p style={{ marginBottom: '2rem', color: 'var(--color-gray-dark)' }}>
                Sección 3: Hábitos y necesidades de consumo.
            </p>

            <ConsumptionForm projectId={id} initialData={consumptionData} />
        </div>
    );
}
