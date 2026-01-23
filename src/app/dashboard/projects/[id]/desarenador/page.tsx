import { createClient } from '@/utils/supabase/server';
import DesarenadorForm from '@/components/projects/DesarenadorForm';
import { redirect } from 'next/navigation';

export default async function DesarenadorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: calculations } = await supabase
        .from('project_calculations')
        .select('*')
        .eq('project_id', id)
        .single();

    const { data: desarenador } = await supabase
        .from('project_desarenador')
        .select('*')
        .eq('project_id', id)
        .single();

    if (!calculations) {
        redirect(`/dashboard/projects/${id}/population`);
    }

    const designFlowQMD = calculations.calculated_flows?.qmd_max || 0;

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">8. Dimensionamiento del Desarenador</h1>
            <DesarenadorForm
                projectId={id}
                initialData={desarenador}
                designFlowQMD={designFlowQMD}
            />
        </div>
    );
}
