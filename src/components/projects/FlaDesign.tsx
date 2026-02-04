"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Button from '@/components/ui/Button';
import ModuleWarning from './ModuleWarning';
import ModuleNavigation from './ModuleNavigation';

type DesignParams = {
    vf: number; // Velocidad de filtración (m/h) 0.1 - 0.3
    num_units: number; // Número de unidades
    ratio_l_a: number; // Relación Largo/Ancho
};

type DesignResults = {
    q_unit_lps: number;
    q_unit_m3h: number;
    area_total_m2: number;
    area_unit_m2: number;
    width_a: number;
    length_l: number;
    real_vf: number;
    is_area_safe: boolean; // True if unit area <= 100m2
};

export default function FlaDesign({ projectId }: { projectId: string }) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Data States
    const [qmd, setQmd] = useState<number>(0);

    // Design Inputs
    const [designParams, setDesignParams] = useState<DesignParams>({
        vf: 0.15,
        num_units: 2,
        ratio_l_a: 2.0
    });

    // Initial Load
    useEffect(() => {
        async function loadData() {
            // Fetch Flows (Caudales)
            const { data: cData } = await supabase.from('project_calculations').select('calculated_flows').eq('project_id', projectId).maybeSingle();
            if (cData && cData.calculated_flows) {
                setQmd(cData.calculated_flows.qmd_max || 0);

                if (cData.calculated_flows.fla?.params) {
                    setDesignParams(cData.calculated_flows.fla.params);
                }
            }
            setLoading(false);
        }
        loadData();
    }, [projectId, supabase]);

    // Derived Design Results
    const results = React.useMemo(() => {
        if (!qmd || designParams.num_units < 1) return null;

        const q_total_m3h = (qmd * 3600) / 1000;
        const area_total = q_total_m3h / designParams.vf;
        const area_unit = area_total / designParams.num_units;

        const width = Math.sqrt(area_unit / designParams.ratio_l_a);
        const length = designParams.ratio_l_a * width;
        const real_vf = q_total_m3h / (area_unit * designParams.num_units);

        return {
            q_unit_lps: qmd / designParams.num_units,
            q_unit_m3h: q_total_m3h / designParams.num_units,
            area_total_m2: area_total,
            area_unit_m2: area_unit,
            width_a: width,
            length_l: length,
            real_vf,
            is_area_safe: area_unit <= 100
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
                fla: {
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

            alert('Diseño FLA guardado exitosamente.');
            router.refresh();

        } catch (error) {
            console.error('Error saving FLA design:', error);
            alert('Error al guardar el diseño. Por favor intente nuevamente.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando datos hidráulicos...</div>;

    return (
        <div className="space-y-8">
            <ModuleWarning projectId={projectId} moduleKey="fime_lento_arena" />

            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-cyan-500">
                <h1 className="text-2xl font-bold text-gray-800">Fase 4: Filtro Lento en Arena (FLA)</h1>
                <p className="text-gray-600 mt-2">
                    Barrera microbiológica principal. Mediante la capa biológica (<em>Schmutzdecke</em>), remueve hasta el 99.9% de bacterias y virus.
                    Requiere un proceso de maduración de 2 a 4 semanas.
                </p>
                <div className="mt-4 flex gap-4 text-sm">
                    <div className="bg-cyan-50 px-3 py-1 rounded text-cyan-800 font-medium">QMD Diseño: {qmd.toFixed(2)} L/s</div>
                    <div className="bg-cyan-50 px-3 py-1 rounded text-cyan-800 font-medium">Vf Diseño: {designParams.vf} m/h</div>
                </div>
            </div>

            {/* Hydraulic Design */}
            <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">1. Dimensionamiento Hidráulico (Normativo)</h2>

                {!qmd && (
                    <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-lg text-center">
                        <div className="text-red-500 text-4xl mb-2">⚠️</div>
                        <h3 className="text-lg font-bold text-red-800 mb-2">Caudal de Diseño No Definido</h3>
                        <p className="text-red-700 mb-4">
                            No se ha calculado el Caudal Máximo Diario (QMD). El sistema no puede realizar el dimensionamiento sin este valor.
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => router.push(`/dashboard/projects/${projectId}/caudales`)}
                        >
                            Ir a Calcular Caudales
                        </Button>
                    </div>
                )}

                {/* Validation Errors */}
                {(() => {
                    const errors = [];
                    if (designParams.vf < 0.1 || designParams.vf > 0.2)
                        errors.push(`Velocidad de Filtración ${designParams.vf} m/h fuera de rango normativo (0.1 - 0.2 m/h) [Guía FIME Sección 10.4]`);

                    if (results && results.area_unit_m2 > 100)
                        errors.push(`Área por módulo (${results.area_unit_m2.toFixed(2)} m²) excede el límite máximo de 100 m² [Guía FIME Sección 10.4.c]. Aumente el número de módulos.`);

                    if (errors.length > 0) {
                        return (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
                                <h3 className="font-bold mb-2">⛔ RESTRICCIONES NORMATIVAS</h3>
                                <ul className="list-disc pl-5 space-y-1">
                                    {errors.map((err, i) => <li key={i}>{err}</li>)}
                                </ul>
                                <p className="text-xs mt-3 font-semibold">El diseño no podrá generarse válidamente con estos parámetros.</p>
                            </div>
                        );
                    }
                    return null;
                })()}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Inputs */}
                    <div className="space-y-6">
                        <h3 className="font-semibold text-gray-700">Parámetros de Diseño</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Velocidad de Filtración (Vf)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.1"
                                    max="0.2"
                                    value={designParams.vf}
                                    onChange={(e) => setDesignParams({ ...designParams, vf: parseFloat(e.target.value) })}
                                    className={`w-full p-2 border rounded focus:ring-2 outline-none text-black ${designParams.vf < 0.1 || designParams.vf > 0.2 ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                />
                                <span className="text-gray-500 text-sm w-12">m/h</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Rango Estricto: 0.10 - 0.20 m/h</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Número de Módulos (n)</label>
                            <input
                                type="number"
                                min="2"
                                value={designParams.num_units}
                                onChange={(e) => setDesignParams({ ...designParams, num_units: parseInt(e.target.value) })}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-cyan-500 outline-none text-black"
                            />
                            <p className="text-xs text-gray-500 mt-1">Mínimo 2 módulos independientes.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Relación Largo/Ancho (L/a)</label>
                            <input
                                type="number"
                                step="0.5"
                                value={designParams.ratio_l_a}
                                onChange={(e) => setDesignParams({ ...designParams, ratio_l_a: parseFloat(e.target.value) })}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-cyan-500 outline-none text-black"
                            />
                        </div>
                    </div>

                    {/* Results */}
                    <div className="bg-cyan-50 p-6 rounded-lg border border-cyan-100">
                        <h3 className="font-semibold text-cyan-900 mb-4">Resultados (Por Módulo)</h3>

                        {results ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-cyan-200 pb-2">
                                    <span className="text-cyan-800">Caudal unitario</span>
                                    <span className="font-bold text-cyan-900">{results.q_unit_lps.toFixed(2)} L/s</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-cyan-200 pb-2">
                                    <span className="text-cyan-800">Área superficial</span>
                                    <span className={`font-bold ${results.area_unit_m2 > 100 ? 'text-red-600' : 'text-cyan-900'}`}>
                                        {results.area_unit_m2.toFixed(2)} m²
                                    </span>
                                </div>

                                {results.area_unit_m2 > 100 && (
                                    <div className="text-xs bg-red-100 text-red-700 p-2 rounded">
                                        ⚠️ Excede 100 m²/módulo. Dificulta la operación manual (raspado). Divida el caudal en más módulos.
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="bg-white p-3 rounded border border-cyan-200">
                                        <span className="block text-xs text-cyan-600 uppercase font-bold">Ancho (a)</span>
                                        <span className="text-xl font-bold text-gray-800">{results.width_a.toFixed(2)} m</span>
                                    </div>
                                    <div className="bg-white p-3 rounded border border-cyan-200">
                                        <span className="block text-xs text-cyan-600 uppercase font-bold">Largo (L)</span>
                                        <span className="text-xl font-bold text-gray-800">{results.length_l.toFixed(2)} m</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-cyan-400 italic">Defina parámetros...</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Material Specifications */}
            <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">2. Especificaciones del Medio Filtrante</h2>

                <h3 className="font-semibold text-gray-700 mb-3">Perfil Estratigráfico (De arriba hacia abajo)</h3>
                <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm text-left border rounded-lg overflow-hidden">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="p-3 border-b">Elemento</th>
                                <th className="p-3 border-b">Material</th>
                                <th className="p-3 border-b">Espesor (m)</th>
                                <th className="p-3 border-b">Especificaciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-gray-800">
                            <tr className="bg-blue-50/50">
                                <td className="p-3 font-medium">Capa Hto.</td>
                                <td className="p-3">Agua Sobrenadante</td>
                                <td className="p-3 font-bold text-blue-800">1.10 m</td>
                                <td className="p-3 text-xs">Mínimo 1.0 m para garantizar carrera de filtración.</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-medium">Medio Filtrante</td>
                                <td className="p-3">Arena Sílice</td>
                                <td className="p-3 font-bold">0.80 m</td>
                                <td className="p-3 text-xs">
                                    T.E (d10): 0.15 - 0.30 mm<br />
                                    C.U: {'<'} 3 (Pref. {'<'} 2.0)<br />
                                    Lavada, libre de limo/arcilla.
                                </td>
                            </tr>
                            <tr className="bg-gray-50/30">
                                <td className="p-3 font-medium text-gray-600" rowSpan={3}>Soporte (Grava)</td>
                                <td className="p-3">Fina (1.6 - 3 mm)</td>
                                <td className="p-3">0.05 m</td>
                                <td className="p-3 text-xs">Transición a arena (opcional)</td>
                            </tr>
                            <tr className="bg-gray-50/30">
                                <td className="p-3">Media (6 - 13 mm)</td>
                                <td className="p-3">0.10 m</td>
                                <td className="p-3 text-xs">Capa intermedia</td>
                            </tr>
                            <tr className="bg-gray-50/30">
                                <td className="p-3">Gruesa (19 - 38 mm)</td>
                                <td className="p-3">0.15 m</td>
                                <td className="p-3 text-xs">Sobre drenajes</td>
                            </tr>
                            <tr className="bg-gray-100 font-bold border-t">
                                <td className="p-3">TOTAL CAJA</td>
                                <td className="p-3">-</td>
                                <td className="p-3">~ 2.4 - 2.5 m</td>
                                <td className="p-3 text-xs">Incluyendo borde libre (0.2m)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                    <h3 className="font-bold text-amber-900 mb-1">⚠️ Control de Operación (Schmutzdecke)</h3>
                    <p className="text-sm text-amber-800">
                        La eficiencia biológica depende de la maduración (15-30 días).
                        <strong>Prohibido cloración previa</strong> al FLA, ya que destruiría la capa biológica.
                    </p>
                </div>
            </section>

            <div className="flex justify-end gap-4 pt-4">
                <Button variant="primary" onClick={handleSave} disabled={saving || !results}>
                    {saving ? 'Guardando...' : 'Guardar Diseño FLA'}
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => router.push(`/dashboard/projects/${projectId}/fime-desinfeccion`)}
                    disabled={!results}
                >
                    Siguiente: Desinfección →
                </Button>
            </div>

            <ModuleNavigation projectId={projectId} currentModuleKey="fime_lento_arena" />
        </div>
    );
}
