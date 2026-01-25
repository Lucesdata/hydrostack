import { createClient } from '@/utils/supabase/server';
import FimeModuleForm from '@/components/projects/FimeModuleForm';
import { redirect } from 'next/navigation';

export default async function FimeLentoArenaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: calculations } = await supabase.from('project_calculations').select('*').eq('project_id', id).single();
    if (!calculations) redirect(`/dashboard/projects/${id}/population`);

    const { data: quality } = await supabase.from('project_water_quality').select('*').eq('project_id', id).single();
    const initialData = calculations.metadata?.fime_lento_arena || {};
    const designFlowQMD = calculations.calculated_flows?.qmd_max || 0;

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">E4. Filtro Lento de Arena</h1>
            <FimeModuleForm
                projectId={id}
                moduleKey="fime_lento_arena"
                title="Barrera Microbiológica Principal (FLA)"
                description="Unidad de filtración lenta orientada a la remoción de patógenos y carga biológica."
                designFlowQMD={designFlowQMD}
                initialData={initialData}
                quality={quality}
                fields={[
                    { key: 'area_total', label: 'Área Total de Filtración', type: 'number', unit: 'm²' },
                    { key: 'numero_unidades', label: 'Número de Filtros', type: 'number' },
                    { key: 'velocidad_filtracion', label: 'Velocidad de Filtración', type: 'number', unit: 'm/h' },
                    { key: 'tiempo_maduracion', label: 'Tiempo de Maduración Proyectado', type: 'number', unit: 'días' }
                ]}
            />
        </div>
    );
}
