import { createClient } from '@/utils/supabase/server';
import CaudalesForm from '@/components/projects/CaudalesForm';
import { redirect } from 'next/navigation';

export default async function CaudalesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Verify project and fetch calculations data (which contains population and flows)
    const { data: calculations, error } = await supabase
        .from('project_calculations')
        .select('*')
        .eq('project_id', id)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is code for "no rows found"
        redirect('/dashboard');
    }

    return (
        <div>
            <h1 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Caudales de Diseño</h1>
            <p style={{ marginBottom: '2rem', color: 'var(--color-gray-dark)' }}>
                Sección 5: Cálculo de la demanda de agua para el sistema.
            </p>

            <CaudalesForm projectId={id} initialData={calculations} />
        </div>
    );
}
