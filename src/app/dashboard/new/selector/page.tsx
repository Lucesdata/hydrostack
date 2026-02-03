'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/utils/supabase/client';
import ProjectTechSelector from '@/components/selector/ProjectTechSelector';
import { RecommendationEngine } from '@/lib/recommendation-engine';
import type { ProjectContext, TreatmentCategory } from '@/types/project';
import type { TechKey } from '@/lib/selector-engine';

export default function SelectorPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const handleCreateProject = async (payload: {
    name: string;
    project_context: string;
    treatment_category: string;
    decision_metadata: Record<string, unknown>;
    recommendedTech: { key: TechKey; nombre: string; score: number };
  }) => {
    if (!user) {
      setCreateError('Debe iniciar sesión para crear un proyecto');
      return;
    }

    setCreateLoading(true);
    setCreateError('');

    const supabase = createClient();

    try {
      const { data: project, error: insertError } = await supabase
        .from('projects')
        .insert([
          {
            user_id: user.id,
            name: payload.name,
            description: `Proyecto creado desde Selector Pro: ${payload.recommendedTech.nombre}. Origen ${(payload.decision_metadata.selector_origin as string) ?? '—'}, caudal ${(payload.decision_metadata.caudal_lps as number) ?? '—'} L/s.`,
            location: null,
            project_domain: 'water_treatment',
            project_context: payload.project_context as ProjectContext,
            project_level: 'complete_design',
            treatment_category: payload.treatment_category as TreatmentCategory,
            decision_metadata: {
              ...payload.decision_metadata,
              selector_completed_at: new Date().toISOString(),
            },
            status: 'Borrador',
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      if (project) {
        const moduleStatuses = RecommendationEngine.initializeModuleStatuses(
          project.id,
          'water_treatment',
          payload.project_context as ProjectContext,
          'complete_design',
          payload.treatment_category as TreatmentCategory
        );

        const { error: statusError } = await supabase
          .from('project_module_status')
          .insert(moduleStatuses);

        if (statusError) console.error('Error al inicializar módulos:', statusError);

        router.push(`/dashboard/projects/${project.id}/general`);
        router.refresh();
      }
    } catch (err: any) {
      console.error('Error creating project:', err);
      // Supabase errors are often objects with a message property but not instances of Error
      const errorMessage = err?.message || (typeof err === 'string' ? err : 'Error al crear el proyecto');
      setCreateError(errorMessage);
    } finally {
      setCreateLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-slate-50">
        <p className="text-slate-600 font-medium">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      {createError && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2"
          role="alert"
        >
          <span>⚠️</span>
          {createError}
          <button
            type="button"
            onClick={() => setCreateError('')}
            className="ml-2 text-red-600 hover:text-red-800 font-bold"
          >
            ×
          </button>
        </div>
      )}
      <ProjectTechSelector onCreateProject={handleCreateProject} createLoading={createLoading} />
    </div>
  );
}
