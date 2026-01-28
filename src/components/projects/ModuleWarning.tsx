import React from 'react';
import { ModuleKey } from '@/types/project';

interface ModuleWarningProps {
    projectId: string;
    moduleKey: ModuleKey;
}

// Stub component - No longer used with new architecture
export default function ModuleWarning({ projectId, moduleKey }: ModuleWarningProps) {
    return null;
}
