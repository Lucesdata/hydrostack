import { createClient } from '@/utils/supabase/server';
import TankForm from '@/components/projects/TankForm';
import { redirect } from 'next/navigation';

export default async function TankPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: calculations, error } = await supabase
        .from('project_calculations')
        .select('*')
        .eq('project_id', id)
        .single();

    if (error && error.code !== 'PGRST116') {
        redirect('/dashboard');
    }

    return (
        <div>
            <h1 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Dimensionamiento del Tanque</h1>
            <p style={{ marginBottom: '2rem', color: 'var(--color-gray-dark)' }}>
                Sección 6: Cálculo del volumen de almacenamiento requerido.
            </p>

            <TankForm projectId={id} initialData={calculations} />
        </div>
    );
}
