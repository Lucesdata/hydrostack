import { createClient } from '@/utils/supabase/server';
import FimeModuleForm from '@/components/projects/FimeModuleForm';
import { redirect } from 'next/navigation';

export default async function FimeBalanceMasasPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: calculations } = await supabase.from('project_calculations').select('*').eq('project_id', id).single();
    if (!calculations) redirect(`/dashboard/projects/${id}/population`);

    const { data: quality } = await supabase.from('project_water_quality').select('*').eq('project_id', id).single();
    const initialData = calculations.metadata?.fime_balance_masas || {};
    const designFlowQMD = calculations.calculated_flows?.qmd_max || 0;

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">E7. Balance de Masas</h1>
            <FimeModuleForm
                projectId={id}
                moduleKey="fime_balance_masas"
                title="Remoción Operativa Proyectada"
                description="Estimación de eficiencia de remoción física y biológica por barreras."
                designFlowQMD={designFlowQMD}
                initialData={initialData}
                quality={quality}
                fields={[
                    { key: 'remocion_turbiedad', label: 'Eficiencia Turbiedad Esperada (%)', type: 'number' },
                    { key: 'remocion_sst', label: 'Eficiencia SST Esperada (%)', type: 'number' },
                    { key: 'carga_organica', label: 'Nota sobre Materia Orgánica', type: 'text' }
                ]}
            />
        </div>
    );
}
