import CompactModuleSkeleton from '@/components/projects/CompactModuleSkeleton';

export default async function CompactFiltrationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">E4. Filtración Rápida</h1>
            <CompactModuleSkeleton
                projectId={id}
                moduleKey="compact_filtration"
                title="Pulimento de Calidad"
                description="Remoción final de partículas remanentes mediante lechos de arena y antracita."
            />
        </div>
    );
}
