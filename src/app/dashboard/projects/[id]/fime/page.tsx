import { createClient } from '@/utils/supabase/server';
import Fase1Diagnostico from '@/components/fime/Fase1Diagnostico';
import { notFound } from 'next/navigation';

export default async function FimeFase1Page({ params }: { params: Promise<{ id: string }> }) {
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

    return <Fase1Diagnostico projectId={id} />;
}
