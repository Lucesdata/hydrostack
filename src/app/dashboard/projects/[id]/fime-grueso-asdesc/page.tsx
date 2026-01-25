import { createClient } from '@/utils/supabase/server';
import FimeModuleForm from '@/components/projects/FimeModuleForm';
import { redirect } from 'next/navigation';

export default async function FimeGruesoAscDescPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: calculations } = await supabase.from('project_calculations').select('*').eq('project_id', id).single();
    if (!calculations) redirect(`/dashboard/projects/${id}/population`);

    const { data: quality } = await supabase.from('project_water_quality').select('*').eq('project_id', id).single();
    const initialData = calculations.metadata?.fime_grueso_asdesc || {};
    const designFlowQMD = calculations.calculated_flows?.qmd_max || 0;

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">E3. Filtro Grueso Asc/Des</h1>
            <FimeModuleForm
                projectId={id}
                moduleKey="fime_grueso_asdesc"
                title="Diseño de Filtros Gruesos (FGA/FGD)"
                description="Etapas de pre-clarificación física mediante lechos granulares."
                designFlowQMD={designFlowQMD}
                initialData={initialData}
                quality={quality}
                fields={[
                    { key: 'unidades_count', label: 'Número de Unidades', type: 'number' },
                    { key: 'altura_lecho', label: 'Altura del Lecho', type: 'number', unit: 'm' },
                    { key: 'granulometria', label: 'Granulometría Sugerida', type: 'text' },
                    { key: 'tiempo_retencion', label: 'Tiempo de Retención', type: 'number', unit: 'min' }
                ]}
            />
        </div>
    );
}
