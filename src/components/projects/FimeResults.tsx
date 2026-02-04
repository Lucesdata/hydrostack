"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import Button from '@/components/ui/Button';
import ModuleWarning from './ModuleWarning';
import ModuleNavigation from './ModuleNavigation';

type ProjectCalculations = {
    qmd_max?: number;
    fgdi?: {
        params: any;
        results: any;
    };
    fla?: {
        params: any;
        results: any;
    };
    disinfection?: {
        params: any;
        results: any;
    };
};

export default function FimeResults({ projectId }: { projectId: string }) {
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ProjectCalculations | null>(null);

    useEffect(() => {
        async function loadData() {
            const { data: cData } = await supabase
                .from('project_calculations')
                .select('calculated_flows')
                .eq('project_id', projectId)
                .maybeSingle();

            if (cData && cData.calculated_flows) {
                setData(cData.calculated_flows);
            }
            setLoading(false);
        }
        loadData();
    }, [projectId, supabase]);

    if (loading) return <div className="p-8 text-center text-gray-500">Generando reporte consolidado...</div>;

    if (!data) return <div className="p-8 text-center text-red-500">No se encontraron datos de diseño para este proyecto.</div>;

    return (
        <div className="space-y-8">
            <ModuleWarning projectId={projectId} moduleKey="fime_balance_masas" />

            {/* Header */}
            <div className="bg-white p-8 rounded-lg shadow-lg border-t-8 border-green-600">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">Resumen Ejecutivo de Diseño</h1>
                        <p className="text-gray-600 mt-2 text-lg">
                            Sistema de Potabilización FIME (Filtración en Múltiples Etapas)
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold">
                            ESTADO: FINALIZADO
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                {/* 1. Basic Parameters */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                        <span>💧</span> Parámetros Base
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded">
                            <span className="block text-xs text-gray-500 uppercase">Caudal de Diseño (QMD)</span>
                            <span className="text-xl font-bold text-gray-900">{data.qmd_max?.toFixed(2) || '---'} L/s</span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded">
                            <span className="block text-xs text-gray-500 uppercase">Capacidad Diaria</span>
                            <span className="text-xl font-bold text-gray-900">
                                {data.qmd_max ? ((data.qmd_max * 86400) / 1000).toFixed(1) : '---'} m³/día
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. FGDi Summary */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-blue-800 mb-4 border-b pb-2 flex items-center gap-2">
                        <span>🏗️</span> 1. Pretratamiento (FGDi)
                    </h2>
                    {data.fgdi?.results ? (
                        <div className="space-y-3 font-mono text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Unidades:</span>
                                <span className="font-bold">{data.fgdi.params.num_units}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Velocidad de Filtración:</span>
                                <span className="font-bold">{data.fgdi.params.filtration_rate} m/h</span>
                            </div>
                            <div className="flex justify-between bg-blue-50 p-2 rounded">
                                <span className="text-blue-800">Área Total Requerida:</span>
                                <span className="font-bold text-blue-900">{data.fgdi.results.totalRequiredArea} m²</span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-400 italic text-sm">Sin datos de diseño.</p>
                    )}
                </div>

                {/* 3. FLA Summary */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-cyan-800 mb-4 border-b pb-2 flex items-center gap-2">
                        <span>🛡️</span> 2. Tratamiento (FLA)
                    </h2>
                    {data.fla?.results ? (
                        <div className="space-y-3 font-mono text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Unidades:</span>
                                <span className="font-bold">{data.fla.params.num_units}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Velocidad de Filtración:</span>
                                <span className="font-bold">{data.fla.params.vf} m/h</span>
                            </div>
                            <div className="flex justify-between bg-cyan-50 p-2 rounded">
                                <span className="text-cyan-800">Área Total Superficial:</span>
                                <span className="font-bold text-cyan-900">{data.fla.results.area_total_m2.toFixed(2)} m²</span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-400 italic text-sm">Sin datos de diseño.</p>
                    )}
                </div>

                {/* 4. Disinfection Summary */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-yellow-800 mb-4 border-b pb-2 flex items-center gap-2">
                        <span>⚡</span> 3. Desinfección
                    </h2>
                    {data.disinfection?.results ? (
                        <div className="space-y-3 font-mono text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tiempo de Contacto:</span>
                                <span className="font-bold">{data.disinfection.params.contact_time} min</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Dosis Cloro:</span>
                                <span className="font-bold">{data.disinfection.params.chlorine_dose} mg/L</span>
                            </div>
                            <div className="flex justify-between bg-yellow-50 p-2 rounded">
                                <span className="text-yellow-800">Consumo Hipoclorito:</span>
                                <span className="font-bold text-yellow-900">{data.disinfection.results.monthly_consumption_kg.toFixed(1)} kg/mes</span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-400 italic text-sm">Sin datos de diseño.</p>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-6 mt-12 mb-8">
                <Button variant="secondary" onClick={() => window.print()}>
                    🖨️ Imprimir / Guardar PDF
                </Button>
                <Link href={`/dashboard/projects/${projectId}/report`} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-lg">
                    📄 Ver Informe Técnico Completo
                </Link>
            </div>

            <ModuleNavigation projectId={projectId} currentModuleKey="fime_balance_masas" />
        </div>
    );
}
