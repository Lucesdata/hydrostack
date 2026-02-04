"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Button from '@/components/ui/Button';
import ModuleWarning from './ModuleWarning';
import ModuleNavigation from './ModuleNavigation';

type DesignParams = {
    contact_time: number; // min (15-60)
    chlorine_dose: number; // mg/L (1-3 typ)
    chlorine_concentration: number; // % (e.g. 70% for HTH)
};

type DesignResults = {
    tank_volume_m3: number;
    chlorine_daily_kg: number;
    monthly_consumption_kg: number;
    required_residual: number;
};

export default function FimeDisinfection({ projectId }: { projectId: string }) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Data States
    const [qmd, setQmd] = useState<number>(0);

    // Design Inputs
    const [designParams, setDesignParams] = useState<DesignParams>({
        contact_time: 30,
        chlorine_dose: 1.5,
        chlorine_concentration: 70
    });

    // Initial Load
    useEffect(() => {
        async function loadData() {
            // Fetch Flows & Previous Data
            const { data: cData } = await supabase.from('project_calculations').select('calculated_flows').eq('project_id', projectId).maybeSingle();
            if (cData && cData.calculated_flows) {
                setQmd(cData.calculated_flows.qmd_max || 0);

                if (cData.calculated_flows.disinfection?.params) {
                    setDesignParams(cData.calculated_flows.disinfection.params);
                }
            }
            setLoading(false);
        }
        loadData();
    }, [projectId, supabase]);

    // Derived Design Results
    const results = React.useMemo(() => {
        if (!qmd) return null;

        // V = Q * t
        // Q in L/s -> m3/min = Q * 60 / 1000
        const q_m3min = (qmd * 60) / 1000;
        const vol = q_m3min * designParams.contact_time;

        // Consumption = Q(L/s) * Dose(mg/L) * 86400 / (Conc/100) * 10^-6 (mg to kg)
        // Q * 3600 * 24 = L/day
        const flow_l_day = qmd * 86400;
        const chlorine_pure_kg_day = (flow_l_day * designParams.chlorine_dose) / 1000000;
        const commercial_kg_day = chlorine_pure_kg_day / (designParams.chlorine_concentration / 100);

        return {
            tank_volume_m3: vol,
            chlorine_daily_kg: commercial_kg_day,
            monthly_consumption_kg: commercial_kg_day * 30,
            required_residual: 0.3 // Normativo min
        };
    }, [designParams, qmd]);

    const handleSave = async () => {
        if (!results) return;
        setSaving(true);
        try {
            const { data: latestData, error: fetchError } = await supabase
                .from('project_calculations')
                .select('calculated_flows')
                .eq('project_id', projectId)
                .single();

            if (fetchError) throw fetchError;

            const currentFlows = latestData?.calculated_flows || {};

            const updatedFlows = {
                ...currentFlows,
                disinfection: {
                    params: designParams,
                    results: results,
                    updated_at: new Date().toISOString()
                }
            };

            const { error: updateError } = await supabase
                .from('project_calculations')
                .update({ calculated_flows: updatedFlows })
                .eq('project_id', projectId);

            if (updateError) throw updateError;

            alert('Diseño de Desinfección guardado exitosamente.');
            router.refresh();

        } catch (error) {
            console.error('Error saving disinfection design:', error);
            alert('Error al guardar el diseño.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando módulo de desinfección...</div>;

    return (
        <div className="space-y-8">
            <ModuleWarning projectId={projectId} moduleKey="compact_disinfection" />

            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
                <h1 className="text-2xl font-bold text-gray-800">Fase 5: Desinfección (Tanque de Contacto)</h1>
                <p className="text-gray-600 mt-2">
                    Aseguramiento final de la calidad del agua. El cloro residual libre garantiza la protección contra recontaminación en la red.
                </p>
                <div className="mt-4 flex gap-4 text-sm">
                    <div className="bg-yellow-50 px-3 py-1 rounded text-yellow-800 font-medium">QMD Diseño: {qmd.toFixed(2)} L/s</div>
                </div>
            </div>

            {/* Design Inputs */}
            <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">1. Parámetros de Cloración</h2>

                {!qmd && (
                    <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-lg text-center">
                        <div className="text-red-500 text-4xl mb-2">⚠️</div>
                        <h3 className="text-lg font-bold text-red-800 mb-2">Caudal de Diseño No Definido</h3>
                        <Button onClick={() => router.push(`/dashboard/projects/${projectId}/caudales`)}>
                            Ir a Calcular Caudales
                        </Button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo de Contacto (t)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="15"
                                    value={designParams.contact_time}
                                    onChange={(e) => setDesignParams({ ...designParams, contact_time: parseFloat(e.target.value) })}
                                    className="w-full p-2 border rounded focus:ring-2 outline-none border-gray-300 focus:ring-yellow-500"
                                />
                                <span className="text-gray-500 text-sm">min</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Norma RAS: Mínimo 15-30 minutos.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dosis de Cloro</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0.5"
                                    max="5.0"
                                    value={designParams.chlorine_dose}
                                    onChange={(e) => setDesignParams({ ...designParams, chlorine_dose: parseFloat(e.target.value) })}
                                    className="w-full p-2 border rounded focus:ring-2 outline-none border-gray-300 focus:ring-yellow-500"
                                />
                                <span className="text-gray-500 text-sm">mg/L</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Para garantizar residual de 0.3 a 2.0 mg/L.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Concentración del Químico</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={designParams.chlorine_concentration}
                                    onChange={(e) => setDesignParams({ ...designParams, chlorine_concentration: parseFloat(e.target.value) })}
                                    className="w-full p-2 border rounded focus:ring-2 outline-none border-gray-300 focus:ring-yellow-500"
                                />
                                <span className="text-gray-500 text-sm">%</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Ej: Hipoclorito de Calcio (65-70%), H. de Sodio (15%).</p>
                        </div>
                    </div>

                    <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100">
                        <h3 className="font-semibold text-yellow-900 mb-4">Resultados de Dimensionamiento</h3>

                        {results ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-yellow-200 pb-2">
                                    <span className="text-yellow-800">Volumen Tanque Contacto</span>
                                    <span className="font-bold text-2xl text-yellow-900">{results.tank_volume_m3.toFixed(2)} m³</span>
                                </div>

                                <div className="mt-4">
                                    <h4 className="text-sm font-bold text-yellow-900 mb-2">Consumo de Insumos</h4>
                                    <div className="bg-white p-3 rounded border border-yellow-200 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Diario</span>
                                            <span className="font-bold">{results.chlorine_daily_kg.toFixed(2)} kg/día</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Mensual</span>
                                            <span className="font-bold">{results.monthly_consumption_kg.toFixed(2)} kg/mes</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-yellow-600 italic">Defina caudal para ver resultados...</p>
                        )}
                    </div>
                </div>
            </section>

            <div className="flex justify-end gap-4 pt-4">
                <Button variant="primary" onClick={handleSave} disabled={saving || !results}>
                    {saving ? 'Guardando...' : 'Guardar Diseño Desinfección'}
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => router.push(`/dashboard/projects/${projectId}/fime-resultados`)}
                    disabled={!results}
                >
                    Siguiente: Resultados Finales →
                </Button>
            </div>

            <ModuleNavigation projectId={projectId} currentModuleKey="compact_disinfection" />
        </div>
    );
}
