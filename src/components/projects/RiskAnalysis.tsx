"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Button from '@/components/ui/Button';
import ModuleWarning from './ModuleWarning';
import ModuleNavigation from './ModuleNavigation';

type RiskLevel = 1 | 2 | 3 | 4 | 5;

type RiskCategory = {
    key: string;
    label: string;
    description: string;
    icon: string;
    weight: number;
};

type RiskAssessment = {
    flood_risk: RiskLevel | null;
    drought_risk: RiskLevel | null;
    contamination_risk: RiskLevel | null;
    flow_stability: RiskLevel | null;
    watershed_protection: RiskLevel | null;
};

type MitigationAction = {
    category: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
};

const RISK_CATEGORIES: RiskCategory[] = [
    {
        key: 'flood_risk',
        label: 'Riesgo de Inundación',
        description: '¿La fuente está ubicada en zona propensa a crecientes o inundaciones estacionales?',
        icon: '🌊',
        weight: 1.2
    },
    {
        key: 'drought_risk',
        label: 'Vulnerabilidad a Sequías',
        description: '¿La fuente presenta reducción significativa de caudal en época seca?',
        icon: '☀️',
        weight: 1.5
    },
    {
        key: 'contamination_risk',
        label: 'Riesgo de Contaminación',
        description: '¿Existen fuentes de contaminación aguas arriba (agricultura, ganado, residuos)?',
        icon: '⚠️',
        weight: 1.8
    },
    {
        key: 'flow_stability',
        label: 'Estabilidad del Caudal',
        description: '¿El caudal de la fuente se mantiene constante durante todo el año?',
        icon: '📊',
        weight: 1.3
    },
    {
        key: 'watershed_protection',
        label: 'Protección de Microcuenca',
        description: '¿La microcuenca cuenta con cobertura vegetal y protección legal?',
        icon: '🌳',
        weight: 1.4
    }
];

const RISK_LABELS: { [key in RiskLevel]: { label: string; color: string; description: string } } = {
    1: { label: 'Muy Bajo', color: 'green', description: 'Riesgo mínimo, condiciones ideales' },
    2: { label: 'Bajo', color: 'lime', description: 'Riesgo controlable, monitoreo básico' },
    3: { label: 'Medio', color: 'yellow', description: 'Requiere medidas preventivas' },
    4: { label: 'Alto', color: 'orange', description: 'Requiere intervención inmediata' },
    5: { label: 'Muy Alto', color: 'red', description: 'Condición crítica, alternativas necesarias' }
};

