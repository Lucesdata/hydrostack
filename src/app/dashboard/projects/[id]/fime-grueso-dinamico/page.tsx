import { createClient } from '@/utils/supabase/server';
import FimeModuleForm from '@/components/projects/FimeModuleForm';
import { redirect } from 'next/navigation';

export default async function FimeGruesoDinamicoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: calculations } = await supabase.from('project_calculations').select('*').eq('project_id', id).single();
    if (!calculations) redirect(`/dashboard/projects/${id}/population`);

    const { data: quality } = await supabase.from('project_water_quality').select('*').eq('project_id', id).single();
    const initialData = calculations.metadata?.fime_grueso_dinamico || {};
    const designFlowQMD = calculations.calculated_flows?.qmd_max || 0;

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">E2. Filtro Grueso Dinámico</h1>
            <FimeModuleForm
                projectId={id}
                moduleKey="fime_grueso_dinamico"
                title="Dimensionamiento Hidráulico (FGD)"
                description="Unidad de protección mecánica para remoción de picos de turbiedad."
                designFlowQMD={designFlowQMD}
                initialData={initialData}
                quality={quality}
                fields={[
                    { key: 'velocidad_filtracion', label: 'Velocidad de Filtración', type: 'number', unit: 'm/h' },
                    { key: 'area_requerida', label: 'Área Total Requerida', type: 'number', unit: 'm²' },
                    { key: 'perdida_carga', label: 'Pérdida de Carga Estimada', type: 'number', unit: 'm' }
                ]}
            />
        </div>
    );
}
