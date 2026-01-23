import { createClient } from '@/utils/supabase/server';
import ViabilityForm from '@/components/projects/ViabilityForm';
import { redirect } from 'next/navigation';

export default async function ViabilityPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

    const { data: viability } = await supabase
        .from('project_viability')
        .select('*')
        .eq('project_id', id)
        .single();

    if (!project) {
        redirect('/dashboard');
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">14. Viabilidad de Sitio y Mantenimiento</h1>
            <ViabilityForm
                projectId={id}
                initialData={viability}
            />
        </div>
    );
}
