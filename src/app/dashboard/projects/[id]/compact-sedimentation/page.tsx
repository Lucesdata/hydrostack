import CompactModuleSkeleton from '@/components/projects/CompactModuleSkeleton';

export default async function CompactSedimentationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">E3. Sedimentación</h1>
            <CompactModuleSkeleton
                projectId={id}
                moduleKey="compact_sedimentation"
                title="Clarificación de Alta Tasa"
                description="Separación de sólidos mediante decantación (convencional o lamelar)."
            />
        </div>
    );
}
