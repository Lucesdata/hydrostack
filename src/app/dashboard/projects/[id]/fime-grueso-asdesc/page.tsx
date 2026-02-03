import { createClient } from '@/utils/supabase/server';
import FimeModulePlaceholder from '@/components/projects/FimeModulePlaceholder';
import { redirect } from 'next/navigation';

export default async function FimeGruesoAsdescPage({ params }: { params: Promise<{ id: string }> }) {
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
                title="FG Ascendente/Descendente"
                description="Filtro grueso de flujo ascendente/descendente — dimensionamiento y especificaciones."
                icon="⬆️⬇️"
            />
        </div>
    );
}
