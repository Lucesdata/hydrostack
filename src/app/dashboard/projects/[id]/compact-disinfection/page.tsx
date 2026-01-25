import CompactModuleSkeleton from '@/components/projects/CompactModuleSkeleton';

export default async function CompactDisinfectionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">E5. Desinfección</h1>
            <CompactModuleSkeleton
                projectId={id}
                moduleKey="compact_disinfection"
                title="Blindaje Sanitario (CT)"
                description="Garantía de inactivación de patógenos mediante tiempo de contacto con desinfectante."
            />
        </div>
    );
}
