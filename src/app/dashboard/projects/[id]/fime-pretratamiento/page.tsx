import { createClient } from '@/utils/supabase/server';
import FimeModulePlaceholder from '@/components/projects/FimeModulePlaceholder';
import { redirect } from 'next/navigation';

export default async function FimePretratamientoPage({ params }: { params: Promise<{ id: string }> }) {
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
                title="Pretratamiento FIME"
                description="Desbaste, rejas y prefiltración previa a las etapas FIME."
                icon="🔧"
            />
        </div>
    );
}
