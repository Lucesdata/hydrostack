import { createClient } from '@/utils/supabase/server';
import FimeModulePlaceholder from '@/components/projects/FimeModulePlaceholder';
import { redirect } from 'next/navigation';

export default async function FimeHidraulicaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('id', id)
        .single();

    if (!project) redirect('/dashboard');

    return (
        <div className="container mx-auto py-8">
            <FimeModulePlaceholder
                projectId={id}
                title="Hidráulica FIME"
                description="Balance hidráulico, pérdidas de carga y distribución de flujos en la planta FIME."
                icon="💧"
            />
        </div>
    );
}
