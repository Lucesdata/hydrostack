"use client";

import FimeDisinfection from '@/components/projects/FimeDisinfection';
import { useParams } from 'next/navigation';

export default function FimeDisinfectionPage() {
    const params = useParams();
    const projectId = params.id as string;

    return <FimeDisinfection projectId={projectId} />;
}
