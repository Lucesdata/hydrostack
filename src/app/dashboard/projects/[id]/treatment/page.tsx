import { createClient } from '@/utils/supabase/server';
import TreatmentForm from '@/components/projects/TreatmentForm';
import { redirect } from 'next/navigation';

export default async function TreatmentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch design flows for context
    const { data: calculations } = await supabase
        .from('project_calculations')
        .select('*')
        .eq('project_id', id)
        .single();

    // Fetch water quality for recommendations
    const { data: quality } = await supabase
        .from('project_water_quality')
        .select('*')
        .eq('project_id', id)
        .single();

    // Fetch existing treatment data
    const { data: treatment } = await supabase
        .from('project_treatment')
        .select('*')
        .eq('project_id', id)
        .single();

    const qmd_lps = calculations?.calculated_flows?.qmd_max || 0;

    return (
        <div>
            <h1 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Tratamiento de Agua (PTAP)</h1>
            <p style={{ marginBottom: '2rem', color: 'var(--color-gray-dark)' }}>
                Sección 8: Selección de tecnologías para potabilización de acuerdo a la calidad del agua.
            </p>

            <TreatmentForm
                projectId={id}
                initialData={treatment}
                qualityData={quality}
                qmd_lps={qmd_lps}
            />
        </div>
    );
}
