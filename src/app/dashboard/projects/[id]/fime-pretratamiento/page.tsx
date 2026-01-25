import { createClient } from '@/utils/supabase/server';
import FimeModuleForm from '@/components/projects/FimeModuleForm';
import { redirect } from 'next/navigation';

export default async function FimePretratamientoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: calculations } = await supabase.from('project_calculations').select('*').eq('project_id', id).single();
    if (!calculations) redirect(`/dashboard/projects/${id}/population`);

    const { data: quality } = await supabase.from('project_water_quality').select('*').eq('project_id', id).single();
    const initialData = calculations.metadata?.fime_pretratamiento || {};
    const designFlowQMD = calculations.calculated_flows?.qmd_max || 0;

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">E1. Pretratamiento FIME</h1>
            <FimeModuleForm
                projectId={id}
                moduleKey="fime_pretratamiento"
                title="Protección Hidráulica y Captación"
                description="Definición de las unidades de protección inicial para el sistema de filtración múltiple."
                designFlowQMD={designFlowQMD}
                initialData={initialData}
                quality={quality}
                fields={[
                    { key: 'captacion_tipo', label: 'Tipo de Captación', type: 'select', options: ['Sumergida', 'Lateral', 'Lateral con Rejas', 'Fondo'] },
                    { key: 'desarenado_previo', label: '¿Requiere Desarenador previo?', type: 'select', options: ['SÍ', 'NO'] },
                    { key: 'proteccion_hidraulica', label: 'Protección Hidráulica (Válvula/Rejas)', type: 'text' }
                ]}
            />
        </div>
    );
}
