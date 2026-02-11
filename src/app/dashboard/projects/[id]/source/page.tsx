import { createClient } from '@/utils/supabase/server';
import SourceForm from '@/components/projects/SourceForm';
import { redirect } from 'next/navigation';
import { ChevronRight, Wind } from 'lucide-react';
import Link from 'next/link';

export default async function SourcePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: project, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('id', id)
        .single();

    if (error || !project) {
        redirect('/dashboard');
    }

    const { data: sourceData } = await supabase
        .from('project_sources')
        .select('*')
        .eq('project_id', id)
        .single();

    return (
        <div className="max-w-5xl mx-auto space-y-4 pb-10">
            {/* Compact Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/5 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">
                        <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Proyectos</Link>
                        <ChevronRight className="w-3 h-3 translate-y-[0.5px]" />
                        <span className="text-emerald-400/80 truncate max-w-[150px]">{project.name}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                        Fuente de Abastecimiento
                        <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono hidden sm:block">
                            Modulo 2
                        </div>
                    </h1>
                </div>
                <p className="text-slate-400 text-xs max-w-sm sm:text-right hidden sm:block leading-tight">
                    Diagnóstico y caracterización técnica de la captación.
                </p>
            </div>

            <SourceForm projectId={id} initialData={sourceData} />
        </div>
    );
}
