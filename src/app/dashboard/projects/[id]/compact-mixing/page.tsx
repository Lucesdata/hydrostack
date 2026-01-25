import CompactModuleSkeleton from '@/components/projects/CompactModuleSkeleton';

export default async function CompactMixingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">E1. Mezcla Rápida</h1>
            <CompactModuleSkeleton
                projectId={id}
                moduleKey="compact_mixing"
                title="Coagulación y Mezcla Rápida"
                description="Unidad de alta energía para la dispersión instantánea de coagulantes químicos."
            />
        </div>
    );
}
