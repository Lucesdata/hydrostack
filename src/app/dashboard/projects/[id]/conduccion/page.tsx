import { createClient } from '@/utils/supabase/server';
import ConduccionForm from '@/components/projects/ConduccionForm';
import { redirect } from 'next/navigation';

export default async function ConduccionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch design flows to get QMD
    const { data: calculations } = await supabase
        .from('project_calculations')
        .select('*')
        .eq('project_id', id)
        .single();

    // Fetch existing conduction data if any
    const { data: conduccion } = await supabase
        .from('project_conduccion')
        .select('*')
        .eq('project_id', id)
        .single();

    const qmd_lps = calculations?.calculated_flows?.qmd_max || 0;

    return (
        <div>
            <h1 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Diseño de Línea de Conducción</h1>
            <p style={{ marginBottom: '2rem', color: 'var(--color-gray-dark)' }}>
                Sección 7: Cálculo hidráulico de tuberías des de la bocatoma hasta el tanque.
            </p>

            <ConduccionForm
                projectId={id}
                initialData={conduccion}
                qmd_lps={qmd_lps}
            />
        </div>
    );
}
