import { createClient } from '@/utils/supabase/server';
import GeneralInfoForm from '@/components/projects/GeneralInfoForm';
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

    return (
        <div>
            <h1 style={{ fontSize: '1.5rem', color: 'var(--color-foreground)', marginBottom: '1.5rem' }}>Información General</h1>
            <GeneralInfoForm project={project} />
        </div>
    );
}
