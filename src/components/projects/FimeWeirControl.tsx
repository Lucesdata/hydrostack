"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Button from '@/components/ui/Button';
import ModuleWarning from './ModuleWarning';
import ModuleNavigation from './ModuleNavigation';

type WeirType = 'triangular' | 'rectangular';

type TriangularWeirParams = {
    angle: number; // Ángulo en grados (típicamente 60° o 90°)
    h: number; // Altura de agua sobre el vertedero (m)
};

type RectangularWeirParams = {
    length: number; // Longitud de la cresta (m)
    h: number; // Altura de agua sobre el vertedero (m)
};

type GaugeColor = {
    level: 'green' | 'yellow' | 'red';
    h_min: number;
    h_max: number;
    label: string;
    description: string;
};

export default function FimeWeirControl({ projectId }: { projectId: string }) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Data States
    const [qmd, setQmd] = useState<number>(0);
    const [weirType, setWeirType] = useState<WeirType>('triangular');

    // Weir Parameters
    const [triangularParams, setTriangularParams] = useState<TriangularWeirParams>({
        angle: 60,
        h: 0.15
    });

    const [rectangularParams, setRectangularParams] = useState<RectangularWeirParams>({
        length: 0.5,
        h: 0.10
    });

    // Load Data
    useEffect(() => {
        async function loadData() {
            const { data: cData } = await supabase.from('project_calculations').select('calculated_flows').eq('project_id', projectId).maybeSingle();
            if (cData && cData.calculated_flows) {
                setQmd(cData.calculated_flows.qmd_max || 0);
            }

            // Try to load existing weir design
            const { data: wData } = await supabase.from('project_weir_control').select('*').eq('project_id', projectId).maybeSingle();
            if (wData) {
                setWeirType(wData.weir_type as WeirType);
                if (wData.weir_type === 'triangular' && wData.angle_degrees) {
                    setTriangularParams({ angle: wData.angle_degrees, h: wData.h_design_m });
                } else if (wData.weir_type === 'rectangular' && wData.length_m) {
                    setRectangularParams({ length: wData.length_m, h: wData.h_design_m });
                }
            }

            setLoading(false);
        }
        loadData();
    }, [projectId, supabase]);

    // Triangular Weir Calculation
    // Fórmula: Q = K * h^2.5
    // Donde K = C * tan(θ/2) * sqrt(2g)
    // Para θ=60°: K ≈ 1.4
    // Para θ=90°: K ≈ 2.5
    const triangularResults = React.useMemo(() => {
        const g = 9.81;
        const theta_rad = (triangularParams.angle * Math.PI) / 180;
        const K = 0.593 * Math.tan(theta_rad / 2) * Math.sqrt(2 * g);
        const Q_m3s = K * Math.pow(triangularParams.h, 2.5);
        const Q_lps = Q_m3s * 1000;

        return {
            K: K.toFixed(2),
            Q_lps: Q_lps.toFixed(3),
            Q_m3s: Q_m3s.toFixed(5),
            matches_design: Math.abs(Q_lps - qmd) / qmd < 0.1 // Within 10%
        };
    }, [triangularParams, qmd]);

    // Rectangular Weir Calculation
    // Fórmula: Q = C * L * h^1.5
    // Donde C ≈ 1.84 (sin contracciones)
    const rectangularResults = React.useMemo(() => {
        const C = 1.84;
        const Q_m3s = C * rectangularParams.length * Math.pow(rectangularParams.h, 1.5);
        const Q_lps = Q_m3s * 1000;

        return {
            C: C.toFixed(2),
            Q_lps: Q_lps.toFixed(3),
            Q_m3s: Q_m3s.toFixed(5),
            matches_design: Math.abs(Q_lps - qmd) / qmd < 0.1
        };
    }, [rectangularParams, qmd]);

    // Gauge Color Zones (for triangular weir)
    const gaugeZones = React.useMemo((): GaugeColor[] => {
        const h_design = weirType === 'triangular' ? triangularParams.h : rectangularParams.h;

        return [
            {
                level: 'green',
                h_min: h_design * 0.90,
                h_max: h_design * 1.05,
                label: 'OPERACIÓN NORMAL',
                description: 'Velocidad de filtración dentro del rango óptimo'
            },
            {
                level: 'yellow',
                h_min: h_design * 1.05,
                h_max: h_design * 1.15,
                label: 'PRECAUCIÓN',
                description: 'Velocidad elevada. Verificar colmatación del filtro'
            },
            {
                level: 'red',
                h_min: h_design * 1.15,
                h_max: h_design * 1.30,
                label: 'MANTENIMIENTO REQUERIDO',
                description: 'Filtro colmatado. Realizar lavado inmediatamente'
            }
        ];
    }, [weirType, triangularParams.h, rectangularParams.h]);

    const handleSave = async () => {
        setSaving(true);

        const currentResults = weirType === 'triangular' ? triangularResults : rectangularResults;

        const { error } = await supabase.from('project_weir_control').upsert({
            project_id: projectId,
            weir_type: weirType,
            angle_degrees: weirType === 'triangular' ? triangularParams.angle : null,
            length_m: weirType === 'rectangular' ? rectangularParams.length : null,
            h_design_m: weirType === 'triangular' ? triangularParams.h : rectangularParams.h,
            q_calculated_lps: parseFloat(currentResults.Q_lps),
            gauge_colors: gaugeZones,
            updated_at: new Date().toISOString()
        }, { onConflict: 'project_id' });

        setSaving(false);
        if (!error) {
            alert('✅ Diseño de vertedero guardado exitosamente');
        } else {
            alert('❌ Error al guardar: ' + error.message);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando datos hidráulicos...</div>;

    const currentResults = weirType === 'triangular' ? triangularResults : rectangularResults;

    return (
        <div className="space-y-8">
            <ModuleWarning projectId={projectId} moduleKey="fime_weir_control" />

            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-500">
                <h1 className="text-2xl font-bold text-gray-800">Control Hidráulico y Vertederos de Aforo</h1>
                <p className="text-gray-600 mt-2">
                    Sistema de control de caudal mediante vertederos calibrados. Garantiza velocidad de filtración constante
                    y facilita la operación manual mediante reglas graduadas con códigos de colores.
                </p>
                <div className="mt-4 flex gap-4 text-sm">
                    <div className="bg-indigo-50 px-3 py-1 rounded text-indigo-800 font-medium">QMD Diseño: {qmd.toFixed(3)} L/s</div>
                    <div className="bg-indigo-50 px-3 py-1 rounded text-indigo-800 font-medium">Q Diseño: {(qmd / 1000 * 3.6).toFixed(4)} m³/h</div>
                </div>
            </div>

            {/* Weir Type Selection */}
            <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">1. Selección de Tipo de Vertedero</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => setWeirType('triangular')}
                        className={`p-6 rounded-lg border-2 transition-all ${weirType === 'triangular'
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className="text-4xl mb-2">📐</div>
                        <h3 className="font-bold text-gray-800">Vertedero Triangular</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Recomendado para caudales bajos (&lt;5 L/s). Mayor precisión en medición.
                        </p>
                    </button>

                    <button
                        onClick={() => setWeirType('rectangular')}
                        className={`p-6 rounded-lg border-2 transition-all ${weirType === 'rectangular'
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className="text-4xl mb-2">▬</div>
                        <h3 className="font-bold text-gray-800">Vertedero Rectangular</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Para caudales mayores (&gt;5 L/s). Construcción más simple.
                        </p>
                    </button>
                </div>
            </section>

            {/* Design Parameters */}
            <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">2. Dimensionamiento del Vertedero</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Inputs */}
                    <div className="space-y-6">
                        <h3 className="font-semibold text-gray-700">Parámetros</h3>

                        {weirType === 'triangular' ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ángulo del Vertedero (θ)</label>
                                    <select
                                        value={triangularParams.angle}
                                        onChange={(e) => setTriangularParams({ ...triangularParams, angle: parseInt(e.target.value) })}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                                    >
                                        <option value={60}>60° (Estándar)</option>
                                        <option value={90}>90° (Mayor capacidad)</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">60° recomendado para caudales bajos</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Altura de Diseño (h)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.05"
                                            max="0.30"
                                            value={triangularParams.h}
                                            onChange={(e) => setTriangularParams({ ...triangularParams, h: parseFloat(e.target.value) })}
                                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                                        />
                                        <span className="text-gray-500 text-sm w-8">m</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Altura del agua sobre la cresta del vertedero</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitud de Cresta (L)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            step="0.05"
                                            min="0.20"
                                            max="2.00"
                                            value={rectangularParams.length}
                                            onChange={(e) => setRectangularParams({ ...rectangularParams, length: parseFloat(e.target.value) })}
                                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                                        />
                                        <span className="text-gray-500 text-sm w-8">m</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Ancho del vertedero</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Altura de Diseño (h)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.05"
                                            max="0.30"
                                            value={rectangularParams.h}
                                            onChange={(e) => setRectangularParams({ ...rectangularParams, h: parseFloat(e.target.value) })}
                                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                                        />
                                        <span className="text-gray-500 text-sm w-8">m</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Altura del agua sobre la cresta</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Results */}
                    <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                        <h3 className="font-semibold text-indigo-900 mb-4">Resultados del Cálculo</h3>

                        <div className="space-y-4">
                            <div className="bg-white p-3 rounded border border-indigo-200">
                                <span className="block text-xs text-indigo-600 uppercase font-bold mb-1">Fórmula Utilizada</span>
                                <code className="text-sm text-gray-800">
                                    {weirType === 'triangular'
                                        ? `Q = ${triangularResults.K} × h^2.5`
                                        : `Q = ${rectangularResults.C} × ${rectangularParams.length.toFixed(2)} × h^1.5`
                                    }
                                </code>
                            </div>

                            <div className="flex justify-between items-center border-b border-indigo-200 pb-2">
                                <span className="text-indigo-800">Caudal Calculado</span>
                                <span className="font-bold text-indigo-900 text-lg">{currentResults.Q_lps} L/s</span>
                            </div>

                            <div className="flex justify-between items-center border-b border-indigo-200 pb-2">
                                <span className="text-indigo-800">Caudal de Diseño</span>
                                <span className="font-bold text-gray-800">{qmd.toFixed(3)} L/s</span>
                            </div>

                            <div className={`p-3 rounded ${currentResults.matches_design ? 'bg-green-100 border border-green-300' : 'bg-yellow-100 border border-yellow-300'}`}>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{currentResults.matches_design ? '✅' : '⚠️'}</span>
                                    <div>
                                        <p className="font-bold text-sm text-gray-800">
                                            {currentResults.matches_design ? 'Ajuste Correcto' : 'Ajuste Necesario'}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {currentResults.matches_design
                                                ? 'El caudal calculado está dentro del ±10% del diseño'
                                                : 'Ajuste la altura h para igualar el caudal de diseño'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gauge Color System */}
            <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">3. Sistema de Regla de Aforo con Códigos de Colores</h2>

                <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
                    <p className="text-sm text-blue-900">
                        <strong>Instrucción Operacional:</strong> Instale una regla graduada transparente junto al vertedero.
                        Marque las zonas de colores según las alturas calculadas a continuación para facilitar la operación manual sin instrumentos.
                    </p>
                </div>

                <div className="space-y-4">
                    {gaugeZones.map((zone, idx) => (
                        <div
                            key={idx}
                            className={`p-4 rounded-lg border-l-4 ${zone.level === 'green' ? 'bg-green-50 border-green-500' :
                                zone.level === 'yellow' ? 'bg-yellow-50 border-yellow-500' :
                                    'bg-red-50 border-red-500'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className={`font-bold ${zone.level === 'green' ? 'text-green-900' :
                                        zone.level === 'yellow' ? 'text-yellow-900' :
                                            'text-red-900'
                                        }`}>
                                        {zone.label}
                                    </h4>
                                    <p className="text-sm text-gray-700 mt-1">{zone.description}</p>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono text-lg font-bold text-gray-800">
                                        {(zone.h_min * 100).toFixed(1)} - {(zone.h_max * 100).toFixed(1)} cm
                                    </div>
                                    <div className="text-xs text-gray-500">Altura en regla</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-800 mb-2">Especificaciones del Aforo</h4>
                    <ul className="text-sm space-y-1 text-gray-700">
                        <li>• Material Regla: <strong>Acrílico transparente o PVC rígido</strong></li>
                        <li>• Graduación: <strong>Milímetros (mm)</strong></li>
                        <li>• Marcado de Colores: <strong>Pintura resistente al agua</strong></li>
                        <li>• Ubicación: <strong>Aguas arriba del vertedero, zona de flujo laminar</strong></li>
                    </ul>
                </div>
            </section>

            {/* Construction Notes */}
            <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">4. Notas de Construcción</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <h4 className="font-bold text-amber-900 mb-2">⚠️ Criterios Críticos</h4>
                        <ul className="text-sm space-y-2 text-amber-800">
                            <li>• Cresta del vertedero: <strong>Borde afilado</strong> (ángulo 45°)</li>
                            <li>• Material: <strong>Acero inoxidable o PVC rígido</strong></li>
                            <li>• Ventilación: <strong>Zona aguas abajo ventilada</strong></li>
                            <li>• Nivel: <strong>Perfectamente horizontal</strong> (usar nivel de precisión)</li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-bold text-blue-900 mb-2">📋 Mantenimiento</h4>
                        <ul className="text-sm space-y-2 text-blue-800">
                            <li>• Limpieza semanal de cresta y regla</li>
                            <li>• Verificar nivel mensualmente</li>
                            <li>• Calibración semestral con medidor portátil</li>
                            <li>• Registro diario de nivel en bitácora</li>
                        </ul>
                    </div>
                </div>
            </section>

            <div className="flex justify-end gap-4 pt-4">
                <Button variant="primary" onClick={handleSave} loading={saving}>
                    Guardar Diseño de Vertedero
                </Button>
            </div>

            <ModuleNavigation projectId={projectId} currentModuleKey="fime_weir_control" />
        </div>
    );
}
