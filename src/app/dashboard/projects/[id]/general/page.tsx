import { createClient } from '@/utils/supabase/server';
import ModuleDashboard from '@/components/projects/ModuleDashboard';
import { notFound } from 'next/navigation';

export default async function GeneralInfoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !project) {
        notFound();
    }

    return <ModuleDashboard projectId={id} />;
}
