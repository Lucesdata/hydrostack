import { createClient } from '@/utils/supabase/server';
import FiltroLentoForm from '@/components/projects/FiltroLentoForm';
import { redirect } from 'next/navigation';

export default async function FiltroLentoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: calculations } = await supabase
        .from('project_calculations')
        .select('*')
        .eq('project_id', id)
        .single();

    const { data: filters } = await supabase
        .from('project_filtros_lentos')
        .select('*')
        .eq('project_id', id)
        .single();

    if (!calculations) {
        redirect(`/dashboard/projects/${id}/population`);
    }

    const designFlowQMD = calculations.calculated_flows?.qmd_max || 0;

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">9. Dimensionamiento de Filtros Lentos</h1>
            <FiltroLentoForm
                projectId={id}
                initialData={filters}
                designFlowQMD={designFlowQMD}
            />
        </div>
    );
}
