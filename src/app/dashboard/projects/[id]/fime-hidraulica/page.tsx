import { createClient } from '@/utils/supabase/server';
import FimeModuleForm from '@/components/projects/FimeModuleForm';
import { redirect } from 'next/navigation';

export default async function FimeHidraulicaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: calculations } = await supabase.from('project_calculations').select('*').eq('project_id', id).single();
    if (!calculations) redirect(`/dashboard/projects/${id}/population`);

    const { data: quality } = await supabase.from('project_water_quality').select('*').eq('project_id', id).single();
    const initialData = calculations.metadata?.fime_hidraulica || {};
    const designFlowQMD = calculations.calculated_flows?.qmd_max || 0;

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">E5. Hidráulica Integrada</h1>
            <FimeModuleForm
                projectId={id}
                moduleKey="fime_hidraulica"
                title="Balance Hidráulico del Sistema"
                description="Gestión de niveles y pérdidas de carga acumuladas en el tren FIME."
                designFlowQMD={designFlowQMD}
                initialData={initialData}
                quality={quality}
                fields={[
                    { key: 'balance_caudales', label: 'Balance de Caudales (L/s)', type: 'number' },
                    { key: 'perdida_acumulada', label: 'Pérdida de Carga Acumulada', type: 'number', unit: 'm' },
                    { key: 'operacion_gravedad', label: '¿Operación 100% Gravedad?', type: 'select', options: ['SÍ', 'NO'] }
                ]}
            />
        </div>
    );
}
