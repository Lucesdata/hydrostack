import CompactModuleSkeleton from '@/components/projects/CompactModuleSkeleton';

export default async function CompactFlocculationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">E2. Floculación</h1>
            <CompactModuleSkeleton
                projectId={id}
                moduleKey="compact_flocculation"
                title="Crecimiento de Flóculos"
                description="Zonas de gradiente decreciente para promover la aglomeración de partículas desestabilizadas."
            />
        </div>
    );
}
