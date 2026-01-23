import { createClient } from '@/utils/supabase/server';
import OpexForm from '@/components/projects/OpexForm';
import { redirect } from 'next/navigation';

export default async function OpexPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: calculations } = await supabase
        .from('project_calculations')
        .select('*')
        .eq('project_id', id)
        .single();

    const { data: opex } = await supabase
        .from('project_opex')
        .select('*')
        .eq('project_id', id)
        .single();

    const { data: jarTest } = await supabase
        .from('project_jar_test')
        .select('*')
        .eq('project_id', id)
        .single();

    if (!calculations) {
        redirect(`/dashboard/projects/${id}/population`);
    }

    const designFlow = calculations.calculated_flows?.qmd_max || 0;

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">13. Análisis de Costos y Operación (OpEx)</h1>
            <OpexForm
                projectId={id}
                initialData={opex}
                designFlow={designFlow}
                jarTestData={jarTest}
            />
        </div>
    );
}
