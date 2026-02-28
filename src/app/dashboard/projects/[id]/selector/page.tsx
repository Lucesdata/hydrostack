import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import TechSelectorWizard from '@/components/selector/TechSelectorWizard';
import { ChevronRight, Compass } from 'lucide-react';
import Link from 'next/link';
import type { SourceInputs } from '@/types/tech-selector';

export default async function ProjectSelectorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    // Verify project exists and fundamentals are complete
    const { data: project, error } = await supabase
        .from('projects')
        .select('id, name, decision_metadata')
        .eq('id', id)
        .single();

    if (error || !project) {
        redirect('/dashboard');
    }

    // Fetch water quality parameters
    const { data: quality } = await supabase
        .from('project_water_quality')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    // Check that population calculations exist (Phase 2 complete)
    const { data: calculations } = await supabase
        .from('project_calculations')
        .select('initial_population, calculated_flows')
        .eq('project_id', id)
        .single();

    if (!calculations?.initial_population) {
        // Fundamentals not complete — redirect back to population
        redirect(`/dashboard/projects/${id}/population`);
    }

    const initialSourceData: SourceInputs = {
        sourceType: project.decision_metadata?.sourceType || 'surface',
        turbidity: quality?.turbidity || 30,
        tds: quality?.tds || 200,
        ironManganese: quality?.iron || 0.2,
        nitrates: quality?.nitrates || 10,
        microbiologicalContamination: (quality?.fecal_coliforms || 0) > 0,
        seasonalVariability: project.decision_metadata?.climate_variability || 'medium',
    };

    return (
        <div className="max-w-6xl mx-auto space-y-4 pb-10 px-4 sm:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/5 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">
                        <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Proyectos</Link>
                        <ChevronRight className="w-3 h-3 translate-y-[0.5px]" />
                        <Link href={`/dashboard/projects/${id}/population`} className="hover:text-emerald-400 transition-colors truncate max-w-[150px]">{project.name}</Link>
                        <ChevronRight className="w-3 h-3 translate-y-[0.5px]" />
                        <span className="text-amber-400/80">Selector Tecnológico</span>
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3 italic">
                        Selector de Tecnología Experto
                        <div className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 font-mono hidden sm:block not-italic">
                            IGST v2.0
                        </div>
                    </h1>
                </div>
                <p className="text-slate-400 text-xs max-w-sm sm:text-right hidden sm:block leading-tight">
                    Motor de decisión multicriterio para selección óptima de tecnología de tratamiento.
                </p>
            </div>

            <TechSelectorWizard initialSourceData={initialSourceData} />
        </div>
    );
}
