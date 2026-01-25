import { createClient } from '@/utils/supabase/server';
import FimeModuleForm from '@/components/projects/FimeModuleForm';
import { redirect } from 'next/navigation';

export default async function FimeImplantacionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: calculations } = await supabase.from('project_calculations').select('*').eq('project_id', id).single();
    if (!calculations) redirect(`/dashboard/projects/${id}/population`);

    const { data: quality } = await supabase.from('project_water_quality').select('*').eq('project_id', id).single();
    const initialData = calculations.metadata?.fime_implantacion || {};
    const designFlowQMD = calculations.calculated_flows?.qmd_max || 0;

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">E6. Layout e Implantación</h1>
            <FimeModuleForm
                projectId={id}
                moduleKey="fime_implantacion"
                title="Superficie y Operatividad"
                description="Definición espacial y accesos para el mantenimiento del sistema rural."
                designFlowQMD={designFlowQMD}
                initialData={initialData}
                quality={quality}
                fields={[
                    { key: 'area_predial', label: 'Área Predial Total', type: 'number', unit: 'm²' },
                    { key: 'separacion_unidades', label: 'Separación entre unidades', type: 'number', unit: 'm' },
                    { key: 'accesos_operativos', label: '¿Accesos operativos validados?', type: 'select', options: ['SÍ', 'NO'] }
                ]}
            />
        </div>
    );
}
