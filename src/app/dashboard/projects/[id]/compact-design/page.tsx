import { createClient } from '@/utils/supabase/server';
import CompactDesignForm from '@/components/projects/CompactDesignForm';
import { redirect } from 'next/navigation';

export default async function CompactDesignPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: calculations } = await supabase
        .from('project_calculations')
        .select('*')
        .eq('project_id', id)
        .single();

    const { data: compact } = await supabase
        .from('project_compact_ptap')
        .select('*')
        .eq('project_id', id)
        .single();

    if (!calculations) {
        redirect(`/dashboard/projects/${id}/population`);
    }

    const designFlow = calculations.calculated_flows?.qmd_max || 0;

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">12. Ingeniería de Detalle: PTAP Compacta</h1>
            <CompactDesignForm
                projectId={id}
                initialData={compact}
                designFlow={designFlow}
            />
        </div>
    );
}
