"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Button from '@/components/ui/Button';
import ModuleWarning from './ModuleWarning';
import ModuleNavigation from './ModuleNavigation';
import Link from 'next/link';

type WaterQuality = {
    turbidity: number | null;
    color: number | null;
    fecal_coliforms: number | null;
};

export default function FimeTechSelection({ projectId }: { projectId: string }) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [quality, setQuality] = useState<WaterQuality>({ turbidity: null, color: null, fecal_coliforms: null });

    useEffect(() => {
        async function loadData() {
            const { data: qData } = await supabase.from('project_water_quality').select('*').eq('project_id', projectId).maybeSingle();
            if (qData) {
                setQuality({
                    turbidity: qData.turbidity,
                    color: qData.color,
                    fecal_coliforms: qData.fecal_coliforms
                });
            }
            setLoading(false);
        }
        loadData();
    }, [projectId, supabase]);

    const recommendation = React.useMemo(() => {
        if (quality.turbidity !== null && quality.color !== null) {
            const t = quality.turbidity;
            const c = quality.color;

            // Logic CINARA Table 5.1
            if (t < 10 && c < 20) {
                return {
                    tech: 'FGDi + FLA',
                    message: 'Calidad de agua adecuada para Tren Estándar FIME.',
                    description: 'La baja carga de sólidos permite utilizar Filtro Grueso Dinámico (FGDi) como única etapa de pretratamiento antes del Filtro Lento (FLA).',
                    type: 'success' as const
                };
            } else if (t <= 30 && c <= 40) {
                return {
                    tech: 'FGDi + FGAC + FLA',
                    message: 'Calidad regular. Requiere pretratamiento robusto.',
                    description: 'Niveles intermedios sugieren añadir Filtro Grueso Ascendente en Capas (FGAC) después del FGDi para proteger el Filtro Lento.',
                    type: 'warning' as const
                };
            } else {
                return {
                    tech: 'Tren Complejo (FGDi + FGAS + FLA)',
                    message: 'Alta carga contaminante.',
                    description: 'Se recomienda serie de filtración gruesa completa o sedimentación previa.',
                    type: 'error' as const
                };
            }
        }
        return null;
    }, [quality]);

    if (loading) return <div className="p-8 text-center">Cargando análisis...</div>;

    return (
        <div className="space-y-8">
            <ModuleWarning projectId={projectId} moduleKey="fime_tech_selection" />

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
                <h1 className="text-2xl font-bold text-gray-800">Fase 2: Selección de Tecnología</h1>
                <p className="text-gray-600 mt-2">
                    Matriz de decisión basada en la calidad del agua cruda (Modelo CINARA - Tabla 5.1).
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Check Calidad */}
                <div className="bg-white p-6 rounded-lg shadow-sm md:col-span-1">
                    <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Datos de Entrada</h3>
                    <div className="space-y-4">
                        <div>
                            <span className="text-sm text-gray-500 block">Turbiedad Media</span>
                            {quality.turbidity !== null ? (
                                <span className={`text-xl font-bold ${quality.turbidity > 10 ? 'text-orange-600' : 'text-green-600'}`}>
                                    {quality.turbidity} UNT
                                </span>
                            ) : <span className="text-red-500 italic">No registrado</span>}
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 block">Color Real</span>
                            {quality.color !== null ? (
                                <span className={`text-xl font-bold ${quality.color > 20 ? 'text-orange-600' : 'text-green-600'}`}>
                                    {quality.color} UPC
                                </span>
                            ) : <span className="text-red-500 italic">No registrado</span>}
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 block">Coliformes</span>
                            {quality.fecal_coliforms !== null ? (
                                <span className="text-xl font-bold text-gray-800">
                                    {quality.fecal_coliforms} UFC
                                </span>
                            ) : <span className="text-gray-400">No critico para selección física</span>}
                        </div>
                    </div>
                    {(!quality.turbidity || !quality.color) && (
                        <div className="mt-6">
                            <Link href={`/dashboard/projects/${projectId}/quality`} className="text-blue-600 hover:underline text-sm">
                                → Ir a ingresar datos de calidad
                            </Link>
                        </div>
                    )}
                </div>

                {/* Resultado Selección */}
                <div className="bg-white p-6 rounded-lg shadow-sm md:col-span-2 flex flex-col justify-center">
                    <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Tecnología Recomendada</h3>
                    {recommendation ? (
                        <div className={`p-6 rounded-lg border-2 ${recommendation.type === 'success' ? 'border-green-100 bg-green-50' :
                                recommendation.type === 'warning' ? 'border-orange-100 bg-orange-50' : 'border-red-100 bg-red-50'
                            }`}>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl">
                                    {recommendation.type === 'success' ? '✅' : recommendation.type === 'warning' ? '⚠️' : '🛑'}
                                </span>
                                <h2 className="text-2xl font-black text-gray-800">{recommendation.tech}</h2>
                            </div>
                            <p className="font-semibold text-lg mb-2 text-gray-800">{recommendation.message}</p>
                            <p className="text-gray-600">{recommendation.description}</p>

                            <div className="mt-6 flex gap-3">
                                <Button
                                    onClick={() => router.push(`/dashboard/projects/${projectId}/fime-grueso-dinamico`)}
                                    variant="primary"
                                >
                                    Continuar a Diseño FGDi →
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            Complete los datos de calidad para ver la recomendación.
                        </div>
                    )}
                </div>
            </div>

            <ModuleNavigation projectId={projectId} currentModuleKey="fime_tech_selection" />
        </div>
    );
}
