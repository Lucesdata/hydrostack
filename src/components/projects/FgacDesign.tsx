"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Button from '@/components/ui/Button';
import ModuleWarning from './ModuleWarning';
import ModuleNavigation from './ModuleNavigation';

// Types
type WaterQuality = {
    turbidity: number | null;
    color: number | null;
    fecal_coliforms: number | null;
};

type DesignParams = {
    vf: number; // Velocidad de filtración (m/h) - Rango: 0.3 - 0.6
    num_units: number; // Número de unidades
    ratio_l_a: number; // Relación Largo/Ancho
};

type DesignResults = {
    q_unit_lps: number; // Q por unidad (L/s)
    q_unit_m3h: number; // Q por unidad (m3/h)
    area_m2: number; // Area requerida
    width_a: number; // Ancho a (m)
    length_l: number; // Largo L (m)
    real_vf: number; // Velocidad real
    height_total: number; // Altura total del lecho
};

export default function FgacDesign({ projectId }: { projectId: string }) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Data States
    const [quality, setQuality] = useState<WaterQuality>({ turbidity: null, color: null, fecal_coliforms: null });
    const [qmd, setQmd] = useState<number>(0);

    // Design Inputs
    const [designParams, setDesignParams] = useState<DesignParams>({
        vf: 0.5, // Valor medio del rango recomendado
        num_units: 2,
        ratio_l_a: 2.5
    });

    // Initial Load
    useEffect(() => {
        async function loadData() {
            // Fetch Quality
            const { data: qData } = await supabase.from('project_water_quality').select('*').eq('project_id', projectId).maybeSingle();
            if (qData) {
                setQuality({
                    turbidity: qData.turbidity,
                    color: qData.color,
                    fecal_coliforms: qData.fecal_coliforms
                });
            }

            // Fetch Flows
            const { data: cData } = await supabase.from('project_calculations').select('calculated_flows').eq('project_id', projectId).maybeSingle();
            if (cData && cData.calculated_flows) {
                setQmd(cData.calculated_flows.qmd_max || 0);
            }

            setLoading(false);
        }
        loadData();
    }, [projectId, supabase]);

    // Recommendation Check
    const recommendation = React.useMemo(() => {
        if (quality.turbidity !== null && quality.color !== null) {
            const t = quality.turbidity;
            const c = quality.color;

            // FGAC es recomendado para turbiedad 10-50 UNT o color 20-70 UPC
            if ((t >= 10 && t <= 50) || (c >= 20 && c <= 70)) {
                return {
                    recommended: true,
                    message: '✅ FGAC Recomendado. La calidad del agua requiere filtración gruesa adicional antes del FLA.',
                    type: 'success' as const
                };
            } else if (t < 10 && c < 20) {
                return {
                    recommended: false,
                    message: '⚠️ Calidad excelente. FGAC no es estrictamente necesario, pero puede usarse como protección adicional.',
                    type: 'warning' as const
                };
            } else {
                return {
                    recommended: false,
                    message: '🛑 Calidad muy mala. Considere tratamiento adicional (sedimentación, FGAC múltiple).',
                    type: 'error' as const
                };
            }
        }
        return { recommended: false, message: '', type: 'warning' as const };
    }, [quality]);

    // Hydraulic Design Results
    const results = React.useMemo(() => {
        if (!qmd || designParams.num_units < 1) return null;

        const q_unit_lps = qmd / designParams.num_units;
        const q_unit_m3h = (q_unit_lps * 3600) / 1000;
        const area = q_unit_m3h / designParams.vf;
        const a = Math.sqrt(area / designParams.ratio_l_a);
        const l = designParams.ratio_l_a * a;

        return {
            q_unit_lps,
            q_unit_m3h,
            area_m2: area,
            width_a: a,
            length_l: l,
            real_vf: q_unit_m3h / (a * l),
            height_total: 1.5 // Altura total típica del lecho FGAC
        };
    }, [designParams, qmd]);

    const handleSave = async () => {
        if (!results) return;

        setSaving(true);
        const { error } = await supabase.from('project_fgac_design').upsert({
            project_id: projectId,
            vf_design: designParams.vf,
            num_units: designParams.num_units,
            area_unit: results.area_m2,
            width: results.width_a,
            length: results.length_l,
            layer_specifications: {
                layer_1: { size: '13-25 mm', height: 0.3 },
                layer_2: { size: '6-13 mm', height: 0.4 },
                layer_3: { size: '3-6 mm', height: 0.5 }
            },
            updated_at: new Date().toISOString()
        }, { onConflict: 'project_id' });

        setSaving(false);
        if (!error) {
            alert('✅ Diseño FGAC guardado exitosamente');
        } else {
            alert('❌ Error al guardar: ' + error.message);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando datos del proyecto...</div>;

    return (
        <div className="space-y-8">
            <ModuleWarning projectId={projectId} moduleKey="fime_grueso_ascendente" />

            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
                <h1 className="text-2xl font-bold text-gray-800">Filtro Grueso Ascendente en Capas (FGAC)</h1>
                <p className="text-gray-600 mt-2">
                    Unidad de tratamiento intermedia que reduce la carga de turbiedad antes del Filtro Lento. 
                    Esencial para aguas con turbiedad media (10-50 UNT).
                </p>
                <div className="mt-4 flex gap-4 text-sm flex-wrap">
                    <div className="bg-purple-50 px-3 py-1 rounded text-purple-800 font-medium">QMD Diseño: {qmd.toFixed(2)} L/s</div>
                    <div className="bg-purple-50 px-3 py-1 rounded text-purple-800 font-medium">Tecnología: FIME (Tren Completo)</div>
                </div>
            </div>

            {/* Validation */}
            <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">1. Validación de Necesidad (Tabla 2)</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <span className="block text-sm text-gray-500">Turbiedad Media</span>
                        <span className={`text-xl font-bold ${quality.turbidity && quality.turbidity > 50 ? 'text-red-600' : quality.turbidity && quality.turbidity >= 10 ? 'text-orange-600' : 'text-gray-800'}`}>
                            {quality.turbidity ?? 'N/A'} <span className="text-sm font-normal text-gray-500">UNT</span>
                        </span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <span className="block text-sm text-gray-500">Color Real</span>
                        <span className={`text-xl font-bold ${quality.color && quality.color > 70 ? 'text-red-600' : quality.color && quality.color >= 20 ? 'text-orange-600' : 'text-gray-800'}`}>
                            {quality.color ?? 'N/A'} <span className="text-sm font-normal text-gray-500">UPC</span>
                        </span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <span className="block text-sm text-gray-500">Coliformes Fecales</span>
                        <span className="text-xl font-bold text-gray-800">
                            {quality.fecal_coliforms ?? 'N/A'} <span className="text-sm font-normal text-gray-500">UFC/100mL</span>
                        </span>
                    </div>
                </div>

                <div className={`p-4 rounded-lg border flex items-start gap-3 ${recommendation.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                    recommendation.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                        'bg-red-50 border-red-200 text-red-800'
                    }`}>
                    <span className="text-2xl">{recommendation.type === 'success' ? '✅' : recommendation.type === 'warning' ? '⚠️' : '🛑'}</span>
                    <div>
                        <h3 className="font-bold">Recomendación Técnica</h3>
                        <p>{recommendation.message}</p>
                    </div>
                </div>
            </section>

            {/* Hydraulic Design */}
            <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">2. Dimensionamiento Hidráulico</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Inputs */}
                    <div className="space-y-6">
                        <h3 className="font-semibold text-gray-700">Parámetros de Diseño</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Velocidad de Filtración (Vf)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    step="0.05"
                                    min="0.3"
                                    max="0.6"
                                    value={designParams.vf}
                                    onChange={(e) => setDesignParams({ ...designParams, vf: parseFloat(e.target.value) })}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none text-black"
                                />
                                <span className="text-gray-500 text-sm w-12">m/h</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Recomendado: 0.3 - 0.6 m/h (CINARA)</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Número de Unidades (n)</label>
                            <input
                                type="number"
                                min="2"
                                value={designParams.num_units}
                                onChange={(e) => setDesignParams({ ...designParams, num_units: parseInt(e.target.value) })}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none text-black"
                            />
                            <p className="text-xs text-gray-500 mt-1">Mínimo 2 para alternancia en lavado.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Relación Largo/Ancho (L/a)</label>
                            <input
                                type="number"
                                step="0.5"
                                value={designParams.ratio_l_a}
                                onChange={(e) => setDesignParams({ ...designParams, ratio_l_a: parseFloat(e.target.value) })}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none text-black"
                            />
                        </div>
                    </div>

                    {/* Results */}
                    <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
                        <h3 className="font-semibold text-purple-900 mb-4">Resultados de Diseño (Por Unidad)</h3>

                        {results ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-purple-200 pb-2">
                                    <span className="text-purple-800">Caudal por unidad</span>
                                    <span className="font-bold text-purple-900">{results.q_unit_lps.toFixed(2)} L/s</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-purple-200 pb-2">
                                    <span className="text-purple-800">Área Filtración Requerida</span>
                                    <span className="font-bold text-purple-900 text-lg">{results.area_m2.toFixed(2)} m²</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="bg-white p-3 rounded border border-purple-200">
                                        <span className="block text-xs text-purple-600 uppercase font-bold">Ancho (a)</span>
                                        <span className="text-xl font-bold text-gray-800">{results.width_a.toFixed(2)} m</span>
                                    </div>
                                    <div className="bg-white p-3 rounded border border-purple-200">
                                        <span className="block text-xs text-purple-600 uppercase font-bold">Largo (L)</span>
                                        <span className="text-xl font-bold text-gray-800">{results.length_l.toFixed(2)} m</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-purple-200">
                                    <h4 className="text-sm font-bold text-purple-900 mb-2">Altura Total de Lecho</h4>
                                    <div className="text-sm bg-white p-2 rounded">
                                        Altura Total: <strong>{results.height_total.toFixed(2)} m</strong> (3 capas)
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-purple-400 italic">Defina caudal y parámetros...</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Material Specifications */}
            <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">3. Especificaciones Constructivas</h2>

                <div className="overflow-x-auto">
                    <h3 className="font-semibold text-gray-700 mb-3">Lecho Filtrante (De abajo hacia arriba - Flujo Ascendente)</h3>
                    <table className="w-full text-sm text-left border rounded-lg overflow-hidden">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="p-3 border-b">Capa</th>
                                <th className="p-3 border-b">Material</th>
                                <th className="p-3 border-b">Espesor (m)</th>
                                <th className="p-3 border-b">Tamaño Grava (mm)</th>
                                <th className="p-3 border-b">Ubicación</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            <tr>
                                <td className="p-3">Capa 1 (Inferior)</td>
                                <td className="p-3">Grava Gruesa</td>
                                <td className="p-3">0.30</td>
                                <td className="p-3 font-mono">13 - 25 mm</td>
                                <td className="p-3 text-xs text-gray-600">Entrada de agua cruda</td>
                            </tr>
                            <tr>
                                <td className="p-3">Capa 2 (Intermedia)</td>
                                <td className="p-3">Grava Media</td>
                                <td className="p-3">0.40</td>
                                <td className="p-3 font-mono">6 - 13 mm</td>
                                <td className="p-3 text-xs text-gray-600">Remoción intermedia</td>
                            </tr>
                            <tr>
                                <td className="p-3">Capa 3 (Superior)</td>
                                <td className="p-3">Grava Fina</td>
                                <td className="p-3">0.50</td>
                                <td className="p-3 font-mono">3 - 6 mm</td>
                                <td className="p-3 text-xs text-gray-600">Salida hacia FLA</td>
                            </tr>
                            <tr className="bg-gray-50 font-bold">
                                <td className="p-3 text-right" colSpan={2}>Altura Total Lecho</td>
                                <td className="p-3 text-purple-600">1.20 m</td>
                                <td className="p-3"></td>
                                <td className="p-3"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-bold text-gray-800 mb-2">Sistema de Drenaje Inferior</h4>
                        <ul className="text-sm space-y-2 text-gray-600">
                            <li>• Tubería Principal: <strong>6"</strong> PVC perforada</li>
                            <li>• Tubería Lateral: <strong>4"</strong> PVC perforada</li>
                            <li>• Separación Laterales: <strong>0.3 - 0.5 m</strong></li>
                            <li>• Perforaciones: <strong>6-10 mm Ø</strong></li>
                        </ul>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-bold text-gray-800 mb-2">Sistema de Recolección Superior</h4>
                        <ul className="text-sm space-y-2 text-gray-600">
                            <li>• Canal Recolector: <strong>Concreto</strong></li>
                            <li>• Velocidad Máxima: <strong>0.3 m/s</strong></li>
                            <li>• Control de Nivel: <strong>Vertedero Triangular</strong></li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Performance Expectations */}
            <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">4. Eficiencia Esperada</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-bold text-green-900 mb-2">Turbiedad</h4>
                        <p className="text-2xl font-bold text-green-700">70 - 80%</p>
                        <p className="text-xs text-green-600 mt-1">Remoción típica</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-bold text-blue-900 mb-2">Microbiológica</h4>
                        <p className="text-2xl font-bold text-blue-700">1.0 - 2.0 Log</p>
                        <p className="text-xs text-blue-600 mt-1">Unidades logarítmicas</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <h4 className="font-bold text-amber-900 mb-2">Frecuencia Lavado</h4>
                        <p className="text-2xl font-bold text-amber-700">2 - 4 semanas</p>
                        <p className="text-xs text-amber-600 mt-1">Según calidad de entrada</p>
                    </div>
                </div>
            </section>

            <div className="flex justify-end gap-4 pt-4">
                <Button variant="primary" onClick={handleSave} loading={saving}>
                    Guardar Diseño FGAC
                </Button>
            </div>

            <ModuleNavigation projectId={projectId} currentModuleKey="fime_grueso_ascendente" />
        </div>
    );
}
