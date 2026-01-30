"use client";

import FlaDesign from '@/components/projects/FlaDesign';
import { useParams } from 'next/navigation';

export default function FlaDesignPage() {
    const params = useParams();
    const projectId = params.id as string;

    return <FlaDesign projectId={projectId} />;
}
