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
    ph: number | null;
    alkalinity: number | null;
};

// Perfil Estándar (Quebrada La Olga)
// Referencia: Informe La Paz, Tabla 4.1. Fuente de buena calidad técnica.
const STANDARD_PROFILE = {
    turbidity: 4.1,
    color: 10.0,
    fecal_coliforms: 56,
    ph: 7.37,
    alkalinity: 150
};

export default function FimeTechSelection({ projectId }: { projectId: string }) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [quality, setQuality] = useState<WaterQuality>({ turbidity: null, color: null, fecal_coliforms: null, ph: null, alkalinity: null });
    const [hasData, setHasData] = useState(false);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const { data: qData } = await supabase.from('project_water_quality').select('*').eq('project_id', projectId).maybeSingle();
            if (qData) {
                setQuality({
                    turbidity: qData.turbidity,
                    color: qData.color,
                    fecal_coliforms: qData.fecal_coliforms,
                    ph: qData.ph,
                    alkalinity: qData.alkalinity
                });
                // Consideramos que "tiene datos" si al menos hay turbiedad definida
                setHasData(qData.turbidity !== null);
            }
            setLoading(false);
        }
        loadData();
    }, [projectId, supabase]);

    const handleUseStandardProfile = async () => {
        setSaving(true);
        // Guardamos o actualizamos en Supabase
        const { error } = await supabase.from('project_water_quality').upsert({
            project_id: projectId,
            ...STANDARD_PROFILE,
            updated_at: new Date().toISOString()
        }, { onConflict: 'project_id' });

        if (!error) {
            setQuality(STANDARD_PROFILE);
            setHasData(true);
        }
        setSaving(false);
    };

    const recommendation = React.useMemo(() => {
        if (quality.turbidity !== null && quality.color !== null) {
            const t = quality.turbidity;
            const c = quality.color;
            const coli = quality.fecal_coliforms || 0;

            const rec = {
                tech: '',
                message: '',
                description: '',
                type: 'success' as 'success' | 'warning' | 'error',
                warnings: [] as string[],
                requiresPilot: false
            };

            // ALERTA CRÍTICA: Valores fuera de rango FIME convencional
            if (t > 70 || coli > 20000) {
                rec.tech = '🛑 Requiere Planta Piloto';
                rec.message = 'Calidad Fuera de Rango Estándar FIME';
                rec.description = `Los valores extremos (${t > 70 ? `Turbiedad: ${t} UNT` : ''}${t > 70 && coli > 20000 ? ', ' : ''}${coli > 20000 ? `Coliformes: ${coli} UFC/100mL` : ''}) exceden los límites de aplicabilidad directa de FIME. Se requiere estudio en planta piloto para validar eficiencia y ajustar parámetros de diseño.`;
                rec.type = 'error';
                rec.requiresPilot = true;
                rec.warnings.push(' ACCIÓN REQUERIDA: Antes de proceder con el diseño definitivo, debe ejecutar un estudio piloto de al menos 3 meses para determinar tasas de filtración óptimas y eficiencias reales.');
                return rec;
            }

            // Lógica Base CINARA (Tabla 5.1 refinada)
            // Caso 1: Calidad Excelente/Buena (<10 UNT, <20 UPC) -> FGDi + FLA
            if (t < 10 && c < 20) {
                rec.tech = 'FGDi + FLA';
                rec.message = 'Tren Estándar FIME';
                rec.description = 'La opción más viable económica y técnicamente. La baja carga de sólidos permite utilizar Filtro Grueso Dinámico (FGDi) como única protección antes del Filtro Lento.';
                rec.type = 'success';
            }
            // Caso 2: Calidad Regular (10-50 UNT, 20-70 UPC) -> Requiere FGAC
            else if (t <= 50 && c <= 70) {
                rec.tech = 'FGDi + FGAC + FLA';
                rec.message = 'Requiere Filtración Gruesa Adicional';
                rec.description = 'Niveles de turbiedad intermedios exigen añadir un Filtro Grueso Ascendente en Capas (FGAC) después del FGDi para evitar la colmatación rápida del Filtro Lento.';
                rec.type = 'warning';
            }
            // Caso 3: Calidad Mala (50-70 UNT) -> Tren Complejo
            else if (t <= 70 && c <= 100) {
                rec.tech = 'Tren Complejo (Sed + FG + FLA)';
                rec.message = 'Alta carga contaminante';
                rec.description = 'Se requieren múltiples barreras. Considere sedimentación previa o series largas de filtración gruesa.';
                rec.type = 'error';
            }

            // Advertencia Microbiológica (>500 UFC)
            if (coli > 500 && coli <= 20000) {
                rec.warnings.push(` Riesgo Microbiológico Alto (>500 UFC). Se debe robustecer la desinfección final y asegurar operación estricta para lograr >5 Log de remoción.`);
                // Si era success, pasamos a warning para que el usuario note el riesgo
                if (rec.type === 'success') rec.type = 'warning';
            }

            return rec;
        }
        return null;
    }, [quality]);

    if (loading) return <div className="p-12 text-center text-gray-500">Cargando perfil de calidad...</div>;

    return (
        <div className="space-y-8">
            <ModuleWarning projectId={projectId} moduleKey="fime_tech_selection" />

            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
                <h1 className="text-2xl font-bold text-gray-800">Fase 2: Perfil de Calidad y Selección</h1>
                <p className="text-gray-600 mt-2">
                    Validación de la fuente y recomendación tecnológica según Modelo CINARA.
                </p>
            </div>

            {/* Paso 1: Perfil de Calidad (Empty State vs Details) */}
            {!hasData ? (
                <div className="bg-blue-50 p-8 rounded-xl border border-blue-200 text-center animate-fade-in">
                    <h2 className="text-xl font-bold text-blue-900 mb-4">Perfil de Calidad de Entrada</h2>
                    <p className="max-w-2xl mx-auto text-blue-800 mb-8 leading-relaxed">
                        Para agilizar su pre-informe, hemos cargado un <strong>Perfil Estándar de Agua Superficial</strong> basado en fuentes de buena calidad técnica (Referencia: Quebrada La Olga). Estos valores son ideales para validar sistemas FIME.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 bg-white p-6 rounded-lg shadow-sm max-w-4xl mx-auto border border-blue-100">
                        <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Turbiedad</div>
                            <div className="text-xl font-bold text-gray-800">{STANDARD_PROFILE.turbidity} <span className="text-xs font-normal">UNT</span></div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Color</div>
                            <div className="text-xl font-bold text-gray-800">{STANDARD_PROFILE.color} <span className="text-xs font-normal">UPC</span></div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Coliformes</div>
                            <div className="text-xl font-bold text-gray-800">{STANDARD_PROFILE.fecal_coliforms} <span className="text-xs font-normal">UFC</span></div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">pH</div>
                            <div className="text-xl font-bold text-gray-800">{STANDARD_PROFILE.ph}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Alcalinidad</div>
                            <div className="text-xl font-bold text-gray-800">{STANDARD_PROFILE.alkalinity}</div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-center gap-4">
                        <Button
                            onClick={handleUseStandardProfile}
                            variant="primary"
                            loading={saving}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Usar estos valores y continuar
                        </Button>
                        <Button
                            onClick={() => router.push(`/dashboard/projects/${projectId}/quality`)}
                            variant="secondary"
                        >
                            Editar indicadores manualmente
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Panel Izquierdo: Datos Actuales */}
                    <div className="bg-white p-6 rounded-lg shadow-sm md:col-span-1 border border-gray-100 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-6 border-b pb-2">
                            <h3 className="font-bold text-gray-700">Calidad de Fuente</h3>
                            <button
                                onClick={() => router.push(`/dashboard/projects/${projectId}/quality`)}
                                className="text-xs text-blue-600 hover:underline font-bold uppercase"
                            >
                                Editar
                            </button>
                        </div>
                        <div className="space-y-6 flex-1">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Turbiedad</span>
                                <span className={`font-mono font-bold text-lg ${quality.turbidity! > 10 ? 'text-orange-600' : 'text-green-700'}`}>
                                    {quality.turbidity} <span className="text-xs text-gray-400 font-normal">UNT</span>
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Color Real</span>
                                <span className={`font-mono font-bold text-lg ${quality.color! > 20 ? 'text-orange-600' : 'text-green-700'}`}>
                                    {quality.color} <span className="text-xs text-gray-400 font-normal">UPC</span>
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Coliformes</span>
                                <span className={`font-mono font-bold text-lg ${quality.fecal_coliforms! > 500 ? 'text-red-600' : 'text-gray-800'}`}>
                                    {quality.fecal_coliforms} <span className="text-xs text-gray-400 font-normal">UFC</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Panel Derecho: Recomendación */}
                    <div className="bg-white p-6 rounded-lg shadow-sm md:col-span-2 border border-gray-100 flex flex-col justify-center">
                        <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Selección Tecnológica (FIME)</h3>
                        {recommendation && (
                            <div className={`p-6 rounded-lg border-2 h-full flex flex-col justify-center ${recommendation.type === 'success' ? 'border-green-100 bg-green-50' :
                                recommendation.type === 'warning' ? 'border-orange-100 bg-orange-50' : 'border-red-100 bg-red-50'
                                }`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-4xl">
                                        {recommendation.type === 'success' ? '✅' : recommendation.type === 'warning' ? '⚠️' : '🛑'}
                                    </span>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 leading-tight">{recommendation.tech}</h2>
                                        <p className="text-sm font-bold text-gray-700 uppercase tracking-wide opacity-80">{recommendation.message}</p>
                                    </div>
                                </div>
                                <p className="text-gray-800 mb-4 leading-relaxed text-base">{recommendation.description}</p>

                                {recommendation.warnings.length > 0 && (
                                    <div className="bg-white/80 p-3 rounded-md border border-red-200 text-sm text-red-700 shadow-sm">
                                        {recommendation.warnings.map((w, i) => (
                                            <div key={i} className="flex gap-2">
                                                <span>⚠</span>
                                                <p>{w}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Paso 3: Visualización de Eficiencias */}
            {hasData && recommendation && (
                <section className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Resultados Esperados del Tren de Tratamiento</h2>

                    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm mb-8">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 font-bold uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="p-4 border-b w-1/4">Etapa</th>
                                    <th className="p-4 border-b w-1/4">Función Principal</th>
                                    <th className="p-4 border-b">Eficiencia Turbiedad</th>
                                    <th className="p-4 border-b">Eficiencia Microbiológica</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-bold text-blue-900 border-r border-gray-50">1. Pretratamiento (FGDi)</td>
                                    <td className="p-4 text-gray-600">Protección contra picos de sólidos</td>
                                    <td className="p-4 font-mono font-bold text-green-700 bg-green-50/50">50 - 60%</td>
                                    <td className="p-4 text-gray-600 bg-gray-50/50">0.5 - 1.0 Unidades Log</td>
                                </tr>
                                {recommendation.tech.includes('FGAC') && (
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-bold text-blue-900 border-r border-gray-50">2. Filtro Grueso (FGAC)</td>
                                        <td className="p-4 text-gray-600">Reducción de carga media</td>
                                        <td className="p-4 font-mono font-bold text-green-700 bg-green-50/50">70 - 80%</td>
                                        <td className="p-4 text-gray-600 bg-gray-50/50">1.0 - 2.0 Unidades Log</td>
                                    </tr>
                                )}
                                <tr className="hover:bg-blue-50/30 transition-colors bg-blue-50/10 border-t-2 border-blue-100">
                                    <td className="p-4 font-bold text-blue-900 border-r border-blue-50">
                                        {recommendation.tech.includes('FGAC') ? '3. ' : '2. '}
                                        Filtración Lenta (FLA)
                                    </td>
                                    <td className="p-4 text-gray-600">Tratamiento biológico final</td>
                                    <td className="p-4 font-mono font-bold text-green-700 bg-green-50/50">Salida &lt; 1.0 UNT</td>
                                    <td className="p-4 text-gray-800 font-bold bg-green-50/50">99 - 99.9% (2-3 Log)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-center">
                        <Button
                            onClick={() => router.push(`/dashboard/projects/${projectId}/fime-grueso-dinamico`)}
                            variant="primary"
                            className="w-full md:w-auto px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                        >
                            Confirmar Selección e Ir a Diseño FGDi →
                        </Button>
                    </div>
                </section>
            )}

            <ModuleNavigation projectId={projectId} currentModuleKey="fime_tech_selection" />
        </div>
    );
}
