"use client";

import FimeTechSelection from '@/components/projects/FimeTechSelection';
import { useParams } from 'next/navigation';

export default function FimeTechSelectionPage() {
    const params = useParams();
    const projectId = params.id as string;

    return (
        <div className="container mx-auto max-w-5xl">
            <FimeTechSelection projectId={projectId} />
        </div>
    );
}
