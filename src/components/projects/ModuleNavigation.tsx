import React from 'react';
import { ModuleKey } from '@/types/project';

interface ModuleNavigationProps {
    projectId: string;
    currentModuleKey: ModuleKey;
}

// Stub component - Navigation now handled by dashboard
export default function ModuleNavigation({ projectId, currentModuleKey }: ModuleNavigationProps) {
    return null;
}
