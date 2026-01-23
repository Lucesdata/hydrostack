import { createClient } from '@/utils/supabase/server';
import ProjectReport from '@/components/projects/ProjectReport';
import { redirect } from 'next/navigation';

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch all project data
    const [
        { data: project },
        { data: calculations },
        { data: source },
        { data: consumption },
        { data: quality },
        { data: conduccion },
        { data: treatment },
        { data: seasonalData },
        { data: jarTest },
        { data: opex },
        { data: viability },
        { data: desarenador },
        { data: filters },
        { data: compact },
        { data: techMatrix }
    ] = await Promise.all([
        supabase.from('projects').select('*').eq('id', id).single(),
        supabase.from('project_calculations').select('*').eq('project_id', id).single(),
        supabase.from('project_sources').select('*').eq('project_id', id).single(),
        supabase.from('project_consumption').select('*').eq('project_id', id).single(),
        supabase.from('project_water_quality').select('*').eq('project_id', id).single(),
        supabase.from('project_conduccion').select('*').eq('project_id', id).single(),
        supabase.from('project_treatment').select('*').eq('project_id', id).single(),
        supabase.from('project_seasonal_data').select('*').eq('id', id).single(),
        supabase.from('project_jar_test').select('*').eq('project_id', id).single(),
        supabase.from('project_opex').select('*').eq('project_id', id).single(),
        supabase.from('project_viability').select('*').eq('project_id', id).single(),
        supabase.from('project_desarenador').select('*').eq('project_id', id).single(),
        supabase.from('project_filtros_lentos').select('*').eq('project_id', id).single(),
        supabase.from('project_compact_ptap').select('*').eq('project_id', id).single(),
        supabase.from('project_tech_matrix').select('*').eq('project_id', id).single(),
    ]);

    if (!project) {
        redirect('/dashboard');
    }

    const reportData = {
        project,
        calculations: {
            ...calculations,
            project_conduccion: conduccion,
            project_treatment: treatment,
            project_seasonal_data: seasonalData,
            project_jar_test: jarTest,
            project_opex: opex,
            project_viability: viability,
            project_desarenador: desarenador,
            project_filtros_lentos: filters,
            project_compact_ptap: compact,
            project_tech_matrix: techMatrix
        },
        source,
        consumption,
        quality
    };

    return (
        <div style={{ padding: '2rem 0' }}>
            <ProjectReport data={reportData} />
        </div>
    );
}
