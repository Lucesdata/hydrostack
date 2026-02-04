"use client";

import FimeResults from '@/components/projects/FimeResults';
import { useParams } from 'next/navigation';

export default function FimeResultsPage() {
    const params = useParams();
    const projectId = params.id as string;

    return <FimeResults projectId={projectId} />;
}
