"use client";

import FgdiDesign from '@/components/projects/FgdiDesign';
import { useParams } from 'next/navigation';

export default function FgdiPage() {
    const params = useParams();
    const projectId = params.id as string;

    return (
        <div className="container mx-auto max-w-5xl">
            <FgdiDesign projectId={projectId} />
        </div>
    );
}
