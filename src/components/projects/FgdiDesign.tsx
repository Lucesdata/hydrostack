"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ModuleWarning from './ModuleWarning';
import ModuleNavigation from './ModuleNavigation';

// Types
type WaterQuality = {
    turbidity: number | null;
    color: number | null;
    fecal_coliforms: number | null;
};

type DesignParams = {
    vf: number; // Velocidad de filtración (m/h)
    num_units: number; // Número de unidades
    ratio_l_a: number; // Relación Largo/Ancho (L=3a usually)
};

type DesignResults = {
    q_unit_lps: number; // Q por unidad (L/s)
    q_unit_m3h: number; // Q por unidad (m3/h)
    area_m2: number; // Area requerida
    width_a: number; // Ancho a (m)
    length_l: number; // Largo L (m)
    real_vf: number; // Velocidad real
    wash_velocity_check: number; // Vs check (assume some standard wash flow or calc req wash flow)
};

export default function FgdiDesign({ projectId }: { projectId: string }) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Data States
    const [quality, setQuality] = useState<WaterQuality>({ turbidity: null, color: null, fecal_coliforms: null });
    const [qmd, setQmd] = useState<number>(0);

    // UI States
    const [step, setStep] = useState<1 | 2>(1); // 1: Tech Selection, 2: Hydraulic Design

    // Design Inputs
    const [designParams, setDesignParams] = useState<DesignParams>({
        vf: 2.0,
        num_units: 2,
        ratio_l_a: 3
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

            // Fetch Flows (Caudales)
            const { data: cData } = await supabase.from('project_calculations').select('calculated_flows').eq('project_id', projectId).maybeSingle();
            if (cData && cData.calculated_flows) {
                setQmd(cData.calculated_flows.qmd_max || 0);
            }

            setLoading(false);
        }
        loadData();
    }, [projectId, supabase]);

    // Derived State: Tech Selection Recommendation
    const recommendation = React.useMemo(() => {
        if (quality.turbidity !== null && quality.color !== null) {
            const t = quality.turbidity;
            const c = quality.color;

            if (t <= 15 && c <= 25) {
                if (t < 10 && c < 20) {
                    return {
                        recommended: true,
                        message: '¡Ideal! La calidad del agua permite un tren FIME estándar: FGDi + FLA.',
                        type: 'success' as const
                    };
                } else {
                    return {
                        recommended: true,
                        message: 'Aceptable. Calidad en rango límite, el FGDi es crucial como protección.',
                        type: 'warning' as const
                    };
                }
            } else {
                return {
                    recommended: false,
                    message: 'Atención: Turbiedad o Color altos. Se recomienda añadir filtración gruesa adicional (FGAC/FGAS) antes del FGDi.',
                    type: 'error' as const
                };
            }
        }
        return { recommended: false, message: '', type: 'warning' as const };
    }, [quality]);

    // Derived State: Hydraulic Design Results
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
            wash_velocity_check: 0.2
        };
    }, [designParams, qmd]);

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando datos del proyecto...</div>;

    return (
        <div className="space-y-8">
            <ModuleWarning projectId={projectId} moduleKey="fime_grueso_dinamico" />

            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                <h1 className="text-2xl font-bold text-gray-800">Diseño de Filtro Grueso Dinámico (FGDi)</h1>
                <p className="text-gray-600 mt-2">
                    Unidad de pretratamiento que permite remover sólidos suspendidos gruesos y proteger las unidades posteriores.
                    Fundamental ante picos de turbiedad.
                </p>
                <div className="mt-4 flex gap-4 text-sm">
                    <div className="bg-blue-50 px-3 py-1 rounded text-blue-800 font-medium">QMD Diseño: {qmd.toFixed(2)} L/s</div>
                    <div className="bg-blue-50 px-3 py-1 rounded text-blue-800 font-medium">Tecnología: FIME</div>
                </div>
            </div>

            {/* Step 1: Tech Selection Validation */}
            <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">1. Validación de Tecnología (CINARA)</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <span className="block text-sm text-gray-500">Turbiedad Media</span>
                        <span className={`text-xl font-bold ${quality.turbidity && quality.turbidity > 15 ? 'text-red-600' : 'text-gray-800'}`}>
                            {quality.turbidity ?? 'N/A'} <span className="text-sm font-normal text-gray-500">UNT</span>
                        </span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <span className="block text-sm text-gray-500">Color Real</span>
                        <span className={`text-xl font-bold ${quality.color && quality.color > 25 ? 'text-red-600' : 'text-gray-800'}`}>
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
                        <h3 className="font-bold">Recomendación del Modelo</h3>
                        <p>{recommendation.message}</p>
                    </div>
                </div>
            </section>

            {/* Step 2: Hydraulic Design */}
            <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">2. Dimensionamiento Hidráulico</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Inputs */}
                    <div className="space-y-6">
                        <h3 className="font-semibold text-gray-700">Parámetros de Entrada</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Velocidad de Filtración (Vf)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    step="0.1"
                                    value={designParams.vf}
                                    onChange={(e) => setDesignParams({ ...designParams, vf: parseFloat(e.target.value) })}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <span className="text-gray-500 text-sm w-12">m/h</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Recomendado: 1.0 - 3.0 m/h</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Número de Unidades (n)</label>
                            <input
                                type="number"
                                min="2"
                                value={designParams.num_units}
                                onChange={(e) => setDesignParams({ ...designParams, num_units: parseInt(e.target.value) })}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
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
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Results */}
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                        <h3 className="font-semibold text-blue-900 mb-4">Resultados de Diseño (Por Unidad)</h3>

                        {results ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-blue-200 pb-2">
                                    <span className="text-blue-800">Caudal por unidad</span>
                                    <span className="font-bold text-blue-900">{results.q_unit_lps.toFixed(2)} L/s</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-blue-200 pb-2">
                                    <span className="text-blue-800">Área Filtración Requerida</span>
                                    <span className="font-bold text-blue-900 text-lg">{results.area_m2.toFixed(2)} m²</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="bg-white p-3 rounded border border-blue-200">
                                        <span className="block text-xs text-blue-600 uppercase font-bold">Ancho (a)</span>
                                        <span className="text-xl font-bold text-gray-800">{results.width_a.toFixed(2)} m</span>
                                    </div>
                                    <div className="bg-white p-3 rounded border border-blue-200">
                                        <span className="block text-xs text-blue-600 uppercase font-bold">Largo (L)</span>
                                        <span className="text-xl font-bold text-gray-800">{results.length_l.toFixed(2)} m</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-blue-200">
                                    <h4 className="text-sm font-bold text-blue-900 mb-2">Verificación Lavado (Vs)</h4>
                                    <p className="text-sm text-blue-800 mb-2">
                                        Para cumplir Vs entre 0.15 y 0.30 m/s:
                                    </p>
                                    <div className="text-sm bg-white p-2 rounded">
                                        Q Lavado Requerido:
                                        <strong> {(0.15 * results.area_m2 * 1000).toFixed(0)} - {(0.30 * results.area_m2 * 1000).toFixed(0)} L/s</strong>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-blue-400 italic">Defina caudal y parámetros...</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Step 3: Material Specifications */}
            <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">3. Especificaciones Constructivas</h2>

                <div className="overflow-x-auto">
                    <h3 className="font-semibold text-gray-700 mb-3">Lecho Filtrante (Tabla 6.2)</h3>
                    <table className="w-full text-sm text-left border rounded-lg overflow-hidden">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="p-3 border-b">Capa</th>
                                <th className="p-3 border-b">Material</th>
                                <th className="p-3 border-b">Espesor (m)</th>
                                <th className="p-3 border-b">Tamaño Grava (mm)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            <tr>
                                <td className="p-3">Superior</td>
                                <td className="p-3">Grava Fina</td>
                                <td className="p-3">0.20</td>
                                <td className="p-3">3 - 6 mm</td>
                            </tr>
                            <tr>
                                <td className="p-3">Intermedia</td>
                                <td className="p-3">Grava Media</td>
                                <td className="p-3">0.20</td>
                                <td className="p-3">6 - 13 mm</td>
                            </tr>
                            <tr>
                                <td className="p-3">Inferior</td>
                                <td className="p-3">Grava Gruesa</td>
                                <td className="p-3">0.20</td>
                                <td className="p-3">13 - 25 mm</td>
                            </tr>
                            <tr className="bg-gray-50 font-bold">
                                <td className="p-3 text-right" colSpan={2}>Altura Total Lecho</td>
                                <td className="p-3 text-blue-600">0.60 m</td>
                                <td className="p-3"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-bold text-gray-800 mb-2">Cámara de Aquietamiento</h4>
                        <ul className="text-sm space-y-2 text-gray-600">
                            <li>• Tiempo Retención: <strong>50 seg</strong></li>
                            <li>• Velocidad Ascensional: <strong>0.01 m/s</strong></li>
                            <li>• Volumen Req: <strong>{qmd && results ? (qmd * 50 / 1000).toFixed(2) : '-'} m³</strong></li>
                        </ul>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-bold text-gray-800 mb-2">Sistema de Aforo</h4>
                        <ul className="text-sm space-y-2 text-gray-600">
                            <li>• Tipo: <strong>Vertedero Triangular</strong></li>
                            <li>• Ángulo: <strong>60°</strong></li>
                            <li>• Material: <strong>Acero Inoxidable / PVC</strong></li>
                        </ul>
                    </div>
                </div>
            </section>

            <div className="flex justify-end gap-4 pt-4">
                {/* <Button variant="secondary" onClick={() => router.back()}>Atrás</Button> */}
                <Button variant="primary">Guardar Diseño FGDi</Button>
            </div>

            <ModuleNavigation projectId={projectId} currentModuleKey="fime_grueso_dinamico" />
        </div>
    );
}