export default function RiskAnalysis({ projectId }: { projectId: string }) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [assessment, setAssessment] = useState<RiskAssessment>({
        flood_risk: null,
        drought_risk: null,
        contamination_risk: null,
        flow_stability: null,
        watershed_protection: null
    });

    const [additionalNotes, setAdditionalNotes] = useState<string>('');

    // Load existing data
    useEffect(() => {
        async function loadData() {
            const { data: rData } = await supabase
                .from('project_risk_analysis')
                .select('*')
                .eq('project_id', projectId)
                .maybeSingle();

            if (rData) {
                setAssessment({
                    flood_risk: rData.flood_risk,
                    drought_risk: rData.drought_risk,
                    contamination_risk: rData.contamination_risk,
                    flow_stability: rData.flow_stability,
                    watershed_protection: rData.watershed_protection
                });
            }

            setLoading(false);
        }
        loadData();
    }, [projectId, supabase]);

    // Calculate overall vulnerability
    const overallVulnerability = React.useMemo(() => {
        const values = Object.entries(assessment).filter(([_, v]) => v !== null);
        if (values.length === 0) return null;

        let weighted_sum = 0;
        let total_weight = 0;

        values.forEach(([key, value]) => {
            const category = RISK_CATEGORIES.find(c => c.key === key);
            if (category && value) {
                weighted_sum += value * category.weight;
                total_weight += category.weight;
            }
        });

        return total_weight > 0 ? weighted_sum / total_weight : null;
    }, [assessment]);

    // Generate mitigation recommendations
    const mitigationActions = React.useMemo((): MitigationAction[] => {
        const actions: MitigationAction[] = [];

        // Flood risk mitigation
        if (assessment.flood_risk && assessment.flood_risk >= 3) {
            actions.push({
                category: 'Inundación',
                action: assessment.flood_risk >= 4
                    ? 'Construir bocatoma elevada con estructura de protección y canales de desvío'
                    : 'Implementar sistema de alarma temprana y válvulas de cierre rápido',
                priority: assessment.flood_risk >= 4 ? 'high' : 'medium'
            });
        }

        // Drought risk mitigation
        if (assessment.drought_risk && assessment.drought_risk >= 3) {
            actions.push({
                category: 'Sequía',
                action: assessment.drought_risk >= 4
                    ? 'Considerar fuente alternativa o tanque de reserva de emergencia (≥3 días)'
                    : 'Aumentar capacidad de almacenamiento en tanque de reserva',
                priority: assessment.drought_risk >= 4 ? 'high' : 'medium'
            });
        }

        // Contamination risk mitigation
        if (assessment.contamination_risk && assessment.contamination_risk >= 3) {
            actions.push({
                category: 'Contaminación',
                action: assessment.contamination_risk >= 4
                    ? 'CRÍTICO: Implementar cercado perimetral de la microcuenca y programa de vigilancia comunitaria'
                    : 'Establecer zona de protección (≥100m) y señalización',
                priority: 'high'
            });
        }

        // Flow stability
        if (assessment.flow_stability && assessment.flow_stability >= 3) {
            actions.push({
                category: 'Caudal',
                action: 'Instalar medidor de caudal continuo con registro automático',
                priority: 'medium'
            });
        }

        // Watershed protection
        if (assessment.watershed_protection && assessment.watershed_protection >= 3) {
            actions.push({
                category: 'Microcuenca',
                action: assessment.watershed_protection >= 4
                    ? 'Gestionar declaratoria de área protegida y programa de reforestación'
                    : 'Establecer acuerdo de conservación con propietarios aguas arriba',
                priority: assessment.watershed_protection >= 4 ? 'high' : 'medium'
            });
        }

        // General recommendation if overall is high
        if (overallVulnerability && overallVulnerability >= 3.5) {
            actions.push({
                category: 'General',
                action: 'Contratar estudio de vulnerabilidad detallado y plan de gestión de riesgos',
                priority: 'high'
            });
        }

        return actions;
    }, [assessment, overallVulnerability]);

    const handleRiskChange = (key: string, value: RiskLevel) => {
        setAssessment({ ...assessment, [key]: value });
    };

    const handleSave = async () => {
        setSaving(true);

        const { error } = await supabase.from('project_risk_analysis').upsert({
            project_id: projectId,
            flood_risk: assessment.flood_risk,
            drought_risk: assessment.drought_risk,
            contamination_risk: assessment.contamination_risk,
            flow_stability: assessment.flow_stability,
            watershed_protection: assessment.watershed_protection,
            overall_vulnerability: overallVulnerability,
            mitigation_actions: mitigationActions.map(a => a.action),
            updated_at: new Date().toISOString()
        }, { onConflict: 'project_id' });

        setSaving(false);
        if (!error) {
            alert('✅ Análisis de riesgo guardado exitosamente');
        } else {
            alert('❌ Error al guardar: ' + error.message);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando evaluación de riesgos...</div>;

    const vulnerabilityColor = overallVulnerability
        ? overallVulnerability < 2 ? 'green'
            : overallVulnerability < 3 ? 'lime'
                : overallVulnerability < 4 ? 'yellow'
                    : 'red'
        : 'gray';

    return (
        <div className="space-y-8">
            <ModuleWarning projectId={projectId} moduleKey="risk_analysis" />

            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-rose-500">
                <h1 className="text-2xl font-bold text-gray-800">Análisis de Riesgo y Vulnerabilidad</h1>
                <p className="text-gray-600 mt-2">
                    Evaluación de amenazas ambientales y factores de vulnerabilidad que pueden afectar
                    la sostenibilidad del sistema de tratamiento FIME a largo plazo.
                </p>
            </div>

            {/* Risk Assessment Checklist */}
            <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">1. Evaluación de Riesgos (Escala 1-5)</h2>

                <div className="space-y-6">
                    {RISK_CATEGORIES.map((category) => (
                        <div key={category.key} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-3 mb-3">
                                <span className="text-3xl">{category.icon}</span>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800">{category.label}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                {([1, 2, 3, 4, 5] as RiskLevel[]).map((level) => {
                                    const isSelected = assessment[category.key as keyof RiskAssessment] === level;
                                    const levelInfo = RISK_LABELS[level];

                                    return (
                                        <button
                                            key={level}
                                            onClick={() => handleRiskChange(category.key, level)}
                                            className={`px-4 py-2 rounded-lg border-2 transition-all flex-1 min-w-[80px] ${isSelected
                                                ? `border-${levelInfo.color}-500 bg-${levelInfo.color}-100`
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                                }`}
                                            style={{
                                                borderColor: isSelected ? `var(--color-${levelInfo.color}-500)` : undefined,
                                                backgroundColor: isSelected ? `var(--color-${levelInfo.color}-100)` : undefined
                                            }}
                                        >
                                            <div className="font-bold text-gray-800">{level}</div>
                                            <div className="text-xs text-gray-600">{levelInfo.label}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-800 mb-2">Guía de Interpretación</h4>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
                        {([1, 2, 3, 4, 5] as RiskLevel[]).map(level => (
                            <div key={level} className="p-2 bg-white rounded border">
                                <div className="font-bold">{level} - {RISK_LABELS[level].label}</div>
                                <div className="text-gray-600">{RISK_LABELS[level].description}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Overall Vulnerability Score */}
            {overallVulnerability !== null && (
                <section className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">2. Índice de Vulnerabilidad General</h2>

                    <div className={`p-8 rounded-lg border-4 text-center bg-${vulnerabilityColor}-50 border-${vulnerabilityColor}-300`}
                        style={{
                            backgroundColor: `var(--color-${vulnerabilityColor}-50)`,
                            borderColor: `var(--color-${vulnerabilityColor}-300)`
                        }}>
                        <div className="text-6xl font-black text-gray-800 mb-2">
                            {overallVulnerability.toFixed(1)}
                        </div>
                        <div className="text-lg font-bold text-gray-700 uppercase tracking-wide">
                            {overallVulnerability < 2 ? 'RIESGO MUY BAJO'
                                : overallVulnerability < 3 ? 'RIESGO BAJO'
                                    : overallVulnerability < 4 ? 'RIESGO MEDIO'
                                        : 'RIESGO ALTO'}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            Índice calculado con ponderación por importancia de cada factor
                        </p>
                    </div>

                    {overallVulnerability >= 3 && (
                        <div className="mt-4 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                            <h4 className="font-bold text-amber-900">⚠️ Atención Requerida</h4>
                            <p className="text-sm text-amber-800 mt-1">
                                El índice de vulnerabilidad indica riesgos significativos.
                                Revise las medidas de mitigación propuestas e impleméntelas según prioridad.
                            </p>
                        </div>
                    )}
                </section>
            )}

            {/* Mitigation Actions */}
            {mitigationActions.length > 0 && (
                <section className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">3. Recomendaciones de Mitigación</h2>

                    <div className="space-y-3">
                        {mitigationActions.map((action, idx) => (
                            <div
                                key={idx}
                                className={`p-4 rounded-lg border-l-4 ${action.priority === 'high'
                                    ? 'bg-red-50 border-red-500'
                                    : action.priority === 'medium'
                                        ? 'bg-yellow-50 border-yellow-500'
                                        : 'bg-blue-50 border-blue-500'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${action.priority === 'high'
                                                ? 'bg-red-200 text-red-900'
                                                : action.priority === 'medium'
                                                    ? 'bg-yellow-200 text-yellow-900'
                                                    : 'bg-blue-200 text-blue-900'
                                                }`}>
                                                Prioridad {action.priority === 'high' ? 'Alta' : action.priority === 'medium' ? 'Media' : 'Baja'}
                                            </span>
                                            <span className="text-xs font-bold text-gray-600 uppercase">{action.category}</span>
                                        </div>
                                        <p className="text-gray-800">{action.action}</p>
                                    </div>
                                    <span className="text-2xl">
                                        {action.priority === 'high' ? '🔴' : action.priority === 'medium' ? '🟡' : '🔵'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-bold text-gray-800 mb-2">Próximos Pasos</h4>
                        <ol className="text-sm space-y-1 text-gray-700 list-decimal list-inside">
                            <li>Priorizar acciones de ALTA prioridad para implementación inmediata</li>
                            <li>Incluir costos de mitigación en presupuesto del proyecto</li>
                            <li>Definir responsables y cronograma de implementación</li>
                            <li>Establecer sistema de monitoreo y seguimiento</li>
                        </ol>
                    </div>
                </section>
            )}

            {/* Additional Observations */}
            <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">4. Observaciones Adicionales</h2>

                <textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    rows={4}
                    placeholder="Describa condiciones específicas del sitio, eventos históricos, o consideraciones adicionales..."
                    className="w-full p-3 border rounded focus:ring-2 focus:ring-rose-500 outline-none text-black"
                />
            </section>

            <div className="flex justify-end gap-4 pt-4">
                <Button variant="primary" onClick={handleSave} loading={saving}>
                    Guardar Análisis de Riesgo
                </Button>
            </div>

            <ModuleNavigation projectId={projectId} currentModuleKey="risk_analysis" />
        </div>
    );
}
