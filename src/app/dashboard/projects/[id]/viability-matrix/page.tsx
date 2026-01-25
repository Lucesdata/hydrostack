import { createClient } from '@/utils/supabase/server';
import ViabilityMatrixForm from '@/components/projects/ViabilityMatrixForm';
import { redirect } from 'next/navigation';
import { Project } from '@/types/project';

export default async function ViabilityMatrixPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

    if (!project) redirect('/dashboard');

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Estructura A2. Viabilidad Tecnológica</h1>
            <ViabilityMatrixForm project={project as Project} />
        </div>
    );
}
